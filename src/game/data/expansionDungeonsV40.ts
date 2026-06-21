/**
 * v4.0 — Donjons des 12 nouvelles zones
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
  { id: "caverne_givre", name: "Caverne de Givre", description: "Grottes gelées du plateau.", zoneId: "plateau_givre", levelRequired: 60, rooms: 6, icon: "🧊", mobs: ["yeti_cristal", "loup_givre", "elemental_glace"], bossId: "boss_caverne_givre", lootItemId: "cristal_givre" },
  { id: "autel_froid", name: "Autel du Froid", description: "Sanctuaire gelé des anciens.", zoneId: "plateau_givre", levelRequired: 68, rooms: 7, icon: "❄️", mobs: ["elemental_glace", "loup_givre"], bossId: "boss_caverne_givre", lootItemId: "flocon_stellaire" },
  { id: "pic_translucide", name: "Pic Translucide", description: "Ascension vers le sommet cristallin.", zoneId: "monts_cristallins", levelRequired: 78, rooms: 8, icon: "🏔️", mobs: ["golem_givre", "harpy_glace", "wisp_polar"], bossId: "boss_pic_translucide", lootItemId: "fragment_cristal" },
  { id: "mine_cristalline", name: "Mine Cristalline", description: "Filon de minerai stellaire pur.", zoneId: "monts_cristallins", levelRequired: 82, rooms: 7, icon: "⛏️", mobs: ["golem_givre", "wisp_polar"], bossId: "boss_pic_translucide", lootItemId: "minerai_stellaire" },
  { id: "temple_givre", name: "Temple de Givre", description: "Temple englouti sous la glaise.", zoneId: "glaise_nord", levelRequired: 95, rooms: 9, icon: "🛕", mobs: ["mammouth_ether", "spectre_givre"], bossId: "dragon_givre", lootItemId: "ecaille_givre" },
  { id: "antre_dragon_givre", name: "Antre du Dragon de Givre", description: "Tanière du seigneur du nord.", zoneId: "glaise_nord", levelRequired: 110, rooms: 10, icon: "🐉", mobs: ["spectre_givre", "mammouth_ether"], bossId: "dragon_givre", lootItemId: "essence_boreale" },
  { id: "tourbiere_maudite", name: "Tourbière Maudite", description: "Marais hanté par les feux follets.", zoneId: "marais_ether", levelRequired: 32, rooms: 5, icon: "🌫️", mobs: ["boue_vivante", "grenouille_ether", "will_o_wisp"], bossId: "boss_tourbiere", lootItemId: "mousse_ether" },
  { id: "hangar_englouti", name: "Hangar Englouti", description: "Dépôt de marchandises submergé.", zoneId: "marais_ether", levelRequired: 38, rooms: 6, icon: "📦", mobs: ["grenouille_ether", "boue_vivante"], bossId: "boss_tourbiere", lootItemId: "racine_marais" },
  { id: "nexus_flottant", name: "Nexus Flottant", description: "Cœur magique de la cité suspendue.", zoneId: "cite_flottante", levelRequired: 50, rooms: 7, icon: "🏛️", mobs: ["golem_rune", "sentinelle_flottante", "wisp_architecte"], bossId: "boss_nexus_flottant", lootItemId: "pierre_levitation" },
  { id: "bibliotheque_suspendue", name: "Bibliothèque Suspendue", description: "Archives des architectes stellaires.", zoneId: "cite_flottante", levelRequired: 55, rooms: 8, icon: "📚", mobs: ["wisp_architecte", "sentinelle_flottante"], bossId: "boss_nexus_flottant", lootItemId: "parchemin_flottant" },
  { id: "crypte_humide", name: "Crypte Humide", description: "Catacombes des prêtres noyés.", zoneId: "catacombes_humides", levelRequired: 58, rooms: 8, icon: "💀", mobs: ["squelette_marais", "necro_marais", "esprit_tourbiere"], bossId: "boss_crypte_humide", lootItemId: "os_fossile" },
  { id: "puits_ombres", name: "Puits des Ombres", description: "Abîme reliant marais et cendres.", zoneId: "catacombes_humides", levelRequired: 65, rooms: 9, icon: "🕳️", mobs: ["necro_marais", "esprit_tourbiere"], bossId: "boss_crypte_humide", lootItemId: "essence_marais" },
  { id: "grotte_cendres", name: "Grotte des Cendres", description: "Tunnel de lave refroidie.", zoneId: "vallee_cendres", levelRequired: 42, rooms: 6, icon: "🌋", mobs: ["salamandre_cendre", "golem_lave", "chauve_souris_magma"], bossId: "boss_grotte_cendres", lootItemId: "cendre_stellaire" },
  { id: "passage_lave", name: "Passage de Lave", description: "Couloir actif vers la forge.", zoneId: "vallee_cendres", levelRequired: 48, rooms: 7, icon: "🔥", mobs: ["golem_lave", "chauve_souris_magma"], bossId: "boss_grotte_cendres", lootItemId: "obsidienne_ether" },
  { id: "fournaise_ancienne", name: "Fournaise Ancienne", description: "Forge naturelle des titans.", zoneId: "forge_volcanique", levelRequired: 62, rooms: 8, icon: "🔥", mobs: ["elemental_magma", "golem_fournaise", "drake_cendre"], bossId: "boss_fournaise", lootItemId: "lingot_volcan" },
  { id: "atelier_magma", name: "Atelier de Magma", description: "Atelier des forgerons légendaires.", zoneId: "forge_volcanique", levelRequired: 72, rooms: 9, icon: "🔨", mobs: ["drake_cendre", "golem_fournaise"], bossId: "boss_fournaise", lootItemId: "coeur_magma" },
  { id: "creuset_primordial", name: "Creuset Primordial", description: "Bassin de magma stellaire brut.", zoneId: "chambre_magma", levelRequired: 88, rooms: 10, icon: "🌋", mobs: ["phoenix_ether", "colosse_magma"], bossId: "titan_cendre", lootItemId: "fragment_primordial" },
  { id: "trone_magma", name: "Trône du Magma", description: "Sanctuaire du Titan de Cendre.", zoneId: "chambre_magma", levelRequired: 105, rooms: 11, icon: "👑", mobs: ["colosse_magma", "phoenix_ether"], bossId: "boss_trone_magma", lootItemId: "larme_phoenix" },
  { id: "ruines_astrales", name: "Ruines Astrales", description: "Vestiges des navigateurs célestes.", zoneId: "iles_stellaires", levelRequired: 22, rooms: 5, icon: "🏛️", mobs: ["sprite_stellaire", "golem_astral", "raie_ciel"], bossId: "boss_ruines_astrales", lootItemId: "fragment_astral" },
  { id: "temple_ile", name: "Temple de l'Île", description: "Sanctuaire sur l'île principale.", zoneId: "iles_stellaires", levelRequired: 28, rooms: 6, icon: "🛕", mobs: ["golem_astral", "raie_ciel"], bossId: "boss_ruines_astrales", lootItemId: "poussiere_stellaire" },
  { id: "lagoon_stellaire", name: "Lagoon Stellaire", description: "Lagune céleste de l'atoll.", zoneId: "atoll_nebula", levelRequired: 36, rooms: 6, icon: "🌊", mobs: ["meduse_stellaire", "crabe_astral", "anguille_ciel"], bossId: "boss_lagoon", lootItemId: "corail_astral" },
  { id: "grotte_atoll", name: "Grotte de l'Atoll", description: "Caverne sous le récif céleste.", zoneId: "atoll_nebula", levelRequired: 42, rooms: 7, icon: "🦀", mobs: ["crabe_astral", "anguille_ciel"], bossId: "boss_lagoon", lootItemId: "perle_stellaire" },
  { id: "dome_lunaire", name: "Dôme Lunaire", description: "Observatoire sous les étoiles.", zoneId: "observatoire_lune", levelRequired: 68, rooms: 9, icon: "🔭", mobs: ["constellation_vivante", "sentinelle_lunaire", "archimage_astral"], bossId: "boss_dome_lunaire", lootItemId: "lentille_lunaire" },
  { id: "passage_constellation", name: "Passage des Constellations", description: "Corridor entre les étoiles mortes.", zoneId: "observatoire_lune", levelRequired: 85, rooms: 10, icon: "✨", mobs: ["archimage_astral", "constellation_vivante"], bossId: "boss_dome_lunaire", lootItemId: "essence_constellation" },
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

export const EXPANSION_DUNGEONS_V40: DungeonDefinition[] = DUNGEON_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  zoneId: seed.zoneId,
  levelRequired: seed.levelRequired,
  rooms: seed.rooms,
  bossId: seed.bossId,
  icon: seed.icon,
  groupSize: { min: seed.levelRequired >= 80 ? 3 : seed.levelRequired >= 50 ? 2 : 1, max: 4 },
  roomMonsters: buildRooms(seed.mobs, seed.rooms, seed.bossId),
  rewards: {
    xp: seed.levelRequired * 55,
    eclats: seed.levelRequired * 28,
    items: seed.lootItemId
      ? [{ itemId: seed.lootItemId, chance: 0.18, quantity: 1 }]
      : undefined,
  },
}));

export const EXPANSION_DUNGEON_IDS_BY_ZONE_V40: Record<string, string[]> = DUNGEON_SEEDS.reduce(
  (acc, seed) => {
    const list = acc[seed.zoneId] ?? [];
    list.push(seed.id);
    acc[seed.zoneId] = list;
    return acc;
  },
  {} as Record<string, string[]>
);
