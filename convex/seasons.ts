import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const SEASON_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const BASE_SEASON_RATING = 1000;

async function ensureActiveSeason(ctx: MutationCtx) {
  const active = await ctx.db
    .query("pvpSeasons")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  const now = Date.now();
  if (active && now < active.endsAt) return active;

  if (active) {
    await ctx.db.patch("pvpSeasons", active._id, { status: "ended" });
  }

  const allSeasons = await ctx.db.query("pvpSeasons").collect();
  const seasonNumber = allSeasons.length + 1;
  const id = await ctx.db.insert("pvpSeasons", {
    name: `Saison ${seasonNumber}`,
    seasonNumber,
    status: "active",
    startsAt: now,
    endsAt: now + SEASON_DURATION_MS,
  });
  return (await ctx.db.get("pvpSeasons", id))!;
}

export async function recordSeasonMatch(
  ctx: MutationCtx,
  winnerId: Id<"characters">,
  loserId: Id<"characters">,
  ratingGain: number,
  ratingLoss: number
) {
  const season = await ensureActiveSeason(ctx);
  const winner = await ctx.db.get("characters", winnerId);
  const loser = await ctx.db.get("characters", loserId);
  if (!winner || !loser) return;

  const now = Date.now();

  for (const [char, gain, isWin] of [
    [winner, ratingGain, true] as const,
    [loser, -ratingLoss, false] as const,
  ]) {
    const existing = await ctx.db
      .query("seasonRatings")
      .withIndex("by_season_and_character", (q) =>
        q.eq("seasonId", season._id).eq("characterId", char._id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch("seasonRatings", existing._id, {
        characterName: char.name,
        classId: char.classId,
        rating: Math.max(0, existing.rating + gain),
        wins: isWin ? existing.wins + 1 : existing.wins,
        losses: isWin ? existing.losses : existing.losses + 1,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("seasonRatings", {
        seasonId: season._id,
        characterId: char._id,
        characterName: char.name,
        classId: char.classId,
        rating: Math.max(0, BASE_SEASON_RATING + gain),
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        updatedAt: now,
      });
    }
  }
}

export const getActiveSeason = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("pvpSeasons"),
      name: v.string(),
      seasonNumber: v.number(),
      startsAt: v.number(),
      endsAt: v.number(),
      daysLeft: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const season = await ctx.db
      .query("pvpSeasons")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!season) return null;

    const now = Date.now();
    if (now >= season.endsAt) return null;

    return {
      _id: season._id,
      name: season.name,
      seasonNumber: season.seasonNumber,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
      daysLeft: Math.ceil((season.endsAt - now) / (24 * 60 * 60 * 1000)),
    };
  },
});

export const getSeasonLeaderboard = query({
  args: { seasonId: v.id("pvpSeasons"), limit: v.optional(v.number()) },
  returns: v.array(v.object({
    characterName: v.string(),
    classId: v.string(),
    rating: v.number(),
    wins: v.number(),
    losses: v.number(),
  })),
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("seasonRatings")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    return ratings
      .sort((a, b) => b.rating - a.rating)
      .slice(0, args.limit ?? 20)
      .map((r) => ({
        characterName: r.characterName,
        classId: r.classId,
        rating: r.rating,
        wins: r.wins,
        losses: r.losses,
      }));
  },
});

export const getMySeasonRating = query({
  args: {
    seasonId: v.id("pvpSeasons"),
    characterId: v.id("characters"),
  },
  returns: v.union(
    v.object({
      rating: v.number(),
      wins: v.number(),
      losses: v.number(),
      rank: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("seasonRatings")
      .withIndex("by_season_and_character", (q) =>
        q.eq("seasonId", args.seasonId).eq("characterId", args.characterId)
      )
      .unique();

    if (!mine) return null;

    const all = await ctx.db
      .query("seasonRatings")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    const sorted = all.sort((a, b) => b.rating - a.rating);
    const rank = sorted.findIndex((r) => r.characterId === args.characterId) + 1;

    return { rating: mine.rating, wins: mine.wins, losses: mine.losses, rank };
  },
});

export const initSeason = mutation({
  args: {},
  returns: v.id("pvpSeasons"),
  handler: async (ctx) => {
    const season = await ensureActiveSeason(ctx);
    return season._id;
  },
});
