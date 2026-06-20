import type { Id } from "../../convex/_generated/dataModel";

export interface CloudCombatMeta {
  type: "world" | "dungeon" | "pvp" | "event";
  monsterIds?: string[];
  zoneId?: string;
  characterId: string;
  convexMatchId?: string;
  convexRunId?: string;
  isTeamA?: boolean;
  pvpOpponent?: { name: string; classId: string; level: number; characterId?: string };
  roomIndex?: number;
  dungeonId?: string;
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
