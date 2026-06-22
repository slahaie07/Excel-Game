import type { Id } from "../../convex/_generated/dataModel";
import { loadCharacter, loadPvpRecord } from "./characterStorage";

const PLAYER_KEY_STORAGE = "aetheris-player-key";

export interface LiveQueuePayload {
  playerKey: string;
  playerName: string;
  classId: string;
  level: number;
  rating: number;
  characterStats: {
    vitality: number;
    wisdom: number;
    strength: number;
    intelligence: number;
    agility: number;
    chance: number;
  };
  spells: string[];
}

export type PvpLiveAction =
  | { type: "move"; targetX: number; targetY: number }
  | { type: "cast"; spellId: string; targetX: number; targetY: number }
  | { type: "endTurn" };

/** Clé invité stable (localStorage) dérivée du personnage */
export function getOrCreatePlayerKey(characterId: string): string {
  const storageKey = `${PLAYER_KEY_STORAGE}-${characterId}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const key = `guest_${characterId}_${Date.now().toString(36)}`;
  localStorage.setItem(storageKey, key);
  return key;
}

export function buildLiveQueuePayload(
  characterId: string,
  characterName: string,
  classId: string
): LiveQueuePayload {
  const char = loadCharacter(characterId);
  const record = loadPvpRecord(characterId);
  const stats = char?.stats ?? {
    vitality: 10,
    wisdom: 10,
    strength: 10,
    intelligence: 10,
    agility: 10,
    chance: 10,
  };

  return {
    playerKey: getOrCreatePlayerKey(characterId),
    playerName: characterName,
    classId,
    level: char?.level ?? 1,
    rating: record.rating,
    characterStats: {
      vitality: stats.vitality ?? 10,
      wisdom: stats.wisdom ?? 10,
      strength: stats.strength ?? 10,
      intelligence: stats.intelligence ?? 10,
      agility: stats.agility ?? 10,
      chance: stats.chance ?? 10,
    },
    spells: char?.spells ?? [],
  };
}

export function cacheLiveCombat(
  localCombatId: string,
  matchId: Id<"pvpLiveMatches">,
  playerKey: string,
  opponent: { name: string; classId: string }
): void {
  localStorage.setItem(
    `aetheris-combat-${localCombatId}`,
    JSON.stringify({
      type: "pvp_live",
      liveMatchId: matchId,
      playerKey,
      pvpOpponent: opponent,
      zoneId: "arene_pvp",
    })
  );
}

export function buildLiveCombatLocalId(): string {
  return `pvp_live_${Date.now()}`;
}

export function mapLiveEntitiesForPlayer<T extends {
  playerKey?: string;
  team: "player" | "enemy";
  classId?: string;
}>(
  entities: T[],
  myPlayerKey: string,
  myClassId: string
): Array<T & { team: "player" | "enemy"; classId?: string }> {
  return entities.map((e) => {
    const isMe = e.playerKey === myPlayerKey;
    return {
      ...e,
      team: isMe ? ("player" as const) : ("enemy" as const),
      classId: isMe ? myClassId : e.classId,
    };
  });
}

export function didPlayerWin(
  status: string,
  playerKey: string,
  playerAKey: string,
  playerBKey: string,
  winnerPlayerKey?: string
): boolean | null {
  if (status === "victory_a") return playerKey === playerAKey;
  if (status === "victory_b") return playerKey === playerBKey;
  if (status === "abandoned" && winnerPlayerKey) return playerKey === winnerPlayerKey;
  return null;
}
