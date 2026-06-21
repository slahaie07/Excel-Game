/**
 * v5.0 — 7 métiers finaux (23 → 30)
 */

import type { ProfessionDefinition } from "./professions";

export const EXPANSION_PROFESSIONS_V50: ProfessionDefinition[] = [
  {
    id: "glaciologue",
    name: "Glaciologue",
    description: "Extrait ressources des terres gelées du nord.",
    type: "gathering",
    icon: "🧊",
    recipes: [
      { id: "recolte_glace", name: "Glace Stellaire", levelRequired: 55, ingredients: [], result: { itemId: "flocon_stellaire", quantity: 4 }, xpGain: 50 },
      { id: "recolte_cristal_givre", name: "Cristal de Givre", levelRequired: 70, ingredients: [], result: { itemId: "cristal_givre", quantity: 2 }, xpGain: 75 },
      { id: "recolte_boreale", name: "Essence Boréale", levelRequired: 100, ingredients: [], result: { itemId: "essence_boreale", quantity: 1 }, xpGain: 120 },
    ],
  },
  {
    id: "archeologue",
    name: "Archéologue",
    description: "Déterre reliques des ruines oubliées.",
    type: "gathering",
    icon: "🏺",
    recipes: [
      { id: "fouille_parchemin", name: "Parchemin Ancien", levelRequired: 30, ingredients: [], result: { itemId: "parchemin_ancien", quantity: 1 }, xpGain: 40 },
      { id: "fouille_relique", name: "Relique du Temple", levelRequired: 45, ingredients: [], result: { itemId: "relique_temple", quantity: 1 }, xpGain: 65 },
      { id: "fouille_fragment", name: "Fragment Fractal", levelRequired: 50, ingredients: [], result: { itemId: "fragment_fractal", quantity: 1 }, xpGain: 85 },
    ],
  },
  {
    id: "distillateur",
    name: "Distillateur",
    description: "Distille essences en potions puissantes.",
    type: "crafting",
    icon: "⚗️",
    recipes: [
      { id: "distillateur_potion_abysse", name: "Potion des Abysses", levelRequired: 30, ingredients: [{ itemId: "algue_lumineuse", quantity: 6 }, { itemId: "herbe_eveil", quantity: 4 }], result: { itemId: "potion_abysse", quantity: 2 }, xpGain: 55 },
      { id: "distillateur_elixir_vie", name: "Élixir de Vie Majeure", levelRequired: 80, ingredients: [{ itemId: "larme_nereide", quantity: 2 }, { itemId: "ether_condense", quantity: 3 }, { itemId: "herbe_eveil", quantity: 10 }], result: { itemId: "elixir_vie_majeure", quantity: 1 }, xpGain: 150 },
      { id: "distillateur_potion_tempete", name: "Potion de Tempête", levelRequired: 40, ingredients: [{ itemId: "essence_tempete", quantity: 2 }, { itemId: "poussiere_stellaire", quantity: 5 }], result: { itemId: "potion_tempete", quantity: 1 }, xpGain: 70 },
    ],
  },
  {
    id: "eleveur",
    name: "Éleveur",
    description: "Élève créatures et récolte produits animaux.",
    type: "gathering",
    icon: "🐑",
    recipes: [
      { id: "eleveur_ble", name: "Blé d'Éveil", levelRequired: 5, ingredients: [], result: { itemId: "ble_eveil", quantity: 6 }, xpGain: 8 },
      { id: "eleveur_poisson", name: "Poisson d'Éther", levelRequired: 10, ingredients: [], result: { itemId: "poisson_ether", quantity: 4 }, xpGain: 12 },
      { id: "eleveur_tentacule", name: "Tentacule de Kraken", levelRequired: 35, ingredients: [], result: { itemId: "tentacule_kraken", quantity: 1 }, xpGain: 50 },
    ],
  },
  {
    id: "gemmologue",
    name: "Gemmologue",
    description: "Taille et polit les gemmes stellaires.",
    type: "crafting",
    icon: "💎",
    recipes: [
      { id: "recette_cristal_pur", name: "Cristal Pur Taillé", levelRequired: 25, ingredients: [{ itemId: "cristal_pur", quantity: 2 }, { itemId: "poussiere_stellaire", quantity: 5 }], result: { itemId: "amulette_eveil", quantity: 1 }, xpGain: 60 },
      { id: "recette_noyau", name: "Noyau Stellaire Poli", levelRequired: 50, ingredients: [{ itemId: "noyau_stellaire", quantity: 3 }, { itemId: "ether_condense", quantity: 2 }], result: { itemId: "amulette_solaire", quantity: 1 }, xpGain: 100 },
      { id: "recette_perle", name: "Perle Stellaire Sertie", levelRequired: 45, ingredients: [{ itemId: "perle_stellaire", quantity: 3 }, { itemId: "cristal_corail", quantity: 2 }], result: { itemId: "anneau_tempete", quantity: 1 }, xpGain: 90 },
    ],
  },
  {
    id: "ingenieur_stellaire",
    name: "Ingénieur Stellaire",
    description: "Construit mécanismes et armes à éther.",
    type: "crafting",
    icon: "⚙️",
    recipes: [
      { id: "ingenieur_mecanisme", name: "Mécanisme Runique", levelRequired: 35, ingredients: [{ itemId: "minerai_stellaire", quantity: 5 }, { itemId: "noyau_stellaire", quantity: 1 }], result: { itemId: "rune_faille", quantity: 1 }, xpGain: 95 },
      { id: "ingenieur_lame", name: "Lame de la Forge Éternelle", levelRequired: 55, ingredients: [{ itemId: "noyau_stellaire", quantity: 3 }, { itemId: "ether_condense", quantity: 5 }, { itemId: "minerai_stellaire", quantity: 10 }], result: { itemId: "lame_forge_eternelle", quantity: 1 }, xpGain: 200 },
      { id: "ingenieur_trident", name: "Trident des Néréides", levelRequired: 55, ingredients: [{ itemId: "cristal_corail", quantity: 5 }, { itemId: "larme_nereide", quantity: 2 }, { itemId: "corail_vivant", quantity: 10 }], result: { itemId: "trident_nereide", quantity: 1 }, xpGain: 180 },
    ],
  },
  {
    id: "calligraphe",
    name: "Calligraphe",
    description: "Transcrit savoirs anciens en parchemins magiques.",
    type: "crafting",
    icon: "🖋️",
    recipes: [
      { id: "calligraphe_parchemin", name: "Parchemin Flottant", levelRequired: 48, ingredients: [{ itemId: "parchemin_ancien", quantity: 2 }, { itemId: "encre_ombre", quantity: 3 }], result: { itemId: "parchemin_flottant", quantity: 1 }, xpGain: 70 },
      { id: "calligraphe_relique", name: "Relique du Mirage", levelRequired: 32, ingredients: [{ itemId: "sable_ether", quantity: 10 }, { itemId: "parchemin_ancien", quantity: 1 }, { itemId: "cristal_pur", quantity: 3 }], result: { itemId: "relique_mirage", quantity: 1 }, xpGain: 95 },
      { id: "calligraphe_carte", name: "Carte au Trésor", levelRequired: 20, ingredients: [{ itemId: "encre_ombre", quantity: 2 }, { itemId: "parchemin_ancien", quantity: 1 }], result: { itemId: "carte_tresor", quantity: 1 }, xpGain: 45 },
    ],
  },
];
