import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { recordSeasonMatch } from "./seasons";
import { sendNotification } from "./lib/notifications";
import { syncCharacterAchievements } from "./lib/achievementUnlock";
import { recordTournamentMatch } from "./pvpTournaments";

const TEAM_SIZE: Record<"1v1" | "2v2" | "3v3", number> = {
  "1v1": 1,
  "2v2": 2,
  "3v3": 3,
};

type QueueEntry = {
  _id: string;
  characterId: Id<"characters">;
  characterName: string;
  classId: string;
  level: number;
  rating: number;
  mode: "1v1" | "2v2" | "3v3";
  queuedAt: number;
};

function snakeDraftTeams(players: QueueEntry[]) {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const teamA: QueueEntry[] = [];
  const teamB: QueueEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i % 2 === 0) teamA.push(sorted[i]!);
    else teamB.push(sorted[i]!);
  }
  return { teamA, teamB };
}

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

    await ctx.db.insert("pvpQueue", {
      characterId: args.characterId,
      characterName: args.characterName,
      classId: args.classId,
      level: args.level,
      rating: args.rating,
      mode: args.mode,
      queuedAt: Date.now(),
    });

    const teamSize = TEAM_SIZE[args.mode];
    const playersNeeded = teamSize * 2;

    const queued = await ctx.db
      .query("pvpQueue")
      .withIndex("by_mode", (q) => q.eq("mode", args.mode))
      .order("asc")
      .take(playersNeeded);

    if (queued.length < playersNeeded) return null;

    const participants = queued.slice(0, playersNeeded);
    for (const p of participants) {
      await ctx.db.delete("pvpQueue", p._id);
    }

    const { teamA, teamB } = snakeDraftTeams(participants as QueueEntry[]);

    const matchId = await ctx.db.insert("pvpMatches", {
      mode: args.mode,
      teamA: teamA.map((p) => ({
        characterId: p.characterId,
        name: p.characterName,
        classId: p.classId,
        rating: p.rating,
      })),
      teamB: teamB.map((p) => ({
        characterId: p.characterId,
        name: p.characterName,
        classId: p.classId,
        rating: p.rating,
      })),
      status: "pending",
      createdAt: Date.now(),
    });

    for (const p of participants) {
      const character = await ctx.db.get("characters", p.characterId);
      if (character?.pushNotificationsEnabled) {
        await sendNotification(ctx, {
          characterId: p.characterId,
          type: "pvp_match_found",
          title: "Match PvP trouvé !",
          body: `Un ${args.mode} est prêt — rejoignez l'arène !`,
          screen: "pvp",
        });
      }
    }

    return matchId;
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

export const getQueueStatus = query({
  args: {
    characterId: v.id("characters"),
    mode: v.union(v.literal("1v1"), v.literal("2v2"), v.literal("3v3")),
  },
  returns: v.object({
    inQueue: v.boolean(),
    playersWaiting: v.number(),
    playersNeeded: v.number(),
  }),
  handler: async (ctx, args) => {
    const teamSize = TEAM_SIZE[args.mode];
    const playersNeeded = teamSize * 2;

    const inQueue = await ctx.db
      .query("pvpQueue")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const queued = await ctx.db
      .query("pvpQueue")
      .withIndex("by_mode", (q) => q.eq("mode", args.mode))
      .collect();

    return {
      inQueue: !!inQueue,
      playersWaiting: queued.length,
      playersNeeded,
    };
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
  },
  returns: v.object({ ratingGain: v.number(), ratingLoss: v.number() }),
  handler: async (ctx, args) => {
    const match = await ctx.db.get("pvpMatches", args.matchId);
    if (!match) throw new Error("Match introuvable");
    if (match.status === "completed") {
      return { ratingGain: match.ratingChange ?? 0, ratingLoss: match.ratingChange ?? 0 };
    }

    const winners = args.winnerTeam === "A" ? match.teamA : match.teamB;
    const losers = args.winnerTeam === "A" ? match.teamB : match.teamA;

    const avgWinnerRating = winners.reduce((s, p) => s + p.rating, 0) / winners.length;
    const avgLoserRating = losers.reduce((s, p) => s + p.rating, 0) / losers.length;

    const ratingGain = Math.max(10, Math.floor((avgLoserRating - avgWinnerRating) / 20) + 25);
    const ratingLoss = Math.max(5, Math.floor((avgWinnerRating - avgLoserRating) / 20) + 15);

    const activeSeason = await ctx.db
      .query("pvpSeasons")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();
    const bonusPercent = activeSeason?.ratingBonusPercent ?? 0;
    const effectiveGain = Math.floor(ratingGain * (1 + bonusPercent / 100));

    for (const w of winners) {
      const char = await ctx.db.get("characters", w.characterId);
      if (char) {
        await ctx.db.patch("characters", w.characterId, {
          pvpRating: char.pvpRating + effectiveGain,
          pvpWins: char.pvpWins + 1,
        });
      }
    }

    for (const l of losers) {
      const char = await ctx.db.get("characters", l.characterId);
      if (char) {
        await ctx.db.patch("characters", l.characterId, {
          pvpRating: Math.max(0, char.pvpRating - ratingLoss),
          pvpLosses: char.pvpLosses + 1,
        });
      }
    }

    await ctx.db.patch("pvpMatches", args.matchId, {
      status: "completed",
      winnerTeam: args.winnerTeam,
      ratingChange: effectiveGain,
    });

    const winnerCap = winners[0]!;
    const loserCap = losers[0]!;
    await recordSeasonMatch(ctx, winnerCap.characterId, loserCap.characterId, effectiveGain, ratingLoss);

    const allParticipants = [...match.teamA, ...match.teamB].map((p) => ({
      characterId: p.characterId,
      characterName: p.name,
      classId: p.classId,
    }));
    await recordTournamentMatch(
      ctx,
      winners.map((w) => w.characterId),
      losers.map((l) => l.characterId),
      allParticipants
    );

    for (const w of winners) {
      await syncCharacterAchievements(ctx, w.characterId);
    }

    return { ratingGain: effectiveGain, ratingLoss };
  },
});

export const getPendingMatch = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("pvpMatches")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(30);

    const active = await ctx.db
      .query("pvpMatches")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(30);

    const all = [...pending, ...active];

    return all.find(
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
