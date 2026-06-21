/**
 * Système de quêtes
 */

import { EXPANSION_QUESTS_V31 } from "./expansionQuests";
import { EXPANSION_QUESTS_V41 } from "./expansionQuestsV41";

export type QuestType = "main" | "side" | "daily" | "guild" | "dungeon";
export type QuestObjectiveType = "kill" | "collect" | "talk" | "explore" | "craft" | "deliver";

export interface QuestObjective {
  type: QuestObjectiveType;
  targetId: string;
  count: number;
  description: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  levelRequired: number;
  zoneId: string;
  giverNpcId: string;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    eclats: number;
    items?: { itemId: string; quantity: number }[];
    spells?: string[];
  };
  prerequisiteQuests?: string[];
}

export const QUESTS: QuestDefinition[] = [
  {
    id: "eveil_initial",
    name: "L'Éveil",
    description: "Découvrez votre pouvoir d'Éveilleur en touchant le Cristal ancestral.",
    type: "main",
    levelRequired: 1,
    zoneId: "vallee_eveils",
    giverNpcId: "maitre_eveil",
    objectives: [
      { type: "talk", targetId: "maitre_eveil", count: 1, description: "Parler au Maître de l'Éveil" },
      { type: "kill", targetId: "graine_ombre", count: 3, description: "Éliminer 3 Graines d'Ombre" },
    ],
    rewards: { xp: 100, eclats: 50, items: [{ itemId: "epee_apprenti", quantity: 1 }, { itemId: "tunique_debutant", quantity: 1 }] },
  },
  {
    id: "premiers_pas",
    name: "Premiers Pas",
    description: "Explorez la Vallée des Éveils et apprenez les bases du combat.",
    type: "main",
    levelRequired: 1,
    zoneId: "vallee_eveils",
    giverNpcId: "maitre_eveil",
    objectives: [
      { type: "kill", targetId: "wisp_sauvage", count: 5, description: "Éliminer 5 Wisps Sauvages" },
      { type: "explore", targetId: "vallee_eveils", count: 1, description: "Explorer toute la vallée" },
    ],
    rewards: { xp: 150, eclats: 75 },
    prerequisiteQuests: ["eveil_initial"],
  },
  {
    id: "menace_ruines",
    name: "Menace des Ruines",
    description: "Un Gardien des Ruines corrompu terrorise la vallée. Éliminez-le !",
    type: "main",
    levelRequired: 8,
    zoneId: "vallee_eveils",
    giverNpcId: "maitre_eveil",
    objectives: [
      { type: "kill", targetId: "gardien_ruines", count: 1, description: "Vaincre le Gardien des Ruines" },
    ],
    rewards: { xp: 500, eclats: 200, items: [{ itemId: "cristal_eveil", quantity: 1 }] },
    prerequisiteQuests: ["premiers_pas"],
  },
  {
    id: "route_lumina",
    name: "La Route de Lumina",
    description: "Rendez-vous à la Forêt de Lumina pour rejoindre l'Ordre.",
    type: "main",
    levelRequired: 10,
    zoneId: "foret_lumina",
    giverNpcId: "pretre_lumina",
    objectives: [
      { type: "talk", targetId: "pretre_lumina", count: 1, description: "Rencontrer le Prêtre de Lumina" },
      { type: "kill", targetId: "treant_corrompu", count: 3, description: "Purifier 3 Tréants Corrompus" },
    ],
    rewards: { xp: 400, eclats: 150, spells: ["sort_bonus_lumina"] },
    prerequisiteQuests: ["menace_ruines"],
  },
  {
    id: "collecte_herbes",
    name: "Herbes Médicinales",
    description: "L'alchimiste a besoin d'herbes d'éveil pour ses potions.",
    type: "side",
    levelRequired: 3,
    zoneId: "vallee_eveils",
    giverNpcId: "marchand_debut",
    objectives: [
      { type: "collect", targetId: "herbe_eveil", count: 10, description: "Collecter 10 Herbes d'Éveil" },
    ],
    rewards: { xp: 80, eclats: 40, items: [{ itemId: "potion_vie", quantity: 5 }] },
  },
  {
    id: "daily_chasse",
    name: "Chasse Quotidienne",
    description: "Éliminez des monstres pour gagner des récompenses bonus.",
    type: "daily",
    levelRequired: 5,
    zoneId: "vallee_eveils",
    giverNpcId: "maitre_eveil",
    objectives: [
      { type: "kill", targetId: "any", count: 10, description: "Éliminer 10 monstres" },
    ],
    rewards: { xp: 200, eclats: 100 },
  },
  {
    id: "compagnon_wisp",
    name: "Un Ami Stellaire",
    description: "Le dresseur de compagnons peut vous confier un Wisp.",
    type: "side",
    levelRequired: 5,
    zoneId: "foret_lumina",
    giverNpcId: "dresseur_compagnons",
    objectives: [
      { type: "collect", targetId: "poussiere_stellaire", count: 5, description: "Apporter 5 Poussières Stellaires" },
      { type: "talk", targetId: "dresseur_compagnons", count: 1, description: "Retourner voir le dresseur" },
    ],
    rewards: { xp: 150, eclats: 0, items: [{ itemId: "pet_wisp", quantity: 1 }] },
  },
  // v2.2 — Chaîne Archipel de Brume
  {
    id: "appel_ocean",
    name: "L'Appel de l'Océan",
    description: "Un marin du port parle d'étranges brumes au large.",
    type: "main",
    levelRequired: 12,
    zoneId: "port_nebula",
    giverNpcId: "marchand_marin",
    objectives: [
      { type: "talk", targetId: "pecheur_brume", count: 1, description: "Parler au pêcheur des Côtes de Brume" },
      { type: "explore", targetId: "cotes_brume", count: 1, description: "Atteindre les Côtes de Brume" },
    ],
    rewards: { xp: 300, eclats: 120 },
    prerequisiteQuests: ["route_lumina"],
  },
  {
    id: "epave_fantome",
    name: "L'Épave Fantôme",
    description: "Un navire spectral échoué sur la côte. Explorez l'épave.",
    type: "main",
    levelRequired: 12,
    zoneId: "cotes_brume",
    giverNpcId: "pecheur_brume",
    objectives: [
      { type: "kill", targetId: "capitaine_epave", count: 1, description: "Vaincre le Capitaine de l'Épave" },
    ],
    rewards: { xp: 500, eclats: 200, items: [{ itemId: "bottes_maree", quantity: 1 }] },
    prerequisiteQuests: ["appel_ocean"],
  },
  {
    id: "grottes_inondees",
    name: "Grottes Inondées",
    description: "Les marées montent dans les grottes. Trouvez la source.",
    type: "main",
    levelRequired: 18,
    zoneId: "grottes_maree",
    giverNpcId: "explorateur_grotte",
    objectives: [
      { type: "kill", targetId: "crab_golem", count: 2, description: "Détruire 2 Golems de Corail" },
      { type: "collect", targetId: "corail_vivant", count: 5, description: "Collecter 5 Coraux Vivants" },
    ],
    rewards: { xp: 600, eclats: 250 },
    prerequisiteQuests: ["epave_fantome"],
  },
  {
    id: "recif_danger",
    name: "Danger sur le Récif",
    description: "Des requins d'éther attaquent les plongeurs.",
    type: "side",
    levelRequired: 25,
    zoneId: "recif_abyssal",
    giverNpcId: "plongeur_ether",
    objectives: [
      { type: "kill", targetId: "requin_ether", count: 5, description: "Éliminer 5 Requins d'Éther" },
    ],
    rewards: { xp: 450, eclats: 180, items: [{ itemId: "potion_abysse", quantity: 3 }] },
    prerequisiteQuests: ["grottes_inondees"],
  },
  {
    id: "tempete_approche",
    name: "La Tempête Approche",
    description: "L'île de la Tempête est inaccessible. Le capitaine a besoin d'aide.",
    type: "main",
    levelRequired: 32,
    zoneId: "ile_tempete",
    giverNpcId: "capitaine_tempete",
    objectives: [
      { type: "kill", targetId: "seigneur_tempete", count: 1, description: "Vaincre le Seigneur de la Tempête" },
    ],
    rewards: { xp: 900, eclats: 400, items: [{ itemId: "anneau_tempete", quantity: 1 }] },
    prerequisiteQuests: ["recif_danger"],
  },
  {
    id: "sanctuaire_engouti",
    name: "Sanctuaire Englouti",
    description: "Les oracles marins cherchent un champion pour le temple.",
    type: "main",
    levelRequired: 40,
    zoneId: "sanctuaire_marins",
    giverNpcId: "oracles_marins",
    objectives: [
      { type: "kill", targetId: "reine_nereides", count: 1, description: "Affronter la Reine des Néréides" },
    ],
    rewards: { xp: 1500, eclats: 600 },
    prerequisiteQuests: ["tempete_approche"],
  },
  {
    id: "leviathan_brume_quete",
    name: "Le Léviathan de Brume",
    description: "La menace ultime des abysses doit être vaincue.",
    type: "main",
    levelRequired: 70,
    zoneId: "profondeurs_nereides",
    giverNpcId: "nereide_heralde",
    objectives: [
      { type: "kill", targetId: "leviathan_brume", count: 1, description: "Vaincre le Léviathan de Brume" },
    ],
    rewards: { xp: 5000, eclats: 2000, spells: ["armee_esprits"] },
    prerequisiteQuests: ["sanctuaire_engouti"],
  },
  {
    id: "temple_perdu",
    name: "Le Temple Perdu",
    description: "Explorez le temple oublié sous la forêt.",
    type: "side",
    levelRequired: 14,
    zoneId: "foret_lumina",
    giverNpcId: "pretre_lumina",
    objectives: [
      { type: "kill", targetId: "gardien_temple", count: 1, description: "Vaincre le Gardien du Temple" },
    ],
    rewards: { xp: 400, eclats: 180, items: [{ itemId: "relique_temple", quantity: 1 }] },
    prerequisiteQuests: ["route_lumina"],
  },
  {
    id: "labyrinthe_quete",
    name: "Secrets du Labyrinthe",
    description: "Le guide du désert connaît un passage secret.",
    type: "side",
    levelRequired: 28,
    zoneId: "desert_umbra",
    giverNpcId: "guide_desert",
    objectives: [
      { type: "kill", targetId: "scorpion_royal", count: 1, description: "Vaincre le Scorpion Royal" },
    ],
    rewards: { xp: 800, eclats: 350 },
    prerequisiteQuests: ["route_lumina"],
  },
  {
    id: "collecte_algues",
    name: "Récolte d'Algues",
    description: "Le marchand marin achète des algues lumineuses.",
    type: "side",
    levelRequired: 12,
    zoneId: "cotes_brume",
    giverNpcId: "marchand_marin",
    objectives: [
      { type: "collect", targetId: "algue_lumineuse", count: 15, description: "Collecter 15 Algues Lumineuses" },
    ],
    rewards: { xp: 200, eclats: 100 },
  },
  {
    id: "forge_corail",
    name: "Forge de Corail",
    description: "Le forgeron corail a besoin de matériaux rares.",
    type: "side",
    levelRequired: 45,
    zoneId: "sanctuaire_marins",
    giverNpcId: "forgeron_corail",
    objectives: [
      { type: "collect", targetId: "cristal_corail", count: 3, description: "Apporter 3 Cristaux de Corail" },
    ],
    rewards: { xp: 500, eclats: 250, items: [{ itemId: "armure_corail", quantity: 1 }] },
  },
  {
    id: "daily_archipel",
    name: "Chasse Archipel",
    description: "Éliminez des créatures marines pour des bonus.",
    type: "daily",
    levelRequired: 15,
    zoneId: "cotes_brume",
    giverNpcId: "pecheur_brume",
    objectives: [
      { type: "kill", targetId: "any", count: 8, description: "Éliminer 8 monstres marins" },
    ],
    rewards: { xp: 350, eclats: 150 },
  },
  {
    id: "explore_archipel",
    name: "Cartographe des Brumes",
    description: "Explorez toutes les zones de l'Archipel.",
    type: "side",
    levelRequired: 12,
    zoneId: "cotes_brume",
    giverNpcId: "pecheur_brume",
    objectives: [
      { type: "explore", targetId: "cotes_brume", count: 1, description: "Côtes de Brume" },
      { type: "explore", targetId: "grottes_maree", count: 1, description: "Grottes de Marée" },
      { type: "explore", targetId: "recif_abyssal", count: 1, description: "Récif Abyssal" },
      { type: "explore", targetId: "ile_tempete", count: 1, description: "Île de la Tempête" },
      { type: "explore", targetId: "sanctuaire_marins", count: 1, description: "Sanctuaire des Marins" },
      { type: "explore", targetId: "profondeurs_nereides", count: 1, description: "Profondeurs des Néréides" },
    ],
    rewards: { xp: 1000, eclats: 500 },
    prerequisiteQuests: ["appel_ocean"],
  },
  {
    id: "niveau_50",
    name: "Éveilleur Confirmé",
    description: "Atteignez le niveau 50 pour prouver votre valeur.",
    type: "side",
    levelRequired: 1,
    zoneId: "port_nebula",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "talk", targetId: "chef_guilde", count: 1, description: "Parler au chef de guilde" },
    ],
    rewards: { xp: 1000, eclats: 500 },
  },
  {
    id: "chasse_pieuvre",
    name: "Chasse aux Pieuvres",
    description: "Les pieuvres d'ombre infestent le récif.",
    type: "side",
    levelRequired: 30,
    zoneId: "recif_abyssal",
    giverNpcId: "plongeur_ether",
    objectives: [
      { type: "kill", targetId: "pieuvre_ombre", count: 4, description: "Éliminer 4 Pieuvres d'Ombre" },
    ],
    rewards: { xp: 400, eclats: 160, items: [{ itemId: "encre_ombre", quantity: 2 }] },
  },
  // v3.1 — +86 quêtes (donjons, citadelle, endgame, side, daily, guilde)
  ...EXPANSION_QUESTS_V31,
  // v4.1 — +41 quêtes régionales Terreval (découverte, maîtres, donjons v4.0)
  ...EXPANSION_QUESTS_V41,
];

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsForZone(zoneId: string): QuestDefinition[] {
  return QUESTS.filter((q) => q.zoneId === zoneId);
}
