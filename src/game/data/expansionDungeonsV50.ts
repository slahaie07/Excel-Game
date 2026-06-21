/**
 * v5.0 — 26 donjons mythiques (fin de projet Terreval)
 */

import type { DungeonDefinition } from "./dungeons";

interface DungeonSeed {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  levelRequired: number;
  rooms: number;
  icon: string;
  mobs: string[];
  bossId: string;
  lootItemId?: string;
}

const DUNGEON_SEEDS: DungeonSeed[] = [
  { id: "sanctuaire_mythique_eveil", name: "Sanctuaire Mythique de l'Éveil", description: "Cristaux primordiaux corrompus par l'Ombre ancienne.", zoneId: "vallee_eveils", levelRequired: 15, rooms: 6, icon: "💠", mobs: ["graine_ombre", "wisp_sauvage", "loup_cristal"], bossId: "boss_mythique_eveil", lootItemId: "cristal_eveil" },
  { id: "nexus_mythique_citadelle", name: "Nexus Mythique", description: "Cœur stellaire inaccessible aux mortels.", zoneId: "citadelle_stellaire", levelRequired: 120, rooms: 12, icon: "🏰", mobs: ["golem_stellaire", "archimage_astral"], bossId: "boss_mythique_nexus", lootItemId: "coeur_nexus" },
  { id: "docks_mythiques", name: "Docks Mythiques", description: "Quais engloutis sous la marée noire.", zoneId: "port_nebula", levelRequired: 35, rooms: 7, icon: "⚓", mobs: ["meduse_brume", "pieuvre_ombre"], bossId: "boss_mythique_docks", lootItemId: "encre_ombre" },
  { id: "clairiere_mythique", name: "Clairière Mythique", description: "Cercle de fées devenue antre d'ombres.", zoneId: "foret_lumina", levelRequired: 28, rooms: 7, icon: "🌳", mobs: ["treant_corrompu", "fee_brume"], bossId: "boss_mythique_clairiere", lootItemId: "aile_fee" },
  { id: "tombeau_mythique", name: "Tombeau Mythique d'Umbra", description: "Sépulture du dernier pharaon stellaire.", zoneId: "desert_umbra", levelRequired: 45, rooms: 8, icon: "🏺", mobs: ["scorpion_ether", "sphinx_ombres"], bossId: "boss_mythique_tombeau", lootItemId: "parchemin_ancien" },
  { id: "fosse_mythique", name: "Fosse Mythique", description: "Arène souterraine des champions oubliés.", zoneId: "arene_pvp", levelRequired: 55, rooms: 8, icon: "⚔️", mobs: ["golem_stellaire", "champion_lumina"], bossId: "boss_mythique_fosse", lootItemId: "noyau_stellaire" },
  { id: "epave_mythique", name: "Épave Mythique", description: "Carcasse de vaisseau stellaire dans la brume.", zoneId: "cotes_brume", levelRequired: 22, rooms: 6, icon: "🚢", mobs: ["meduse_brume", "kraken_jeune"], bossId: "boss_mythique_epave", lootItemId: "carte_tresor" },
  { id: "maree_mythique", name: "Grotte Mythique de Marée", description: "Marée éternelle dans les cavernes.", zoneId: "grottes_maree", levelRequired: 26, rooms: 7, icon: "🌊", mobs: ["crab_golem", "sanglier_marin"], bossId: "boss_mythique_maree", lootItemId: "corail_vivant" },
  { id: "abysse_mythique", name: "Puits Mythique Abyssal", description: "Vertige vers les ténèbres liquides.", zoneId: "recif_abyssal", levelRequired: 38, rooms: 8, icon: "🕳️", mobs: ["pieuvre_ombre", "requin_ether"], bossId: "boss_mythique_abysse", lootItemId: "perle_abysse" },
  { id: "tempete_mythique", name: "Œil Mythique de la Tempête", description: "Cœur du cyclone stellaire.", zoneId: "ile_tempete", levelRequired: 42, rooms: 8, icon: "⛈️", mobs: ["harpy_stellaire", "elemental_tempete"], bossId: "boss_mythique_tempete", lootItemId: "essence_tempete" },
  { id: "sanctuaire_mythique_marin", name: "Sanctuaire Mythique Marin", description: "Autel des navigateurs englouti.", zoneId: "sanctuaire_marins", levelRequired: 48, rooms: 9, icon: "🛕", mobs: ["nereide_guerriere", "meduse_brume"], bossId: "boss_mythique_sanctuaire", lootItemId: "cristal_corail" },
  { id: "leviathan_mythique", name: "Antre Mythique du Léviathan", description: "Tanière du seigneur des abysses.", zoneId: "profondeurs_nereides", levelRequired: 75, rooms: 10, icon: "🐋", mobs: ["nereide_guerriere", "pieuvre_ombre"], bossId: "boss_mythique_leviathan", lootItemId: "ecaille_leviathan" },
  { id: "glacier_mythique", name: "Glacier Mythique", description: "Langue de glace éternelle.", zoneId: "plateau_givre", levelRequired: 70, rooms: 8, icon: "🧊", mobs: ["yeti_cristal", "elemental_glace"], bossId: "boss_mythique_glacier", lootItemId: "cristal_givre" },
  { id: "sommet_mythique", name: "Sommet Mythique Cristallin", description: "Pic où le ciel touche la glace.", zoneId: "monts_cristallins", levelRequired: 88, rooms: 9, icon: "🏔️", mobs: ["golem_givre", "harpy_glace"], bossId: "boss_mythique_sommet", lootItemId: "fragment_cristal" },
  { id: "toundra_mythique", name: "Toundra Mythique", description: "Steppe gelée des dragons anciens.", zoneId: "glaise_nord", levelRequired: 115, rooms: 11, icon: "🦣", mobs: ["mammouth_ether", "spectre_givre"], bossId: "boss_mythique_toundra", lootItemId: "essence_boreale" },
  { id: "marecage_mythique", name: "Marécage Mythique", description: "Tourbière où le temps stagne.", zoneId: "marais_ether", levelRequired: 44, rooms: 7, icon: "🌫️", mobs: ["boue_vivante", "will_o_wisp"], bossId: "boss_mythique_marecage", lootItemId: "mousse_ether" },
  { id: "cite_mythique", name: "Cité Mythique Suspendue", description: "Ruines flottantes des dieux architectes.", zoneId: "cite_flottante", levelRequired: 58, rooms: 9, icon: "🏛️", mobs: ["golem_rune", "sentinelle_flottante"], bossId: "boss_mythique_cite", lootItemId: "parchemin_flottant" },
  { id: "crypte_mythique", name: "Crypte Mythique des Noyés", description: "Catacombes où les morts ne reposent pas.", zoneId: "catacombes_humides", levelRequired: 68, rooms: 9, icon: "💀", mobs: ["necro_marais", "esprit_tourbiere"], bossId: "boss_mythique_crypte", lootItemId: "essence_marais" },
  { id: "lave_mythique", name: "Couloir Mythique de Lave", description: "Rivière de magma stellaire.", zoneId: "vallee_cendres", levelRequired: 52, rooms: 8, icon: "🌋", mobs: ["golem_lave", "salamandre_cendre"], bossId: "boss_mythique_lave", lootItemId: "cendre_stellaire" },
  { id: "forge_mythique", name: "Forge Mythique Volcanique", description: "Atelier des titans forgerons.", zoneId: "forge_volcanique", levelRequired: 78, rooms: 10, icon: "🔨", mobs: ["golem_fournaise", "drake_cendre"], bossId: "boss_mythique_forge", lootItemId: "lingot_volcan" },
  { id: "magma_mythique", name: "Creuset Mythique", description: "Bassin où naquit le Titan de Cendre.", zoneId: "chambre_magma", levelRequired: 125, rooms: 12, icon: "🔥", mobs: ["colosse_magma", "phoenix_ether"], bossId: "boss_mythique_magma", lootItemId: "fragment_primordial" },
  { id: "ciel_mythique", name: "Passage Mythique Céleste", description: "Pont d'éther entre les îles.", zoneId: "iles_stellaires", levelRequired: 32, rooms: 7, icon: "✨", mobs: ["sprite_stellaire", "raie_ciel"], bossId: "boss_mythique_ciel", lootItemId: "fragment_astral" },
  { id: "lagoon_mythique", name: "Lagoon Mythique Stellaire", description: "Lagune où les étoiles se reflètent.", zoneId: "atoll_nebula", levelRequired: 46, rooms: 8, icon: "🌊", mobs: ["meduse_stellaire", "crabe_astral"], bossId: "boss_mythique_lagoon", lootItemId: "perle_stellaire" },
  { id: "dome_mythique", name: "Dôme Mythique Lunaire", description: "Observatoire des constellations mortes.", zoneId: "observatoire_lune", levelRequired: 130, rooms: 12, icon: "🔭", mobs: ["constellation_vivante", "archimage_astral"], bossId: "boss_mythique_dome", lootItemId: "essence_constellation" },
  { id: "portail_mythique_givre", name: "Portail Mythique Boréal", description: "Passage gelé reliant nord et cendres.", zoneId: "glaise_nord", levelRequired: 105, rooms: 10, icon: "🌀", mobs: ["dragon_givre", "spectre_givre"], bossId: "boss_mythique_portail_givre", lootItemId: "ecaille_givre" },
  { id: "nexus_mythique_marais", name: "Nexus Mythique des Eaux", description: "Confluence des marais et des catacombes.", zoneId: "marais_ether", levelRequired: 62, rooms: 9, icon: "💧", mobs: ["will_o_wisp", "necro_marais"], bossId: "boss_mythique_nexus_marais", lootItemId: "phylactere_umbra" },
];

function buildRooms(mobs: string[], rooms: number, bossId: string): string[][] {
  const result: string[][] = [];
  for (let i = 0; i < rooms - 1; i++) {
    const a = mobs[i % mobs.length]!;
    const b = mobs[(i + 1) % mobs.length]!;
    result.push(i % 2 === 0 ? [a, b] : [a]);
  }
  result.push([bossId]);
  return result;
}

export const EXPANSION_DUNGEONS_V50: DungeonDefinition[] = DUNGEON_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  zoneId: seed.zoneId,
  levelRequired: seed.levelRequired,
  rooms: seed.rooms,
  bossId: seed.bossId,
  icon: seed.icon,
  groupSize: { min: seed.levelRequired >= 100 ? 3 : seed.levelRequired >= 60 ? 2 : 1, max: 4 },
  roomMonsters: buildRooms(seed.mobs, seed.rooms, seed.bossId),
  rewards: {
    xp: seed.levelRequired * 65,
    eclats: seed.levelRequired * 32,
    items: seed.lootItemId
      ? [{ itemId: seed.lootItemId, chance: 0.22, quantity: 1 }]
      : undefined,
  },
}));
