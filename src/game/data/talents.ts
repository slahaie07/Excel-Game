/**
 * Talents par archétype — 2 branches, déblocage aux niveaux 10 et 20
 */

import type { ClassArchetype } from "./classes";

export interface TalentDefinition {
  id: string;
  archetype: ClassArchetype;
  branch: "a" | "b";
  tier: 1 | 2;
  name: string;
  description: string;
  levelRequired: number;
  icon: string;
  /** Bonus passif appliqué en combat */
  effect: {
    stat: string;
    value: number;
  };
}

export const TALENTS: TalentDefinition[] = [
  // Soins
  { id: "serenite_sacree", archetype: "healer", branch: "a", tier: 1, name: "Sérénité Sacrée", description: "+12 % sur les soins.", levelRequired: 10, icon: "💚", effect: { stat: "heal_bonus", value: 12 } },
  { id: "murmure_renovateur", archetype: "healer", branch: "b", tier: 1, name: "Murmure Rénovateur", description: "+12 % sur la régénération.", levelRequired: 10, icon: "🌿", effect: { stat: "regen_bonus", value: 12 } },
  { id: "grace_lumineuse", archetype: "healer", branch: "a", tier: 2, name: "Grâce Lumineuse", description: "+8 % sur les boucliers.", levelRequired: 20, icon: "✨", effect: { stat: "shield_bonus", value: 8 } },
  { id: "vitalite_ether", archetype: "healer", branch: "b", tier: 2, name: "Vitalité d'Éther", description: "+5 % PV max.", levelRequired: 20, icon: "❤️", effect: { stat: "max_hp_bonus", value: 5 } },

  // Magie
  { id: "flux_arcanique", archetype: "magic", branch: "a", tier: 1, name: "Flux Arcanique", description: "+10 % dégâts magiques.", levelRequired: 10, icon: "🔮", effect: { stat: "magic_damage_bonus", value: 10 } },
  { id: "maitrise_elements", archetype: "magic", branch: "b", tier: 1, name: "Maîtrise des Éléments", description: "+1 tour sur les debuffs.", levelRequired: 10, icon: "🌀", effect: { stat: "debuff_duration", value: 1 } },
  { id: "surcharge_ether", archetype: "magic", branch: "a", tier: 2, name: "Surcharge d'Éther", description: "+8 % dégâts de zone.", levelRequired: 20, icon: "💥", effect: { stat: "aoe_damage_bonus", value: 8 } },
  { id: "barriere_mystique", archetype: "magic", branch: "b", tier: 2, name: "Barrière Mystique", description: "+10 % sur les boucliers magiques.", levelRequired: 20, icon: "🛡️", effect: { stat: "shield_bonus", value: 10 } },

  // Bouclier
  { id: "peau_roche", archetype: "shield", branch: "a", tier: 1, name: "Peau de Roche", description: "+8 % PV max.", levelRequired: 10, icon: "🪨", effect: { stat: "max_hp_bonus", value: 8 } },
  { id: "fortification", archetype: "shield", branch: "b", tier: 1, name: "Fortification", description: "+15 % sur les buffs de défense.", levelRequired: 10, icon: "🏰", effect: { stat: "defense_buff_bonus", value: 15 } },
  { id: "provocateur", archetype: "shield", branch: "a", tier: 2, name: "Provocateur", description: "+10 % dégâts au corps à corps.", levelRequired: 20, icon: "😤", effect: { stat: "melee_damage_bonus", value: 10 } },
  { id: "rempart_vivant", archetype: "shield", branch: "b", tier: 2, name: "Rempart Vivant", description: "+5 % défense passive.", levelRequired: 20, icon: "🧱", effect: { stat: "defense_passive", value: 5 } },

  // Gros dégâts
  { id: "fureur_controlee", archetype: "burst", branch: "a", tier: 1, name: "Fureur Contrôlée", description: "+10 % sur les buffs de dégâts.", levelRequired: 10, icon: "😡", effect: { stat: "damage_buff_bonus", value: 10 } },
  { id: "lame_brutale", archetype: "burst", branch: "b", tier: 1, name: "Lame Brutale", description: "+8 % dégâts directs.", levelRequired: 10, icon: "🗡️", effect: { stat: "direct_damage_bonus", value: 8 } },
  { id: "assaut_eclair", archetype: "burst", branch: "a", tier: 2, name: "Assaut Éclair", description: "+1 Élan.", levelRequired: 20, icon: "⚡", effect: { stat: "bonus_mp", value: 1 } },
  { id: "coup_fatal", archetype: "burst", branch: "b", tier: 2, name: "Coup Fatal", description: "+12 % dégâts au corps à corps.", levelRequired: 20, icon: "💢", effect: { stat: "melee_damage_bonus", value: 12 } },

  // À distance
  { id: "oeil_aigle", archetype: "ranged", branch: "a", tier: 1, name: "Œil d'Aigle", description: "+1 case de portée max.", levelRequired: 10, icon: "🎯", effect: { stat: "bonus_range", value: 1 } },
  { id: "tir_perforant", archetype: "ranged", branch: "b", tier: 1, name: "Tir Perforant", description: "+8 % dégâts à distance.", levelRequired: 10, icon: "🏹", effect: { stat: "ranged_damage_bonus", value: 8 } },
  { id: "precision_stellaire", archetype: "ranged", branch: "a", tier: 2, name: "Précision Stellaire", description: "+10 % dégâts à distance.", levelRequired: 20, icon: "⭐", effect: { stat: "ranged_damage_bonus", value: 10 } },
  { id: "esprit_guide", archetype: "ranged", branch: "b", tier: 2, name: "Esprit Guide", description: "+8 % dégâts d'invocation.", levelRequired: 20, icon: "👾", effect: { stat: "summon_damage_bonus", value: 8 } },
];

export function getTalentById(id: string): TalentDefinition | undefined {
  return TALENTS.find((t) => t.id === id);
}

export function getTalentsForArchetype(archetype: ClassArchetype): TalentDefinition[] {
  return TALENTS.filter((t) => t.archetype === archetype);
}

export function getAvailableTalents(
  archetype: ClassArchetype,
  level: number,
  owned: string[]
): TalentDefinition[] {
  return TALENTS.filter(
    (t) =>
      t.archetype === archetype &&
      t.levelRequired <= level &&
      !owned.includes(t.id) &&
      !owned.some((id) => {
        const ownedTalent = getTalentById(id);
        return ownedTalent?.tier === t.tier && ownedTalent.archetype === archetype;
      })
  );
}
