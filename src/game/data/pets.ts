export interface PetDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  bonusType: "xp" | "eclats" | "damage" | "heal" | "defense";
  bonusValue: number;
  levelRequired: number;
  evolveAt?: number;
  evolvesTo?: string;
}

export const PETS: PetDefinition[] = [
  {
    id: "pet_wisp",
    name: "Wisp Stellaire",
    description: "Petit esprit fidèle qui augmente l'XP gagnée.",
    icon: "✨",
    rarity: "rare",
    bonusType: "xp",
    bonusValue: 10,
    levelRequired: 5,
    evolveAt: 20,
    evolvesTo: "pet_wisp_ancien",
  },
  {
    id: "pet_wisp_ancien",
    name: "Wisp Ancien",
    description: "Esprit évolué aux pouvoirs accrus.",
    icon: "🌟",
    rarity: "epic",
    bonusType: "xp",
    bonusValue: 25,
    levelRequired: 20,
  },
  {
    id: "pet_loup_cristal",
    name: "Loup de Cristal",
    description: "Compagnon féroce augmentant les dégâts.",
    icon: "🐺",
    rarity: "uncommon",
    bonusType: "damage",
    bonusValue: 8,
    levelRequired: 10,
  },
  {
    id: "pet_fee",
    name: "Fée de Brume",
    description: "Soigne légèrement après chaque combat.",
    icon: "🧚",
    rarity: "rare",
    bonusType: "heal",
    bonusValue: 15,
    levelRequired: 15,
  },
  {
    id: "pet_golem",
    name: "Mini-Golem",
    description: "Renforce la défense de son maître.",
    icon: "🗿",
    rarity: "epic",
    bonusType: "defense",
    bonusValue: 12,
    levelRequired: 30,
  },
  {
    id: "pet_dragonnet",
    name: "Dragonnet d'Aether",
    description: "Compagnon légendaire boostant les Éclats.",
    icon: "🐉",
    rarity: "legendary",
    bonusType: "eclats",
    bonusValue: 20,
    levelRequired: 50,
  },
];

export function getPetById(id: string): PetDefinition | undefined {
  return PETS.find((p) => p.id === id);
}
