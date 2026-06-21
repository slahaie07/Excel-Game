/**
 * v5.0 — Quêtes finales : POI restants + donjons mythiques + chroniques endgame
 */

import type { QuestDefinition } from "./quests";
import { MAP_POIS } from "./mapPOIs";
import { ZONES } from "./zones";
import { EXPANSION_DUNGEONS_V50 } from "./expansionDungeonsV50";
import { EXPANSION_ZONES_V40 } from "./expansionZonesV40";

const V40_ZONE_IDS = new Set(EXPANSION_ZONES_V40.map((z) => z.id));

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

const POI_TYPE_LABELS: Record<string, string> = {
  landmark: "Repère",
  vendor: "Marchand",
  teleporter: "Portail",
  dungeon: "Donjon",
};

/** 32 quêtes POI — landmark, vendor, teleporter, dungeon */
const POI_V50_TYPES = new Set(["landmark", "vendor", "teleporter", "dungeon"]);

const POI_V50_QUESTS: QuestDefinition[] = MAP_POIS.filter((poi) =>
  POI_V50_TYPES.has(poi.type)
).map((poi) => ({
  id: `quete_${poi.id}`,
  name: `${POI_TYPE_LABELS[poi.type] ?? "POI"} — ${poi.name}`,
  description: poi.description,
  type: "side" as const,
  levelRequired: levelForZone(poi.zoneId),
  zoneId: poi.zoneId,
  giverNpcId: giverForZone(poi.zoneId),
  objectives: [
    {
      type: "explore" as const,
      targetId: poi.id,
      count: 1,
      description: `Découvrir ${poi.name}`,
    },
  ],
  rewards: {
    xp: levelForZone(poi.zoneId) * 10,
    eclats: levelForZone(poi.zoneId) * 4,
    items:
      poi.type === "vendor"
        ? [{ itemId: "potion_vie", quantity: 2 }]
        : poi.type === "dungeon"
          ? [{ itemId: "parchemin_ancien", quantity: 1 }]
          : undefined,
  },
}));

/** 26 quêtes donjon mythique */
const DUNGEON_V50_QUESTS: QuestDefinition[] = EXPANSION_DUNGEONS_V50.map((dungeon) => ({
  id: `quete_${dungeon.id}`,
  name: `Mythique — ${dungeon.name}`,
  description: `Affrontez le gardien mythique du donjon ${dungeon.name}.`,
  type: "dungeon" as const,
  levelRequired: dungeon.levelRequired,
  zoneId: dungeon.zoneId,
  giverNpcId: giverForZone(dungeon.zoneId),
  objectives: [
    {
      type: "kill" as const,
      targetId: dungeon.bossId,
      count: 1,
      description: `Vaincre le gardien mythique de ${dungeon.name}`,
    },
  ],
  rewards: {
    xp: dungeon.levelRequired * 70,
    eclats: dungeon.levelRequired * 30,
    items: dungeon.rewards.items?.[0]
      ? [{ itemId: dungeon.rewards.items[0].itemId, quantity: 1 }]
      : undefined,
  },
  ...(V40_ZONE_IDS.has(dungeon.zoneId)
    ? { prerequisiteQuests: [`decouverte_${dungeon.zoneId}`] }
    : {}),
}));

/** 6 chroniques endgame — capstone v5 */
const ENDGAME_V50_QUESTS: QuestDefinition[] = [
  {
    id: "chronique_mythique_givre",
    name: "Chronique Mythique du Givre",
    description: "Triomphez des trois gardiens mythiques du nord.",
    type: "main",
    levelRequired: 120,
    zoneId: "glaise_nord",
    giverNpcId: "gardien_glaise",
    objectives: [
      { type: "kill", targetId: "boss_mythique_glacier", count: 1, description: "Vaincre le Gardien Mythique du Glacier" },
      { type: "kill", targetId: "boss_mythique_sommet", count: 1, description: "Vaincre le Gardien Mythique du Sommet" },
      { type: "kill", targetId: "boss_mythique_toundra", count: 1, description: "Vaincre le Gardien Mythique de la Toundra" },
    ],
    rewards: { xp: 12000, eclats: 5000, items: [{ itemId: "essence_boreale", quantity: 2 }] },
    prerequisiteQuests: ["maitre_region_givre", "cartographe_terreval"],
  },
  {
    id: "chronique_mythique_cendres",
    name: "Chronique Mythique des Cendres",
    description: "Domptez la fureur volcanique de Terreval.",
    type: "main",
    levelRequired: 130,
    zoneId: "chambre_magma",
    giverNpcId: "oracle_cendres",
    objectives: [
      { type: "kill", targetId: "boss_mythique_lave", count: 1, description: "Vaincre le Gardien Mythique de Lave" },
      { type: "kill", targetId: "boss_mythique_forge", count: 1, description: "Vaincre le Gardien Mythique de la Forge" },
      { type: "kill", targetId: "boss_mythique_magma", count: 1, description: "Vaincre le Gardien Mythique du Magma" },
    ],
    rewards: { xp: 14000, eclats: 6000, items: [{ itemId: "fragment_primordial", quantity: 2 }] },
    prerequisiteQuests: ["maitre_region_cendres", "cartographe_terreval"],
  },
  {
    id: "chronique_mythique_stellaire",
    name: "Chronique Mythique Stellaire",
    description: "Atteignez les constellations vivantes du dôme lunaire.",
    type: "main",
    levelRequired: 140,
    zoneId: "observatoire_lune",
    giverNpcId: "gardien_observatoire",
    objectives: [
      { type: "kill", targetId: "boss_mythique_ciel", count: 1, description: "Vaincre le Gardien Mythique du Ciel" },
      { type: "kill", targetId: "boss_mythique_lagoon", count: 1, description: "Vaincre le Gardien Mythique du Lagoon" },
      { type: "kill", targetId: "boss_mythique_dome", count: 1, description: "Vaincre le Gardien Mythique du Dôme" },
    ],
    rewards: { xp: 16000, eclats: 7000, items: [{ itemId: "essence_constellation", quantity: 2 }] },
    prerequisiteQuests: ["maitre_region_stellaire", "cartographe_terreval"],
  },
  {
    id: "chronique_mythique_marais",
    name: "Chronique Mythique des Marais",
    description: "Purifiez les eaux stagnantes de l'est.",
    type: "main",
    levelRequired: 80,
    zoneId: "catacombes_humides",
    giverNpcId: "exorciste_marais",
    objectives: [
      { type: "kill", targetId: "boss_mythique_marecage", count: 1, description: "Vaincre le Gardien Mythique du Marécage" },
      { type: "kill", targetId: "boss_mythique_cite", count: 1, description: "Vaincre le Gardien Mythique de la Cité" },
      { type: "kill", targetId: "boss_mythique_crypte", count: 1, description: "Vaincre le Gardien Mythique de la Crypte" },
    ],
    rewards: { xp: 8000, eclats: 3500, items: [{ itemId: "essence_marais", quantity: 3 }] },
    prerequisiteQuests: ["maitre_region_marais", "cartographe_terreval"],
  },
  {
    id: "chronique_terreval_finale",
    name: "Chronique Finale de Terreval",
    description: "La guilde proclame les champions qui ont conquis Terreval.",
    type: "main",
    levelRequired: 150,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_mythique_nexus", count: 1, description: "Vaincre le Gardien Mythique du Nexus" },
      { type: "kill", targetId: "dragon_givre", count: 1, description: "Vaincre le Dragon de Givre" },
      { type: "kill", targetId: "titan_cendre", count: 1, description: "Vaincre le Titan de Cendre" },
    ],
    rewards: { xp: 20000, eclats: 10000, items: [{ itemId: "couronne_aether", quantity: 1 }] },
    prerequisiteQuests: [
      "chronique_mythique_givre",
      "chronique_mythique_cendres",
      "chronique_mythique_stellaire",
      "chronique_mythique_marais",
      "guilde_raid_terreval",
    ],
  },
  {
    id: "explorateur_poi_terreval",
    name: "Explorateur de Terreval",
    description: "Découvrez tous les points d'intérêt majeurs de Terreval.",
    type: "side",
    levelRequired: 50,
    zoneId: "port_nebula",
    giverNpcId: "chef_guilde",
    objectives: MAP_POIS.slice(0, 12).map((poi) => ({
      type: "explore" as const,
      targetId: poi.id,
      count: 1,
      description: `Découvrir ${poi.name}`,
    })),
    rewards: { xp: 5000, eclats: 2500, items: [{ itemId: "carte_tresor", quantity: 1 }] },
    prerequisiteQuests: ["cartographe_terreval"],
  },
];

export const EXPANSION_QUESTS_V50: QuestDefinition[] = [
  ...POI_V50_QUESTS,
  ...DUNGEON_V50_QUESTS,
  ...ENDGAME_V50_QUESTS,
];
