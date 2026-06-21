/**
 * v3.2 — Expansion métiers (6 → 22)
 */

import type { ProfessionDefinition } from "./professions";

/** Recettes endgame ajoutées aux métiers existants */
export const EXISTING_PROFESSION_RECIPES: Record<string, ProfessionDefinition["recipes"]> = {
  herboriste: [
    { id: "recolte_champignon", name: "Champignon d'Abysses", levelRequired: 55, ingredients: [], result: { itemId: "champignon_abysse", quantity: 2 }, xpGain: 55 },
    { id: "recolte_flocon", name: "Flocon Stellaire", levelRequired: 25, ingredients: [], result: { itemId: "flocon_stellaire", quantity: 3 }, xpGain: 28 },
  ],
  mineur: [
    { id: "recolte_stellaire", name: "Minerai Stellaire", levelRequired: 45, ingredients: [], result: { itemId: "minerai_stellaire", quantity: 2 }, xpGain: 50 },
    { id: "recolte_ombre", name: "Minerai d'Ombre", levelRequired: 15, ingredients: [], result: { itemId: "minerai_ombre", quantity: 3 }, xpGain: 18 },
    { id: "recolte_fragment", name: "Fragment Fractal", levelRequired: 42, ingredients: [], result: { itemId: "fragment_fractal", quantity: 1 }, xpGain: 45 },
  ],
  bucheron: [
    { id: "recolte_bois_fossile", name: "Bois Fossilisé", levelRequired: 35, ingredients: [], result: { itemId: "bois_fossile", quantity: 2 }, xpGain: 38 },
  ],
  alchimie: [
    { id: "recette_elixir_vie", name: "Élixir de Vie Majeure", levelRequired: 80, ingredients: [{ itemId: "larme_nereide", quantity: 2 }, { itemId: "ether_condense", quantity: 3 }, { itemId: "herbe_eveil", quantity: 10 }], result: { itemId: "elixir_vie_majeure", quantity: 1 }, xpGain: 150 },
    { id: "recette_potion_tempete", name: "Potion de Tempête", levelRequired: 40, ingredients: [{ itemId: "essence_tempete", quantity: 2 }, { itemId: "poussiere_stellaire", quantity: 5 }], result: { itemId: "potion_tempete", quantity: 1 }, xpGain: 70 },
  ],
  forge: [
    { id: "recette_lame_eternelle", name: "Lame de la Forge Éternelle", levelRequired: 55, ingredients: [{ itemId: "noyau_stellaire", quantity: 3 }, { itemId: "ether_condense", quantity: 5 }, { itemId: "minerai_stellaire", quantity: 10 }], result: { itemId: "lame_forge_eternelle", quantity: 1 }, xpGain: 200 },
    { id: "recette_trident", name: "Trident des Néréides", levelRequired: 55, ingredients: [{ itemId: "cristal_corail", quantity: 5 }, { itemId: "larme_nereide", quantity: 2 }, { itemId: "corail_vivant", quantity: 10 }], result: { itemId: "trident_nereide", quantity: 1 }, xpGain: 180 },
    { id: "recette_arc_lunaire", name: "Arc Lunaire", levelRequired: 12, ingredients: [{ itemId: "bois_lumina", quantity: 8 }, { itemId: "fleur_moonlight", quantity: 4 }], result: { itemId: "arc_lunaire", quantity: 1 }, xpGain: 55 },
  ],
  joaillerie: [
    { id: "recette_amulette_umbra", name: "Amulette d'Umbra", levelRequired: 42, ingredients: [{ itemId: "essence_ombre", quantity: 3 }, { itemId: "cristal_pur", quantity: 2 }], result: { itemId: "amulette_umbra", quantity: 1 }, xpGain: 110 },
    { id: "recette_couronne_marine", name: "Couronne Marine", levelRequired: 85, ingredients: [{ itemId: "ecaille_leviathan", quantity: 3 }, { itemId: "larme_nereide", quantity: 5 }, { itemId: "cristal_corail", quantity: 8 }], result: { itemId: "couronne_marine", quantity: 1 }, xpGain: 300 },
  ],
};

export const EXPANSION_PROFESSIONS_V32: ProfessionDefinition[] = [
  // ——— Récolte ———
  {
    id: "pecheur",
    name: "Pêcheur",
    description: "Pêche des créatures et ressources marines.",
    type: "gathering",
    icon: "🎣",
    recipes: [
      { id: "peche_poisson", name: "Poisson d'Éther", levelRequired: 1, ingredients: [], result: { itemId: "poisson_ether", quantity: 3 }, xpGain: 8 },
      { id: "peche_coquille", name: "Coquilles Perlières", levelRequired: 14, ingredients: [], result: { itemId: "coquille_perle", quantity: 2 }, xpGain: 16 },
      { id: "peche_tentacule", name: "Tentacule de Kraken", levelRequired: 30, ingredients: [], result: { itemId: "tentacule_kraken", quantity: 1 }, xpGain: 45 },
    ],
  },
  {
    id: "paysan",
    name: "Paysan",
    description: "Cultive céréales et plantes du désert.",
    type: "gathering",
    icon: "🌾",
    recipes: [
      { id: "recolte_ble", name: "Blé d'Éveil", levelRequired: 1, ingredients: [], result: { itemId: "ble_eveil", quantity: 5 }, xpGain: 6 },
      { id: "recolte_cactus", name: "Cactus d'Ombre", levelRequired: 25, ingredients: [], result: { itemId: "cactus_ombre", quantity: 4 }, xpGain: 30 },
      { id: "recolte_sable", name: "Sable d'Éther", levelRequired: 22, ingredients: [], result: { itemId: "sable_ether", quantity: 5 }, xpGain: 22 },
    ],
  },
  {
    id: "trappeur",
    name: "Trappeur",
    description: "Chasse et dépece les créatures sauvages.",
    type: "gathering",
    icon: "🪤",
    recipes: [
      { id: "depecer_loup", name: "Fourrure de Cristal", levelRequired: 5, ingredients: [], result: { itemId: "fourrure_cristal", quantity: 3 }, xpGain: 12 },
      { id: "depecer_requin", name: "Écaille de Requin", levelRequired: 30, ingredients: [], result: { itemId: "ecaille_requin", quantity: 2 }, xpGain: 40 },
      { id: "depecer_scorpion", name: "Carapace Royale", levelRequired: 35, ingredients: [], result: { itemId: "carapace_royale", quantity: 1 }, xpGain: 55 },
    ],
  },
  {
    id: "plongeur",
    name: "Plongeur",
    description: "Récolte les trésors des abysses.",
    type: "gathering",
    icon: "🤿",
    recipes: [
      { id: "plonge_nacre", name: "Nacre Stellaire", levelRequired: 22, ingredients: [], result: { itemId: "nacre_stellaire", quantity: 2 }, xpGain: 28 },
      { id: "plonge_perle", name: "Perle d'Abysse", levelRequired: 30, ingredients: [], result: { itemId: "perle_abysse", quantity: 1 }, xpGain: 42 },
      { id: "plonge_larme", name: "Larme de Néréide", levelRequired: 58, ingredients: [], result: { itemId: "larme_nereide", quantity: 1 }, xpGain: 80 },
    ],
  },
  {
    id: "prospecteur",
    name: "Prospecteur",
    description: "Trouve des gisements rares et cristaux purs.",
    type: "gathering",
    icon: "🔍",
    recipes: [
      { id: "prospect_cristal", name: "Cristal Pur", levelRequired: 20, ingredients: [], result: { itemId: "cristal_pur", quantity: 1 }, xpGain: 35 },
      { id: "prospect_essence", name: "Essence de Wisp", levelRequired: 14, ingredients: [], result: { itemId: "essence_wisp", quantity: 2 }, xpGain: 22 },
      { id: "prospect_lentille", name: "Lentille du Vide", levelRequired: 50, ingredients: [], result: { itemId: "lentille_void", quantity: 1 }, xpGain: 90 },
    ],
  },
  {
    id: "botaniste",
    name: "Botaniste",
    description: "Spécialiste des plantes rares et fleurs stellaires.",
    type: "gathering",
    icon: "🌺",
    recipes: [
      { id: "recolte_fleur_ether", name: "Fleur d'Éther", levelRequired: 12, ingredients: [], result: { itemId: "fleur_ether", quantity: 3 }, xpGain: 18 },
      { id: "recolte_aile", name: "Aile de Fée", levelRequired: 16, ingredients: [], result: { itemId: "aile_fee", quantity: 2 }, xpGain: 25 },
      { id: "recolte_venin", name: "Venin d'Éther", levelRequired: 28, ingredients: [], result: { itemId: "venin_ether", quantity: 2 }, xpGain: 38 },
    ],
  },
  {
    id: "cueilleur_corail",
    name: "Cueilleur de Corail",
    description: "Extrait corail vivant des récifs.",
    type: "gathering",
    icon: "🪸",
    recipes: [
      { id: "cueil_corail", name: "Corail Vivant", levelRequired: 20, ingredients: [], result: { itemId: "corail_vivant", quantity: 3 }, xpGain: 25 },
      { id: "cueil_cristal_corail", name: "Cristal de Corail", levelRequired: 48, ingredients: [], result: { itemId: "cristal_corail", quantity: 1 }, xpGain: 75 },
      { id: "cueil_nacre_mat", name: "Nacre de Matriarche", levelRequired: 24, ingredients: [], result: { itemId: "nacre_matriarche", quantity: 1 }, xpGain: 32 },
    ],
  },
  {
    id: "chasseur_ombres",
    name: "Chasseur d'Ombres",
    description: "Traque les essences corrompues.",
    type: "gathering",
    icon: "👤",
    recipes: [
      { id: "chasse_fragment", name: "Fragment d'Ombre", levelRequired: 1, ingredients: [], result: { itemId: "fragment_ombre", quantity: 5 }, xpGain: 5 },
      { id: "chasse_essence", name: "Essence d'Ombre", levelRequired: 32, ingredients: [], result: { itemId: "essence_ombre", quantity: 2 }, xpGain: 48 },
      { id: "chasse_eclipse", name: "Fragment d'Éclipse", levelRequired: 28, ingredients: [], result: { itemId: "fragment_eclipse", quantity: 1 }, xpGain: 40 },
    ],
  },
  // ——— Craft ———
  {
    id: "tailleur",
    name: "Tailleur",
    description: "Confectionne capes et armures légères.",
    type: "crafting",
    icon: "🧵",
    recipes: [
      { id: "recette_fil", name: "Fil de Lumina", levelRequired: 8, ingredients: [{ itemId: "fleur_moonlight", quantity: 3 }], result: { itemId: "fil_lumina", quantity: 5 }, xpGain: 20 },
      { id: "recette_cape_umbra", name: "Cape d'Umbra", levelRequired: 35, ingredients: [{ itemId: "fil_lumina", quantity: 8 }, { itemId: "essence_ombre", quantity: 3 }, { itemId: "sable_ether", quantity: 5 }], result: { itemId: "cape_umbra", quantity: 1 }, xpGain: 95 },
      { id: "recette_cape_tempete", name: "Cape de la Tempête", levelRequired: 42, ingredients: [{ itemId: "fil_lumina", quantity: 10 }, { itemId: "plume_stellaire", quantity: 4 }, { itemId: "essence_tempete", quantity: 3 }], result: { itemId: "cape_tempete", quantity: 1 }, xpGain: 110 },
      { id: "recette_armure_givre", name: "Armure de Givre", levelRequired: 40, ingredients: [{ itemId: "fil_lumina", quantity: 12 }, { itemId: "flocon_stellaire", quantity: 8 }, { itemId: "cristal_pur", quantity: 3 }], result: { itemId: "armure_givre", quantity: 1 }, xpGain: 130 },
    ],
  },
  {
    id: "cordonnier",
    name: "Cordonnier",
    description: "Fabrique bottes et chaussures enchantées.",
    type: "crafting",
    icon: "👞",
    recipes: [
      { id: "recette_bottes_maree", name: "Bottes de Marée", levelRequired: 25, ingredients: [{ itemId: "cuir_ombre", quantity: 5 }, { itemId: "algue_lumineuse", quantity: 8 }], result: { itemId: "bottes_maree", quantity: 1 }, xpGain: 60 },
      { id: "recette_bottes_umbra", name: "Bottes d'Umbra", levelRequired: 38, ingredients: [{ itemId: "cuir_ombre", quantity: 8 }, { itemId: "venin_ether", quantity: 3 }, { itemId: "sable_ether", quantity: 5 }], result: { itemId: "bottes_umbra", quantity: 1 }, xpGain: 85 },
    ],
  },
  {
    id: "sculpteur",
    name: "Sculpteur",
    description: "Sculpte bâtons et armes magiques en bois.",
    type: "crafting",
    icon: "🪵",
    recipes: [
      { id: "recette_baton_ether_adv", name: "Bâton d'Éther Renforcé", levelRequired: 15, ingredients: [{ itemId: "bois_lumina", quantity: 6 }, { itemId: "essence_wisp", quantity: 2 }], result: { itemId: "baton_ether", quantity: 1 }, xpGain: 45 },
      { id: "recette_baguette_abysses", name: "Baguette des Abysses", levelRequired: 60, ingredients: [{ itemId: "bois_fossile", quantity: 5 }, { itemId: "larme_nereide", quantity: 3 }, { itemId: "encre_ombre", quantity: 4 }], result: { itemId: "baguette_abysses", quantity: 1 }, xpGain: 160 },
    ],
  },
  {
    id: "cuisine",
    name: "Cuisine",
    description: "Prépare nourriture et buffs de combat.",
    type: "crafting",
    icon: "🍳",
    recipes: [
      { id: "recette_pain", name: "Pain d'Éveil", levelRequired: 1, ingredients: [{ itemId: "ble_eveil", quantity: 3 }], result: { itemId: "pain_eveil", quantity: 3 }, xpGain: 8 },
      { id: "recette_ration", name: "Ration Stellaire", levelRequired: 20, ingredients: [{ itemId: "ble_eveil", quantity: 5 }, { itemId: "poisson_ether", quantity: 2 }, { itemId: "herbe_eveil", quantity: 3 }], result: { itemId: "ration_stellaire", quantity: 2 }, xpGain: 35 },
      { id: "recette_feast", name: "Festin des Champions", levelRequired: 70, ingredients: [{ itemId: "poisson_ether", quantity: 5 }, { itemId: "ble_eveil", quantity: 10 }, { itemId: "ether_condense", quantity: 2 }], result: { itemId: "festin_champions", quantity: 1 }, xpGain: 120 },
    ],
  },
  {
    id: "maroquinier",
    name: "Maroquinier",
    description: "Travaille cuirs et peaux en équipement.",
    type: "crafting",
    icon: "🧥",
    recipes: [
      { id: "recette_cuir", name: "Cuir d'Ombre", levelRequired: 8, ingredients: [{ itemId: "fourrure_cristal", quantity: 4 }], result: { itemId: "cuir_ombre", quantity: 3 }, xpGain: 18 },
      { id: "recette_couronne_brume", name: "Couronne de Brume", levelRequired: 18, ingredients: [{ itemId: "cuir_ombre", quantity: 4 }, { itemId: "aile_fee", quantity: 3 }, { itemId: "fleur_ether", quantity: 2 }], result: { itemId: "couronne_brume", quantity: 1 }, xpGain: 65 },
    ],
  },
  {
    id: "enchanteur",
    name: "Enchanteur",
    description: "Imprègne objets de pouvoirs stellaires.",
    type: "crafting",
    icon: "✨",
    recipes: [
      { id: "recette_amulette_solaire", name: "Amulette Solaire", levelRequired: 28, ingredients: [{ itemId: "fragment_eclipse", quantity: 2 }, { itemId: "cristal_pur", quantity: 2 }, { itemId: "poussiere_stellaire", quantity: 8 }], result: { itemId: "amulette_solaire", quantity: 1 }, xpGain: 80 },
      { id: "recette_relique_mirage", name: "Relique du Mirage", levelRequired: 32, ingredients: [{ itemId: "sable_ether", quantity: 10 }, { itemId: "parchemin_ancien", quantity: 1 }, { itemId: "cristal_pur", quantity: 3 }], result: { itemId: "relique_mirage", quantity: 1 }, xpGain: 95 },
    ],
  },
  {
    id: "forgeron_marin",
    name: "Forgeron Marin",
    description: "Forge armes et armures de corail.",
    type: "crafting",
    icon: "🔱",
    recipes: [
      { id: "recette_sabre", name: "Sabre du Corsaire", levelRequired: 20, ingredients: [{ itemId: "minerai_cuivre", quantity: 8 }, { itemId: "encre_ombre", quantity: 2 }], result: { itemId: "sabre_corsaire", quantity: 1 }, xpGain: 55 },
      { id: "recette_armure_corail_adv", name: "Armure de Corail", levelRequired: 52, ingredients: [{ itemId: "corail_vivant", quantity: 12 }, { itemId: "cristal_corail", quantity: 4 }, { itemId: "nacre_matriarche", quantity: 3 }], result: { itemId: "armure_corail", quantity: 1 }, xpGain: 140 },
    ],
  },
  {
    id: "orfevre",
    name: "Orfèvre",
    description: "Maître joaillier des pièces légendaires.",
    type: "crafting",
    icon: "👑",
    recipes: [
      { id: "recette_couronne_florale", name: "Couronne Florale", levelRequired: 15, ingredients: [{ itemId: "fleur_ether", quantity: 6 }, { itemId: "fleur_moonlight", quantity: 4 }, { itemId: "cristal_pur", quantity: 1 }], result: { itemId: "couronne_florale", quantity: 1 }, xpGain: 70 },
      { id: "recette_couronne_aether", name: "Couronne d'Aether", levelRequired: 60, ingredients: [{ itemId: "ecaille_dragon", quantity: 5 }, { itemId: "ether_condense", quantity: 8 }, { itemId: "noyau_stellaire", quantity: 3 }], result: { itemId: "couronne_aether", quantity: 1 }, xpGain: 250 },
    ],
  },
  {
    id: "runesmith",
    name: "Forgeur de Runes",
    description: "Condense fragments en runes de pouvoir.",
    type: "crafting",
    icon: "🔮",
    recipes: [
      { id: "recette_rune_faille", name: "Rune de Faille", levelRequired: 65, ingredients: [{ itemId: "fragment_faille", quantity: 2 }, { itemId: "lentille_void", quantity: 1 }], result: { itemId: "rune_faille", quantity: 1 }, xpGain: 130 },
      { id: "recette_coeur_nexus", name: "Cœur du Nexus (artisanat)", levelRequired: 58, ingredients: [{ itemId: "noyau_stellaire", quantity: 5 }, { itemId: "ether_condense", quantity: 5 }, { itemId: "coeur_nexus", quantity: 1 }], result: { itemId: "coeur_nexus", quantity: 1 }, xpGain: 180 },
    ],
  },
];
