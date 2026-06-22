/**
 * Chemins des visuels générés pour Aetheris.
 * Régénérer : npm run generate:assets
 */

import { getRegionForZone, MAP_REGIONS, type MapRegionId } from "./expansionZonesV40";
import { ZONES } from "./zones";
import { CLASSES } from "./classes";
import { MONSTERS } from "./monsters";
import { NPCS } from "./npcs";
import { DUNGEONS } from "./dungeons";
import { MAP_POIS } from "./mapPOIs";
import { RAIDS } from "./raids";

/** Plancher historique du catalogue (avant salles complètes). */
export const MIN_MAP_COUNT = 350;

function assetSlug(id: string): string {
  return id.replace(/_/g, "-");
}

export function countFiniteDungeonRooms(): number {
  return DUNGEONS.filter((d) => d.rooms < 999).reduce((sum, d) => sum + d.rooms, 0);
}

export function countRaidPhases(): number {
  return RAIDS.reduce((sum, r) => sum + r.phases, 0);
}

/** Nombre attendu de cartes une fois le générateur exécuté. */
export function getExpectedMapCount(): number {
  return (
    ZONES.length +
    DUNGEONS.length +
    MAP_POIS.length +
    RAIDS.length +
    countFiniteDungeonRooms() +
    countRaidPhases() +
    MAP_REGIONS.length
  );
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
  for (const dungeon of DUNGEONS) {
    if (dungeon.rooms >= 999) continue;
    for (let roomIndex = 0; roomIndex < dungeon.rooms; roomIndex++) {
      const key = `${dungeon.id}:${roomIndex}`;
      entries.push([
        key,
        `/assets/dungeon-rooms/dungeon-${assetSlug(dungeon.id)}-room-${roomIndex + 1}.png`,
      ]);
    }
  }
  return Object.fromEntries(entries);
}

export const DUNGEON_ROOM_BACKGROUNDS: Record<string, string> = buildDungeonRoomBackgrounds();

function buildRaidPhaseBackgrounds(): Record<string, string> {
  const entries: [string, string][] = [];
  for (const raid of RAIDS) {
    for (let phaseIndex = 0; phaseIndex < raid.phases; phaseIndex++) {
      entries.push([
        `${raid.id}:${phaseIndex}`,
        `/assets/raid-phases/raid-${assetSlug(raid.id)}-phase-${phaseIndex + 1}.png`,
      ]);
    }
  }
  return Object.fromEntries(entries);
}

export const RAID_PHASE_BACKGROUNDS: Record<string, string> = buildRaidPhaseBackgrounds();

export const REGION_COMBAT_BACKGROUNDS: Record<MapRegionId, string> = Object.fromEntries(
  MAP_REGIONS.map((r) => [r.id, `/assets/combat/combat-region-${assetSlug(r.id)}.png`])
) as Record<MapRegionId, string>;

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
    Object.keys(DUNGEON_ROOM_BACKGROUNDS).length +
    Object.keys(RAID_PHASE_BACKGROUNDS).length +
    Object.keys(REGION_COMBAT_BACKGROUNDS).length
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

export function getRaidPhaseBackground(raidId: string, phaseIndex: number): string | undefined {
  return RAID_PHASE_BACKGROUNDS[`${raidId}:${phaseIndex}`];
}

export function getRegionCombatBackground(zoneId: string): string | undefined {
  const region = getRegionForZone(zoneId);
  return region ? REGION_COMBAT_BACKGROUNDS[region.id] : undefined;
}

export function getDungeonRoomBackground(dungeonId: string, roomIndex: number): string | undefined {
  return DUNGEON_ROOM_BACKGROUNDS[`${dungeonId}:${roomIndex}`];
}

export interface CombatBackgroundContext {
  combatType?: string;
  dungeonId?: string;
  roomIndex?: number;
  raidId?: string;
  phaseIndex?: number;
  zoneId?: string;
}

export function resolveCombatBackground(ctx?: CombatBackgroundContext): string | undefined {
  if (ctx?.combatType === "dungeon" && ctx.dungeonId != null && ctx.roomIndex != null) {
    const roomArt = getDungeonRoomBackground(ctx.dungeonId, ctx.roomIndex);
    if (roomArt) return roomArt;
    const dungeonArt = getDungeonBackground(ctx.dungeonId);
    if (dungeonArt) return dungeonArt;
  }
  if (ctx?.combatType === "raid" && ctx.raidId) {
    if (ctx.phaseIndex != null) {
      const phaseArt = getRaidPhaseBackground(ctx.raidId, ctx.phaseIndex);
      if (phaseArt) return phaseArt;
    }
    const raidArt = getRaidBackground(ctx.raidId);
    if (raidArt) return raidArt;
  }
  if (ctx?.zoneId && (ctx.combatType === "world" || ctx.combatType === "event")) {
    const regional = getRegionCombatBackground(ctx.zoneId);
    if (regional) return regional;
    const zoneArt = getZoneBackground(ctx.zoneId);
    if (zoneArt) return zoneArt;
  }
  if (ctx?.combatType === "pvp") {
    return REGION_COMBAT_BACKGROUNDS.coeur ?? getCombatBackground("pvp");
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
