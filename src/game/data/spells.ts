/**
 * Système de sorts — combat tactique au tour par tour
 * PA = Points d'Action, PM = Points de Mouvement
 */

export type SpellEffect =
  | { type: "damage"; element: string; min: number; max: number }
  | { type: "heal"; min: number; max: number }
  | { type: "buff"; stat: string; value: number; duration: number }
  | { type: "debuff"; stat: string; value: number; duration: number }
  | { type: "summon"; creatureId: string }
  | { type: "teleport"; range: number }
  | { type: "push"; cells: number }
  | { type: "pull"; cells: number }
  | { type: "trap"; damage: number; duration: number }
  | { type: "taunt"; duration: number };

export interface SpellDefinition {
  id: string;
  name: string;
  description: string;
  apCost: number;
  minRange: number;
  maxRange: number;
  area: number;
  cooldown: number;
  levelRequired: number;
  classId?: string;
  effects: SpellEffect[];
  icon: string;
}

export const SPELLS: SpellDefinition[] = [
  // Pyromancien
  { id: "flamme_cristalline", name: "Flamme Cristalline", description: "Projette une flamme d'éther.", apCost: 3, minRange: 1, maxRange: 6, area: 0, cooldown: 0, levelRequired: 1, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 8, max: 14 }], icon: "🔥" },
  { id: "explosion_ether", name: "Explosion d'Éther", description: "Explosion en zone.", apCost: 5, minRange: 1, maxRange: 5, area: 2, cooldown: 2, levelRequired: 6, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 12, max: 20 }], icon: "💥" },
  { id: "bouclier_flamme", name: "Bouclier de Flamme", description: "Bouclier absorbant les dégâts.", apCost: 4, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 3, classId: "pyromancien", effects: [{ type: "buff", stat: "shield", value: 30, duration: 3 }], icon: "🛡️" },

  // Gardien
  { id: "mur_cristal", name: "Mur de Cristal", description: "Crée une barrière protectrice.", apCost: 4, minRange: 0, maxRange: 2, area: 1, cooldown: 2, levelRequired: 1, classId: "gardien", effects: [{ type: "buff", stat: "defense", value: 50, duration: 2 }], icon: "🧱" },
  { id: "provocation", name: "Provocation", description: "Force l'ennemi à vous attaquer.", apCost: 2, minRange: 1, maxRange: 4, area: 0, cooldown: 1, levelRequired: 1, classId: "gardien", effects: [{ type: "taunt", duration: 2 }], icon: "😤" },
  { id: "fracas_tellurique", name: "Fracas Tellurique", description: "Frappe au corps à corps dévastatrice.", apCost: 5, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 4, classId: "gardien", effects: [{ type: "damage", element: "earth", min: 15, max: 25 }], icon: "💢" },

  // Éclaireur
  { id: "coup_brume", name: "Coup de Brume", description: "Attaque furtive rapide.", apCost: 3, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 1, classId: "eclaireur", effects: [{ type: "damage", element: "shadow", min: 10, max: 16 }], icon: "🌫️" },
  { id: "invisibilite", name: "Invisibilité", description: "Devient invisible aux ennemis.", apCost: 4, minRange: 0, maxRange: 0, area: 0, cooldown: 4, levelRequired: 5, classId: "eclaireur", effects: [{ type: "buff", stat: "invisibility", value: 1, duration: 2 }], icon: "👻" },
  { id: "piege_ether", name: "Piège d'Éther", description: "Pose un piège explosif.", apCost: 3, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "eclaireur", effects: [{ type: "trap", damage: 20, duration: 5 }], icon: "🪤" },

  // Invocateur
  { id: "invocation_wisp", name: "Invocation de Wisp", description: "Invoque un esprit stellaire.", apCost: 4, minRange: 1, maxRange: 3, area: 0, cooldown: 3, levelRequired: 1, classId: "invocateur", effects: [{ type: "summon", creatureId: "wisp" }], icon: "👾" },
  { id: "lien_ether", name: "Lien d'Éther", description: "Lie un ennemi, réduisant sa mobilité.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 2, levelRequired: 4, classId: "invocateur", effects: [{ type: "debuff", stat: "mp", value: -2, duration: 2 }], icon: "🔗" },
  { id: "tempete_esprits", name: "Tempête d'Esprits", description: "Dégâts de zone aux esprits.", apCost: 6, minRange: 1, maxRange: 6, area: 2, cooldown: 4, levelRequired: 8, classId: "invocateur", effects: [{ type: "damage", element: "ether", min: 8, max: 14 }], icon: "🌪️" },

  // Alchimiste
  { id: "soin_rune", name: "Soin de Rune", description: "Soigne un allié.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 0, levelRequired: 1, classId: "alchimiste", effects: [{ type: "heal", min: 15, max: 25 }], icon: "💚" },
  { id: "potion_regen", name: "Potion de Régénération", description: "Régénération sur la durée.", apCost: 4, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "alchimiste", effects: [{ type: "buff", stat: "regen", value: 10, duration: 3 }], icon: "🧪" },
  { id: "barriere_alchimique", name: "Barrière Alchimique", description: "Bouclier de groupe.", apCost: 5, minRange: 0, maxRange: 3, area: 1, cooldown: 4, levelRequired: 6, classId: "alchimiste", effects: [{ type: "buff", stat: "shield", value: 20, duration: 2 }], icon: "🔮" },

  // Archer
  { id: "fleche_lune", name: "Flèche Lunaire", description: "Tir de précision.", apCost: 3, minRange: 2, maxRange: 8, area: 0, cooldown: 0, levelRequired: 1, classId: "archer", effects: [{ type: "damage", element: "light", min: 10, max: 18 }], icon: "🏹" },
  { id: "pluie_fleches", name: "Pluie de Flèches", description: "Tir en zone.", apCost: 5, minRange: 3, maxRange: 7, area: 2, cooldown: 3, levelRequired: 6, classId: "archer", effects: [{ type: "damage", element: "light", min: 6, max: 12 }], icon: "🌧️" },
  { id: "marque_cible", name: "Marque de Cible", description: "Marque un ennemi pour plus de dégâts.", apCost: 2, minRange: 2, maxRange: 8, area: 0, cooldown: 1, levelRequired: 3, classId: "archer", effects: [{ type: "debuff", stat: "defense", value: -20, duration: 3 }], icon: "🎯" },

  // Berserker
  { id: "coup_tellurique", name: "Coup Tellurique", description: "Frappe puissante au corps à corps.", apCost: 4, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 1, classId: "berserker", effects: [{ type: "damage", element: "earth", min: 14, max: 22 }], icon: "👊" },
  { id: "rage_cristal", name: "Rage de Cristal", description: "Augmente les dégâts quand blessé.", apCost: 3, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 4, classId: "berserker", effects: [{ type: "buff", stat: "damage", value: 30, duration: 3 }], icon: "😡" },
  { id: "entaille_sismique", name: "Entaille Sismique", description: "Frappe en ligne.", apCost: 5, minRange: 1, maxRange: 3, area: 1, cooldown: 2, levelRequired: 7, classId: "berserker", effects: [{ type: "damage", element: "earth", min: 12, max: 20 }], icon: "〰️" },

  // Chronomancien
  { id: "ralentissement", name: "Ralentissement", description: "Réduit les PM de la cible.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 1, levelRequired: 1, classId: "chronomancien", effects: [{ type: "debuff", stat: "mp", value: -3, duration: 2 }], icon: "🐌" },
  { id: "acceleration", name: "Accélération", description: "Augmente les PM d'un allié.", apCost: 3, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "chronomancien", effects: [{ type: "buff", stat: "mp", value: 3, duration: 2 }], icon: "⚡" },
  { id: "paradoxe_temporel", name: "Paradoxe Temporel", description: "Dégâts temporels en zone.", apCost: 6, minRange: 1, maxRange: 5, area: 2, cooldown: 5, levelRequired: 10, classId: "chronomancien", effects: [{ type: "damage", element: "time", min: 10, max: 18 }], icon: "⏳" },
];

export function getSpellById(id: string): SpellDefinition | undefined {
  return SPELLS.find((s) => s.id === id);
}

export function getSpellsForClass(classId: string): SpellDefinition[] {
  return SPELLS.filter((s) => s.classId === classId);
}
