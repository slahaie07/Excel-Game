import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { sendNotification } from "./lib/notifications";

const LIVE_EVENT_DURATION_MS = 48 * 60 * 60 * 1000;
const LIVE_EVENT_TEMPLATES = [
  {
    eventId: "boss_rush_aether",
    name: "Ruée du Colosse",
    description: "Tous les serveurs unissent leurs forces pour abattre le Colosse d'Aether !",
    type: "boss_rush" as const,
    globalTarget: 100_000,
    rewardEclats: 500,
    rewardXp: 200,
  },
  {
    eventId: "kill_race_ombres",
    name: "Chasse aux Ombres",
    description: "Éliminez un maximum de créatures corrompues — progression globale cross-serveur.",
    type: "kill_race" as const,
    globalTarget: 50_000,
    rewardEclats: 350,
    rewardXp: 150,
  },
  {
    eventId: "harvest_cristaux",
    name: "Moisson de Cristaux",
    description: "Récoltez des fragments d'Aether pour la communauté entière.",
    type: "harvest" as const,
    globalTarget: 75_000,
    rewardEclats: 400,
    rewardXp: 175,
  },
];

async function activateNextLiveEvent(ctx: MutationCtx) {
  const active = await ctx.db
    .query("liveEvents")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  const now = Date.now();
  if (active && now < active.endsAt) return active;

  if (active) {
    await ctx.db.patch("liveEvents", active._id, { status: "ended" });
  }

  const past = await ctx.db.query("liveEvents").collect();
  const template = LIVE_EVENT_TEMPLATES[past.length % LIVE_EVENT_TEMPLATES.length]!;

  const id = await ctx.db.insert("liveEvents", {
    ...template,
    status: "active",
    startsAt: now,
    endsAt: now + LIVE_EVENT_DURATION_MS,
    globalProgress: 0,
  });

  return (await ctx.db.get("liveEvents", id))!;
}

export const ensureActiveLiveEvent = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await activateNextLiveEvent(ctx);
    return null;
  },
});

export const getActiveLiveEvents = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("liveEvents"),
    eventId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("boss_rush"), v.literal("kill_race"), v.literal("harvest")),
    startsAt: v.number(),
    endsAt: v.number(),
    globalTarget: v.number(),
    globalProgress: v.number(),
    progressPercent: v.number(),
    rewardEclats: v.number(),
    rewardXp: v.number(),
  })),
  handler: async (ctx) => {
    const events = await ctx.db
      .query("liveEvents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const now = Date.now();
    return events
      .filter((e) => now < e.endsAt)
      .map((e) => ({
        _id: e._id,
        eventId: e.eventId,
        name: e.name,
        description: e.description,
        type: e.type,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        globalTarget: e.globalTarget,
        globalProgress: e.globalProgress,
        progressPercent: Math.min(100, Math.round((e.globalProgress / e.globalTarget) * 100)),
        rewardEclats: e.rewardEclats,
        rewardXp: e.rewardXp,
      }));
  },
});

export const initLiveEvent = mutation({
  args: {},
  returns: v.id("liveEvents"),
  handler: async (ctx) => {
    const event = await activateNextLiveEvent(ctx);
    return event._id;
  },
});

export const contributeToLiveEvent = mutation({
  args: {
    liveEventId: v.id("liveEvents"),
    characterId: v.id("characters"),
    characterName: v.string(),
    amount: v.number(),
  },
  returns: v.object({
    globalProgress: v.number(),
    myContribution: v.number(),
    completed: v.boolean(),
  }),
  handler: async (ctx, args) => {
    if (args.amount <= 0) throw new Error("Contribution invalide");

    const event = await ctx.db.get("liveEvents", args.liveEventId);
    if (!event || event.status !== "active") throw new Error("Événement live introuvable");
    if (Date.now() >= event.endsAt) throw new Error("Événement terminé");

    const existing = await ctx.db
      .query("liveEventContributions")
      .withIndex("by_event_and_character", (q) =>
        q.eq("liveEventId", args.liveEventId).eq("characterId", args.characterId)
      )
      .unique();

    const now = Date.now();
    let myContribution: number;

    if (existing) {
      myContribution = existing.contribution + args.amount;
      await ctx.db.patch("liveEventContributions", existing._id, {
        contribution: myContribution,
        updatedAt: now,
      });
    } else {
      myContribution = args.amount;
      await ctx.db.insert("liveEventContributions", {
        liveEventId: args.liveEventId,
        characterId: args.characterId,
        characterName: args.characterName,
        contribution: myContribution,
        rewardClaimed: false,
        updatedAt: now,
      });
    }

    const newProgress = Math.min(event.globalTarget, event.globalProgress + args.amount);
    const completed = newProgress >= event.globalTarget;
    await ctx.db.patch("liveEvents", args.liveEventId, {
      globalProgress: newProgress,
      status: completed ? "ended" : "active",
    });

    if (completed) {
      await sendNotification(ctx, {
        characterId: args.characterId,
        type: "live_event_complete",
        title: "Événement live terminé !",
        body: `${event.name} — objectif global atteint ! Réclamez votre récompense.`,
        screen: "live-events",
      });
    }

    return { globalProgress: newProgress, myContribution, completed };
  },
});

export const getMyLiveEventContribution = query({
  args: {
    liveEventId: v.id("liveEvents"),
    characterId: v.id("characters"),
  },
  returns: v.union(
    v.object({
      contribution: v.number(),
      rewardClaimed: v.boolean(),
      rank: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("liveEventContributions")
      .withIndex("by_event_and_character", (q) =>
        q.eq("liveEventId", args.liveEventId).eq("characterId", args.characterId)
      )
      .unique();

    if (!mine) return null;

    const all = await ctx.db
      .query("liveEventContributions")
      .withIndex("by_event", (q) => q.eq("liveEventId", args.liveEventId))
      .collect();

    const sorted = all.sort((a, b) => b.contribution - a.contribution);
    const rank = sorted.findIndex((c) => c.characterId === args.characterId) + 1;

    return { contribution: mine.contribution, rewardClaimed: mine.rewardClaimed, rank };
  },
});

export const getLiveEventLeaderboard = query({
  args: { liveEventId: v.id("liveEvents"), limit: v.optional(v.number()) },
  returns: v.array(v.object({
    characterName: v.string(),
    contribution: v.number(),
  })),
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("liveEventContributions")
      .withIndex("by_event", (q) => q.eq("liveEventId", args.liveEventId))
      .collect();

    return all
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, args.limit ?? 20)
      .map((c) => ({ characterName: c.characterName, contribution: c.contribution }));
  },
});

export const claimLiveEventReward = mutation({
  args: {
    liveEventId: v.id("liveEvents"),
    characterId: v.id("characters"),
  },
  returns: v.object({ eclats: v.number(), xp: v.number() }),
  handler: async (ctx, args) => {
    const event = await ctx.db.get("liveEvents", args.liveEventId);
    if (!event) throw new Error("Événement introuvable");

    const contribution = await ctx.db
      .query("liveEventContributions")
      .withIndex("by_event_and_character", (q) =>
        q.eq("liveEventId", args.liveEventId).eq("characterId", args.characterId)
      )
      .unique();

    if (!contribution || contribution.contribution <= 0) {
      throw new Error("Aucune contribution");
    }
    if (contribution.rewardClaimed) throw new Error("Récompense déjà réclamée");

    const canClaim =
      event.status === "ended" ||
      event.globalProgress >= event.globalTarget ||
      Date.now() >= event.endsAt;
    if (!canClaim) throw new Error("Événement encore en cours");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + event.rewardEclats,
      xp: character.xp + event.rewardXp,
    });
    await ctx.db.patch("liveEventContributions", contribution._id, {
      rewardClaimed: true,
    });

    return { eclats: event.rewardEclats, xp: event.rewardXp };
  },
});
