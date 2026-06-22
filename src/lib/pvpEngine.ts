import type { ClassId } from "../data/classes";
import { CLASSES, scaleStatsForLevel } from "../data/classes";
import {
  ALL_CLASS_IDS,
  DEFAULT_PVP_RATING,
  getTierForRating,
  OPPONENT_NAMES,
  type PvpTier,
} from "../data/pvp";
import {
  createCombatEntity,
  initCombatState,
  type CombatState,
} from "../game/combat/CombatEngine";
import type { PlayerCharacter } from "../store/gameStore";

export interface PvpStats {
  rating: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  totalMatches: number;
}

export interface PvpOpponent {
  name: string;
  classId: ClassId;
  level: number;
  rating: number;
  tier: PvpTier;
}

export interface PvpRun {
  opponent: PvpOpponent;
  playerRatingBefore: number;
  startedAt: number;
}

export interface PvpMatchResult {
  victory: boolean;
  ratingChange: number;
  newRating: number;
  tier: PvpTier;
  kamas: number;
  xp: number;
}

export function defaultPvpStats(): PvpStats {
  return {
    rating: DEFAULT_PVP_RATING,
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestStreak: 0,
    totalMatches: 0,
  };
}

export function calculateElo(
  playerRating: number,
  opponentRating: number,
  victory: boolean,
  k = 32,
): number {
  const expected = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
  const score = victory ? 1 : 0;
  return Math.round(k * (score - expected));
}

export function generateOpponent(player: PlayerCharacter): PvpOpponent {
  const playerRating = player.pvpStats?.rating ?? DEFAULT_PVP_RATING;
  const ratingDelta = Math.floor(Math.random() * 201) - 100;
  const rating = Math.max(800, Math.min(2200, playerRating + ratingDelta));
  const levelDelta = Math.floor(Math.random() * 5) - 2;
  const level = Math.max(5, Math.min(80, player.level + levelDelta));

  const classId = ALL_CLASS_IDS[Math.floor(Math.random() * ALL_CLASS_IDS.length)]!;
  const name =
    OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)]! +
    (Math.random() > 0.7 ? ` ${Math.floor(Math.random() * 99)}` : "");

  return {
    name,
    classId,
    level,
    rating,
    tier: getTierForRating(rating),
  };
}

export function createPvpCombat(
  player: PlayerCharacter,
  opponent: PvpOpponent,
): CombatState {
  const playerClass = CLASSES[player.classId];
  const opponentClass = CLASSES[opponent.classId];

  const playerEntity = createCombatEntity(
    "player_0",
    player.name,
    "player",
    { ...player.stats },
    { x: 2, y: 5 },
    player.spells,
    playerClass.name[0] ?? "H",
    parseInt(playerClass.color.replace("#", ""), 16) || 0x3498db,
    { classId: player.classId },
  );

  const oppStats = scaleStatsForLevel(opponentClass.baseStats, opponent.level);
  const ratingScale = 1 + (opponent.rating - DEFAULT_PVP_RATING) / 2000;
  oppStats.maxHp = Math.floor(oppStats.maxHp * ratingScale);
  oppStats.hp = oppStats.maxHp;
  oppStats.force = Math.floor(oppStats.force * ratingScale);
  oppStats.intelligence = Math.floor(oppStats.intelligence * ratingScale);
  oppStats.dommages = Math.floor(oppStats.dommages * ratingScale);

  const opponentEntity = createCombatEntity(
    "pvp_opponent",
    opponent.name,
    "enemy",
    oppStats,
    { x: 11, y: 5 },
    opponentClass.spells,
    opponentClass.name[0] ?? "?",
    parseInt(opponentClass.color.replace("#", ""), 16) || 0xe74c3c,
    { classId: opponent.classId },
  );

  return initCombatState([playerEntity], [opponentEntity]);
}

export function resolvePvpMatch(
  player: PlayerCharacter,
  run: PvpRun,
  victory: boolean,
): { stats: PvpStats; result: PvpMatchResult } {
  const current = player.pvpStats ?? defaultPvpStats();
  const ratingChange = calculateElo(
    run.playerRatingBefore,
    run.opponent.rating,
    victory,
  );
  const newRating = Math.max(0, current.rating + ratingChange);
  const tier = getTierForRating(newRating);

  const stats: PvpStats = {
    rating: newRating,
    wins: current.wins + (victory ? 1 : 0),
    losses: current.losses + (victory ? 0 : 1),
    winStreak: victory ? current.winStreak + 1 : 0,
    bestStreak: victory
      ? Math.max(current.bestStreak, current.winStreak + 1)
      : current.bestStreak,
    totalMatches: current.totalMatches + 1,
  };

  const result: PvpMatchResult = {
    victory,
    ratingChange,
    newRating,
    tier,
    kamas: victory ? tier.winKamas : Math.floor(tier.winKamas * 0.1),
    xp: victory ? tier.winXp : Math.floor(tier.winXp * 0.25),
  };

  return { stats, result };
}
