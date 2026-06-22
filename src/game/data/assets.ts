/**
 * Chemins des visuels générés pour Aetheris.
 * Régénérer : npm run generate:assets
 */

import { getRegionForZone, type MapRegionId } from "./expansionZonesV40";
import { ZONES } from "./zones";
import { CLASSES } from "./classes";
import { MONSTERS } from "./monsters";
import { NPCS } from "./npcs";
import { DUNGEONS } from "./dungeons";
import { MAP_POIS } from "./mapPOIs";
import { RAIDS } from "./raids";

/** Nombre cible de cartes générées (zones + donjons + POI + raids + salles). */
export const TARGET_MAP_COUNT = 350;
const TARGET_DUNGEON_ROOM_MAPS = 155;

function assetSlug(id: string): string {
  return id.replace(/_/g, "-");
}

export const ZONE_BACKGROUNDS: Record<string, string> = Object.fromEntries(
  ZONES.map((z) => [z.id, `/assets/zones/zone-${assetSlug(z.id)}.png`])
);

export const DUNGEON_BACKGROUNDS: Record<string, string> = Object.fromEntries(
  DUNGEONS.map((d) => [d.id, `/assets/dungeons/dungeon-${assetSlug(d.id)}.png`])
);

export const POI_MAPS: Record<string, string> = Object.fromEntries(
  MAP_POIS.map((p) => [p.id, `/assets/pois/poi-${assetSlug(p.id)}.png`])
);

export const RAID_BACKGROUNDS: Record<string, string> = Object.fromEntries(
  RAIDS.map((r) => [r.id, `/assets/raids/raid-${assetSlug(r.id)}.png`])
);

function buildDungeonRoomBackgrounds(): Record<string, string> {
  const entries: [string, string][] = [];
  let count = 0;
  for (const dungeon of DUNGEONS) {
    if (dungeon.rooms >= 999) continue;
    for (let roomIndex = 0; roomIndex < dungeon.rooms; roomIndex++) {
      if (count >= TARGET_DUNGEON_ROOM_MAPS) return Object.fromEntries(entries);
      const key = `${dungeon.id}:${roomIndex}`;
      entries.push([
        key,
        `/assets/dungeon-rooms/dungeon-${assetSlug(dungeon.id)}-room-${roomIndex + 1}.png`,
      ]);
      count++;
    }
  }
  return Object.fromEntries(entries);
}

export const DUNGEON_ROOM_BACKGROUNDS: Record<string, string> = buildDungeonRoomBackgrounds();

export const COMBAT_BACKGROUNDS: Partial<Record<string, string>> = {
  combat: "/assets/combat/combat-tactical.png",
  world: "/assets/combat/combat-tactical.png",
  dungeon: "/assets/combat/combat-tactical.png",
  pvp: "/assets/combat/combat-tactical.png",
  event: "/assets/combat/combat-tactical.png",
  raid: "/assets/combat/combat-tactical.png",
};

export const CLASS_PORTRAITS: Record<string, string> = Object.fromEntries(
  CLASSES.map((c) => [c.id, `/assets/characters/class-${assetSlug(c.id)}.png`])
);

export const ROSTER_ART = "/assets/characters/characters-roster.png";

export const NPC_PORTRAITS: Record<string, string> = Object.fromEntries(
  NPCS.map((n) => [n.id, `/assets/npcs/npc-${assetSlug(n.id)}.png`])
);

export const MONSTER_SPRITES: Record<string, string> = Object.fromEntries(
  MONSTERS.map((m) => [m.id, `/assets/monsters/monster-${assetSlug(m.id)}.png`])
);

export function getTotalMapCount(): number {
  return (
    Object.keys(ZONE_BACKGROUNDS).length +
    Object.keys(DUNGEON_BACKGROUNDS).length +
    Object.keys(POI_MAPS).length +
    Object.keys(RAID_BACKGROUNDS).length +
    Object.keys(DUNGEON_ROOM_BACKGROUNDS).length
  );
}

export function getNpcPortrait(npcId: string): string | undefined {
  return NPC_PORTRAITS[npcId];
}

export function getMonsterPortrait(monsterId: string): string | undefined {
  return MONSTER_SPRITES[monsterId];
}

export function getMonsterTextureKey(monsterId: string): string {
  return `monster_${monsterId}`;
}

export function hasMonsterSprite(monsterId: string): boolean {
  return monsterId in MONSTER_SPRITES;
}

/** Teinte CSS par région Terreval (v4.1) */
export const REGION_OVERLAYS: Record<MapRegionId, string> = {
  coeur: "linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 60%)",
  archipel: "linear-gradient(180deg, rgba(14,165,233,0.14) 0%, transparent 60%)",
  givre: "linear-gradient(180deg, rgba(56,189,248,0.18) 0%, rgba(147,197,253,0.06) 100%)",
  marais: "linear-gradient(180deg, rgba(34,197,94,0.14) 0%, rgba(74,222,128,0.05) 100%)",
  cendres: "linear-gradient(180deg, rgba(249,115,22,0.16) 0%, rgba(251,146,60,0.06) 100%)",
  stellaire: "linear-gradient(180deg, rgba(167,139,250,0.16) 0%, rgba(196,181,253,0.06) 100%)",
};

export function getRegionOverlayForZone(zoneId: string): string | undefined {
  const region = getRegionForZone(zoneId);
  return region ? REGION_OVERLAYS[region.id] : undefined;
}

export function getZoneBackground(zoneId: string): string | undefined {
  return ZONE_BACKGROUNDS[zoneId];
}

export function getDungeonBackground(dungeonId: string): string | undefined {
  return DUNGEON_BACKGROUNDS[dungeonId];
}

export function getPoiMapArt(poiId: string): string | undefined {
  return POI_MAPS[poiId];
}

export function getRaidBackground(raidId: string): string | undefined {
  return RAID_BACKGROUNDS[raidId];
}

export function getDungeonRoomBackground(dungeonId: string, roomIndex: number): string | undefined {
  return DUNGEON_ROOM_BACKGROUNDS[`${dungeonId}:${roomIndex}`];
}

export interface CombatBackgroundContext {
  combatType?: string;
  dungeonId?: string;
  roomIndex?: number;
  raidId?: string;
}

export function resolveCombatBackground(ctx?: CombatBackgroundContext): string | undefined {
  if (ctx?.combatType === "dungeon" && ctx.dungeonId != null && ctx.roomIndex != null) {
    const roomArt = getDungeonRoomBackground(ctx.dungeonId, ctx.roomIndex);
    if (roomArt) return roomArt;
    const dungeonArt = getDungeonBackground(ctx.dungeonId);
    if (dungeonArt) return dungeonArt;
  }
  if (ctx?.combatType === "raid" && ctx.raidId) {
    const raidArt = getRaidBackground(ctx.raidId);
    if (raidArt) return raidArt;
  }
  return getCombatBackground(ctx?.combatType);
}

export function getCombatBackground(combatType?: string): string | undefined {
  if (!combatType) return COMBAT_BACKGROUNDS.combat;
  return COMBAT_BACKGROUNDS[combatType] ?? COMBAT_BACKGROUNDS.combat;
}

export function getClassPortrait(classId: string): string | undefined {
  return CLASS_PORTRAITS[classId];
}

export function getClassTextureKey(classId: string): string {
  return `class_${classId}`;
}

export function hasClassPortrait(classId: string): boolean {
  return classId in CLASS_PORTRAITS;
}
