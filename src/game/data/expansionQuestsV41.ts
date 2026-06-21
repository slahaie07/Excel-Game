/**
 * v4.1 — Quêtes régionales Terreval (12 zones v4.0)
 */

import type { QuestDefinition } from "./quests";
import { EXPANSION_DUNGEONS_V40 } from "./expansionDungeonsV40";
import { MAP_REGIONS } from "./expansionZonesV40";

const ZONE_GIVER_V41: Record<string, string> = {
  plateau_givre: "guide_givre",
  monts_cristallins: "alpiniste_ether",
  glaise_nord: "gardien_glaise",
  marais_ether: "guide_marais",
  cite_flottante: "marchand_flottant",
  catacombes_humides: "exorciste_marais",
  vallee_cendres: "prospecteur_cendres",
  forge_volcanique: "maitre_forge_volcan",
  chambre_magma: "oracle_cendres",
  iles_stellaires: "cartographe_iles",
  atoll_nebula: "plongeur_stellaire",
  observatoire_lune: "gardien_observatoire",
};

function giverForZone(zoneId: string): string {
  return ZONE_GIVER_V41[zoneId] ?? "chef_guilde";
}

interface DiscoverySeed {
  zoneId: string;
  name: string;
  monsterId: string;
  monsterLabel: string;
  levelRequired: number;
}

const DISCOVERY_SEEDS: DiscoverySeed[] = [
  { zoneId: "plateau_givre", name: "Premiers Pas sur le Givre", monsterId: "yeti_cristal", monsterLabel: "Yétis de Cristal", levelRequired: 55 },
  { zoneId: "monts_cristallins", name: "Échos des Monts", monsterId: "golem_givre", monsterLabel: "Golems de Givre", levelRequired: 70 },
  { zoneId: "glaise_nord", name: "Souffle Boréal", monsterId: "spectre_givre", monsterLabel: "Spectres de Givre", levelRequired: 90 },
  { zoneId: "marais_ether", name: "Brumes du Marais", monsterId: "boue_vivante", monsterLabel: "Boues Vivantes", levelRequired: 28 },
  { zoneId: "cite_flottante", name: "Ruines Suspendues", monsterId: "golem_rune", monsterLabel: "Golems de Rune", levelRequired: 42 },
  { zoneId: "catacombes_humides", name: "Échos des Catacombes", monsterId: "squelette_marais", monsterLabel: "Squelettes du Marais", levelRequired: 52 },
  { zoneId: "vallee_cendres", name: "Cendres Stellaires", monsterId: "salamandre_cendre", monsterLabel: "Salamandres de Cendre", levelRequired: 38 },
  { zoneId: "forge_volcanique", name: "Forge Ardente", monsterId: "elemental_magma", monsterLabel: "Élémentaux de Magma", levelRequired: 58 },
  { zoneId: "chambre_magma", name: "Cœur Volcanique", monsterId: "colosse_magma", monsterLabel: "Colosses de Magma", levelRequired: 85 },
  { zoneId: "iles_stellaires", name: "Navigateurs Stellaires", monsterId: "sprite_stellaire", monsterLabel: "Sprites Stellaires", levelRequired: 18 },
  { zoneId: "atoll_nebula", name: "Lagons Célestes", monsterId: "meduse_stellaire", monsterLabel: "Méduses Stellaires", levelRequired: 32 },
  { zoneId: "observatoire_lune", name: "Veille Lunaire", monsterId: "constellation_vivante", monsterLabel: "Constellations Vivantes", levelRequired: 62 },
];

const BRIDGE_BY_ZONE: Record<string, string> = {
  plateau_givre: "appel_givre",
  monts_cristallins: "appel_givre",
  glaise_nord: "appel_givre",
  marais_ether: "appel_marais",
  cite_flottante: "appel_marais",
  catacombes_humides: "appel_marais",
  vallee_cendres: "appel_cendres",
  forge_volcanique: "appel_cendres",
  chambre_magma: "appel_cendres",
  iles_stellaires: "appel_iles",
  atoll_nebula: "appel_iles",
  observatoire_lune: "appel_iles",
};

const DISCOVERY_QUESTS: QuestDefinition[] = DISCOVERY_SEEDS.map((seed) => ({
  id: `decouverte_${seed.zoneId}`,
  name: seed.name,
  description: `Explorez ${seed.name.split(" ").slice(-2).join(" ") || "la zone"} et repoussez les créatures locales.`,
  type: "side",
  levelRequired: seed.levelRequired,
  zoneId: seed.zoneId,
  giverNpcId: giverForZone(seed.zoneId),
  objectives: [
    { type: "explore", targetId: seed.zoneId, count: 1, description: `Explorer la zone` },
    { type: "kill", targetId: seed.monsterId, count: 5, description: `Éliminer 5 ${seed.monsterLabel}` },
  ],
  rewards: {
    xp: seed.levelRequired * 12,
    eclats: seed.levelRequired * 5,
  },
  prerequisiteQuests: BRIDGE_BY_ZONE[seed.zoneId] ? [BRIDGE_BY_ZONE[seed.zoneId]!] : undefined,
}));

const REGION_MASTER_QUESTS: QuestDefinition[] = [
  {
    id: "maitre_region_givre",
    name: "Maître du Givre",
    description: "Unissez les Hautes Terres de Givre et affrontez le dragon boréal.",
    type: "main",
    levelRequired: 100,
    zoneId: "glaise_nord",
    giverNpcId: "gardien_glaise",
    objectives: [
      { type: "explore", targetId: "plateau_givre", count: 1, description: "Explorer le Plateau de Givre" },
      { type: "explore", targetId: "monts_cristallins", count: 1, description: "Explorer les Monts Cristallins" },
      { type: "explore", targetId: "glaise_nord", count: 1, description: "Explorer la Glaise du Nord" },
      { type: "kill", targetId: "dragon_givre", count: 1, description: "Vaincre le Dragon de Givre" },
    ],
    rewards: { xp: 8000, eclats: 3500, items: [{ itemId: "essence_boreale", quantity: 1 }] },
    prerequisiteQuests: ["decouverte_plateau_givre", "decouverte_monts_cristallins", "decouverte_glaise_nord"],
  },
  {
    id: "maitre_region_marais",
    name: "Maître du Marais",
    description: "Purifiez le Marais d'Éther et terrassez le gardien des catacombes.",
    type: "main",
    levelRequired: 65,
    zoneId: "catacombes_humides",
    giverNpcId: "exorciste_marais",
    objectives: [
      { type: "explore", targetId: "marais_ether", count: 1, description: "Explorer le Marais d'Éther" },
      { type: "explore", targetId: "cite_flottante", count: 1, description: "Explorer la Cité Flottante" },
      { type: "explore", targetId: "catacombes_humides", count: 1, description: "Explorer les Catacombes Humides" },
      { type: "kill", targetId: "boss_crypte_humide", count: 1, description: "Vaincre le Gardien de la Crypte Humide" },
    ],
    rewards: { xp: 5000, eclats: 2200, items: [{ itemId: "essence_marais", quantity: 1 }] },
    prerequisiteQuests: ["decouverte_marais_ether", "decouverte_cite_flottante", "decouverte_catacombes_humides"],
  },
  {
    id: "maitre_region_cendres",
    name: "Maître des Cendres",
    description: "Domptez la Cordillère des Cendres et défiez le Titan de Magma.",
    type: "main",
    levelRequired: 95,
    zoneId: "chambre_magma",
    giverNpcId: "oracle_cendres",
    objectives: [
      { type: "explore", targetId: "vallee_cendres", count: 1, description: "Explorer la Vallée des Cendres" },
      { type: "explore", targetId: "forge_volcanique", count: 1, description: "Explorer la Forge Volcanique" },
      { type: "explore", targetId: "chambre_magma", count: 1, description: "Explorer la Chambre du Magma" },
      { type: "kill", targetId: "titan_cendre", count: 1, description: "Vaincre le Titan de Cendre" },
    ],
    rewards: { xp: 9000, eclats: 4000, items: [{ itemId: "fragment_primordial", quantity: 1 }] },
    prerequisiteQuests: ["decouverte_vallee_cendres", "decouverte_forge_volcanique", "decouverte_chambre_magma"],
  },
  {
    id: "maitre_region_stellaire",
    name: "Maître Stellaire",
    description: "Cartographiez les Îles Stellaires et triomphez du gardien lunaire.",
    type: "main",
    levelRequired: 80,
    zoneId: "observatoire_lune",
    giverNpcId: "gardien_observatoire",
    objectives: [
      { type: "explore", targetId: "iles_stellaires", count: 1, description: "Explorer les Îles Stellaires" },
      { type: "explore", targetId: "atoll_nebula", count: 1, description: "Explorer l'Atoll de Nébula" },
      { type: "explore", targetId: "observatoire_lune", count: 1, description: "Explorer l'Observatoire de la Lune" },
      { type: "kill", targetId: "boss_dome_lunaire", count: 1, description: "Vaincre le Gardien du Dôme Lunaire" },
    ],
    rewards: { xp: 6500, eclats: 2800, items: [{ itemId: "essence_constellation", quantity: 1 }] },
    prerequisiteQuests: ["decouverte_iles_stellaires", "decouverte_atoll_nebula", "decouverte_observatoire_lune"],
  },
];

const DUNGEON_V40_QUESTS: QuestDefinition[] = EXPANSION_DUNGEONS_V40.map((dungeon) => ({
  id: `quete_${dungeon.id}`,
  name: `Gardien — ${dungeon.name}`,
  description: `Affrontez et vainquez le gardien du donjon ${dungeon.name}.`,
  type: "dungeon",
  levelRequired: dungeon.levelRequired,
  zoneId: dungeon.zoneId,
  giverNpcId: giverForZone(dungeon.zoneId),
  objectives: [
    {
      type: "kill",
      targetId: dungeon.bossId,
      count: 1,
      description: `Vaincre le gardien de ${dungeon.name}`,
    },
  ],
  rewards: {
    xp: dungeon.levelRequired * 50,
    eclats: dungeon.levelRequired * 22,
    items: dungeon.rewards.items?.[0]
      ? [{ itemId: dungeon.rewards.items[0].itemId, quantity: 1 }]
      : undefined,
  },
}));

const V40_ZONE_IDS = DISCOVERY_SEEDS.map((s) => s.zoneId);

const CARTOGRAPHE_QUEST: QuestDefinition = {
  id: "cartographe_terreval",
  name: "Cartographe de Terreval",
  description: "Le cartographe des îles vous demande de cartographier les quatre nouveaux continents.",
  type: "main",
  levelRequired: 120,
  zoneId: "iles_stellaires",
  giverNpcId: "cartographe_iles",
  objectives: V40_ZONE_IDS.map((zoneId) => ({
    type: "explore" as const,
    targetId: zoneId,
    count: 1,
    description: `Explorer ${zoneId.replace(/_/g, " ")}`,
  })),
  rewards: {
    xp: 15000,
    eclats: 6000,
    items: [{ itemId: "parchemin_flottant", quantity: 3 }],
  },
  prerequisiteQuests: MAP_REGIONS.filter((r) =>
    ["givre", "marais", "cendres", "stellaire"].includes(r.id)
  ).map((r) => `maitre_region_${r.id}`),
};

export const EXPANSION_QUESTS_V41: QuestDefinition[] = [
  ...DISCOVERY_QUESTS,
  ...REGION_MASTER_QUESTS,
  ...DUNGEON_V40_QUESTS,
  CARTOGRAPHE_QUEST,
];
