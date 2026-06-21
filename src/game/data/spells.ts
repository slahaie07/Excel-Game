/**
 * Système de sorts — combat tactique au tour par tour
 * PA = Points d'Action, PM = Points de Mouvement
 * Équilibrage : sort de base (3 PA) ≈ 9–15 dégâts ou 15–25 soins
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
  // Alchimiste (soins)
  { id: "soin_rune", name: "Soin de Rune", description: "Soigne un allié.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 0, levelRequired: 1, classId: "alchimiste", effects: [{ type: "heal", min: 15, max: 25 }], icon: "💚" },
  { id: "potion_regen", name: "Potion de Régénération", description: "Régénération sur la durée.", apCost: 4, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "alchimiste", effects: [{ type: "buff", stat: "regen", value: 10, duration: 3 }], icon: "🧪" },
  { id: "barriere_alchimique", name: "Barrière Alchimique", description: "Bouclier de groupe.", apCost: 5, minRange: 0, maxRange: 3, area: 1, cooldown: 4, levelRequired: 6, classId: "alchimiste", effects: [{ type: "buff", stat: "shield", value: 20, duration: 2 }], icon: "🔮" },

  // Luminaire (soins)
  { id: "lumiere_sacree", name: "Lumière Sacrée", description: "Soin direct puissant.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 0, levelRequired: 1, classId: "luminaire", effects: [{ type: "heal", min: 15, max: 25 }], icon: "✨" },
  { id: "benediction", name: "Bénédiction", description: "Régénère un allié sur la durée.", apCost: 4, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "luminaire", effects: [{ type: "buff", stat: "regen", value: 10, duration: 3 }], icon: "🙏" },
  { id: "aura_protectrice", name: "Aura Protectrice", description: "Bouclier sacré sur un allié.", apCost: 5, minRange: 0, maxRange: 3, area: 0, cooldown: 4, levelRequired: 6, classId: "luminaire", effects: [{ type: "buff", stat: "shield", value: 20, duration: 2 }], icon: "🌟" },

  // Pyromancien (magie)
  { id: "flamme_cristalline", name: "Flamme Cristalline", description: "Projette une flamme d'éther.", apCost: 3, minRange: 1, maxRange: 6, area: 0, cooldown: 0, levelRequired: 1, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 9, max: 15 }], icon: "🔥" },
  { id: "explosion_ether", name: "Explosion d'Éther", description: "Explosion en zone.", apCost: 5, minRange: 1, maxRange: 5, area: 2, cooldown: 2, levelRequired: 6, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 11, max: 19 }], icon: "💥" },
  { id: "bouclier_flamme", name: "Bouclier de Flamme", description: "Bouclier absorbant les dégâts.", apCost: 4, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 3, classId: "pyromancien", effects: [{ type: "buff", stat: "shield", value: 25, duration: 3 }], icon: "🛡️" },

  // Cryomancien (magie)
  { id: "eclat_glace", name: "Éclat de Glace", description: "Projectile de givre.", apCost: 3, minRange: 1, maxRange: 6, area: 0, cooldown: 0, levelRequired: 1, classId: "cryomancien", effects: [{ type: "damage", element: "ice", min: 9, max: 15 }], icon: "❄️" },
  { id: "blizzard_ether", name: "Blizzard d'Éther", description: "Tempête de glace en zone.", apCost: 5, minRange: 1, maxRange: 5, area: 2, cooldown: 2, levelRequired: 6, classId: "cryomancien", effects: [{ type: "damage", element: "ice", min: 11, max: 19 }], icon: "🌨️" },
  { id: "prison_glace", name: "Prison de Glace", description: "Réduit la mobilité de la cible.", apCost: 4, minRange: 1, maxRange: 5, area: 0, cooldown: 3, levelRequired: 3, classId: "cryomancien", effects: [{ type: "debuff", stat: "mp", value: -2, duration: 2 }], icon: "🧊" },

  // Gardien (bouclier)
  { id: "mur_cristal", name: "Mur de Cristal", description: "Crée une barrière protectrice.", apCost: 4, minRange: 0, maxRange: 2, area: 1, cooldown: 2, levelRequired: 1, classId: "gardien", effects: [{ type: "buff", stat: "defense", value: 45, duration: 2 }], icon: "🧱" },
  { id: "provocation", name: "Provocation", description: "Force l'ennemi à vous attaquer.", apCost: 2, minRange: 1, maxRange: 4, area: 0, cooldown: 1, levelRequired: 1, classId: "gardien", effects: [{ type: "taunt", duration: 2 }], icon: "😤" },
  { id: "fracas_tellurique", name: "Fracas Tellurique", description: "Frappe au corps à corps.", apCost: 5, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 4, classId: "gardien", effects: [{ type: "damage", element: "earth", min: 14, max: 22 }], icon: "💢" },

  // Bastion (bouclier)
  { id: "egide_fer", name: "Égide de Fer", description: "Renforce la défense.", apCost: 4, minRange: 0, maxRange: 2, area: 1, cooldown: 2, levelRequired: 1, classId: "bastion", effects: [{ type: "buff", stat: "defense", value: 45, duration: 2 }], icon: "🔩" },
  { id: "defi_bastion", name: "Défi du Bastion", description: "Attire l'attention des ennemis.", apCost: 2, minRange: 1, maxRange: 4, area: 0, cooldown: 1, levelRequired: 1, classId: "bastion", effects: [{ type: "taunt", duration: 2 }], icon: "📣" },
  { id: "charge_bouclier", name: "Charge au Bouclier", description: "Charge au corps à corps.", apCost: 5, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 4, classId: "bastion", effects: [{ type: "damage", element: "earth", min: 14, max: 22 }], icon: "🛡️" },

  // Berserker (gros dégâts)
  { id: "coup_tellurique", name: "Coup Tellurique", description: "Frappe puissante au corps à corps.", apCost: 4, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 1, classId: "berserker", effects: [{ type: "damage", element: "earth", min: 12, max: 18 }], icon: "👊" },
  { id: "rage_cristal", name: "Rage de Cristal", description: "Augmente les dégâts.", apCost: 3, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 4, classId: "berserker", effects: [{ type: "buff", stat: "damage", value: 25, duration: 3 }], icon: "😡" },
  { id: "entaille_sismique", name: "Entaille Sismique", description: "Frappe en ligne.", apCost: 5, minRange: 1, maxRange: 3, area: 1, cooldown: 2, levelRequired: 7, classId: "berserker", effects: [{ type: "damage", element: "earth", min: 11, max: 19 }], icon: "〰️" },

  // Éclaireur (gros dégâts)
  { id: "coup_brume", name: "Coup de Brume", description: "Attaque furtive rapide.", apCost: 3, minRange: 1, maxRange: 1, area: 0, cooldown: 0, levelRequired: 1, classId: "eclaireur", effects: [{ type: "damage", element: "shadow", min: 9, max: 15 }], icon: "🌫️" },
  { id: "invisibilite", name: "Invisibilité", description: "Devient invisible aux ennemis.", apCost: 4, minRange: 0, maxRange: 0, area: 0, cooldown: 4, levelRequired: 5, classId: "eclaireur", effects: [{ type: "buff", stat: "invisibility", value: 1, duration: 2 }], icon: "👻" },
  { id: "piege_ether", name: "Piège d'Éther", description: "Pose un piège explosif.", apCost: 3, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 3, classId: "eclaireur", effects: [{ type: "trap", damage: 18, duration: 5 }], icon: "🪤" },

  // Archer (à distance)
  { id: "fleche_lune", name: "Flèche Lunaire", description: "Tir de précision.", apCost: 3, minRange: 2, maxRange: 8, area: 0, cooldown: 0, levelRequired: 1, classId: "archer", effects: [{ type: "damage", element: "light", min: 9, max: 15 }], icon: "🏹" },
  { id: "pluie_fleches", name: "Pluie de Flèches", description: "Tir en zone.", apCost: 5, minRange: 3, maxRange: 7, area: 2, cooldown: 3, levelRequired: 6, classId: "archer", effects: [{ type: "damage", element: "light", min: 11, max: 19 }], icon: "🌧️" },
  { id: "marque_cible", name: "Marque de Cible", description: "Affaiblit la défense de la cible.", apCost: 2, minRange: 2, maxRange: 8, area: 0, cooldown: 1, levelRequired: 3, classId: "archer", effects: [{ type: "debuff", stat: "defense", value: -20, duration: 3 }], icon: "🎯" },

  // Invocateur (à distance)
  { id: "invocation_wisp", name: "Invocation de Wisp", description: "Invoque un esprit stellaire.", apCost: 4, minRange: 1, maxRange: 3, area: 0, cooldown: 3, levelRequired: 1, classId: "invocateur", effects: [{ type: "summon", creatureId: "wisp" }], icon: "👾" },
  { id: "lien_ether", name: "Lien d'Éther", description: "Réduit la mobilité ennemie.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 2, levelRequired: 4, classId: "invocateur", effects: [{ type: "debuff", stat: "mp", value: -2, duration: 2 }], icon: "🔗" },
  { id: "tempete_esprits", name: "Tempête d'Esprits", description: "Dégâts de zone aux esprits.", apCost: 6, minRange: 1, maxRange: 6, area: 2, cooldown: 4, levelRequired: 8, classId: "invocateur", effects: [{ type: "damage", element: "ether", min: 11, max: 19 }], icon: "🌪️" },

  // v2.1 — 2 sorts additionnels par classe (niv. 10 et 18, style Dofus Touch)
  { id: "elixir_force", name: "Élixir de Force", description: "Renforce un allié.", apCost: 3, minRange: 1, maxRange: 4, area: 0, cooldown: 2, levelRequired: 10, classId: "alchimiste", effects: [{ type: "buff", stat: "damage", value: 20, duration: 3 }], icon: "💪" },
  { id: "nova_alchimique", name: "Nova Alchimique", description: "Explosion de potions en zone.", apCost: 6, minRange: 1, maxRange: 5, area: 2, cooldown: 4, levelRequired: 18, classId: "alchimiste", effects: [{ type: "damage", element: "ether", min: 14, max: 22 }], icon: "💫" },
  { id: "sort_bonus_lumina", name: "Bénédiction de Lumina", description: "Bonus sacré de l'Ordre.", apCost: 3, minRange: 1, maxRange: 5, area: 0, cooldown: 2, levelRequired: 10, classId: "luminaire", effects: [{ type: "buff", stat: "damage", value: 15, duration: 3 }], icon: "☀️" },
  { id: "resurrection", name: "Résurrection", description: "Soin puissant d'urgence.", apCost: 6, minRange: 1, maxRange: 4, area: 0, cooldown: 5, levelRequired: 18, classId: "luminaire", effects: [{ type: "heal", min: 40, max: 60 }], icon: "💖" },
  { id: "brasier", name: "Brasier", description: "Flammes persistantes.", apCost: 4, minRange: 1, maxRange: 5, area: 1, cooldown: 2, levelRequired: 10, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 12, max: 18 }], icon: "🔥" },
  { id: "inferno", name: "Inferno", description: "Apocalypse de feu.", apCost: 7, minRange: 1, maxRange: 6, area: 2, cooldown: 5, levelRequired: 18, classId: "pyromancien", effects: [{ type: "damage", element: "fire", min: 18, max: 28 }], icon: "🌋" },
  { id: "lance_glace", name: "Lance de Glace", description: "Projectile perçant.", apCost: 4, minRange: 1, maxRange: 6, area: 0, cooldown: 2, levelRequired: 10, classId: "cryomancien", effects: [{ type: "damage", element: "ice", min: 12, max: 18 }], icon: "🧊" },
  { id: "zero_absolu", name: "Zéro Absolu", description: "Gel dévastateur en zone.", apCost: 7, minRange: 1, maxRange: 5, area: 2, cooldown: 5, levelRequired: 18, classId: "cryomancien", effects: [{ type: "damage", element: "ice", min: 16, max: 26 }], icon: "❄️" },
  { id: "retour_force", name: "Retour de Force", description: "Riposte défensive.", apCost: 3, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 10, classId: "gardien", effects: [{ type: "buff", stat: "defense", value: 30, duration: 2 }], icon: "🔄" },
  { id: "forteresse", name: "Forteresse", description: "Mur impénétrable.", apCost: 6, minRange: 0, maxRange: 2, area: 1, cooldown: 5, levelRequired: 18, classId: "gardien", effects: [{ type: "buff", stat: "shield", value: 40, duration: 3 }], icon: "🏰" },
  { id: "riposte_fer", name: "Riposte de Fer", description: "Contre-attaque au bouclier.", apCost: 3, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 10, classId: "bastion", effects: [{ type: "buff", stat: "defense", value: 30, duration: 2 }], icon: "⚙️" },
  { id: "muraille", name: "Muraille", description: "Protection de groupe.", apCost: 6, minRange: 0, maxRange: 2, area: 1, cooldown: 5, levelRequired: 18, classId: "bastion", effects: [{ type: "buff", stat: "shield", value: 40, duration: 3 }], icon: "🧱" },
  { id: "furie", name: "Furie", description: "Enragement destructeur.", apCost: 3, minRange: 0, maxRange: 0, area: 0, cooldown: 3, levelRequired: 10, classId: "berserker", effects: [{ type: "buff", stat: "damage", value: 35, duration: 2 }], icon: "😤" },
  { id: "seisme_furieux", name: "Séisme Furieux", description: "Frappe en croix.", apCost: 6, minRange: 1, maxRange: 2, area: 2, cooldown: 4, levelRequired: 18, classId: "berserker", effects: [{ type: "damage", element: "earth", min: 16, max: 24 }], icon: "💥" },
  { id: "coup_fatal", name: "Coup Fatal", description: "Attaque critique furtive.", apCost: 4, minRange: 1, maxRange: 1, area: 0, cooldown: 2, levelRequired: 10, classId: "eclaireur", effects: [{ type: "damage", element: "shadow", min: 14, max: 20 }], icon: "🗡️" },
  { id: "tempete_brume", name: "Tempête de Brume", description: "Dégâts en zone furtifs.", apCost: 6, minRange: 1, maxRange: 4, area: 2, cooldown: 4, levelRequired: 18, classId: "eclaireur", effects: [{ type: "damage", element: "shadow", min: 14, max: 22 }], icon: "🌫️" },
  { id: "tir_percant", name: "Tir Perçant", description: "Flèche traversante.", apCost: 4, minRange: 2, maxRange: 8, area: 0, cooldown: 2, levelRequired: 10, classId: "archer", effects: [{ type: "damage", element: "light", min: 12, max: 18 }], icon: "🏹" },
  { id: "eclipse_lunaire", name: "Éclipse Lunaire", description: "Pluie de flèches sacrées.", apCost: 7, minRange: 3, maxRange: 7, area: 2, cooldown: 5, levelRequired: 18, classId: "archer", effects: [{ type: "damage", element: "light", min: 16, max: 26 }], icon: "🌑" },
  { id: "pacte_ether", name: "Pacte d'Éther", description: "Renforce les invocations.", apCost: 3, minRange: 0, maxRange: 3, area: 0, cooldown: 3, levelRequired: 10, classId: "invocateur", effects: [{ type: "buff", stat: "damage", value: 20, duration: 3 }], icon: "📜" },
  { id: "armee_esprits", name: "Armée d'Esprits", description: "Tempête d'esprits en zone.", apCost: 7, minRange: 1, maxRange: 6, area: 2, cooldown: 5, levelRequired: 18, classId: "invocateur", effects: [{ type: "damage", element: "ether", min: 14, max: 24 }], icon: "👻" },
];

export function getSpellById(id: string): SpellDefinition | undefined {
  return SPELLS.find((s) => s.id === id);
}

export function getSpellsForClass(classId: string): SpellDefinition[] {
  return SPELLS.filter((s) => s.classId === classId);
}
