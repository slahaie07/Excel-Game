/**
 * Système de quêtes
 */

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
];

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsForZone(zoneId: string): QuestDefinition[] {
  return QUESTS.filter((q) => q.zoneId === zoneId);
}
