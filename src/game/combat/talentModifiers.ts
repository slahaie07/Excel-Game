/**
 * Agrège les bonus passifs des talents pour le combat
 */

const TALENT_EFFECTS: Record<string, { stat: string; value: number }> = {
  serenite_sacree: { stat: "heal_bonus", value: 12 },
  murmure_renovateur: { stat: "regen_bonus", value: 12 },
  grace_lumineuse: { stat: "shield_bonus", value: 8 },
  vitalite_ether: { stat: "max_hp_bonus", value: 5 },
  flux_arcanique: { stat: "magic_damage_bonus", value: 10 },
  maitrise_elements: { stat: "debuff_duration", value: 1 },
  surcharge_ether: { stat: "aoe_damage_bonus", value: 8 },
  barriere_mystique: { stat: "shield_bonus", value: 10 },
  peau_roche: { stat: "max_hp_bonus", value: 8 },
  fortification: { stat: "defense_buff_bonus", value: 15 },
  provocateur: { stat: "melee_damage_bonus", value: 10 },
  rempart_vivant: { stat: "defense_passive", value: 5 },
  fureur_controlee: { stat: "damage_buff_bonus", value: 10 },
  lame_brutale: { stat: "direct_damage_bonus", value: 8 },
  assaut_eclair: { stat: "bonus_mp", value: 1 },
  coup_fatal: { stat: "melee_damage_bonus", value: 12 },
  oeil_aigle: { stat: "bonus_range", value: 1 },
  tir_perforant: { stat: "ranged_damage_bonus", value: 8 },
  precision_stellaire: { stat: "ranged_damage_bonus", value: 10 },
  esprit_guide: { stat: "summon_damage_bonus", value: 8 },
};

export interface TalentModifiers {
  healBonusPct: number;
  regenBonusPct: number;
  shieldBonusPct: number;
  maxHpBonusPct: number;
  magicDamageBonusPct: number;
  debuffDurationBonus: number;
  aoeDamageBonusPct: number;
  defenseBuffBonusPct: number;
  defensePassivePct: number;
  meleeDamageBonusPct: number;
  damageBuffBonusPct: number;
  directDamageBonusPct: number;
  bonusMp: number;
  bonusRange: number;
  rangedDamageBonusPct: number;
}

export const EMPTY_TALENT_MODIFIERS: TalentModifiers = {
  healBonusPct: 0,
  regenBonusPct: 0,
  shieldBonusPct: 0,
  maxHpBonusPct: 0,
  magicDamageBonusPct: 0,
  debuffDurationBonus: 0,
  aoeDamageBonusPct: 0,
  defenseBuffBonusPct: 0,
  defensePassivePct: 0,
  meleeDamageBonusPct: 0,
  damageBuffBonusPct: 0,
  directDamageBonusPct: 0,
  bonusMp: 0,
  bonusRange: 0,
  rangedDamageBonusPct: 0,
};

const MAGIC_ELEMENTS = new Set(["fire", "ice", "ether"]);

export function computeTalentModifiers(talentIds: string[]): TalentModifiers {
  const mods = { ...EMPTY_TALENT_MODIFIERS };
  for (const id of talentIds) {
    const effect = TALENT_EFFECTS[id];
    if (!effect) continue;
    switch (effect.stat) {
      case "heal_bonus": mods.healBonusPct += effect.value; break;
      case "regen_bonus": mods.regenBonusPct += effect.value; break;
      case "shield_bonus": mods.shieldBonusPct += effect.value; break;
      case "max_hp_bonus": mods.maxHpBonusPct += effect.value; break;
      case "magic_damage_bonus": mods.magicDamageBonusPct += effect.value; break;
      case "debuff_duration": mods.debuffDurationBonus += effect.value; break;
      case "aoe_damage_bonus": mods.aoeDamageBonusPct += effect.value; break;
      case "defense_buff_bonus": mods.defenseBuffBonusPct += effect.value; break;
      case "defense_passive": mods.defensePassivePct += effect.value; break;
      case "melee_damage_bonus": mods.meleeDamageBonusPct += effect.value; break;
      case "damage_buff_bonus": mods.damageBuffBonusPct += effect.value; break;
      case "direct_damage_bonus": mods.directDamageBonusPct += effect.value; break;
      case "bonus_mp": mods.bonusMp += effect.value; break;
      case "bonus_range": mods.bonusRange += effect.value; break;
      case "ranged_damage_bonus": mods.rangedDamageBonusPct += effect.value; break;
      default: break;
    }
  }
  return mods;
}

export interface SpellCombatMeta {
  element?: string;
  minRange: number;
  maxRange: number;
  area: number;
}

export function applyCombatStartTalents(
  hp: number,
  maxHp: number,
  maxMp: number,
  talentIds: string[]
): { hp: number; maxHp: number; maxMp: number } {
  const mods = computeTalentModifiers(talentIds);
  const hpScale = 1 + mods.maxHpBonusPct / 100;
  const scaledMaxHp = Math.floor(maxHp * hpScale);
  const scaledHp = Math.min(scaledMaxHp, Math.floor(hp * hpScale));
  return {
    hp: scaledHp,
    maxHp: scaledMaxHp,
    maxMp: maxMp + mods.bonusMp,
  };
}

function pctBonus(base: number, percent: number): number {
  if (percent <= 0) return base;
  return Math.max(1, Math.floor(base * (1 + percent / 100)));
}

function sumDamageBonuses(
  base: number,
  casterMods: TalentModifiers,
  meta: SpellCombatMeta
): number {
  let bonusPct = casterMods.directDamageBonusPct;
  const isMelee = meta.maxRange <= 1;
  const isRanged = meta.minRange >= 2;

  if (isMelee) bonusPct += casterMods.meleeDamageBonusPct;
  if (isRanged) bonusPct += casterMods.rangedDamageBonusPct;
  if (meta.element && MAGIC_ELEMENTS.has(meta.element)) {
    bonusPct += casterMods.magicDamageBonusPct;
  }
  if (meta.area > 0) bonusPct += casterMods.aoeDamageBonusPct;

  return pctBonus(base, bonusPct);
}

function applyDefensePassive(damage: number, targetMods: TalentModifiers): number {
  if (targetMods.defensePassivePct <= 0) return damage;
  return Math.max(1, Math.floor(damage * (1 - targetMods.defensePassivePct / 100)));
}

export function scaleHealAmount(amount: number, casterMods: TalentModifiers): number {
  return pctBonus(amount, casterMods.healBonusPct);
}

export function scaleBuffValue(
  stat: string,
  value: number,
  casterMods: TalentModifiers
): number {
  if (stat === "regen") return pctBonus(value, casterMods.regenBonusPct);
  if (stat === "shield") return pctBonus(value, casterMods.shieldBonusPct);
  if (stat === "defense" && value > 0) return pctBonus(value, casterMods.defenseBuffBonusPct);
  if (stat === "damage" && value > 0) return pctBonus(value, casterMods.damageBuffBonusPct);
  return value;
}

export function scaleDebuffDuration(duration: number, casterMods: TalentModifiers): number {
  return duration + casterMods.debuffDurationBonus;
}

export function computeSpellDamage(
  baseDamage: number,
  casterMods: TalentModifiers,
  targetMods: TalentModifiers,
  meta: SpellCombatMeta
): number {
  const withTalents = sumDamageBonuses(baseDamage, casterMods, meta);
  return applyDefensePassive(withTalents, targetMods);
}

export function getEffectiveMaxRange(maxRange: number, casterMods: TalentModifiers): number {
  return maxRange + casterMods.bonusRange;
}
