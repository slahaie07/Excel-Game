import type { Id } from "../../convex/_generated/dataModel";

export interface CloudCombatMeta {
  type: "world" | "dungeon" | "raid" | "pvp" | "event";
  monsterIds?: string[];
  zoneId?: string;
  characterId: string;
  convexMatchId?: string;
  convexRunId?: string;
  convexRaidRunId?: string;
  isTeamA?: boolean;
  pvpMode?: "1v1" | "2v2" | "3v3";
  allies?: string[];
  pvpOpponent?: { name: string; classId: string; level: number; characterId?: string };
  roomIndex?: number;
  dungeonId?: string;
  raidId?: string;
  phaseIndex?: number;
  eventId?: string;
  xpMultiplier?: number;
  eclatsMultiplier?: number;
}

export function cacheCloudCombat(
  localCombatId: string,
  convexCombatId: string,
  meta: CloudCombatMeta
): void {
  localStorage.setItem(`aetheris-combat-${localCombatId}`, JSON.stringify({
    ...meta,
    convexCombatId,
  }));
}

export function buildCloudCombatLocalId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

export type ConvexCombatId = Id<"combats">;
