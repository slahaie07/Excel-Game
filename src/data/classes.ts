/** Classes jouables — 8 classes avec rôles distincts */

export type ClassId =
  | "gardien"
  | "arcaniste"
  | "rodeur"
  | "mystique"
  | "forgeur"
  | "ombrelame"
  | "invocateur"
  | "alchimiste";

export interface GameClass {
  id: ClassId;
  name: string;
  role: "tank" | "dps" | "healer" | "support";
  description: string;
  color: string;
  baseStats: CharacterStats;
  spells: string[];
  passive: string;
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  pa: number;
  maxPa: number;
  pm: number;
  maxPm: number;
  force: number;
  intelligence: number;
  agilite: number;
  chance: number;
  sagesse: number;
  initiative: number;
  dommages: number;
  resistance: number;
}

export const CLASSES: Record<ClassId, GameClass> = {
  gardien: {
    id: "gardien",
    name: "Gardien",
    role: "tank",
    description: "Protecteur en armure lourde. Attire les coups et protège ses alliés.",
    color: "#5d6d7e",
    baseStats: {
      hp: 120, maxHp: 120, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 25, intelligence: 5, agilite: 10, chance: 10, sagesse: 15,
      initiative: 80, dommages: 8, resistance: 20,
    },
    spells: ["coup_bouclier", "provocation", "muraille", "contre_attaque"],
    passive: "Réduit les dégâts reçus de 10%",
  },
  arcaniste: {
    id: "arcaniste",
    name: "Arcaniste",
    role: "dps",
    description: "Maître des arcanes. Dégâts élémentaires dévastateurs à distance.",
    color: "#8e44ad",
    baseStats: {
      hp: 70, maxHp: 70, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 5, intelligence: 35, agilite: 10, chance: 15, sagesse: 20,
      initiative: 100, dommages: 5, resistance: 5,
    },
    spells: ["eclair_arcane", "boule_feu", "tempete_glace", "meteore"],
    passive: "+15% dégâts magiques",
  },
  rodeur: {
    id: "rodeur",
    name: "Rôdeur",
    role: "dps",
    description: "Archer agile. Frappe à distance avec précision mortelle.",
    color: "#27ae60",
    baseStats: {
      hp: 80, maxHp: 80, pa: 6, maxPa: 6, pm: 4, maxPm: 4,
      force: 15, intelligence: 5, agilite: 35, chance: 25, sagesse: 10,
      initiative: 130, dommages: 12, resistance: 8,
    },
    spells: ["tir_precis", "fleche_empoisonnee", "pluie_fleches", "piege"],
    passive: "+1 PM par tour",
  },
  mystique: {
    id: "mystique",
    name: "Mystique",
    role: "healer",
    description: "Guérisseur sacré. Soigne et bénit ses compagnons.",
    color: "#f1c40f",
    baseStats: {
      hp: 75, maxHp: 75, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 5, intelligence: 25, agilite: 10, chance: 10, sagesse: 30,
      initiative: 90, dommages: 3, resistance: 10,
    },
    spells: ["soin_mineur", "benediction", "resurrection", "barriere_sacree"],
    passive: "Les soins sont 20% plus efficaces",
  },
  forgeur: {
    id: "forgeur",
    name: "Forgeur",
    role: "dps",
    description: "Guerrier brutal au corps à corps. Frappe puissante et rage contrôlée.",
    color: "#c0392b",
    baseStats: {
      hp: 100, maxHp: 100, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 35, intelligence: 5, agilite: 15, chance: 10, sagesse: 10,
      initiative: 110, dommages: 15, resistance: 12,
    },
    spells: ["coup_furieux", "charge", "rugissement", "fureur"],
    passive: "+10% dégâts en mêlée",
  },
  ombrelame: {
    id: "ombrelame",
    name: "Ombrelame",
    role: "dps",
    description: "Assassin des ombres. Critiques dévastateurs et mobilité extrême.",
    color: "#2c3e50",
    baseStats: {
      hp: 65, maxHp: 65, pa: 6, maxPa: 6, pm: 5, maxPm: 5,
      force: 20, intelligence: 10, agilite: 30, chance: 30, sagesse: 10,
      initiative: 150, dommages: 10, resistance: 5,
    },
    spells: ["coup_sournois", "invisibilite", "poignard", "execution"],
    passive: "+25% chance de critique",
  },
  invocateur: {
    id: "invocateur",
    name: "Invocateur",
    role: "support",
    description: "Conjure des familiers pour combattre à ses côtés.",
    color: "#16a085",
    baseStats: {
      hp: 70, maxHp: 70, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 5, intelligence: 30, agilite: 10, chance: 15, sagesse: 25,
      initiative: 95, dommages: 5, resistance: 8,
    },
    spells: ["invocation_loup", "invocation_golem", "lien_ame", "tempete"],
    passive: "Les invocations durent 2 tours de plus",
  },
  alchimiste: {
    id: "alchimiste",
    name: "Alchimiste",
    role: "support",
    description: "Expert en potions et effets de zone. Contrôle le champ de bataille.",
    color: "#e67e22",
    baseStats: {
      hp: 75, maxHp: 75, pa: 6, maxPa: 6, pm: 3, maxPm: 3,
      force: 10, intelligence: 28, agilite: 12, chance: 20, sagesse: 18,
      initiative: 105, dommages: 6, resistance: 10,
    },
    spells: ["potion_acide", "nuage_toxique", "elixir_force", "transmutation"],
    passive: "Les potions ont 30% de chance de ne pas consommer de PA",
  },
};

export function scaleStatsForLevel(
  base: CharacterStats,
  level: number,
): CharacterStats {
  const mult = 1 + (level - 1) * 0.08;
  return {
    ...base,
    maxHp: Math.floor(base.maxHp * mult),
    hp: Math.floor(base.maxHp * mult),
    force: Math.floor(base.force * mult),
    intelligence: Math.floor(base.intelligence * mult),
    agilite: Math.floor(base.agilite * mult),
    chance: Math.floor(base.chance * mult),
    sagesse: Math.floor(base.sagesse * mult),
    dommages: Math.floor(base.dommages * mult),
    resistance: Math.floor(base.resistance * mult),
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.8));
}
