/**
 * Chemins des visuels générés pour Aetheris.
 * Régénérer : npm run generate:assets
 */

import { getRegionForZone, type MapRegionId } from "./expansionZonesV40";
import { ZONES } from "./zones";
import { CLASSES } from "./classes";
import { MONSTERS } from "./monsters";
import { NPCS } from "./npcs";

function assetSlug(id: string): string {
  return id.replace(/_/g, "-");
}

export const ZONE_BACKGROUNDS: Record<string, string> = Object.fromEntries(
  ZONES.map((z) => [z.id, `/assets/zones/zone-${assetSlug(z.id)}.png`])
);

export const COMBAT_BACKGROUNDS: Partial<Record<string, string>> = {
  combat: "/assets/combat/combat-tactical.png",
  world: "/assets/combat/combat-tactical.png",
  dungeon: "/assets/combat/combat-tactical.png",
  pvp: "/assets/combat/combat-tactical.png",
  event: "/assets/combat/combat-tactical.png",
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
