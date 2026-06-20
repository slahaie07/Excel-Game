import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { sendNotification } from "./lib/notifications";
import { tryUnlockAchievement } from "./lib/achievementUnlock";
import { addZoneFactionReputation } from "./factions";

const INVASION_DURATION_MS = 72 * 60 * 60 * 1000;
const INVASION_BOSS_NAME = "Avatar des Ombres";

const INVASION_TEMPLATES = [
  {
    invasionId: "ombre_vallee",
    name: "Invasion des Ombres — Vallée",
    description: "Les Ombres Cristallines envahissent la Vallée des Éveils ! Repoussez-les.",
    zoneId: "vallee_eveils",
    globalTarget: 10_000,
    rewardEclats: 300,
    threatLevel: 40,
  },
  {
    invasionId: "ombre_foret",
    name: "Invasion des Ombres — Forêt",
    description: "Une marée d'ombres corrompt la Forêt de Lumina.",
    zoneId: "foret_lumina",
    globalTarget: 12_000,
    rewardEclats: 400,
    threatLevel: 55,
  },
  {
    invasionId: "ombre_desert",
    name: "Invasion des Ombres — Désert",
    description: "Les dunes d'Umbra s'assombrissent sous l'assaut cristallin.",
    zoneId: "desert_umbra",
    globalTarget: 15_000,
    rewardEclats: 500,
    threatLevel: 70,
  },
  {
    invasionId: "ombre_citadelle",
    name: "Invasion des Ombres — Citadelle",
    description: "La Citadelle Stellaire est assiégée ! Défendez Terreval.",
    zoneId: "citadelle_stellaire",
    globalTarget: 20_000,
    rewardEclats: 750,
    threatLevel: 90,
  },
];

async function activateNextInvasion(ctx: MutationCtx) {
  const active = await ctx.db
    .query("worldInvasions")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  const now = Date.now();
  if (active && now < active.endsAt) return active;

  if (active) {
    await ctx.db.patch("worldInvasions", active._id, { status: "ended" });
  }

  const past = await ctx.db.query("worldInvasions").collect();
  const template = INVASION_TEMPLATES[past.length % INVASION_TEMPLATES.length]!;

  const id = await ctx.db.insert("worldInvasions", {
    ...template,
    status: "active",
    startsAt: now,
    endsAt: now + INVASION_DURATION_MS,
    globalProgress: 0,
  });

  return (await ctx.db.get("worldInvasions", id))!;
}

export async function recordInvasionKill(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  characterName: string,
  zoneId: string
) {
  const invasion = await ctx.db
    .query("worldInvasions")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  if (!invasion || Date.now() >= invasion.endsAt) return;
  if (invasion.zoneId !== zoneId) return;

  const amount = 1;
  const now = Date.now();

  const existing = await ctx.db
    .query("worldInvasionContributions")
    .withIndex("by_invasion_and_character", (q) =>
      q.eq("invasionId", invasion._id).eq("characterId", characterId)
    )
    .unique();

  if (existing) {
    await ctx.db.patch("worldInvasionContributions", existing._id, {
      kills: existing.kills + amount,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("worldInvasionContributions", {
      invasionId: invasion._id,
      characterId,
      characterName,
      kills: amount,
      rewardClaimed: false,
      updatedAt: now,
    });
  }

  const newProgress = Math.min(invasion.globalTarget, invasion.globalProgress + amount);
  const barFull = newProgress >= invasion.globalTarget;

  if (barFull && !invasion.bossActive) {
    const bossMaxHp = invasion.threatLevel * 500;
    await ctx.db.patch("worldInvasions", invasion._id, {
      globalProgress: newProgress,
      bossActive: true,
      bossName: INVASION_BOSS_NAME,
      bossMaxHp,
      bossCurrentHp: bossMaxHp,
      bossDefeated: false,
    });

    await sendNotification(ctx, {
      characterId,
      type: "invasion_boss_spawn",
      title: "L'Avatar des Ombres apparaît !",
      body: `${invasion.name} — la menace ultime est là. Attaquez-le !`,
      screen: "world",
    });
  } else if (!invasion.bossActive) {
    await ctx.db.patch("worldInvasions", invasion._id, {
      globalProgress: newProgress,
    });
  }

  await addZoneFactionReputation(ctx, characterId, zoneId, 3);
  await tryUnlockAchievement(ctx, characterId, "invasion_defender");
}

export const ensureActiveInvasion = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await activateNextInvasion(ctx);
    return null;
  },
});

export const initInvasion = mutation({
  args: {},
  returns: v.id("worldInvasions"),
  handler: async (ctx) => {
    const invasion = await activateNextInvasion(ctx);
    return invasion._id;
  },
});

export const getActiveInvasion = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("worldInvasions"),
      invasionId: v.string(),
      name: v.string(),
      description: v.string(),
      zoneId: v.string(),
      threatLevel: v.number(),
      startsAt: v.number(),
      endsAt: v.number(),
      globalTarget: v.number(),
      globalProgress: v.number(),
      progressPercent: v.number(),
      rewardEclats: v.number(),
      hoursLeft: v.number(),
      bossActive: v.boolean(),
      bossName: v.union(v.string(), v.null()),
      bossMaxHp: v.union(v.number(), v.null()),
      bossCurrentHp: v.union(v.number(), v.null()),
      bossHpPercent: v.union(v.number(), v.null()),
      bossDefeated: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const invasion = await ctx.db
      .query("worldInvasions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!invasion) return null;
    const now = Date.now();
    if (now >= invasion.endsAt) return null;

    return {
      _id: invasion._id,
      invasionId: invasion.invasionId,
      name: invasion.name,
      description: invasion.description,
      zoneId: invasion.zoneId,
      threatLevel: invasion.threatLevel,
      startsAt: invasion.startsAt,
      endsAt: invasion.endsAt,
      globalTarget: invasion.globalTarget,
      globalProgress: invasion.globalProgress,
      progressPercent: Math.min(100, Math.round((invasion.globalProgress / invasion.globalTarget) * 100)),
      rewardEclats: invasion.rewardEclats,
      hoursLeft: Math.ceil((invasion.endsAt - now) / (60 * 60 * 1000)),
      bossActive: invasion.bossActive ?? false,
      bossName: invasion.bossName ?? null,
      bossMaxHp: invasion.bossMaxHp ?? null,
      bossCurrentHp: invasion.bossCurrentHp ?? null,
      bossHpPercent:
        invasion.bossMaxHp && invasion.bossCurrentHp !== undefined
          ? Math.round((invasion.bossCurrentHp / invasion.bossMaxHp) * 100)
          : null,
      bossDefeated: invasion.bossDefeated ?? false,
    };
  },
});

export const getMyInvasionContribution = query({
  args: {
    invasionId: v.id("worldInvasions"),
    characterId: v.id("characters"),
  },
  returns: v.union(
    v.object({
      kills: v.number(),
      bossDamage: v.number(),
      rewardClaimed: v.boolean(),
      rank: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("worldInvasionContributions")
      .withIndex("by_invasion_and_character", (q) =>
        q.eq("invasionId", args.invasionId).eq("characterId", args.characterId)
      )
      .unique();

    if (!mine) return null;

    const all = await ctx.db
      .query("worldInvasionContributions")
      .withIndex("by_invasion", (q) => q.eq("invasionId", args.invasionId))
      .collect();

    const sorted = all.sort((a, b) => b.kills - a.kills);
    const rank = sorted.findIndex((c) => c.characterId === args.characterId) + 1;

    return {
      kills: mine.kills,
      bossDamage: mine.bossDamage ?? 0,
      rewardClaimed: mine.rewardClaimed,
      rank,
    };
  },
});

export const attackInvasionBoss = mutation({
  args: {
    invasionId: v.id("worldInvasions"),
    characterId: v.id("characters"),
    characterName: v.string(),
    damage: v.optional(v.number()),
  },
  returns: v.object({
    damage: v.number(),
    bossHpPercent: v.number(),
    defeated: v.boolean(),
    rewardEclats: v.number(),
  }),
  handler: async (ctx, args) => {
    const invasion = await ctx.db.get("worldInvasions", args.invasionId);
    if (!invasion || !invasion.bossActive || invasion.bossDefeated) {
      throw new Error("Aucun boss d'invasion actif");
    }

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const damage = args.damage ?? Math.max(50, Math.floor(character.level * 12 + character.stats.strength * 2));
    const bossHp = invasion.bossCurrentHp ?? 0;
    const newHp = Math.max(0, bossHp - damage);
    const defeated = newHp <= 0;

    const existing = await ctx.db
      .query("worldInvasionContributions")
      .withIndex("by_invasion_and_character", (q) =>
        q.eq("invasionId", args.invasionId).eq("characterId", args.characterId)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch("worldInvasionContributions", existing._id, {
        bossDamage: (existing.bossDamage ?? 0) + damage,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("worldInvasionContributions", {
        invasionId: args.invasionId,
        characterId: args.characterId,
        characterName: args.characterName,
        kills: 0,
        bossDamage: damage,
        rewardClaimed: false,
        updatedAt: now,
      });
    }

    const rewardEclats = Math.floor(damage / 100) + 10;

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + rewardEclats,
    });

    if (defeated) {
      await ctx.db.patch("worldInvasions", args.invasionId, {
        bossCurrentHp: 0,
        bossDefeated: true,
        status: "ended",
      });

      await sendNotification(ctx, {
        characterId: args.characterId,
        type: "invasion_boss_defeated",
        title: "Avatar des Ombres vaincu !",
        body: `${invasion.name} — Terreval est sauvée ! Réclamez votre récompense.`,
        screen: "world",
      });

      await tryUnlockAchievement(ctx, args.characterId, "invasion_boss_slayer");
    } else {
      await ctx.db.patch("worldInvasions", args.invasionId, {
        bossCurrentHp: newHp,
      });
    }

    await addZoneFactionReputation(ctx, args.characterId, invasion.zoneId, 5);

    const bossMaxHp = invasion.bossMaxHp ?? 1;
    return {
      damage,
      bossHpPercent: Math.round((newHp / bossMaxHp) * 100),
      defeated,
      rewardEclats,
    };
  },
});

export const claimInvasionReward = mutation({
  args: {
    invasionId: v.id("worldInvasions"),
    characterId: v.id("characters"),
  },
  returns: v.object({ eclats: v.number() }),
  handler: async (ctx, args) => {
    const invasion = await ctx.db.get("worldInvasions", args.invasionId);
    if (!invasion) throw new Error("Invasion introuvable");

    const contribution = await ctx.db
      .query("worldInvasionContributions")
      .withIndex("by_invasion_and_character", (q) =>
        q.eq("invasionId", args.invasionId).eq("characterId", args.characterId)
      )
      .unique();

    if (!contribution || contribution.kills <= 0) throw new Error("Aucune participation");
    if (contribution.rewardClaimed) throw new Error("Récompense déjà réclamée");

    const canClaim =
      invasion.status === "ended" ||
      invasion.bossDefeated === true ||
      invasion.globalProgress >= invasion.globalTarget ||
      Date.now() >= invasion.endsAt;
    if (!canClaim) throw new Error("Invasion encore en cours");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + invasion.rewardEclats,
    });
    await ctx.db.patch("worldInvasionContributions", contribution._id, {
      rewardClaimed: true,
    });

    return { eclats: invasion.rewardEclats };
  },
});
