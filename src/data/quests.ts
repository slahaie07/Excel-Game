/** Système de quêtes — principales, secondaires, quotidiennes */

import type { ProfessionId } from "./items";

export type QuestType = "main" | "side" | "daily" | "dungeon" | "guild";
export type QuestStatus = "available" | "active" | "completed" | "failed";

export interface QuestObjective {
  id: string;
  description: string;
  type: "kill" | "collect" | "talk" | "explore" | "craft" | "deliver";
  target: string;
  quantity: number;
  current?: number;
}

export interface QuestReward {
  xp: number;
  kamas: number;
  items?: { itemId: string; quantity: number }[];
  title?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  level: number;
  zone: string;
  giverNpc: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites?: string[];
  nextQuest?: string;
}

export const QUESTS: Record<string, Quest> = {
  quete_depart: {
    id: "quete_depart",
    name: "L'Éveil de l'Étherium",
    description: "Le Maître de Guilde vous confie votre première mission : prouver votre valeur en éliminant des Slimes Lumineux près du village.",
    type: "main",
    level: 1,
    zone: "lumineth_village",
    giverNpc: "maitre_guilde",
    objectives: [
      { id: "kill_slimes", description: "Éliminer 3 Slimes Lumineux", type: "kill", target: "slime_lumineux", quantity: 3 },
    ],
    rewards: { xp: 100, kamas: 50, items: [{ itemId: "epee_initie", quantity: 1 }] },
    nextQuest: "quete_foret",
  },
  quete_foret: {
    id: "quete_foret",
    name: "Les Murmures de la Forêt",
    description: "Des gobelins attaquent les voyageurs. Le garde forestier demande de l'aide.",
    type: "main",
    level: 5,
    zone: "whispering_forest",
    giverNpc: "garde_forestier",
    objectives: [
      { id: "kill_goblins", description: "Éliminer 5 Gobelins Maraudeurs", type: "kill", target: "gobelin_maraudeur", quantity: 5 },
      { id: "explore_forest", description: "Explorer la Forêt des Murmures", type: "explore", target: "whispering_forest", quantity: 1 },
    ],
    rewards: { xp: 300, kamas: 150, items: [{ itemId: "arc_sylvestre", quantity: 1 }] },
    prerequisites: ["quete_depart"],
    nextQuest: "quete_cristal",
  },
  quete_cristal: {
    id: "quete_cristal",
    name: "Les Grottes Scintillantes",
    description: "Un alchimiste a besoin de cristaux bruts pour ses recherches sur la Faille.",
    type: "main",
    level: 15,
    zone: "crystal_caves",
    giverNpc: "alchimiste_theron",
    objectives: [
      { id: "collect_crystal", description: "Collecter 10 Cristaux Bruts", type: "collect", target: "cristal_brut", quantity: 10 },
      { id: "kill_golem", description: "Vaincre un Golem de Cristal", type: "kill", target: "golem_de_cristal", quantity: 1 },
    ],
    rewards: { xp: 800, kamas: 400, items: [{ itemId: "baton_arcane", quantity: 1 }] },
    prerequisites: ["quete_foret"],
    nextQuest: "quete_faille",
  },
  quete_faille: {
    id: "quete_faille",
    name: "Vers la Faille",
    description: "La guilde révèle l'existence de la Porte de l'Abîme. Seuls les plus braves oseront s'y aventurer.",
    type: "main",
    level: 50,
    zone: "sky_temple",
    giverNpc: "maitre_guilde",
    objectives: [
      { id: "talk_monk", description: "Parler au Grand Moine du Temple Céleste", type: "talk", target: "grand_moine", quantity: 1 },
      { id: "kill_guardian", description: "Vaincre un Gardien Céleste", type: "kill", target: "gardien_celeste", quantity: 1 },
    ],
    rewards: { xp: 3000, kamas: 2000, title: "Héros d'Étheris" },
    prerequisites: ["quete_cristal"],
  },
  quete_journaliere_chasse: {
    id: "quete_journaliere_chasse",
    name: "Chasse du Jour",
    description: "Éliminez des monstres pour gagner des récompenses quotidiennes.",
    type: "daily",
    level: 1,
    zone: "lumineth_village",
    giverNpc: "maitre_guilde",
    objectives: [
      { id: "kill_any", description: "Éliminer 10 monstres", type: "kill", target: "any", quantity: 10 },
    ],
    rewards: { xp: 200, kamas: 100 },
  },
  quete_pet_loup: {
    id: "quete_pet_loup",
    name: "Compagnon des Bois",
    description: "Le dresseur de familiers cherche un aventurier pour récupérer un œuf de loup.",
    type: "side",
    level: 15,
    zone: "whispering_forest",
    giverNpc: "dresseur_familiers",
    objectives: [
      { id: "collect_fur", description: "Collecter 5 Fourrures de Loup", type: "collect", target: "fourrure_loup", quantity: 5 },
    ],
    rewards: { xp: 500, kamas: 300, items: [{ itemId: "oeuf_loup", quantity: 1 }] },
  },
  quete_donjon_grotte: {
    id: "quete_donjon_grotte",
    name: "Le Donjon des Cristaux",
    description: "Un donjon dangereux au coeur des grottes. Récompenses épiques garanties.",
    type: "dungeon",
    level: 25,
    zone: "crystal_caves",
    giverNpc: "explorateur",
    objectives: [
      { id: "clear_dungeon", description: "Terminer le Donjon des Cristaux", type: "explore", target: "dungeon_crystal", quantity: 1 },
    ],
    rewards: { xp: 1500, kamas: 800, items: [{ itemId: "amulette_vitalite", quantity: 1 }] },
  },
};

export const NPCS: Record<string, Npc> = {
  maitre_guilde: {
    id: "maitre_guilde", name: "Maître Aldric", role: "quest_giver",
    zone: "lumineth_village", x: 10, y: 7,
    dialogues: {
      greeting: "Bienvenue, jeune Aventurier de l'Étherium. Le monde a besoin de héros.",
      quest: "J'ai une mission pour toi. Prouve ta valeur !",
      complete: "Excellent travail ! L'Étheris est un peu plus sûr grâce à toi.",
    },
    quests: ["quete_depart", "quete_faille", "quete_journaliere_chasse"],
    shop: false, icon: "🧙",
  },
  marchand_lumineth: {
    id: "marchand_lumineth", name: "Marchand Elric", role: "merchant",
    zone: "lumineth_village", x: 8, y: 9,
    dialogues: {
      greeting: "Bienvenue dans ma boutique ! Les meilleurs prix de Lumineth.",
      shop: "Que désirez-vous acheter ou vendre ?",
    },
    shop: true,
    shopItems: ["potion_vie", "potion_energie", "pain_ether", "epee_initie", "armure_cuivre"],
    icon: "🏪",
  },
  garde_forestier: {
    id: "garde_forestier", name: "Garde Sylas", role: "quest_giver",
    zone: "whispering_forest", x: 5, y: 5,
    dialogues: {
      greeting: "La forêt devient dangereuse... Les gobelins se multiplient.",
      quest: "Peux-tu nous aider à repousser ces créatures ?",
    },
    quests: ["quete_foret"],
    shop: false, icon: "🌲",
  },
  alchimiste_theron: {
    id: "alchimiste_theron", name: "Alchimiste Théron", role: "quest_giver",
    zone: "lumineth_village", x: 12, y: 5,
    dialogues: {
      greeting: "Mes expériences sur la Faille nécessitent des cristaux rares...",
      quest: "Apporte-moi des cristaux des grottes, et tu seras récompensé.",
    },
    quests: ["quete_cristal"],
    shop: true,
    shopItems: ["potion_vie", "potion_energie"],
    icon: "⚗️",
  },
  dresseur_familiers: {
    id: "dresseur_familiers", name: "Dresseur Kael", role: "quest_giver",
    zone: "whispering_forest", x: 15, y: 10,
    dialogues: {
      greeting: "Les familiers sont les meilleurs compagnons d'un aventurier !",
      quest: "Aide-moi à trouver un œuf de loup et je t'en récompenserai.",
    },
    quests: ["quete_pet_loup"],
    shop: false, icon: "🐾",
  },
  forgeron: {
    id: "forgeron", name: "Forgeron Durin", role: "craft",
    zone: "lumineth_village", x: 6, y: 8,
    dialogues: {
      greeting: "Le métal et le feu ne mentent jamais. Besoin d'équipement ?",
      craft: "Montre-moi tes matériaux, je forgerai quelque chose de magnifique.",
    },
    shop: false,
    profession: "forgeron",
    icon: "🔨",
  },
  banquier: {
    id: "banquier", name: "Banquier Moris", role: "bank",
    zone: "lumineth_village", x: 14, y: 8,
    dialogues: {
      greeting: "Votre or est en sécurité dans nos coffres.",
      bank: "Que souhaitez-vous déposer ou retirer ?",
    },
    shop: false, icon: "🏦",
  },
  grand_moine: {
    id: "grand_moine", name: "Grand Moine Seraph", role: "quest_giver",
    zone: "sky_temple", x: 9, y: 9,
    dialogues: {
      greeting: "Le Temple Céleste veille sur Étheris depuis la Grande Faille.",
      quest: "La Porte de l'Abîme appelle les braves. Es-tu prêt ?",
    },
    quests: ["quete_faille"],
    shop: false, icon: "🙏",
  },
  explorateur: {
    id: "explorateur", name: "Explorateur Vex", role: "quest_giver",
    zone: "crystal_caves", x: 8, y: 6,
    dialogues: {
      greeting: "Les grottes recèlent un donjon oublié... Seuls les braves osent s'y aventurer.",
      quest: "Le Donjon des Cristaux attend. Prêt à descendre ?",
      dungeon: "Je peux vous guider vers l'entrée du donjon.",
    },
    quests: ["quete_donjon_grotte"],
    shop: false, icon: "🗺️",
  },
};

export interface Npc {
  id: string;
  name: string;
  role: "quest_giver" | "merchant" | "craft" | "bank" | "trainer" | "guard";
  zone: string;
  x: number;
  y: number;
  dialogues: Record<string, string>;
  quests?: string[];
  shop: boolean;
  shopItems?: string[];
  profession?: ProfessionId;
  icon: string;
}

export function getNpcsForZone(zoneId: string): Npc[] {
  return Object.values(NPCS).filter((n) => n.zone === zoneId);
}
