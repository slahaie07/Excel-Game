import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { addHallOfFameEntry } from "./lib/hallOfFame";
import { sendNotification } from "./lib/notifications";

const TOURNAMENT_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const TOURNAMENT_REWARDS = [2000, 1200, 800, 500, 300];

async function activateWeeklyTournament(ctx: MutationCtx) {
  const active = await ctx.db
    .query("pvpTournaments")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  const now = Date.now();
  if (active && now < active.endsAt) return active;

  if (active) {
    await finalizeTournamentInternal(ctx, active._id);
  }

  const all = await ctx.db.query("pvpTournaments").collect();
  const weekNumber = all.length + 1;
  const id = await ctx.db.insert("pvpTournaments", {
    name: `Tournoi Hebdo #${weekNumber}`,
    weekNumber,
    status: "active",
    startsAt: now,
    endsAt: now + TOURNAMENT_DURATION_MS,
  });
  return (await ctx.db.get("pvpTournaments", id))!;
}

async function finalizeTournamentInternal(
  ctx: MutationCtx,
  tournamentId: Id<"pvpTournaments">
) {
  const tournament = await ctx.db.get("pvpTournaments", tournamentId);
  if (!tournament || tournament.status === "ended") return;

  await ctx.db.patch("pvpTournaments", tournamentId, { status: "ended" });

  const entries = await ctx.db
    .query("pvpTournamentEntries")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();

  const sorted = entries
    .filter((e) => e.wins + e.losses > 0)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]!;
    const rank = i + 1;
    const eclatsReward = TOURNAMENT_REWARDS[i] ?? 100;

    const existing = await ctx.db
      .query("pvpTournamentRewards")
      .withIndex("by_tournament_and_character", (q) =>
        q.eq("tournamentId", tournamentId).eq("characterId", entry.characterId)
      )
      .unique();

    if (existing) continue;

    await ctx.db.insert("pvpTournamentRewards", {
      tournamentId,
      characterId: entry.characterId,
      rank,
      eclatsReward,
    });

    if (rank === 1) {
      await addHallOfFameEntry(ctx, {
        category: "tournament_champion",
        characterId: entry.characterId,
        displayName: entry.characterName,
        subtitle: `${entry.wins} victoires • ${entry.points} pts`,
        value: entry.points,
        icon: "🏆",
        periodLabel: tournament.name,
      });

      const character = await ctx.db.get("characters", entry.characterId);
      if (character?.pushNotificationsEnabled) {
        await sendNotification(ctx, {
          characterId: entry.characterId,
          type: "tournament_won",
          title: "Champion du tournoi !",
          body: `Vous remportez ${tournament.name} ! Réclamez votre récompense.`,
          screen: "pvp",
        });
      }
    }
  }
}

export async function recordTournamentMatch(
  ctx: MutationCtx,
  winnerIds: Id<"characters">[],
  _loserIds: Id<"characters">[],
  participants: { characterId: Id<"characters">; characterName: string; classId: string }[]
) {
  const tournament = await ctx.db
    .query("pvpTournaments")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  if (!tournament || Date.now() >= tournament.endsAt) return;

  const winnerSet = new Set(winnerIds.map(String));

  for (const p of participants) {
    const isWin = winnerSet.has(String(p.characterId));
    const existing = await ctx.db
      .query("pvpTournamentEntries")
      .withIndex("by_tournament_and_character", (q) =>
        q.eq("tournamentId", tournament._id).eq("characterId", p.characterId)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch("pvpTournamentEntries", existing._id, {
        wins: existing.wins + (isWin ? 1 : 0),
        losses: existing.losses + (isWin ? 0 : 1),
        points: existing.points + (isWin ? 3 : 0),
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("pvpTournamentEntries", {
        tournamentId: tournament._id,
        characterId: p.characterId,
        characterName: p.characterName,
        classId: p.classId,
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        points: isWin ? 3 : 0,
        updatedAt: now,
      });
    }
  }
}

export const ensureActiveTournament = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await activateWeeklyTournament(ctx);
    return null;
  },
});

export const initTournament = mutation({
  args: {},
  returns: v.id("pvpTournaments"),
  handler: async (ctx) => {
    const tournament = await activateWeeklyTournament(ctx);
    return tournament._id;
  },
});

export const getActiveTournament = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("pvpTournaments"),
      name: v.string(),
      weekNumber: v.number(),
      endsAt: v.number(),
      daysLeft: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const tournament = await ctx.db
      .query("pvpTournaments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!tournament) return null;
    const now = Date.now();
    if (now >= tournament.endsAt) return null;

    return {
      _id: tournament._id,
      name: tournament.name,
      weekNumber: tournament.weekNumber,
      endsAt: tournament.endsAt,
      daysLeft: Math.ceil((tournament.endsAt - now) / (24 * 60 * 60 * 1000)),
    };
  },
});

export const getTournamentLeaderboard = query({
  args: { tournamentId: v.id("pvpTournaments"), limit: v.optional(v.number()) },
  returns: v.array(v.object({
    characterName: v.string(),
    classId: v.string(),
    wins: v.number(),
    losses: v.number(),
    points: v.number(),
  })),
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("pvpTournamentEntries")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    return entries
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .slice(0, args.limit ?? 10)
      .map((e) => ({
        characterName: e.characterName,
        classId: e.classId,
        wins: e.wins,
        losses: e.losses,
        points: e.points,
      }));
  },
});

export const getMyTournamentEntry = query({
  args: {
    tournamentId: v.id("pvpTournaments"),
    characterId: v.id("characters"),
  },
  returns: v.union(
    v.object({ wins: v.number(), losses: v.number(), points: v.number(), rank: v.number() }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("pvpTournamentEntries")
      .withIndex("by_tournament_and_character", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("characterId", args.characterId)
      )
      .unique();

    if (!mine) return null;

    const all = await ctx.db
      .query("pvpTournamentEntries")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const sorted = all.sort((a, b) => b.points - a.points || b.wins - a.wins);
    const rank = sorted.findIndex((e) => e.characterId === args.characterId) + 1;

    return { wins: mine.wins, losses: mine.losses, points: mine.points, rank };
  },
});

export const getPendingTournamentRewards = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.object({
    _id: v.id("pvpTournamentRewards"),
    tournamentId: v.id("pvpTournaments"),
    rank: v.number(),
    eclatsReward: v.number(),
  })),
  handler: async (ctx, args) => {
    const rewards = await ctx.db
      .query("pvpTournamentRewards")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    return rewards
      .filter((r) => r.claimedAt === undefined)
      .map((r) => ({
        _id: r._id,
        tournamentId: r.tournamentId,
        rank: r.rank,
        eclatsReward: r.eclatsReward,
      }));
  },
});

export const claimTournamentReward = mutation({
  args: {
    characterId: v.id("characters"),
    rewardId: v.id("pvpTournamentRewards"),
  },
  returns: v.object({ eclats: v.number(), rank: v.number() }),
  handler: async (ctx, args) => {
    const reward = await ctx.db.get("pvpTournamentRewards", args.rewardId);
    if (!reward) throw new Error("Récompense introuvable");
    if (reward.characterId !== args.characterId) throw new Error("Non autorisé");
    if (reward.claimedAt !== undefined) throw new Error("Déjà réclamée");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + reward.eclatsReward,
    });
    await ctx.db.patch("pvpTournamentRewards", args.rewardId, {
      claimedAt: Date.now(),
    });

    return { eclats: reward.eclatsReward, rank: reward.rank };
  },
});
