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
];

export function getSpellById(id: string): SpellDefinition | undefined {
  return SPELLS.find((s) => s.id === id);
}
