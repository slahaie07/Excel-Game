/**
 * Classes jouables — 8 archétypes uniques à Aetheris
 */

export type StatKey = "vitality" | "wisdom" | "strength" | "intelligence" | "agility" | "chance";

export interface ClassDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  role: "tank" | "healer" | "dps" | "support";
  range: "melee" | "ranged" | "hybrid";
  baseStats: Record<StatKey, number>;
  startingSpells: string[];
  color: string;
  icon: string;
}

export const CLASSES: ClassDefinition[] = [
  {
    id: "pyromancien",
    name: "Pyromancien",
    title: "Maître des Flammes Cristallines",
    description: "Canalise la chaleur des Cristaux pour incinérer ses ennemis. Dégâts de zone dévastateurs.",
    role: "dps",
    range: "ranged",
    baseStats: { vitality: 8, wisdom: 12, strength: 4, intelligence: 16, agility: 6, chance: 4 },
    startingSpells: ["flamme_cristalline", "explosion_ether", "bouclier_flamme"],
    color: "#ff6b35",
    icon: "🔥",
  },
  {
    id: "gardien",
    name: "Gardien Cristallin",
    title: "Bouclier de Terreval",
    description: "Forge une armure de cristal vivant. Protège ses alliés et attire l'attention des ennemis.",
    role: "tank",
    range: "melee",
    baseStats: { vitality: 18, wisdom: 6, strength: 14, intelligence: 4, agility: 4, chance: 4 },
    startingSpells: ["mur_cristal", "provocation", "fracas_tellurique"],
    color: "#4a90d9",
    icon: "🛡️",
  },
  {
    id: "eclaireur",
    name: "Éclaireur des Brumes",
    title: "Ombre des Vallées",
    description: "Se fond dans les brumes d'Aether. Attaques furtives et mobilité exceptionnelle.",
    role: "dps",
    range: "hybrid",
    baseStats: { vitality: 10, wisdom: 8, strength: 10, intelligence: 6, agility: 16, chance: 10 },
    startingSpells: ["coup_brume", "invisibilite", "piege_ether"],
    color: "#7b68ee",
    icon: "🗡️",
  },
  {
    id: "invocateur",
    name: "Invocateur d'Aether",
    title: "Maître des Esprits",
    description: "Invoque des créatures stellaires pour combattre à ses côtés. Contrôle du champ de bataille.",
    role: "support",
    range: "ranged",
    baseStats: { vitality: 10, wisdom: 14, strength: 4, intelligence: 14, agility: 6, chance: 12 },
    startingSpells: ["invocation_wisp", "lien_ether", "tempete_esprits"],
    color: "#9b59b6",
    icon: "✨",
  },
  {
    id: "alchimiste",
    name: "Alchimiste des Runes",
    title: "Guérisseur Stellaire",
    description: "Mélange runes et potions pour soigner et renforcer ses alliés. Support indispensable.",
    role: "healer",
    range: "ranged",
    baseStats: { vitality: 12, wisdom: 16, strength: 4, intelligence: 12, agility: 6, chance: 10 },
    startingSpells: ["soin_rune", "potion_regen", "barriere_alchimique"],
    color: "#2ecc71",
    icon: "⚗️",
  },
  {
    id: "archer",
    name: "Archer Lunaire",
    title: "Flèche de la Lune",
    description: "Tire des flèches imprégnées de lumière lunaire. Précision mortelle à longue portée.",
    role: "dps",
    range: "ranged",
    baseStats: { vitality: 10, wisdom: 8, strength: 8, intelligence: 8, agility: 14, chance: 12 },
    startingSpells: ["fleche_lune", "pluie_fleches", "marque_cible"],
    color: "#c0c0c0",
    icon: "🏹",
  },
  {
    id: "berserker",
    name: "Berserker Tellurique",
    title: "Fureur de la Terre",
    description: "Canalise la rage tellurique pour des frappes dévastatrices. Plus il est blessé, plus il frappe fort.",
    role: "dps",
    range: "melee",
    baseStats: { vitality: 14, wisdom: 4, strength: 18, intelligence: 4, agility: 8, chance: 12 },
    startingSpells: ["coup_tellurique", "rage_cristal", "entaille_sismique"],
    color: "#e74c3c",
    icon: "⚔️",
  },
  {
    id: "chronomancien",
    name: "Chronomancien",
    title: "Tisseur du Temps",
    description: "Manipule le flux temporel. Ralentit les ennemis, accélère les alliés, unique en son genre.",
    role: "support",
    range: "hybrid",
    baseStats: { vitality: 8, wisdom: 14, strength: 4, intelligence: 16, agility: 10, chance: 8 },
    startingSpells: ["ralentissement", "acceleration", "paradoxe_temporel"],
    color: "#00e5ff",
    icon: "⏳",
  },
];

export function getClassById(id: string): ClassDefinition | undefined {
  return CLASSES.find((c) => c.id === id);
}
