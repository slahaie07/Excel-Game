/** Items, équipement, ressources et consommables */

export type ItemType =
  | "weapon"
  | "helmet"
  | "armor"
  | "boots"
  | "amulet"
  | "ring"
  | "shield"
  | "consumable"
  | "resource"
  | "quest"
  | "pet_egg";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  level: number;
  stats?: Partial<{
    force: number;
    intelligence: number;
    agilite: number;
    chance: number;
    sagesse: number;
    dommages: number;
    resistance: number;
    hp: number;
    pa: number;
    pm: number;
  }>;
  price: number;
  stackable: boolean;
  maxStack: number;
  icon: string;
  craftRecipe?: CraftRecipe;
}

export interface CraftRecipe {
  ingredients: { itemId: string; quantity: number }[];
  profession: ProfessionId;
  levelRequired: number;
}

export type ProfessionId =
  | "forgeron"
  | "bijoutier"
  | "alchimiste"
  | "tailleur"
  | "bûcheron"
  | "mineur"
  | "pêcheur"
  | "cuisinier";

export const PROFESSIONS: Record<ProfessionId, { name: string; description: string }> = {
  forgeron: { name: "Forgeron", description: "Forge armes et armures en métal" },
  bijoutier: { name: "Bijoutier", description: "Crée bagues et amulettes" },
  alchimiste: { name: "Alchimiste", description: "Prépare potions et élixirs" },
  tailleur: { name: "Tailleur", description: "Confectionne vêtements et capes" },
  bûcheron: { name: "Bûcheron", description: "Récolte du bois dans les forêts" },
  mineur: { name: "Mineur", description: "Extrait minerais des grottes" },
  pêcheur: { name: "Pêcheur", description: "Pêche dans les rivières d'Étheris" },
  cuisinier: { name: "Cuisinier", description: "Prépare des plats régénérants" },
};

export const ITEMS: Record<string, Item> = {
  epee_initie: {
    id: "epee_initie", name: "Épée d'Initié", type: "weapon", rarity: "common",
    description: "Une épée basique pour débuter l'aventure.", level: 1,
    stats: { force: 5, dommages: 3 }, price: 50, stackable: false, maxStack: 1, icon: "⚔️",
  },
  arc_sylvestre: {
    id: "arc_sylvestre", name: "Arc Sylvestre", type: "weapon", rarity: "common",
    description: "Arc taillé dans le bois de la Forêt des Murmures.", level: 5,
    stats: { agilite: 8, dommages: 5 }, price: 120, stackable: false, maxStack: 1, icon: "🏹",
  },
  baton_arcane: {
    id: "baton_arcane", name: "Bâton Arcane", type: "weapon", rarity: "uncommon",
    description: "Canalisateur d'énergie magique.", level: 10,
    stats: { intelligence: 12, dommages: 4 }, price: 300, stackable: false, maxStack: 1, icon: "🪄",
  },
  armure_cuivre: {
    id: "armure_cuivre", name: "Armure de Cuivre", type: "armor", rarity: "common",
    description: "Protection légère en cuivre martelé.", level: 3,
    stats: { resistance: 8, hp: 15 }, price: 80, stackable: false, maxStack: 1, icon: "🥋",
  },
  casque_fer: {
    id: "casque_fer", name: "Casque de Fer", type: "helmet", rarity: "uncommon",
    description: "Casque solide forgé par les artisans de Lumineth.", level: 8,
    stats: { resistance: 5, hp: 10 }, price: 200, stackable: false, maxStack: 1, icon: "⛑️",
  },
  bottes_agilite: {
    id: "bottes_agilite", name: "Bottes d'Agilité", type: "boots", rarity: "uncommon",
    description: "Bottes enchantées pour courir plus vite.", level: 12,
    stats: { agilite: 10, pm: 1 }, price: 350, stackable: false, maxStack: 1, icon: "👢",
  },
  amulette_vitalite: {
    id: "amulette_vitalite", name: "Amulette de Vitalité", type: "amulet", rarity: "rare",
    description: "Augmente les points de vie maximum.", level: 15,
    stats: { hp: 30, sagesse: 5 }, price: 500, stackable: false, maxStack: 1, icon: "📿",
  },
  anneau_force: {
    id: "anneau_force", name: "Anneau de Force", type: "ring", rarity: "rare",
    description: "Anneau imprégné de force brute.", level: 20,
    stats: { force: 15 }, price: 600, stackable: false, maxStack: 1, icon: "💍",
  },
  bouclier_lumineth: {
    id: "bouclier_lumineth", name: "Bouclier de Lumineth", type: "shield", rarity: "uncommon",
    description: "Bouclier aux armoiries de la cité-refuge.", level: 10,
    stats: { resistance: 15, hp: 20 }, price: 400, stackable: false, maxStack: 1, icon: "🛡️",
  },
  potion_vie: {
    id: "potion_vie", name: "Potion de Vie", type: "consumable", rarity: "common",
    description: "Restaure 50 PV en combat.", level: 1,
    price: 25, stackable: true, maxStack: 100, icon: "🧪",
  },
  potion_energie: {
    id: "potion_energie", name: "Potion d'Énergie", type: "consumable", rarity: "common",
    description: "Restaure 2 PA en combat.", level: 5,
    price: 40, stackable: true, maxStack: 50, icon: "⚡",
  },
  pain_ether: {
    id: "pain_ether", name: "Pain d'Éther", type: "consumable", rarity: "common",
    description: "Restaure 20 PV hors combat.", level: 1,
    price: 5, stackable: true, maxStack: 200, icon: "🍞",
  },
  gelée_lumineuse: { id: "gelée_lumineuse", name: "Gelée Lumineuse", type: "resource", rarity: "common", description: "Substance visqueuse des Slimes.", level: 1, price: 3, stackable: true, maxStack: 999, icon: "💧" },
  fragment_ether: { id: "fragment_ether", name: "Fragment d'Éther", type: "resource", rarity: "uncommon", description: "Éclat d'énergie pure.", level: 1, price: 10, stackable: true, maxStack: 999, icon: "✨" },
  fourrure_loup: { id: "fourrure_loup", name: "Fourrure de Loup", type: "resource", rarity: "common", description: "Fourrure épaisse.", level: 10, price: 15, stackable: true, maxStack: 999, icon: "🧶" },
  cristal_brut: { id: "cristal_brut", name: "Cristal Brut", type: "resource", rarity: "uncommon", description: "Cristal non taillé des grottes.", level: 20, price: 40, stackable: true, maxStack: 999, icon: "💎" },
  ecaille_dragon: { id: "ecaille_dragon", name: "Écaille de Dragon", type: "resource", rarity: "legendary", description: "Écaille quasi indestructible.", level: 70, price: 2000, stackable: true, maxStack: 50, icon: "🐉" },
  oeuf_loup: {
    id: "oeuf_loup", name: "Œuf de Loup", type: "pet_egg", rarity: "rare",
    description: "Éclos en familiers loup loyal.", level: 15,
    price: 800, stackable: false, maxStack: 1, icon: "🥚",
  },
  parchemin_quete: {
    id: "parchemin_quete", name: "Parchemin de Quête", type: "quest", rarity: "common",
    description: "Document de quête important.", level: 1,
    price: 0, stackable: false, maxStack: 1, icon: "📜",
  },
  epee_legendaire_ether: {
    id: "epee_legendaire_ether", name: "Lame d'Étherium", type: "weapon", rarity: "legendary",
    description: "Arme forgée dans le coeur de la Faille. Légendaire.",
    level: 60, stats: { force: 40, intelligence: 20, dommages: 25 },
    price: 50000, stackable: false, maxStack: 1, icon: "🗡️",
    craftRecipe: {
      ingredients: [
        { itemId: "fragment_ether", quantity: 50 },
        { itemId: "ecaille_dragon", quantity: 5 },
        { itemId: "cristal_brut", quantity: 20 },
      ],
      profession: "forgeron",
      levelRequired: 60,
    },
  },
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: "#bdc3c7",
  uncommon: "#2ecc71",
  rare: "#3498db",
  epic: "#9b59b6",
  legendary: "#f39c12",
};
