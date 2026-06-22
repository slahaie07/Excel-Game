import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitRanking = mutation({
  args: {
    playerKey: v.string(),
    playerName: v.string(),
    classId: v.string(),
    rating: v.number(),
    wins: v.number(),
    losses: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.playerName.trim().slice(0, 20);
    const key = args.playerKey.trim().slice(0, 64);
    if (!name || !key) throw new Error("Données invalides");

    const existing = await ctx.db
      .query("pvpRankings")
      .withIndex("by_player_key", (q) => q.eq("playerKey", key))
      .unique();

    const data = {
      playerKey: key,
      playerName: name,
      classId: args.classId.slice(0, 32),
      rating: Math.max(0, Math.min(9999, args.rating)),
      wins: Math.max(0, args.wins),
      losses: Math.max(0, args.losses),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("pvpRankings", data);
    }
    return null;
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("pvpRankings"),
      playerName: v.string(),
      classId: v.string(),
      rating: v.number(),
      wins: v.number(),
      losses: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("pvpRankings")
      .withIndex("by_rating")
      .order("desc")
      .take(args.limit ?? 20);

    return rows.map((r) => ({
      _id: r._id,
      playerName: r.playerName,
      classId: r.classId,
      rating: r.rating,
      wins: r.wins,
      losses: r.losses,
      updatedAt: r.updatedAt,
    }));
  },
});
