import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { recordWarSeasonResult } from "./guildWarSeasons";
import { tryUnlockAchievement } from "./lib/achievementUnlock";
import { sendNotification } from "./lib/notifications";

const WAR_DURATION_MS = 24 * 60 * 60 * 1000;

async function finalizeWar(ctx: MutationCtx, warId: Id<"guildWars">) {
  const war = await ctx.db.get("guildWars", warId);
  if (!war || war.status !== "active") return;

  const winnerId = war.guildAScore >= war.guildBScore ? war.guildAId : war.guildBId;
  const winnerName = war.guildAScore >= war.guildBScore ? war.guildAName : war.guildBName;
  const winnerScore = Math.max(war.guildAScore, war.guildBScore);

  await ctx.db.patch("guildWars", warId, {
    status: "completed",
    winnerGuildId: winnerId,
  });

  await recordWarSeasonResult(ctx, war.seasonId, winnerId, winnerName, winnerScore);

  const winnerGuild = await ctx.db.get("guilds", winnerId);
  if (winnerGuild) {
    await ctx.db.patch("guilds", winnerId, {
      treasury: winnerGuild.treasury + 500,
    });
  }

  const members = await ctx.db.query("guildMembers").collect();
  const winnerMembers = members.filter((m) => m.guildId === winnerId);
  for (const member of winnerMembers) {
    await tryUnlockAchievement(ctx, member.characterId, "guild_war_victor");
    const character = await ctx.db.get("characters", member.characterId);
    if (character?.pushNotificationsEnabled) {
      await sendNotification(ctx, {
        characterId: member.characterId,
        type: "guild_war_won",
        title: "Victoire de guilde !",
        body: `${winnerName} remporte la guerre contre ${war.guildAId === winnerId ? war.guildBName : war.guildAName} !`,
        screen: "guild",
      });
    }
  }
}

export const declareWar = mutation({
  args: {
    guildAId: v.id("guilds"),
    guildBId: v.id("guilds"),
    characterId: v.id("characters"),
  },
  returns: v.id("guildWars"),
  handler: async (ctx, args) => {
    if (args.guildAId === args.guildBId) throw new Error("Impossible de déclarer la guerre à soi-même");

    const guildA = await ctx.db.get("guilds", args.guildAId);
    const guildB = await ctx.db.get("guilds", args.guildBId);
    if (!guildA || !guildB) throw new Error("Guilde introuvable");

    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildAId) {
      throw new Error("Vous devez appartenir à la guilde attaquante");
    }
    if (member.role !== "leader" && member.role !== "officer") {
      throw new Error("Seuls le chef et les officiers peuvent déclarer la guerre");
    }

    const existing = await ctx.db
      .query("guildWars")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const conflict = existing.find(
      (w) =>
        (w.guildAId === args.guildAId && w.guildBId === args.guildBId) ||
        (w.guildAId === args.guildBId && w.guildBId === args.guildAId)
    );
    if (conflict) throw new Error("Une guerre est déjà en cours entre ces guildes");

    const activeSeason = await ctx.db
      .query("guildWarSeasons")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    const now = Date.now();
    return await ctx.db.insert("guildWars", {
      guildAId: args.guildAId,
      guildBId: args.guildBId,
      guildAName: guildA.name,
      guildBName: guildB.name,
      guildAScore: 0,
      guildBScore: 0,
      status: "active",
      seasonId: activeSeason?._id,
      startedAt: now,
      endsAt: now + WAR_DURATION_MS,
    });
  },
});

export const contributeToWar = mutation({
  args: {
    warId: v.id("guildWars"),
    characterId: v.id("characters"),
    damage: v.optional(v.number()),
  },
  returns: v.object({ guildScore: v.number(), enemyScore: v.number() }),
  handler: async (ctx, args) => {
    const war = await ctx.db.get("guildWars", args.warId);
    if (!war || war.status !== "active") throw new Error("Guerre introuvable");

    const now = Date.now();
    if (now >= war.endsAt) {
      await finalizeWar(ctx, args.warId);
      throw new Error("La guerre est terminée");
    }

    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member) throw new Error("Pas membre d'une guilde");

    const isGuildA = member.guildId === war.guildAId;
    const isGuildB = member.guildId === war.guildBId;
    if (!isGuildA && !isGuildB) throw new Error("Votre guilde ne participe pas à cette guerre");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const dmg = args.damage ?? Math.floor(Math.random() * 20) + 10 + character.level;

    if (isGuildA) {
      await ctx.db.patch("guildWars", args.warId, { guildAScore: war.guildAScore + dmg });
    } else {
      await ctx.db.patch("guildWars", args.warId, { guildBScore: war.guildBScore + dmg });
    }

    await tryUnlockAchievement(ctx, args.characterId, "war_hero");

    const updated = await ctx.db.get("guildWars", args.warId);
    return {
      guildScore: isGuildA ? updated!.guildAScore : updated!.guildBScore,
      enemyScore: isGuildA ? updated!.guildBScore : updated!.guildAScore,
    };
  },
});

export const finalizeExpiredWars = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const wars = await ctx.db
      .query("guildWars")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const now = Date.now();
    for (const war of wars) {
      if (now >= war.endsAt) {
        await finalizeWar(ctx, war._id);
      }
    }
    return null;
  },
});

export const listActiveWars = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("guildWars"),
    guildAName: v.string(),
    guildBName: v.string(),
    guildAScore: v.number(),
    guildBScore: v.number(),
    endsAt: v.number(),
  })),
  handler: async (ctx) => {
    const wars = await ctx.db
      .query("guildWars")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(20);
    return wars.map((w) => ({
      _id: w._id,
      guildAName: w.guildAName,
      guildBName: w.guildBName,
      guildAScore: w.guildAScore,
      guildBScore: w.guildBScore,
      endsAt: w.endsAt,
    }));
  },
});

export const getGuildWar = query({
  args: { guildId: v.id("guilds") },
  returns: v.union(
    v.object({
      _id: v.id("guildWars"),
      guildAId: v.id("guilds"),
      guildBId: v.id("guilds"),
      guildAName: v.string(),
      guildBName: v.string(),
      guildAScore: v.number(),
      guildBScore: v.number(),
      endsAt: v.number(),
      isGuildA: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const wars = await ctx.db
      .query("guildWars")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(20);

    const war = wars.find((w) => w.guildAId === args.guildId || w.guildBId === args.guildId);
    if (!war) return null;

    return {
      _id: war._id,
      guildAId: war.guildAId,
      guildBId: war.guildBId,
      guildAName: war.guildAName,
      guildBName: war.guildBName,
      guildAScore: war.guildAScore,
      guildBScore: war.guildBScore,
      endsAt: war.endsAt,
      isGuildA: war.guildAId === args.guildId,
    };
  },
});
