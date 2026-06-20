import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export interface DailyChallengeTemplate {
  id: string;
  label: string;
  description: string;
  target: number;
  rewardEclats: number;
  rewardLeaguePoints: number;
  mode?: "1v1" | "2v2" | "3v3";
  type: "wins" | "matches" | "mode_win";
}

export const DAILY_CHALLENGE_POOL: DailyChallengeTemplate[] = [
  {
    id: "win_2",
    label: "Duelliste",
    description: "Gagner 2 matchs PvP",
    target: 2,
    rewardEclats: 80,
    rewardLeaguePoints: 20,
    type: "wins",
  },
  {
    id: "play_3",
    label: "Combattant",
    description: "Jouer 3 matchs PvP",
    target: 3,
    rewardEclats: 60,
    rewardLeaguePoints: 15,
    type: "matches",
  },
  {
    id: "win_1v1",
    label: "Maître du duel",
    description: "Gagner un match 1v1",
    target: 1,
    rewardEclats: 100,
    rewardLeaguePoints: 25,
    mode: "1v1",
    type: "mode_win",
  },
  {
    id: "win_2v2",
    label: "Équipier",
    description: "Gagner un match 2v2",
    target: 1,
    rewardEclats: 90,
    rewardLeaguePoints: 22,
    mode: "2v2",
    type: "mode_win",
  },
  {
    id: "win_3",
    label: "Invincible",
    description: "Gagner 3 matchs PvP",
    target: 3,
    rewardEclats: 150,
    rewardLeaguePoints: 35,
    type: "wins",
  },
];

export function getDayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function getChallengesForDay(dayKey: string): DailyChallengeTemplate[] {
  const seed = dayKey.split("-").reduce((s, p) => s + Number(p), 0);
  const pool = [...DAILY_CHALLENGE_POOL];
  const selected: DailyChallengeTemplate[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7) % pool.length;
    selected.push(pool.splice(idx, 1)[0]!);
  }
  return selected;
}

export async function ensureDailyChallenges(
  ctx: MutationCtx,
  characterId: Id<"characters">
) {
  const dayKey = getDayKey();
  const existing = await ctx.db
    .query("pvpDailyChallenges")
    .withIndex("by_character_and_day", (q) =>
      q.eq("characterId", characterId).eq("dayKey", dayKey)
    )
    .collect();

  if (existing.length > 0) return;

  const templates = getChallengesForDay(dayKey);
  const now = Date.now();
  for (const t of templates) {
    await ctx.db.insert("pvpDailyChallenges", {
      characterId,
      dayKey,
      challengeId: t.id,
      label: t.label,
      description: t.description,
      target: t.target,
      progress: 0,
      completed: false,
      claimed: false,
      rewardEclats: t.rewardEclats,
      rewardLeaguePoints: t.rewardLeaguePoints,
      updatedAt: now,
    });
  }
}

export async function recordPvpDailyProgress(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  options: { won: boolean; mode: "1v1" | "2v2" | "3v3" }
) {
  await ensureDailyChallenges(ctx, characterId);
  const dayKey = getDayKey();

  const challenges = await ctx.db
    .query("pvpDailyChallenges")
    .withIndex("by_character_and_day", (q) =>
      q.eq("characterId", characterId).eq("dayKey", dayKey)
    )
    .collect();

  const templates = getChallengesForDay(dayKey);
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  for (const challenge of challenges) {
    if (challenge.completed) continue;
    const template = templateMap.get(challenge.challengeId);
    if (!template) continue;

    let increment = 0;
    if (template.type === "matches") {
      increment = 1;
    } else if (template.type === "wins" && options.won) {
      increment = 1;
    } else if (template.type === "mode_win" && options.won && template.mode === options.mode) {
      increment = 1;
    }

    if (increment > 0) {
      const newProgress = challenge.progress + increment;
      const completed = newProgress >= challenge.target;
      await ctx.db.patch("pvpDailyChallenges", challenge._id, {
        progress: newProgress,
        completed,
        updatedAt: Date.now(),
      });
    }
  }
}
