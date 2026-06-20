import { v } from "convex/values";
import { query } from "./_generated/server";
import { LEAGUE_TIERS, getNextTier } from "./lib/pvpLeagues";

const tierValidator = v.union(
  v.literal("bronze"),
  v.literal("silver"),
  v.literal("gold"),
  v.literal("platinum"),
  v.literal("diamond")
);

export const getMyLeagueStatus = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    tier: tierValidator,
    tierLabel: v.string(),
    tierIcon: v.string(),
    leaguePoints: v.number(),
    wins: v.number(),
    losses: v.number(),
    rank: v.number(),
    nextTier: v.union(v.string(), v.null()),
    nextTierIcon: v.union(v.string(), v.null()),
    pointsToNext: v.union(v.number(), v.null()),
    progressPercent: v.number(),
  }),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("pvpLeagueEntries")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const tier = entry?.tier ?? "bronze";
    const leaguePoints = entry?.leaguePoints ?? 0;
    const tierMeta = LEAGUE_TIERS.find((t) => t.id === tier)!;
    const next = getNextTier(tier);

    const all = await ctx.db.query("pvpLeagueEntries").collect();
    const sorted = all.sort((a, b) => b.leaguePoints - a.leaguePoints);
    const rank = sorted.findIndex((e) => e.characterId === args.characterId) + 1;

    const pointsToNext = next ? next.minPoints - leaguePoints : null;
    const progressPercent = next
      ? Math.min(100, Math.round(((leaguePoints - tierMeta.minPoints) / (next.minPoints - tierMeta.minPoints)) * 100))
      : 100;

    return {
      tier,
      tierLabel: tierMeta.label,
      tierIcon: tierMeta.icon,
      leaguePoints,
      wins: entry?.wins ?? 0,
      losses: entry?.losses ?? 0,
      rank: rank > 0 ? rank : sorted.length + 1,
      nextTier: next?.label ?? null,
      nextTierIcon: next?.icon ?? null,
      pointsToNext,
      progressPercent,
    };
  },
});

export const getLeagueLeaderboard = query({
  args: {
    tier: v.optional(tierValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    characterName: v.string(),
    classId: v.string(),
    tier: tierValidator,
    tierIcon: v.string(),
    leaguePoints: v.number(),
    wins: v.number(),
  })),
  handler: async (ctx, args) => {
    let entries = await ctx.db.query("pvpLeagueEntries").collect();
    if (args.tier) {
      entries = entries.filter((e) => e.tier === args.tier);
    }

    const sorted = entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, args.limit ?? 10);
    const results = [];

    for (const e of sorted) {
      const char = await ctx.db.get("characters", e.characterId);
      if (!char) continue;
      const tierMeta = LEAGUE_TIERS.find((t) => t.id === e.tier)!;
      results.push({
        characterName: char.name,
        classId: char.classId,
        tier: e.tier,
        tierIcon: tierMeta.icon,
        leaguePoints: e.leaguePoints,
        wins: e.wins,
      });
    }

    return results;
  },
});

export const getLeagueTiers = query({
  args: {},
  returns: v.array(v.object({
    id: tierValidator,
    label: v.string(),
    icon: v.string(),
    minPoints: v.number(),
  })),
  handler: async () => LEAGUE_TIERS,
});
