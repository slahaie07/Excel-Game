import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  ACHIEVEMENT_DEFS,
  syncCharacterAchievements,
  tryUnlockAchievement,
} from "./lib/achievementUnlock";

export const listAchievements = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.object({
    achievementId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    unlocked: v.boolean(),
    unlockedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const unlocked = await ctx.db
      .query("achievements")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    const unlockedMap = new Map(unlocked.map((a) => [a.achievementId, a.unlockedAt]));

    return Object.entries(ACHIEVEMENT_DEFS).map(([id, def]) => ({
      achievementId: id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked: unlockedMap.has(id),
      unlockedAt: unlockedMap.get(id),
    }));
  },
});

export const unlockAchievement = mutation({
  args: {
    characterId: v.id("characters"),
    achievementId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return await tryUnlockAchievement(ctx, args.characterId, args.achievementId);
  },
});

export const syncAchievements = mutation({
  args: { characterId: v.id("characters") },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    return await syncCharacterAchievements(ctx, args.characterId);
  },
});

export const getDailyRewardStatus = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    canClaim: v.boolean(),
    streak: v.number(),
    nextReward: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyRewards")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const streak = existing?.streak ?? 0;
    const canClaim = !existing || now - existing.lastClaimedAt >= oneDay;
    const nextReward = 50 + (canClaim ? streak + 1 : streak) * 10;

    return { canClaim, streak, nextReward };
  },
});
