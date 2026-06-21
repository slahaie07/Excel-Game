export interface FurnitureDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "decoration" | "functional" | "trophy";
  cost: number;
  size: { w: number; h: number };
  bonus?: { type: string; value: number };
}

export const FURNITURE: FurnitureDefinition[] = [
  { id: "lit_cristal", name: "Lit de Cristal", description: "Régénère des PV au repos.", icon: "🛏️", category: "functional", cost: 200, size: { w: 2, h: 1 }, bonus: { type: "regen", value: 20 } },
  { id: "tapis_lumina", name: "Tapis de Lumina", description: "Décoration élégante.", icon: "🟣", category: "decoration", cost: 50, size: { w: 2, h: 2 } },
  { id: "forge_portable", name: "Forge Portable", description: "Permet de forger dans le refuge cristallin.", icon: "🔨", category: "functional", cost: 500, size: { w: 2, h: 2 }, bonus: { type: "craft", value: 1 } },
  { id: "trophe_boss", name: "Trophée de Boss", description: "Montre vos victoires.", icon: "🏆", category: "trophy", cost: 0, size: { w: 1, h: 1 } },
  { id: "plante_ether", name: "Plante d'Éther", description: "Purifie l'air du refuge.", icon: "🪴", category: "decoration", cost: 30, size: { w: 1, h: 1 } },
  { id: "bibliotheque", name: "Bibliothèque Ancienne", description: "Bonus XP passif.", icon: "📚", category: "functional", cost: 350, size: { w: 2, h: 1 }, bonus: { type: "xp", value: 5 } },
  { id: "coffre_tresor", name: "Coffre au Trésor", description: "Stocke des objets supplémentaires.", icon: "📦", category: "functional", cost: 150, size: { w: 1, h: 1 }, bonus: { type: "storage", value: 10 } },
  { id: "fontaine_stellaire", name: "Fontaine Stellaire", description: "Pièce maîtresse du refuge.", icon: "⛲", category: "decoration", cost: 800, size: { w: 2, h: 2 } },
];

export const HAVEN_LEVELS = [
  { level: 1, maxFurniture: 5, gridSize: { w: 6, h: 6 }, upgradeCost: 0 },
  { level: 2, maxFurniture: 10, gridSize: { w: 8, h: 6 }, upgradeCost: 500 },
  { level: 3, maxFurniture: 15, gridSize: { w: 8, h: 8 }, upgradeCost: 1500 },
  { level: 4, maxFurniture: 20, gridSize: { w: 10, h: 8 }, upgradeCost: 4000 },
  { level: 5, maxFurniture: 30, gridSize: { w: 10, h: 10 }, upgradeCost: 10000 },
];

export function getFurnitureById(id: string): FurnitureDefinition | undefined {
  return FURNITURE.find((f) => f.id === id);
}

export function getHavenLevel(level: number) {
  return HAVEN_LEVELS[Math.min(level - 1, HAVEN_LEVELS.length - 1)]!;
}
