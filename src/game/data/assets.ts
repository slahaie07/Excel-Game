/**
 * Chemins des visuels générés pour Aetheris.
 * Les zones/combat utilisent des fonds plein écran ; les classes ont des portraits optionnels.
 */

export const ZONE_BACKGROUNDS: Partial<Record<string, string>> = {
  vallee_eveils: "/assets/zones/zone-vallee-eveils.png",
  desert_umbra: "/assets/zones/zone-desert-umbra.png",
};

export const COMBAT_BACKGROUNDS: Partial<Record<string, string>> = {
  combat: "/assets/combat/combat-tactical.png",
  world: "/assets/combat/combat-tactical.png",
  dungeon: "/assets/combat/combat-tactical.png",
  pvp: "/assets/combat/combat-tactical.png",
  event: "/assets/combat/combat-tactical.png",
};

export const CLASS_PORTRAITS: Partial<Record<string, string>> = {
  pyromancien: "/assets/characters/class-pyromancien.png",
  gardien: "/assets/characters/class-gardien.png",
};

export const ROSTER_ART = "/assets/characters/characters-roster.png";

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
