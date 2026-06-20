import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { addFactionReputation } from "./factions";
import { getTierFromPoints } from "./lib/pvpLeagues";
import {
  ensureDailyChallenges,
  getDayKey,
  recordPvpDailyProgress,
} from "./lib/pvpDailyChallenges";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export { recordPvpDailyProgress };

export const initDailyChallenges = mutation({
  args: { characterId: v.id("characters") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureDailyChallenges(ctx, args.characterId);
    return null;
  },
});

export const getDailyChallenges = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.object({
    _id: v.id("pvpDailyChallenges"),
    challengeId: v.string(),
    label: v.string(),
    description: v.string(),
    target: v.number(),
    progress: v.number(),
    completed: v.boolean(),
    claimed: v.boolean(),
    rewardEclats: v.number(),
    rewardLeaguePoints: v.number(),
  })),
  handler: async (ctx, args) => {
    const dayKey = getDayKey();
    const challenges = await ctx.db
      .query("pvpDailyChallenges")
      .withIndex("by_character_and_day", (q) =>
        q.eq("characterId", args.characterId).eq("dayKey", dayKey)
      )
      .collect();

    return challenges.map((c) => ({
      _id: c._id,
      challengeId: c.challengeId,
      label: c.label,
      description: c.description,
      target: c.target,
      progress: c.progress,
      completed: c.completed,
      claimed: c.claimed,
      rewardEclats: c.rewardEclats,
      rewardLeaguePoints: c.rewardLeaguePoints,
    }));
  },
});

export const claimDailyChallenge = mutation({
  args: {
    characterId: v.id("characters"),
    challengeId: v.id("pvpDailyChallenges"),
  },
  returns: v.object({ eclats: v.number(), leaguePoints: v.number() }),
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get("pvpDailyChallenges", args.challengeId);
    if (!challenge) throw new Error("Défi introuvable");
    if (challenge.characterId !== args.characterId) throw new Error("Non autorisé");
    if (!challenge.completed) throw new Error("Défi non terminé");
    if (challenge.claimed) throw new Error("Déjà réclamé");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + challenge.rewardEclats,
    });
    await ctx.db.patch("pvpDailyChallenges", args.challengeId, {
      claimed: true,
      updatedAt: Date.now(),
    });

    await addLeaguePointsBonus(ctx, args.characterId, challenge.rewardLeaguePoints);

    const profile = await ctx.db
      .query("factionProfiles")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (profile?.pledgedFactionId) {
      await addFactionReputation(ctx, args.characterId, profile.pledgedFactionId, 15);
    }

    return { eclats: challenge.rewardEclats, leaguePoints: challenge.rewardLeaguePoints };
  },
});

async function addLeaguePointsBonus(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  points: number
) {
  const entry = await ctx.db
    .query("pvpLeagueEntries")
    .withIndex("by_character", (q) => q.eq("characterId", characterId))
    .unique();

  if (entry) {
    const newPoints = entry.leaguePoints + points;
    await ctx.db.patch("pvpLeagueEntries", entry._id, {
      leaguePoints: newPoints,
      tier: getTierFromPoints(newPoints),
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("pvpLeagueEntries", {
      characterId,
      tier: getTierFromPoints(points),
      leaguePoints: points,
      wins: 0,
      losses: 0,
      updatedAt: Date.now(),
    });
  }
}
