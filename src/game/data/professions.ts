/**
 * Métiers et professions — craft, récolte, forge
 */

import {
  EXISTING_PROFESSION_RECIPES,
  EXPANSION_PROFESSIONS_V32,
} from "./expansionProfessions";
import { EXPANSION_PROFESSIONS_V50 } from "./expansionProfessionsV50";

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

const BASE_PROFESSIONS: ProfessionDefinition[] = [
  {
    id: "herboriste",
    name: "Herboriste",
    description: "Récolte des plantes médicinales dans la nature.",
    type: "gathering",
    icon: "🌿",
    recipes: [
      { id: "recolte_herbe", name: "Cueillette d'Herbes", levelRequired: 1, ingredients: [], result: { itemId: "herbe_eveil", quantity: 3 }, xpGain: 5 },
      { id: "recolte_algue", name: "Cueillette d'Algues", levelRequired: 12, ingredients: [], result: { itemId: "algue_lumineuse", quantity: 3 }, xpGain: 12 },
      { id: "recolte_fleur", name: "Fleur de Moonlight", levelRequired: 15, ingredients: [], result: { itemId: "fleur_moonlight", quantity: 2 }, xpGain: 15 },
    ],
  },
  {
    id: "mineur",
    name: "Mineur",
    description: "Extrait des minerais des filons.",
    type: "gathering",
    icon: "⛏️",
    recipes: [
      { id: "recolte_cuivre", name: "Minerai de Cuivre", levelRequired: 1, ingredients: [], result: { itemId: "minerai_cuivre", quantity: 3 }, xpGain: 8 },
      { id: "recolte_ether", name: "Éther Condensé", levelRequired: 40, ingredients: [], result: { itemId: "ether_condense", quantity: 1 }, xpGain: 40 },
    ],
  },
  {
    id: "bucheron",
    name: "Bûcheron",
    description: "Coupe du bois dans les forêts.",
    type: "gathering",
    icon: "🪓",
    recipes: [
      { id: "recolte_bois", name: "Bois de Lumina", levelRequired: 10, ingredients: [], result: { itemId: "bois_lumina", quantity: 3 }, xpGain: 10 },
      { id: "recolte_ecorce", name: "Écorce de Lumina", levelRequired: 12, ingredients: [], result: { itemId: "ecorce_lumina", quantity: 2 }, xpGain: 12 },
    ],
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
      { id: "recette_potion_abysse", name: "Potion des Abysses", levelRequired: 30, ingredients: [{ itemId: "perle_abysse", quantity: 1 }, { itemId: "algue_lumineuse", quantity: 5 }], result: { itemId: "potion_abysse", quantity: 1 }, xpGain: 60 },
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
      { id: "recette_armure_corail", name: "Armure de Corail", levelRequired: 50, ingredients: [{ itemId: "corail_vivant", quantity: 8 }, { itemId: "cristal_corail", quantity: 2 }], result: { itemId: "armure_corail", quantity: 1 }, xpGain: 120 },
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
      { id: "recette_anneau_tempete", name: "Anneau de Tempête", levelRequired: 38, ingredients: [{ itemId: "essence_tempete", quantity: 3 }, { itemId: "perle_abysse", quantity: 2 }], result: { itemId: "anneau_tempete", quantity: 1 }, xpGain: 90 },
    ],
  },
];

function mergeProfessionRecipes(base: ProfessionDefinition[]): ProfessionDefinition[] {
  return base.map((prof) => {
    const extra = EXISTING_PROFESSION_RECIPES[prof.id];
    if (!extra) return prof;
    return { ...prof, recipes: [...prof.recipes, ...extra] };
  });
}

export const PROFESSIONS: ProfessionDefinition[] = [
  ...mergeProfessionRecipes(BASE_PROFESSIONS),
  ...EXPANSION_PROFESSIONS_V32,
  ...EXPANSION_PROFESSIONS_V50,
];

export const MAX_PROFESSION_SLOTS = 5;

export function getProfessionById(id: string): ProfessionDefinition | undefined {
  return PROFESSIONS.find((p) => p.id === id);
}
