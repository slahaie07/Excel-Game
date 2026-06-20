/**
 * Classes jouables — 10 archétypes équilibrés à Aetheris
 * 2 soins · 2 magie · 2 bouclier · 2 gros dégâts · 2 à distance
 * Chaque classe totalise 60 points de stats de base.
 */

export type StatKey = "vitality" | "wisdom" | "strength" | "intelligence" | "agility" | "chance";

export type ClassArchetype = "healer" | "magic" | "shield" | "burst" | "ranged";

export const ARCHETYPE_LABELS: Record<ClassArchetype, string> = {
  healer: "Soins",
  magic: "Magie",
  shield: "Bouclier",
  burst: "Gros dégâts",
  ranged: "À distance",
};

export interface ClassDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  archetype: ClassArchetype;
  role: "tank" | "healer" | "dps" | "support";
  range: "melee" | "ranged" | "hybrid";
  baseStats: Record<StatKey, number>;
  startingSpells: string[];
  color: string;
  icon: string;
}

/** Pool de stats normalisé : 60 points par classe */
const BALANCED_STATS = {
  healerSupport: { vitality: 12, wisdom: 16, strength: 4, intelligence: 12, agility: 8, chance: 8 },
  healerPure: { vitality: 10, wisdom: 18, strength: 4, intelligence: 14, agility: 8, chance: 6 },
  magicFire: { vitality: 10, wisdom: 12, strength: 4, intelligence: 16, agility: 10, chance: 8 },
  magicIce: { vitality: 10, wisdom: 12, strength: 4, intelligence: 16, agility: 12, chance: 6 },
  tankCrystal: { vitality: 18, wisdom: 6, strength: 14, intelligence: 4, agility: 6, chance: 12 },
  tankIron: { vitality: 18, wisdom: 6, strength: 16, intelligence: 4, agility: 4, chance: 12 },
  burstMelee: { vitality: 14, wisdom: 4, strength: 18, intelligence: 4, agility: 10, chance: 10 },
  burstHybrid: { vitality: 10, wisdom: 8, strength: 12, intelligence: 6, agility: 16, chance: 8 },
  rangedPhys: { vitality: 10, wisdom: 8, strength: 10, intelligence: 8, agility: 16, chance: 8 },
  rangedSummon: { vitality: 10, wisdom: 14, strength: 4, intelligence: 14, agility: 8, chance: 10 },
} as const satisfies Record<string, Record<StatKey, number>>;

export const CLASSES: ClassDefinition[] = [
  // — Soins —
  {
    id: "alchimiste",
    name: "Alchimiste des Runes",
    title: "Guérisseur Stellaire",
    description: "Mélange runes et potions pour soigner et renforcer ses alliés. Soins sur la durée et barrières de groupe.",
    archetype: "healer",
    role: "healer",
    range: "ranged",
    baseStats: BALANCED_STATS.healerSupport,
    startingSpells: ["soin_rune", "potion_regen", "barriere_alchimique"],
    color: "#2ecc71",
    icon: "⚗️",
  },
  {
    id: "luminaire",
    name: "Luminaire",
    title: "Prêtre de Lumina",
    description: "Canalise la lumière sacrée pour des soins puissants et des bénédictions protectrices.",
    archetype: "healer",
    role: "healer",
    range: "ranged",
    baseStats: BALANCED_STATS.healerPure,
    startingSpells: ["lumiere_sacree", "benediction", "aura_protectrice"],
    color: "#f1c40f",
    icon: "☀️",
  },

  // — Magie —
  {
    id: "pyromancien",
    name: "Pyromancien",
    title: "Maître des Flammes Cristallines",
    description: "Canalise la chaleur des Cristaux pour incinérer ses ennemis. Dégâts de zone dévastateurs.",
    archetype: "magic",
    role: "dps",
    range: "ranged",
    baseStats: BALANCED_STATS.magicFire,
    startingSpells: ["flamme_cristalline", "explosion_ether", "bouclier_flamme"],
    color: "#ff6b35",
    icon: "🔥",
  },
  {
    id: "cryomancien",
    name: "Cryomancien",
    title: "Sculpteur de Givre",
    description: "Maîtrise le froid éthéré pour blesser et immobiliser. Contrôle la mobilité ennemie.",
    archetype: "magic",
    role: "dps",
    range: "ranged",
    baseStats: BALANCED_STATS.magicIce,
    startingSpells: ["eclat_glace", "blizzard_ether", "prison_glace"],
    color: "#74b9ff",
    icon: "❄️",
  },

  // — Bouclier —
  {
    id: "gardien",
    name: "Gardien Cristallin",
    title: "Bouclier de Terreval",
    description: "Forge une armure de cristal vivant. Protège ses alliés et attire l'attention des ennemis.",
    archetype: "shield",
    role: "tank",
    range: "melee",
    baseStats: BALANCED_STATS.tankCrystal,
    startingSpells: ["mur_cristal", "provocation", "fracas_tellurique"],
    color: "#4a90d9",
    icon: "🛡️",
  },
  {
    id: "bastion",
    name: "Bastion de Fer",
    title: "Mur Inébranlable",
    description: "Encaisse les coups les plus violents et riposte au corps à corps. Deuxième pilier défensif d'Aetheris.",
    archetype: "shield",
    role: "tank",
    range: "melee",
    baseStats: BALANCED_STATS.tankIron,
    startingSpells: ["egide_fer", "defi_bastion", "charge_bouclier"],
    color: "#636e72",
    icon: "🏰",
  },

  // — Gros dégâts —
  {
    id: "berserker",
    name: "Berserker Tellurique",
    title: "Fureur de la Terre",
    description: "Canalise la rage tellurique pour des frappes dévastatrices. Plus il est blessé, plus il frappe fort.",
    archetype: "burst",
    role: "dps",
    range: "melee",
    baseStats: BALANCED_STATS.burstMelee,
    startingSpells: ["coup_tellurique", "rage_cristal", "entaille_sismique"],
    color: "#e74c3c",
    icon: "⚔️",
  },
  {
    id: "eclaireur",
    name: "Éclaireur des Brumes",
    title: "Ombre des Vallées",
    description: "Se fond dans les brumes d'Aether. Attaques furtives et mobilité exceptionnelle.",
    archetype: "burst",
    role: "dps",
    range: "hybrid",
    baseStats: BALANCED_STATS.burstHybrid,
    startingSpells: ["coup_brume", "invisibilite", "piege_ether"],
    color: "#7b68ee",
    icon: "🗡️",
  },

  // — À distance —
  {
    id: "archer",
    name: "Archer Lunaire",
    title: "Flèche de la Lune",
    description: "Tire des flèches imprégnées de lumière lunaire. Précision mortelle à longue portée.",
    archetype: "ranged",
    role: "dps",
    range: "ranged",
    baseStats: BALANCED_STATS.rangedPhys,
    startingSpells: ["fleche_lune", "pluie_fleches", "marque_cible"],
    color: "#c0c0c0",
    icon: "🏹",
  },
  {
    id: "invocateur",
    name: "Invocateur d'Aether",
    title: "Maître des Esprits",
    description: "Invoque des créatures stellaires pour combattre à ses côtés. Contrôle du champ de bataille à distance.",
    archetype: "ranged",
    role: "support",
    range: "ranged",
    baseStats: BALANCED_STATS.rangedSummon,
    startingSpells: ["invocation_wisp", "lien_ether", "tempete_esprits"],
    color: "#9b59b6",
    icon: "✨",
  },
];

export function getClassById(id: string): ClassDefinition | undefined {
  return CLASSES.find((c) => c.id === id);
}

export function getClassesByArchetype(archetype: ClassArchetype): ClassDefinition[] {
  return CLASSES.filter((c) => c.archetype === archetype);
}
