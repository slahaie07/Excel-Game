import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { recordSeasonMatch } from "./seasons";

export const joinQueue = mutation({
  args: {
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    level: v.number(),
    rating: v.number(),
    mode: v.union(v.literal("1v1"), v.literal("2v2"), v.literal("3v3")),
  },
  returns: v.union(v.id("pvpMatches"), v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pvpQueue")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (existing) await ctx.db.delete("pvpQueue", existing._id);

    const waiting = await ctx.db
      .query("pvpQueue")
      .withIndex("by_mode", (q) => q.eq("mode", args.mode))
      .order("asc")
      .first();

    if (waiting && waiting.characterId !== args.characterId) {
      await ctx.db.delete("pvpQueue", waiting._id);

      const matchId = await ctx.db.insert("pvpMatches", {
        mode: args.mode,
        teamA: [{
          characterId: waiting.characterId,
          name: waiting.characterName,
          classId: waiting.classId,
          rating: waiting.rating,
        }],
        teamB: [{
          characterId: args.characterId,
          name: args.characterName,
          classId: args.classId,
          rating: args.rating,
        }],
        status: "pending",
        createdAt: Date.now(),
      });

      return matchId;
    }

    await ctx.db.insert("pvpQueue", {
      characterId: args.characterId,
      characterName: args.characterName,
      classId: args.classId,
      level: args.level,
      rating: args.rating,
      mode: args.mode,
      queuedAt: Date.now(),
    });

    return null;
  },
});

export const leaveQueue = mutation({
  args: { characterId: v.id("characters") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("pvpQueue")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (entry) await ctx.db.delete("pvpQueue", entry._id);
    return null;
  },
});

export const getMatch = query({
  args: { matchId: v.id("pvpMatches") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("pvpMatches", args.matchId);
  },
});

export const completeMatch = mutation({
  args: {
    matchId: v.id("pvpMatches"),
    winnerTeam: v.union(v.literal("A"), v.literal("B")),
    winnerCharacterId: v.id("characters"),
    loserCharacterId: v.id("characters"),
  },
  returns: v.object({ ratingGain: v.number(), ratingLoss: v.number() }),
  handler: async (ctx, args) => {
    const match = await ctx.db.get("pvpMatches", args.matchId);
    if (!match) throw new Error("Match introuvable");

    const winner = await ctx.db.get("characters", args.winnerCharacterId);
    const loser = await ctx.db.get("characters", args.loserCharacterId);
    if (!winner || !loser) throw new Error("Personnage introuvable");

    const ratingGain = Math.max(10, Math.floor((loser.pvpRating - winner.pvpRating) / 20) + 25);
    const ratingLoss = Math.max(5, Math.floor((winner.pvpRating - loser.pvpRating) / 20) + 15);

    await ctx.db.patch("characters", args.winnerCharacterId, {
      pvpRating: winner.pvpRating + ratingGain,
      pvpWins: winner.pvpWins + 1,
    });

    await ctx.db.patch("characters", args.loserCharacterId, {
      pvpRating: Math.max(0, loser.pvpRating - ratingLoss),
      pvpLosses: loser.pvpLosses + 1,
    });

    await ctx.db.patch("pvpMatches", args.matchId, {
      status: "completed",
      winnerTeam: args.winnerTeam,
      ratingChange: ratingGain,
    });

    await recordSeasonMatch(ctx, args.winnerCharacterId, args.loserCharacterId, ratingGain, ratingLoss);

    return { ratingGain, ratingLoss };
  },
});

export const getPendingMatch = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("pvpMatches")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(20);

    return matches.find(
      (m) =>
        m.teamA.some((p) => p.characterId === args.characterId) ||
        m.teamB.some((p) => p.characterId === args.characterId)
    ) ?? null;
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    name: v.string(),
    classId: v.string(),
    level: v.number(),
    pvpRating: v.number(),
    pvpWins: v.number(),
  })),
  handler: async (ctx, args) => {
    const chars = await ctx.db.query("characters").order("desc").take(args.limit ?? 20);
    return chars
      .sort((a, b) => b.pvpRating - a.pvpRating)
      .slice(0, args.limit ?? 20)
      .map((c) => ({
        name: c.name,
        classId: c.classId,
        level: c.level,
        pvpRating: c.pvpRating,
        pvpWins: c.pvpWins,
      }));
  },
});
