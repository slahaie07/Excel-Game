/**
 * Métiers et professions — craft, récolte, forge
 */

export interface ProfessionDefinition {
  id: string;
  name: string;
  description: string;
  type: "gathering" | "crafting";
  icon: string;
  recipes: RecipeDefinition[];
}

export interface RecipeDefinition {
  id: string;
  name: string;
  levelRequired: number;
  ingredients: { itemId: string; quantity: number }[];
  result: { itemId: string; quantity: number };
  xpGain: number;
}

export const PROFESSIONS: ProfessionDefinition[] = [
  {
    id: "herboriste",
    name: "Herboriste",
    description: "Récolte des plantes médicinales dans la nature.",
    type: "gathering",
    icon: "🌿",
    recipes: [],
  },
  {
    id: "mineur",
    name: "Mineur",
    description: "Extrait des minerais des filons.",
    type: "gathering",
    icon: "⛏️",
    recipes: [],
  },
  {
    id: "bucheron",
    name: "Bûcheron",
    description: "Coupe du bois dans les forêts.",
    type: "gathering",
    icon: "🪓",
    recipes: [],
  },
  {
    id: "alchimie",
    name: "Alchimie",
    description: "Crée des potions et élixirs.",
    type: "crafting",
    icon: "⚗️",
    recipes: [
      { id: "recette_potion_vie", name: "Potion de Vie", levelRequired: 1, ingredients: [{ itemId: "herbe_eveil", quantity: 3 }], result: { itemId: "potion_vie", quantity: 1 }, xpGain: 10 },
      { id: "recette_potion_energie", name: "Potion d'Énergie", levelRequired: 5, ingredients: [{ itemId: "poussiere_stellaire", quantity: 2 }, { itemId: "herbe_eveil", quantity: 5 }], result: { itemId: "potion_energie", quantity: 1 }, xpGain: 25 },
    ],
  },
  {
    id: "forge",
    name: "Forge",
    description: "Forge des armes et armures.",
    type: "crafting",
    icon: "🔨",
    recipes: [
      { id: "recette_epee_apprenti", name: "Épée d'Apprenti", levelRequired: 1, ingredients: [{ itemId: "minerai_cuivre", quantity: 5 }], result: { itemId: "epee_apprenti", quantity: 1 }, xpGain: 15 },
      { id: "recette_baton_ether", name: "Bâton d'Éther", levelRequired: 5, ingredients: [{ itemId: "bois_lumina", quantity: 3 }, { itemId: "poussiere_stellaire", quantity: 2 }], result: { itemId: "baton_ether", quantity: 1 }, xpGain: 30 },
    ],
  },
  {
    id: "joaillerie",
    name: "Joaillerie",
    description: "Crée des bijoux et amulettes.",
    type: "crafting",
    icon: "💍",
    recipes: [
      { id: "recette_amulette_base", name: "Amulette de Base", levelRequired: 10, ingredients: [{ itemId: "cristal_pur", quantity: 1 }, { itemId: "poussiere_stellaire", quantity: 5 }], result: { itemId: "amulette_eveil", quantity: 1 }, xpGain: 50 },
    ],
  },
];

export const DUNGEONS = [
  { id: "ruines_corrompues", name: "Ruines Corrompues", zoneId: "vallee_eveils", levelRequired: 8, rooms: 5, bossId: "gardien_ruines", icon: "🏚️" },
  { id: "sanctuaire_lumina", name: "Sanctuaire de Lumina", zoneId: "foret_lumina", levelRequired: 15, rooms: 8, bossId: "champion_lumina", icon: "⛪" },
  { id: "pyramide_ombres", name: "Pyramide des Ombres", zoneId: "desert_umbra", levelRequired: 30, rooms: 10, bossId: "sphinx_ombres", icon: "🔺" },
  { id: "nexus_aether", name: "Nexus d'Aether", zoneId: "citadelle_stellaire", levelRequired: 50, rooms: 15, bossId: "dragon_aether", icon: "🌀" },
  { id: "tour_infinie", name: "Tour Infinie", zoneId: "citadelle_stellaire", levelRequired: 40, rooms: 999, bossId: "random", icon: "🗼" },
];

export function getProfessionById(id: string): ProfessionDefinition | undefined {
  return PROFESSIONS.find((p) => p.id === id);
}
