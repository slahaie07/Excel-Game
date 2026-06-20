import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; icon: string }> = {
  first_victory: { name: "Première Victoire", description: "Gagner un combat", icon: "⚔️" },
  level_10: { name: "Éveilleur Confirmé", description: "Atteindre le niveau 10", icon: "⭐" },
  level_30: { name: "Maître Cristallin", description: "Atteindre le niveau 30", icon: "💎" },
  dungeon_clear: { name: "Explorateur", description: "Terminer un donjon", icon: "🏚️" },
  pvp_win_10: { name: "Gladiateur", description: "10 victoires PvP", icon: "🏆" },
  guild_member: { name: "Fraternité", description: "Rejoindre une guilde", icon: "🏰" },
  event_participant: { name: "Fêtard", description: "Participer à un événement", icon: "🎉" },
  pet_owner: { name: "Dresseur", description: "Obtenir un compagnon", icon: "✨" },
};

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
    if (!ACHIEVEMENT_DEFS[args.achievementId]) return false;

    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    if (existing.some((a) => a.achievementId === args.achievementId)) return false;

    await ctx.db.insert("achievements", {
      characterId: args.characterId,
      achievementId: args.achievementId,
      unlockedAt: Date.now(),
    });
    return true;
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
