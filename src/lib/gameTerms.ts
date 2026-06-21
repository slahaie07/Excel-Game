/** Terminologie Aetheris — identité propre à Terreval */

export const FLUX = "Flux";
export const FLUX_SHORT = "Fx";
export const ELAN = "Élan";
export const ELAN_SHORT = "Él";

export const CODEX_LABEL = "Codex des Sorts";
export const REFUGE_LABEL = "Refuge Cristallin";

export const STAT_LABELS: Record<string, string> = {
  vitality: "Robustesse",
  wisdom: "Clairvoyance",
  strength: "Puissance",
  intelligence: "Arcane",
  agility: "Vivacité",
  chance: "Fortune",
};

export const EQUIPMENT_SLOT_LABELS: Record<string, string> = {
  weapon: "Arme",
  armor: "Armure",
  helmet: "Heaume",
  boots: "Bottes",
  amulet: "Amulette",
  ring: "Anneau",
};

/** Noms d'affichage distincts pour les métiers (ids inchangés pour la sauvegarde) */
export const PROFESSION_DISPLAY_NAMES: Record<string, string> = {
  herboriste: "Herbaliste Stellaire",
  mineur: "Foreur d'Éther",
  bucheron: "Sylveur de Lumina",
  alchimie: "Distillateur d'Élixirs",
  forge: "Artificier d'Armes",
  joaillerie: "Lapidaire d'Éclats",
  pecheur: "Halieute de Brume",
  paysan: "Cultivateur Stellaire",
  trappeur: "Traqueur de Filons",
  plongeur: "Plongeur Abyssal",
  prospecteur: "Prospecteur Cristallin",
  botaniste: "Botaniste des Éthers",
  cueilleur_corail: "Récolteur de Corail",
  chasseur_ombres: "Traqueur d'Ombres",
  tailleur: "Couturier d'Aether",
  cordonnier: "Bottier Enchanté",
  sculpteur: "Archetier Sylvestre",
  cuisine: "Maître Condimentier",
  maroquinier: "Travailleur de Cuirs",
  enchanteur: "Imprimeur de Runes",
  forgeron_marin: "Artificier des Profondeurs",
  orfevre: "Orfèvre Royal",
  runesmith: "Forgeur de Runes",
  glaciologue: "Glaciologue",
  archeologue: "Archéologue",
  distillateur: "Distillateur",
  eleveur: "Éleveur de Wisps",
  gemmologue: "Gemmologue",
  ingenieur_stellaire: "Ingénieur Stellaire",
  calligraphe: "Calligraphe des Chroniques",
};

export function getProfessionDisplayName(id: string, fallback: string): string {
  return PROFESSION_DISPLAY_NAMES[id] ?? fallback;
}

export function formatFlux(current: number, max: number): string {
  return `⚡ ${current}/${max} ${FLUX}`;
}

export function formatElan(current: number, max: number): string {
  return `👟 ${current}/${max} ${ELAN}`;
}

export function formatFluxCost(cost: number): string {
  return `${cost} ${FLUX}`;
}

export function formatElanMove(distance: number): string {
  return `Déplacement (${distance} ${ELAN})`;
}

/** Traduit les messages serveur hérités PA/PM */
export function mapCombatError(message: string): string {
  if (message.includes("Pas assez de PM")) return `Pas assez d'${ELAN}`;
  if (message.includes("Pas assez de PA")) return `Pas assez de ${FLUX}`;
  return message;
}

export const QUEST_TYPE_LABELS: Record<string, string> = {
  main: "Chronique",
  side: "Écho",
  daily: "Quotidien",
  guild: "Guilde",
  dungeon: "Donjon",
};

export const QUEST_TYPE_COLORS: Record<string, string> = {
  main: "text-crystal-cyan border-crystal-cyan/40 bg-crystal-cyan/10",
  side: "text-aether-300 border-aether-600/40 bg-aether-800/40",
  daily: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  guild: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  dungeon: "text-rose-300 border-rose-500/40 bg-rose-500/10",
};
