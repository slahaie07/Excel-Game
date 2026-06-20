/** Sorts et compétences de combat */

export type SpellTarget = "enemy" | "ally" | "self" | "cell" | "area";
export type DamageType = "physical" | "fire" | "ice" | "light" | "shadow" | "nature" | "arcane";

export interface Spell {
  id: string;
  name: string;
  description: string;
  paCost: number;
  pmCost: number;
  range: number;
  minRange: number;
  area: number;
  target: SpellTarget;
  damageType: DamageType;
  baseDamage: number;
  healAmount: number;
  effects: SpellEffect[];
  cooldown: number;
  icon: string;
}

export interface SpellEffect {
  type: "poison" | "stun" | "buff_force" | "debuff_resistance" | "shield" | "summon" | "taunt" | "invisible";
  duration: number;
  value: number;
}

export const SPELLS: Record<string, Spell> = {
  coup_bouclier: {
    id: "coup_bouclier", name: "Coup de Bouclier", description: "Frappe avec le bouclier et étourdit.",
    paCost: 3, pmCost: 0, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 15, healAmount: 0,
    effects: [{ type: "stun", duration: 1, value: 0 }], cooldown: 0, icon: "🛡️",
  },
  provocation: {
    id: "provocation", name: "Provocation", description: "Force un ennemi à vous attaquer.",
    paCost: 2, pmCost: 0, range: 4, minRange: 1, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 0, healAmount: 0,
    effects: [{ type: "taunt", duration: 2, value: 0 }], cooldown: 2, icon: "😤",
  },
  muraille: {
    id: "muraille", name: "Muraille", description: "Crée un bouclier protecteur.",
    paCost: 3, pmCost: 0, range: 0, minRange: 0, area: 0, target: "self",
    damageType: "physical", baseDamage: 0, healAmount: 0,
    effects: [{ type: "shield", duration: 3, value: 30 }], cooldown: 3, icon: "🏰",
  },
  contre_attaque: {
    id: "contre_attaque", name: "Contre-attaque", description: "Riposte puissante après une parade.",
    paCost: 4, pmCost: 0, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 35, healAmount: 0, effects: [], cooldown: 1, icon: "⚔️",
  },
  eclair_arcane: {
    id: "eclair_arcane", name: "Éclair Arcane", description: "Éclair magique rapide.",
    paCost: 2, pmCost: 0, range: 6, minRange: 1, area: 0, target: "enemy",
    damageType: "arcane", baseDamage: 20, healAmount: 0, effects: [], cooldown: 0, icon: "⚡",
  },
  boule_feu: {
    id: "boule_feu", name: "Boule de Feu", description: "Projectile enflammé explosif.",
    paCost: 4, pmCost: 0, range: 5, minRange: 2, area: 1, target: "area",
    damageType: "fire", baseDamage: 40, healAmount: 0, effects: [], cooldown: 0, icon: "🔥",
  },
  tempete_glace: {
    id: "tempete_glace", name: "Tempête de Glace", description: "Zone glacée qui ralentit.",
    paCost: 5, pmCost: 0, range: 4, minRange: 2, area: 2, target: "area",
    damageType: "ice", baseDamage: 25, healAmount: 0,
    effects: [{ type: "debuff_resistance", duration: 2, value: 10 }], cooldown: 2, icon: "❄️",
  },
  meteore: {
    id: "meteore", name: "Météore", description: "Apocalypse arcanique dévastatrice.",
    paCost: 7, pmCost: 0, range: 6, minRange: 3, area: 2, target: "area",
    damageType: "arcane", baseDamage: 80, healAmount: 0, effects: [], cooldown: 5, icon: "☄️",
  },
  tir_precis: {
    id: "tir_precis", name: "Tir Précis", description: "Flèche mortelle à longue portée.",
    paCost: 3, pmCost: 0, range: 8, minRange: 2, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 30, healAmount: 0, effects: [], cooldown: 0, icon: "🏹",
  },
  fleche_empoisonnee: {
    id: "fleche_empoisonnee", name: "Flèche Empoisonnée", description: "Empoisonne la cible.",
    paCost: 3, pmCost: 0, range: 6, minRange: 2, area: 0, target: "enemy",
    damageType: "nature", baseDamage: 15, healAmount: 0,
    effects: [{ type: "poison", duration: 3, value: 10 }], cooldown: 0, icon: "🧪",
  },
  pluie_fleches: {
    id: "pluie_fleches", name: "Pluie de Flèches", description: "Salve sur une zone.",
    paCost: 5, pmCost: 0, range: 6, minRange: 3, area: 2, target: "area",
    damageType: "physical", baseDamage: 20, healAmount: 0, effects: [], cooldown: 2, icon: "🌧️",
  },
  piege: {
    id: "piege", name: "Piège", description: "Pose un piège sur une case.",
    paCost: 2, pmCost: 0, range: 4, minRange: 1, area: 0, target: "cell",
    damageType: "physical", baseDamage: 25, healAmount: 0,
    effects: [{ type: "stun", duration: 1, value: 0 }], cooldown: 1, icon: "🪤",
  },
  soin_mineur: {
    id: "soin_mineur", name: "Soin Mineur", description: "Restaure des points de vie.",
    paCost: 2, pmCost: 0, range: 4, minRange: 0, area: 0, target: "ally",
    damageType: "light", baseDamage: 0, healAmount: 35, effects: [], cooldown: 0, icon: "💚",
  },
  benediction: {
    id: "benediction", name: "Bénédiction", description: "Augmente la force d'un allié.",
    paCost: 3, pmCost: 0, range: 4, minRange: 0, area: 0, target: "ally",
    damageType: "light", baseDamage: 0, healAmount: 0,
    effects: [{ type: "buff_force", duration: 3, value: 15 }], cooldown: 0, icon: "✨",
  },
  resurrection: {
    id: "resurrection", name: "Résurrection", description: "Ramène un allié à la vie.",
    paCost: 6, pmCost: 0, range: 3, minRange: 1, area: 0, target: "ally",
    damageType: "light", baseDamage: 0, healAmount: 50, effects: [], cooldown: 5, icon: "🕊️",
  },
  barriere_sacree: {
    id: "barriere_sacree", name: "Barrière Sacrée", description: "Bouclier magique sur toute l'équipe.",
    paCost: 4, pmCost: 0, range: 0, minRange: 0, area: 3, target: "ally",
    damageType: "light", baseDamage: 0, healAmount: 0,
    effects: [{ type: "shield", duration: 2, value: 20 }], cooldown: 4, icon: "🔮",
  },
  coup_furieux: {
    id: "coup_furieux", name: "Coup Furieux", description: "Attaque sauvage dévastatrice.",
    paCost: 4, pmCost: 0, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 45, healAmount: 0, effects: [], cooldown: 0, icon: "💥",
  },
  charge: {
    id: "charge", name: "Charge", description: "Fonce sur l'ennemi en ligne droite.",
    paCost: 3, pmCost: 2, range: 5, minRange: 2, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 25, healAmount: 0, effects: [], cooldown: 1, icon: "🐂",
  },
  rugissement: {
    id: "rugissement", name: "Rugissement", description: "Intimide les ennemis proches.",
    paCost: 2, pmCost: 0, range: 2, minRange: 0, area: 1, target: "area",
    damageType: "physical", baseDamage: 5, healAmount: 0,
    effects: [{ type: "debuff_resistance", duration: 2, value: 15 }], cooldown: 2, icon: "🦁",
  },
  fureur: {
    id: "fureur", name: "Fureur", description: "Double les dégâts pendant 2 tours.",
    paCost: 3, pmCost: 0, range: 0, minRange: 0, area: 0, target: "self",
    damageType: "physical", baseDamage: 0, healAmount: 0,
    effects: [{ type: "buff_force", duration: 2, value: 30 }], cooldown: 4, icon: "😡",
  },
  coup_sournois: {
    id: "coup_sournois", name: "Coup Sournois", description: "Attaque dans le dos, critique garanti.",
    paCost: 3, pmCost: 1, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "shadow", baseDamage: 35, healAmount: 0, effects: [], cooldown: 0, icon: "🗡️",
  },
  invisibilite: {
    id: "invisibilite", name: "Invisibilité", description: "Devient invisible aux yeux ennemis.",
    paCost: 2, pmCost: 0, range: 0, minRange: 0, area: 0, target: "self",
    damageType: "shadow", baseDamage: 0, healAmount: 0,
    effects: [{ type: "invisible", duration: 2, value: 0 }], cooldown: 3, icon: "👻",
  },
  poignard: {
    id: "poignard", name: "Poignard", description: "Coup rapide et précis.",
    paCost: 2, pmCost: 0, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "physical", baseDamage: 20, healAmount: 0, effects: [], cooldown: 0, icon: "🔪",
  },
  execution: {
    id: "execution", name: "Exécution", description: "Achève un ennemi affaibli.",
    paCost: 5, pmCost: 0, range: 1, minRange: 0, area: 0, target: "enemy",
    damageType: "shadow", baseDamage: 60, healAmount: 0, effects: [], cooldown: 3, icon: "💀",
  },
  invocation_loup: {
    id: "invocation_loup", name: "Invocation du Loup", description: "Invoque un loup combattant.",
    paCost: 4, pmCost: 0, range: 2, minRange: 1, area: 0, target: "cell",
    damageType: "nature", baseDamage: 0, healAmount: 0,
    effects: [{ type: "summon", duration: 5, value: 40 }], cooldown: 2, icon: "🐺",
  },
  invocation_golem: {
    id: "invocation_golem", name: "Invocation du Golem", description: "Invoque un golem de pierre.",
    paCost: 5, pmCost: 0, range: 2, minRange: 1, area: 0, target: "cell",
    damageType: "physical", baseDamage: 0, healAmount: 0,
    effects: [{ type: "summon", duration: 4, value: 80 }], cooldown: 4, icon: "🗿",
  },
  lien_ame: {
    id: "lien_ame", name: "Lien d'Âme", description: "Partage les dégâts avec une invocation.",
    paCost: 2, pmCost: 0, range: 4, minRange: 0, area: 0, target: "ally",
    damageType: "arcane", baseDamage: 0, healAmount: 20, effects: [], cooldown: 1, icon: "🔗",
  },
  tempete: {
    id: "tempete", name: "Tempête Élémentaire", description: "Chaos élémentaire sur une large zone.",
    paCost: 6, pmCost: 0, range: 5, minRange: 2, area: 3, target: "area",
    damageType: "arcane", baseDamage: 30, healAmount: 0, effects: [], cooldown: 4, icon: "🌪️",
  },
  potion_acide: {
    id: "potion_acide", name: "Potion Acide", description: "Lance une fiole corrosive.",
    paCost: 3, pmCost: 0, range: 5, minRange: 2, area: 1, target: "area",
    damageType: "nature", baseDamage: 25, healAmount: 0,
    effects: [{ type: "poison", duration: 2, value: 8 }], cooldown: 0, icon: "🧴",
  },
  nuage_toxique: {
    id: "nuage_toxique", name: "Nuage Toxique", description: "Nuage empoisonné persistant.",
    paCost: 4, pmCost: 0, range: 4, minRange: 2, area: 2, target: "area",
    damageType: "nature", baseDamage: 15, healAmount: 0,
    effects: [{ type: "poison", duration: 3, value: 12 }], cooldown: 2, icon: "☁️",
  },
  elixir_force: {
    id: "elixir_force", name: "Élixir de Force", description: "Booste temporairement un allié.",
    paCost: 2, pmCost: 0, range: 3, minRange: 0, area: 0, target: "ally",
    damageType: "nature", baseDamage: 0, healAmount: 0,
    effects: [{ type: "buff_force", duration: 3, value: 20 }], cooldown: 0, icon: "⚗️",
  },
  transmutation: {
    id: "transmutation", name: "Transmutation", description: "Transforme les ennemis en statues.",
    paCost: 5, pmCost: 0, range: 4, minRange: 2, area: 0, target: "enemy",
    damageType: "arcane", baseDamage: 10, healAmount: 0,
    effects: [{ type: "stun", duration: 2, value: 0 }], cooldown: 4, icon: "🪨",
  },
};
