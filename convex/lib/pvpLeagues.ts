import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const LEAGUE_TIERS = [
  { id: "bronze" as const, label: "Bronze", icon: "🥉", minPoints: 0 },
  { id: "silver" as const, label: "Argent", icon: "🥈", minPoints: 150 },
  { id: "gold" as const, label: "Or", icon: "🥇", minPoints: 350 },
  { id: "platinum" as const, label: "Platine", icon: "💎", minPoints: 600 },
  { id: "diamond" as const, label: "Diamant", icon: "👑", minPoints: 1000 },
];

export type LeagueTier = (typeof LEAGUE_TIERS)[number]["id"];

export function getTierFromPoints(points: number): LeagueTier {
  let tier: LeagueTier = "bronze";
  for (const t of LEAGUE_TIERS) {
    if (points >= t.minPoints) tier = t.id;
  }
  return tier;
}

export function getNextTier(current: LeagueTier): (typeof LEAGUE_TIERS)[number] | null {
  const idx = LEAGUE_TIERS.findIndex((t) => t.id === current);
  return idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1]! : null;
}

export async function recordLeagueMatch(
  ctx: MutationCtx,
  winnerIds: Id<"characters">[],
  loserIds: Id<"characters">[],
  ratingGain: number
) {
  const now = Date.now();
  const leagueGain = Math.max(15, Math.floor(ratingGain * 0.8));
  const leagueLoss = Math.max(5, Math.floor(leagueGain * 0.4));

  for (const characterId of winnerIds) {
    const existing = await ctx.db
      .query("pvpLeagueEntries")
      .withIndex("by_character", (q) => q.eq("characterId", characterId))
      .unique();

    const newPoints = (existing?.leaguePoints ?? 0) + leagueGain;
    const tier = getTierFromPoints(newPoints);

    if (existing) {
      await ctx.db.patch("pvpLeagueEntries", existing._id, {
        leaguePoints: newPoints,
        tier,
        wins: existing.wins + 1,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("pvpLeagueEntries", {
        characterId,
        tier,
        leaguePoints: newPoints,
        wins: 1,
        losses: 0,
        updatedAt: now,
      });
    }
  }

  for (const characterId of loserIds) {
    const existing = await ctx.db
      .query("pvpLeagueEntries")
      .withIndex("by_character", (q) => q.eq("characterId", characterId))
      .unique();

    const newPoints = Math.max(0, (existing?.leaguePoints ?? 0) - leagueLoss);
    const tier = getTierFromPoints(newPoints);

    if (existing) {
      await ctx.db.patch("pvpLeagueEntries", existing._id, {
        leaguePoints: newPoints,
        tier,
        losses: existing.losses + 1,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("pvpLeagueEntries", {
        characterId,
        tier: "bronze",
        leaguePoints: 0,
        wins: 0,
        losses: 1,
        updatedAt: now,
      });
    }
  }
}
