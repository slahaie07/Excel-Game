/**
 * Chemins des visuels générés pour Aetheris.
 */

export const ZONE_BACKGROUNDS: Record<string, string> = {
  vallee_eveils: "/assets/zones/zone-vallee-eveils.png",
  port_nebula: "/assets/zones/zone-port-nebula.png",
  foret_lumina: "/assets/zones/zone-foret-lumina.png",
  desert_umbra: "/assets/zones/zone-desert-umbra.png",
  citadelle_stellaire: "/assets/zones/zone-citadelle-stellaire.png",
  arene_pvp: "/assets/zones/zone-arene-pvp.png",
};

export const COMBAT_BACKGROUNDS: Partial<Record<string, string>> = {
  combat: "/assets/combat/combat-tactical.png",
  world: "/assets/combat/combat-tactical.png",
  dungeon: "/assets/combat/combat-tactical.png",
  pvp: "/assets/combat/combat-tactical.png",
  event: "/assets/combat/combat-tactical.png",
};

export const CLASS_PORTRAITS: Record<string, string> = {
  alchimiste: "/assets/characters/class-alchimiste.png",
  luminaire: "/assets/characters/class-luminaire.png",
  pyromancien: "/assets/characters/class-pyromancien.png",
  cryomancien: "/assets/characters/class-cryomancien.png",
  gardien: "/assets/characters/class-gardien.png",
  bastion: "/assets/characters/class-bastion.png",
  berserker: "/assets/characters/class-berserker.png",
  eclaireur: "/assets/characters/class-eclaireur.png",
  archer: "/assets/characters/class-archer.png",
  invocateur: "/assets/characters/class-invocateur.png",
};

export const ROSTER_ART = "/assets/characters/characters-roster.png";

export const MONSTER_SPRITES: Record<string, string> = {
  graine_ombre: "/assets/monsters/monster-graine-ombre.png",
  wisp_sauvage: "/assets/monsters/monster-wisp-sauvage.png",
  loup_cristal: "/assets/monsters/monster-loup-cristal.png",
  treant_corrompu: "/assets/monsters/monster-treant-corrompu.png",
  scorpion_ether: "/assets/monsters/monster-scorpion-ether.png",
  dragon_aether: "/assets/monsters/monster-dragon-aether.png",
};

export function getMonsterPortrait(monsterId: string): string | undefined {
  return MONSTER_SPRITES[monsterId];
}

export function getMonsterTextureKey(monsterId: string): string {
  return `monster_${monsterId}`;
}

export function hasMonsterSprite(monsterId: string): boolean {
  return monsterId in MONSTER_SPRITES;
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
