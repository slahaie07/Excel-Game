/**
 * v4.2 — Quêtes complément Terreval (dailies manquantes, ponts régionaux, guilde, chasses, POI)
 */

import type { QuestDefinition } from "./quests";
import { MAP_POIS } from "./mapPOIs";
import { ZONES } from "./zones";
import { EXPANSION_ZONES_V40 } from "./expansionZonesV40";

const ZONE_GIVER: Record<string, string> = {
  vallee_eveils: "maitre_eveil",
  foret_lumina: "pretre_lumina",
  port_nebula: "chef_guilde",
  desert_umbra: "guide_desert",
  citadelle_stellaire: "chef_guilde",
  arene_pvp: "maitre_arene",
  cotes_brume: "pecheur_brume",
  grottes_maree: "explorateur_grotte",
  recif_abyssal: "plongeur_ether",
  ile_tempete: "capitaine_tempete",
  sanctuaire_marins: "oracles_marins",
  profondeurs_nereides: "nereide_heralde",
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
  const zone = ZONES.find((z) => z.id === zoneId);
  return ZONE_GIVER[zoneId] ?? zone?.npcs[0] ?? "chef_guilde";
}

function levelForZone(zoneId: string): number {
  const zone = ZONES.find((z) => z.id === zoneId);
  return zone?.levelRange[0] ?? 10;
}

/** 14 dailies — port_nebula, arene_pvp + 12 zones v4.0 (v3.1 couvre déjà 10 autres zones) */
const MISSING_DAILY_ZONE_IDS = [
  "port_nebula",
  "arene_pvp",
  ...EXPANSION_ZONES_V40.map((z) => z.id),
];

const DAILY_ZONE_LABELS: Record<string, string> = {
  port_nebula: "Chasse Port",
  arene_pvp: "Chasse Arène",
  plateau_givre: "Chasse Givre",
  monts_cristallins: "Chasse Monts",
  glaise_nord: "Chasse Boréal",
  marais_ether: "Chasse Marais",
  cite_flottante: "Chasse Cité",
  catacombes_humides: "Chasse Catacombes",
  vallee_cendres: "Chasse Cendres",
  forge_volcanique: "Chasse Forge",
  chambre_magma: "Chasse Magma",
  iles_stellaires: "Chasse Îles",
  atoll_nebula: "Chasse Atoll",
  observatoire_lune: "Chasse Observatoire",
};

const DAILY_V42_QUESTS: QuestDefinition[] = MISSING_DAILY_ZONE_IDS.map((zoneId, index) => ({
  id: `daily_${zoneId}`,
  name: DAILY_ZONE_LABELS[zoneId] ?? `Chasse ${zoneId.replace(/_/g, " ")}`,
  description: "Éliminez des monstres de la zone pour des récompenses bonus.",
  type: "daily",
  levelRequired: levelForZone(zoneId),
  zoneId,
  giverNpcId: giverForZone(zoneId),
  objectives: [
    {
      type: "kill",
      targetId: "any",
      count: 6 + (index % 3) * 2,
      description: `Éliminer ${6 + (index % 3) * 2} monstres`,
    },
  ],
  rewards: {
    xp: 200 + index * 80,
    eclats: 80 + index * 35,
  },
}));

/** 4 quêtes pont — relient le contenu existant aux nouvelles régions */
const BRIDGE_QUESTS: QuestDefinition[] = [
  {
    id: "appel_marais",
    name: "L'Appel du Marais",
    description: "Le prêtre de Lumina sent une corruption venant des marais à l'est.",
    type: "main",
    levelRequired: 28,
    zoneId: "foret_lumina",
    giverNpcId: "pretre_lumina",
    objectives: [
      { type: "talk", targetId: "guide_marais", count: 1, description: "Rencontrer le guide du Marais d'Éther" },
      { type: "explore", targetId: "marais_ether", count: 1, description: "Atteindre le Marais d'Éther" },
    ],
    rewards: { xp: 600, eclats: 250 },
    prerequisiteQuests: ["route_lumina"],
  },
  {
    id: "appel_iles",
    name: "L'Appel des Îles",
    description: "La citadelle signale un archipel céleste à l'ouest de Nébula.",
    type: "main",
    levelRequired: 18,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "talk", targetId: "cartographe_iles", count: 1, description: "Parler au cartographe stellaire" },
      { type: "explore", targetId: "iles_stellaires", count: 1, description: "Atteindre les Îles Stellaires" },
    ],
    rewards: { xp: 450, eclats: 200 },
    prerequisiteQuests: ["appel_citadelle"],
  },
  {
    id: "appel_cendres",
    name: "L'Appel des Cendres",
    description: "Le guide du désert parle de volcans actifs au sud des dunes.",
    type: "main",
    levelRequired: 38,
    zoneId: "desert_umbra",
    giverNpcId: "guide_desert",
    objectives: [
      { type: "talk", targetId: "prospecteur_cendres", count: 1, description: "Rencontrer le prospecteur des cendres" },
      { type: "explore", targetId: "vallee_cendres", count: 1, description: "Atteindre la Vallée des Cendres" },
    ],
    rewards: { xp: 700, eclats: 300 },
    prerequisiteQuests: ["mirage_pharaon"],
  },
  {
    id: "appel_givre",
    name: "L'Appel du Givre",
    description: "Un écho glacial remonte des abysses — des terres gelées attendent au nord.",
    type: "main",
    levelRequired: 55,
    zoneId: "profondeurs_nereides",
    giverNpcId: "nereide_heralde",
    objectives: [
      { type: "talk", targetId: "guide_givre", count: 1, description: "Rencontrer le guide du Plateau de Givre" },
      { type: "explore", targetId: "plateau_givre", count: 1, description: "Atteindre le Plateau de Givre" },
    ],
    rewards: { xp: 1200, eclats: 500 },
    prerequisiteQuests: ["appel_ocean"],
  },
];

/** 7 quêtes guilde — une par grande région + raid Terreval + quotidien */
const GUILD_V42_QUESTS: QuestDefinition[] = [
  {
    id: "guilde_archipel",
    name: "Patrouille de l'Archipel",
    description: "La guilde demande de sécuriser les eaux de l'Archipel de Brume.",
    type: "guild",
    levelRequired: 25,
    zoneId: "cotes_brume",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "meduse_brume", count: 10, description: "Éliminer 10 Méduses de Brume" },
      { type: "kill", targetId: "leviathan_brume", count: 1, description: "Vaincre le Léviathan de Brume" },
    ],
    rewards: { xp: 1200, eclats: 500 },
    prerequisiteQuests: ["guilde_premiers_refus", "appel_ocean"],
  },
  {
    id: "guilde_givre",
    name: "Expédition Boréale",
    description: "Rapportez la preuve de votre passage dans les Hautes Terres de Givre.",
    type: "guild",
    levelRequired: 70,
    zoneId: "monts_cristallins",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "golem_givre", count: 8, description: "Éliminer 8 Golems de Givre" },
      { type: "kill", targetId: "dragon_givre", count: 1, description: "Vaincre le Dragon de Givre" },
    ],
    rewards: { xp: 3500, eclats: 1400 },
    prerequisiteQuests: ["guilde_archipel", "appel_givre"],
  },
  {
    id: "guilde_marais",
    name: "Purification de Guilde",
    description: "La guilde finance une expédition dans le Marais d'Éther.",
    type: "guild",
    levelRequired: 45,
    zoneId: "marais_ether",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boue_vivante", count: 12, description: "Éliminer 12 Boues Vivantes" },
      { type: "kill", targetId: "boss_crypte_humide", count: 1, description: "Vaincre le Gardien de la Crypte Humide" },
    ],
    rewards: { xp: 1800, eclats: 750 },
    prerequisiteQuests: ["guilde_archipel", "appel_marais"],
  },
  {
    id: "guilde_cendres",
    name: "Convoi des Cendres",
    description: "Escortez un convoi de la guilde à travers la cordillère volcanique.",
    type: "guild",
    levelRequired: 60,
    zoneId: "vallee_cendres",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "salamandre_cendre", count: 10, description: "Éliminer 10 Salamandres de Cendre" },
      { type: "kill", targetId: "boss_trone_magma", count: 1, description: "Vaincre le Gardien du Trône du Magma" },
    ],
    rewards: { xp: 2800, eclats: 1100 },
    prerequisiteQuests: ["guilde_marais", "appel_cendres"],
  },
  {
    id: "guilde_stellaire",
    name: "Carte Stellaire de Guilde",
    description: "Cartographiez les îles célestes pour le registre de la guilde.",
    type: "guild",
    levelRequired: 40,
    zoneId: "iles_stellaires",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "explore", targetId: "iles_stellaires", count: 1, description: "Explorer les Îles Stellaires" },
      { type: "explore", targetId: "atoll_nebula", count: 1, description: "Explorer l'Atoll de Nébula" },
      { type: "kill", targetId: "boss_dome_lunaire", count: 1, description: "Vaincre le Gardien du Dôme Lunaire" },
    ],
    rewards: { xp: 2200, eclats: 900 },
    prerequisiteQuests: ["guilde_archipel", "appel_iles"],
  },
  {
    id: "guilde_raid_terreval",
    name: "Raid Terreval",
    description: "La guilde convoque ses champions pour un raid à travers Terreval.",
    type: "guild",
    levelRequired: 100,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_couronne_ether", count: 1, description: "Vaincre le Gardien de la Couronne d'Éther" },
      { type: "kill", targetId: "dragon_givre", count: 1, description: "Vaincre le Dragon de Givre" },
      { type: "kill", targetId: "titan_cendre", count: 1, description: "Vaincre le Titan de Cendre" },
    ],
    rewards: { xp: 8000, eclats: 3500, items: [{ itemId: "coeur_nexus", quantity: 1 }] },
    prerequisiteQuests: ["guilde_givre", "guilde_cendres", "guilde_stellaire", "cartographe_terreval"],
  },
  {
    id: "guilde_quotidien",
    name: "Service Quotidien",
    description: "Contribution journalière à la guilde — éliminez des monstres où que vous soyez.",
    type: "guild",
    levelRequired: 20,
    zoneId: "port_nebula",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "any", count: 20, description: "Éliminer 20 monstres pour la guilde" },
    ],
    rewards: { xp: 400, eclats: 200 },
    prerequisiteQuests: ["guilde_premiers_refus"],
  },
];

interface HuntSeed {
  zoneId: string;
  name: string;
  description: string;
  monsterId: string;
  monsterLabel: string;
  count: number;
}

const HUNT_SEEDS: HuntSeed[] = [
  { zoneId: "plateau_givre", name: "Chasse au Givre", description: "Les yétis de cristal terrorisent les alpinistes.", monsterId: "yeti_cristal", monsterLabel: "Yétis de Cristal", count: 8 },
  { zoneId: "monts_cristallins", name: "Chasse aux Golems", description: "Les golems de givre bloquent les sentiers de montagne.", monsterId: "golem_givre", monsterLabel: "Golems de Givre", count: 6 },
  { zoneId: "glaise_nord", name: "Chasse Boréale", description: "Des spectres de givre hantent la toundra.", monsterId: "spectre_givre", monsterLabel: "Spectres de Givre", count: 6 },
  { zoneId: "marais_ether", name: "Chasse aux Boues", description: "Les boues vivantes engloutissent les sentiers du marais.", monsterId: "boue_vivante", monsterLabel: "Boues Vivantes", count: 10 },
  { zoneId: "cite_flottante", name: "Chasse aux Runes", description: "Les golems de rune patrouillent les ruines suspendues.", monsterId: "golem_rune", monsterLabel: "Golems de Rune", count: 7 },
  { zoneId: "catacombes_humides", name: "Chasse aux Squelettes", description: "Les morts-vivants infestent les catacombes humides.", monsterId: "squelette_marais", monsterLabel: "Squelettes du Marais", count: 8 },
  { zoneId: "vallee_cendres", name: "Chasse aux Salamandres", description: "Les salamandres de cendre attaquent les prospecteurs.", monsterId: "salamandre_cendre", monsterLabel: "Salamandres de Cendre", count: 8 },
  { zoneId: "forge_volcanique", name: "Chasse au Magma", description: "Les élémentaux de magma surchauffent la forge.", monsterId: "elemental_magma", monsterLabel: "Élémentaux de Magma", count: 6 },
  { zoneId: "chambre_magma", name: "Chasse aux Colosses", description: "Les colosses de magma gardent le cœur volcanique.", monsterId: "colosse_magma", monsterLabel: "Colosses de Magma", count: 5 },
  { zoneId: "iles_stellaires", name: "Chasse Stellaire", description: "Les sprites stellaires sèment le chaos sur les îles.", monsterId: "sprite_stellaire", monsterLabel: "Sprites Stellaires", count: 10 },
  { zoneId: "atoll_nebula", name: "Chasse aux Méduses", description: "Les méduses stellaires envahissent les lagons.", monsterId: "meduse_stellaire", monsterLabel: "Méduses Stellaires", count: 8 },
  { zoneId: "observatoire_lune", name: "Chasse Lunaire", description: "Les constellations vivantes défendent l'observatoire.", monsterId: "constellation_vivante", monsterLabel: "Constellations Vivantes", count: 5 },
];

const SIDE_HUNT_V42_QUESTS: QuestDefinition[] = HUNT_SEEDS.map((seed) => ({
  id: `chasse_${seed.zoneId}`,
  name: seed.name,
  description: seed.description,
  type: "side",
  levelRequired: levelForZone(seed.zoneId),
  zoneId: seed.zoneId,
  giverNpcId: giverForZone(seed.zoneId),
  objectives: [
    {
      type: "kill",
      targetId: seed.monsterId,
      count: seed.count,
      description: `Éliminer ${seed.count} ${seed.monsterLabel}`,
    },
  ],
  rewards: {
    xp: levelForZone(seed.zoneId) * 10,
    eclats: levelForZone(seed.zoneId) * 4,
  },
  prerequisiteQuests: [`decouverte_${seed.zoneId}`],
}));

/** POI trésor + lore — explore avec targetId = poi.id */
const POI_TREASURE_LORE = MAP_POIS.filter((poi) => poi.type === "treasure" || poi.type === "lore");

const POI_V42_QUESTS: QuestDefinition[] = POI_TREASURE_LORE.map((poi) => ({
  id: `quete_${poi.id}`,
  name: poi.type === "treasure" ? `Trésor — ${poi.name}` : `Chronique — ${poi.name}`,
  description: poi.description,
  type: "side",
  levelRequired: levelForZone(poi.zoneId),
  zoneId: poi.zoneId,
  giverNpcId: giverForZone(poi.zoneId),
  objectives: [
    {
      type: "explore",
      targetId: poi.id,
      count: 1,
      description: `Découvrir ${poi.name}`,
    },
  ],
  rewards: {
    xp: levelForZone(poi.zoneId) * 8,
    eclats: levelForZone(poi.zoneId) * 3,
    items: poi.type === "treasure" ? [{ itemId: "parchemin_ancien", quantity: 1 }] : undefined,
  },
}));

export const EXPANSION_QUESTS_V42: QuestDefinition[] = [
  ...DAILY_V42_QUESTS,
  ...BRIDGE_QUESTS,
  ...GUILD_V42_QUESTS,
  ...SIDE_HUNT_V42_QUESTS,
  ...POI_V42_QUESTS,
];
