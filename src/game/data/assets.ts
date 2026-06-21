/**
 * Chemins des visuels générés pour Aetheris.
 */

import { getRegionForZone, type MapRegionId } from "./expansionZonesV40";

export const ZONE_BACKGROUNDS: Record<string, string> = {
  jardin_initiation: "/assets/zones/zone-vallee-eveils.png",
  vallee_eveils: "/assets/zones/zone-vallee-eveils.png",
  port_nebula: "/assets/zones/zone-port-nebula.png",
  foret_lumina: "/assets/zones/zone-foret-lumina.png",
  desert_umbra: "/assets/zones/zone-desert-umbra.png",
  citadelle_stellaire: "/assets/zones/zone-citadelle-stellaire.png",
  arene_pvp: "/assets/zones/zone-arene-pvp.png",
  cotes_brume: "/assets/zones/zone-port-nebula.png",
  grottes_maree: "/assets/zones/zone-port-nebula.png",
  recif_abyssal: "/assets/zones/zone-desert-umbra.png",
  ile_tempete: "/assets/zones/zone-citadelle-stellaire.png",
  sanctuaire_marins: "/assets/zones/zone-port-nebula.png",
  profondeurs_nereides: "/assets/zones/zone-citadelle-stellaire.png",
  plateau_givre: "/assets/zones/zone-citadelle-stellaire.png",
  monts_cristallins: "/assets/zones/zone-vallee-eveils.png",
  glaise_nord: "/assets/zones/zone-citadelle-stellaire.png",
  marais_ether: "/assets/zones/zone-foret-lumina.png",
  cite_flottante: "/assets/zones/zone-citadelle-stellaire.png",
  catacombes_humides: "/assets/zones/zone-desert-umbra.png",
  vallee_cendres: "/assets/zones/zone-desert-umbra.png",
  forge_volcanique: "/assets/zones/zone-desert-umbra.png",
  chambre_magma: "/assets/zones/zone-citadelle-stellaire.png",
  iles_stellaires: "/assets/zones/zone-port-nebula.png",
  atoll_nebula: "/assets/zones/zone-port-nebula.png",
  observatoire_lune: "/assets/zones/zone-citadelle-stellaire.png",
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
  druide: "/assets/characters/class-alchimiste.png",
  fulgurancien: "/assets/characters/class-pyromancien.png",
  paladin: "/assets/characters/class-gardien.png",
  faucheur: "/assets/characters/class-eclaireur.png",
  artilleur: "/assets/characters/class-archer.png",
};

export const ROSTER_ART = "/assets/characters/characters-roster.png";

const MONSTER_SPRITE_GOLEM = "/assets/monsters/monster-golem-stellaire.png";
const MONSTER_SPRITE_DRAGON = "/assets/monsters/monster-dragon-aether.png";
const MONSTER_SPRITE_GARDIEN = "/assets/monsters/monster-gardien-ruines.png";
const MONSTER_SPRITE_FEE = "/assets/monsters/monster-fee-brume.png";
const MONSTER_SPRITE_SPHINX = "/assets/monsters/monster-sphinx-ombres.png";
const MONSTER_SPRITE_SCORPION = "/assets/monsters/monster-scorpion-ether.png";
const MONSTER_SPRITE_CHAMPION = "/assets/monsters/monster-champion-lumina.png";
const MONSTER_SPRITE_ESPRIT = "/assets/monsters/monster-event-esprit-eclipse.png";

export const MONSTER_SPRITES: Record<string, string> = {
  graine_ombre: "/assets/monsters/monster-graine-ombre.png",
  wisp_sauvage: "/assets/monsters/monster-wisp-sauvage.png",
  loup_cristal: "/assets/monsters/monster-loup-cristal.png",
  gardien_ruines: MONSTER_SPRITE_GARDIEN,
  treant_corrompu: "/assets/monsters/monster-treant-corrompu.png",
  fee_brume: MONSTER_SPRITE_FEE,
  champion_lumina: MONSTER_SPRITE_CHAMPION,
  scorpion_ether: MONSTER_SPRITE_SCORPION,
  sphinx_ombres: MONSTER_SPRITE_SPHINX,
  golem_stellaire: MONSTER_SPRITE_GOLEM,
  dragon_aether: MONSTER_SPRITE_DRAGON,
  event_gardien_floral: "/assets/monsters/monster-event-gardien-floral.png",
  event_esprit_eclipse: MONSTER_SPRITE_ESPRIT,
  event_ombre_majeur: "/assets/monsters/monster-event-ombre-majeur.png",
  event_cristal_ancien: "/assets/monsters/monster-event-cristal-ancien.png",
  // v4.0 bosses — fallback sprites
  boss_caverne_givre: MONSTER_SPRITE_GOLEM,
  boss_pic_translucide: MONSTER_SPRITE_GOLEM,
  dragon_givre: MONSTER_SPRITE_DRAGON,
  boss_tourbiere: MONSTER_SPRITE_FEE,
  boss_nexus_flottant: MONSTER_SPRITE_GARDIEN,
  boss_crypte_humide: MONSTER_SPRITE_ESPRIT,
  boss_grotte_cendres: MONSTER_SPRITE_SCORPION,
  boss_fournaise: MONSTER_SPRITE_GOLEM,
  titan_cendre: MONSTER_SPRITE_GOLEM,
  boss_trone_magma: MONSTER_SPRITE_CHAMPION,
  boss_ruines_astrales: MONSTER_SPRITE_GARDIEN,
  boss_lagoon: MONSTER_SPRITE_SPHINX,
  boss_dome_lunaire: MONSTER_SPRITE_GOLEM,
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
