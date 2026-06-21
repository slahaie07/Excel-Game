export type SpellEffect =
  | { type: "damage"; element: string; min: number; max: number }
  | { type: "heal"; min: number; max: number }
  | { type: "buff"; stat: string; value: number; duration: number }
  | { type: "debuff"; stat: string; value: number; duration: number };

export interface SpellDefinition {
  id: string;
  apCost: number;
  minRange: number;
  maxRange: number;
  effects: SpellEffect[];
}

const SPELLS: SpellDefinition[] = [
  // Alchimiste
  { id: "soin_rune", apCost: 3, minRange: 1, maxRange: 5, effects: [{ type: "heal", min: 15, max: 25 }] },
  { id: "potion_regen", apCost: 4, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "regen", value: 10, duration: 3 }] },
  { id: "barriere_alchimique", apCost: 5, minRange: 0, maxRange: 3, effects: [{ type: "buff", stat: "shield", value: 20, duration: 2 }] },
  // Luminaire
  { id: "lumiere_sacree", apCost: 3, minRange: 1, maxRange: 5, effects: [{ type: "heal", min: 15, max: 25 }] },
  { id: "benediction", apCost: 4, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "regen", value: 10, duration: 3 }] },
  { id: "aura_protectrice", apCost: 5, minRange: 0, maxRange: 3, effects: [{ type: "buff", stat: "shield", value: 20, duration: 2 }] },
  // Pyromancien
  { id: "flamme_cristalline", apCost: 3, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "fire", min: 9, max: 15 }] },
  { id: "explosion_ether", apCost: 5, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "fire", min: 11, max: 19 }] },
  { id: "bouclier_flamme", apCost: 4, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "shield", value: 25, duration: 3 }] },
  // Cryomancien
  { id: "eclat_glace", apCost: 3, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "ice", min: 9, max: 15 }] },
  { id: "blizzard_ether", apCost: 5, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "ice", min: 11, max: 19 }] },
  { id: "prison_glace", apCost: 4, minRange: 1, maxRange: 5, effects: [{ type: "debuff", stat: "mp", value: -2, duration: 2 }] },
  // Gardien
  { id: "mur_cristal", apCost: 4, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "defense", value: 45, duration: 2 }] },
  { id: "provocation", apCost: 2, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "taunt", value: 1, duration: 2 }] },
  { id: "fracas_tellurique", apCost: 5, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "earth", min: 14, max: 22 }] },
  // Bastion
  { id: "egide_fer", apCost: 4, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "defense", value: 45, duration: 2 }] },
  { id: "defi_bastion", apCost: 2, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "taunt", value: 1, duration: 2 }] },
  { id: "charge_bouclier", apCost: 5, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "earth", min: 14, max: 22 }] },
  // Berserker
  { id: "coup_tellurique", apCost: 4, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "earth", min: 12, max: 18 }] },
  { id: "rage_cristal", apCost: 3, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "damage", value: 25, duration: 3 }] },
  { id: "entaille_sismique", apCost: 5, minRange: 1, maxRange: 3, effects: [{ type: "damage", element: "earth", min: 11, max: 19 }] },
  // Éclaireur
  { id: "coup_brume", apCost: 3, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "shadow", min: 9, max: 15 }] },
  { id: "invisibilite", apCost: 4, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "invisibility", value: 1, duration: 2 }] },
  { id: "piege_ether", apCost: 3, minRange: 1, maxRange: 4, effects: [{ type: "damage", element: "ether", min: 15, max: 20 }] },
  // Archer
  { id: "fleche_lune", apCost: 3, minRange: 2, maxRange: 8, effects: [{ type: "damage", element: "light", min: 9, max: 15 }] },
  { id: "pluie_fleches", apCost: 5, minRange: 3, maxRange: 7, effects: [{ type: "damage", element: "light", min: 11, max: 19 }] },
  { id: "marque_cible", apCost: 2, minRange: 2, maxRange: 8, effects: [{ type: "debuff", stat: "defense", value: -20, duration: 3 }] },
  // Invocateur
  { id: "invocation_wisp", apCost: 4, minRange: 1, maxRange: 3, effects: [{ type: "buff", stat: "summon", value: 1, duration: 3 }] },
  { id: "lien_ether", apCost: 3, minRange: 1, maxRange: 5, effects: [{ type: "debuff", stat: "mp", value: -2, duration: 2 }] },
  { id: "tempete_esprits", apCost: 6, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "ether", min: 11, max: 19 }] },
  // v2.1
  { id: "elixir_force", apCost: 3, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "damage", value: 20, duration: 3 }] },
  { id: "nova_alchimique", apCost: 6, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "ether", min: 14, max: 22 }] },
  { id: "sort_bonus_lumina", apCost: 3, minRange: 1, maxRange: 5, effects: [{ type: "buff", stat: "damage", value: 15, duration: 3 }] },
  { id: "resurrection", apCost: 6, minRange: 1, maxRange: 4, effects: [{ type: "heal", min: 40, max: 60 }] },
  { id: "brasier", apCost: 4, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "fire", min: 12, max: 18 }] },
  { id: "inferno", apCost: 7, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "fire", min: 18, max: 28 }] },
  { id: "lance_glace", apCost: 4, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "ice", min: 12, max: 18 }] },
  { id: "zero_absolu", apCost: 7, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "ice", min: 16, max: 26 }] },
  { id: "retour_force", apCost: 3, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "defense", value: 30, duration: 2 }] },
  { id: "forteresse", apCost: 6, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "shield", value: 40, duration: 3 }] },
  { id: "riposte_fer", apCost: 3, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "defense", value: 30, duration: 2 }] },
  { id: "muraille", apCost: 6, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "shield", value: 40, duration: 3 }] },
  { id: "furie", apCost: 3, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "damage", value: 35, duration: 2 }] },
  { id: "seisme_furieux", apCost: 6, minRange: 1, maxRange: 2, effects: [{ type: "damage", element: "earth", min: 16, max: 24 }] },
  { id: "coup_fatal", apCost: 4, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "shadow", min: 14, max: 20 }] },
  { id: "tempete_brume", apCost: 6, minRange: 1, maxRange: 4, effects: [{ type: "damage", element: "shadow", min: 14, max: 22 }] },
  { id: "tir_percant", apCost: 4, minRange: 2, maxRange: 8, effects: [{ type: "damage", element: "light", min: 12, max: 18 }] },
  { id: "eclipse_lunaire", apCost: 7, minRange: 3, maxRange: 7, effects: [{ type: "damage", element: "light", min: 16, max: 26 }] },
  { id: "pacte_ether", apCost: 3, minRange: 0, maxRange: 3, effects: [{ type: "buff", stat: "damage", value: 20, duration: 3 }] },
  { id: "armee_esprits", apCost: 7, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "ether", min: 14, max: 24 }] },
  // Druide
  { id: "soin_nature", apCost: 3, minRange: 1, maxRange: 5, effects: [{ type: "heal", min: 15, max: 25 }] },
  { id: "epines_vivantes", apCost: 4, minRange: 1, maxRange: 4, effects: [{ type: "damage", element: "nature", min: 10, max: 16 }] },
  { id: "rugissement_sylvestre", apCost: 4, minRange: 0, maxRange: 3, effects: [{ type: "buff", stat: "regen", value: 12, duration: 3 }] },
  { id: "symbiose", apCost: 5, minRange: 0, maxRange: 3, effects: [{ type: "heal", min: 20, max: 30 }] },
  { id: "tempete_verte", apCost: 6, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "nature", min: 14, max: 22 }] },
  // Fulgurancien
  { id: "eclair_stellaire", apCost: 3, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "lightning", min: 9, max: 15 }] },
  { id: "chaine_foudre", apCost: 4, minRange: 1, maxRange: 5, effects: [{ type: "damage", element: "lightning", min: 11, max: 17 }] },
  { id: "paratonnerre", apCost: 4, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "shield", value: 22, duration: 3 }] },
  { id: "surcharge", apCost: 3, minRange: 0, maxRange: 0, effects: [{ type: "buff", stat: "damage", value: 25, duration: 3 }] },
  { id: "foudre_jugement", apCost: 7, minRange: 1, maxRange: 6, effects: [{ type: "damage", element: "lightning", min: 18, max: 28 }] },
  // Paladin
  { id: "frappe_sacree", apCost: 4, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "light", min: 12, max: 18 }] },
  { id: "armure_lumiere", apCost: 4, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "defense", value: 40, duration: 2 }] },
  { id: "jugement_divin", apCost: 2, minRange: 1, maxRange: 4, effects: [{ type: "buff", stat: "taunt", value: 1, duration: 2 }] },
  { id: "aura_benediction", apCost: 4, minRange: 0, maxRange: 2, effects: [{ type: "heal", min: 18, max: 28 }] },
  { id: "martyre_stellaire", apCost: 6, minRange: 1, maxRange: 2, effects: [{ type: "damage", element: "light", min: 16, max: 24 }] },
  // Faucheur
  { id: "lame_spectrale", apCost: 3, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "shadow", min: 9, max: 15 }] },
  { id: "drain_vie", apCost: 4, minRange: 1, maxRange: 3, effects: [{ type: "damage", element: "shadow", min: 10, max: 16 }] },
  { id: "marque_mort", apCost: 3, minRange: 1, maxRange: 4, effects: [{ type: "debuff", stat: "defense", value: -25, duration: 3 }] },
  { id: "danse_faucheuse", apCost: 5, minRange: 1, maxRange: 1, effects: [{ type: "damage", element: "shadow", min: 14, max: 20 }] },
  { id: "reaper_ultime", apCost: 7, minRange: 1, maxRange: 2, effects: [{ type: "damage", element: "shadow", min: 18, max: 28 }] },
  // Artilleur
  { id: "tir_canon", apCost: 4, minRange: 3, maxRange: 8, effects: [{ type: "damage", element: "ether", min: 10, max: 16 }] },
  { id: "obus_ether", apCost: 5, minRange: 3, maxRange: 7, effects: [{ type: "damage", element: "ether", min: 11, max: 19 }] },
  { id: "mitraille", apCost: 3, minRange: 2, maxRange: 6, effects: [{ type: "damage", element: "ether", min: 9, max: 15 }] },
  { id: "barricade", apCost: 4, minRange: 0, maxRange: 2, effects: [{ type: "buff", stat: "defense", value: 30, duration: 2 }] },
  { id: "barrage_stellaire", apCost: 7, minRange: 3, maxRange: 8, effects: [{ type: "damage", element: "ether", min: 16, max: 26 }] },
];

export function getSpellById(id: string): SpellDefinition | undefined {
  return SPELLS.find((s) => s.id === id);
}
