import type { SpellEffect } from "../data/spells";

export interface CombatBuff {
  stat: string;
  value: number;
  duration: number;
}

export interface CombatEntityWithBuffs {
  entityId: string;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  buffs: CombatBuff[];
  isAlive: boolean;
}

export function applySpellEffects(
  caster: CombatEntityWithBuffs,
  target: CombatEntityWithBuffs | undefined,
  effects: SpellEffect[]
): { caster: CombatEntityWithBuffs; target?: CombatEntityWithBuffs; damage?: number; heal?: number; log: string[] } {
  let updatedCaster = { ...caster, buffs: [...caster.buffs] };
  let updatedTarget = target ? { ...target, buffs: [...target.buffs] } : undefined;
  const log: string[] = [];
  let damage: number | undefined;
  let heal: number | undefined;

  for (const effect of effects) {
    switch (effect.type) {
      case "damage": {
        if (!updatedTarget) break;
        const dmg = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
        const bonus = getDamageBonus(updatedCaster);
        const finalDmg = Math.max(1, dmg + bonus);
        damage = (damage ?? 0) + finalDmg;
        const newHp = Math.max(0, updatedTarget.hp - finalDmg);
        updatedTarget = { ...updatedTarget, hp: newHp, isAlive: newHp > 0 };
        log.push(`${finalDmg} dégâts (${effect.element})`);
        break;
      }
      case "heal": {
        const amount = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
        heal = (heal ?? 0) + amount;
        const newHp = Math.min(updatedCaster.maxHp, updatedCaster.hp + amount);
        updatedCaster = { ...updatedCaster, hp: newHp };
        log.push(`+${amount} PV`);
        break;
      }
      case "buff": {
        const entity = effect.stat === "shield" || effect.stat === "regen" ? updatedCaster : updatedTarget ?? updatedCaster;
        const buffed = addBuff(entity, effect.stat, effect.value, effect.duration);
        if (entity === updatedCaster) updatedCaster = buffed;
        else if (updatedTarget) updatedTarget = buffed;
        log.push(`Buff ${effect.stat} (${effect.duration} tours)`);
        break;
      }
      case "debuff": {
        if (!updatedTarget) break;
        updatedTarget = addBuff(updatedTarget, effect.stat, effect.value, effect.duration);
        log.push(`Debuff ${effect.stat} (${effect.duration} tours)`);
        break;
      }
      default:
        break;
    }
  }

  return { caster: updatedCaster, target: updatedTarget, damage, heal, log };
}

export function addBuff(entity: CombatEntityWithBuffs, stat: string, value: number, duration: number): CombatEntityWithBuffs {
  const buffs = [...entity.buffs, { stat, value, duration }];
  let { maxMp, maxAp } = entity;

  if (stat === "mp" && value > 0) maxMp += value;
  if (stat === "mp" && value < 0) maxMp = Math.max(1, maxMp + value);

  return { ...entity, buffs, maxMp, maxAp };
}

export function tickBuffs(entity: CombatEntityWithBuffs): CombatEntityWithBuffs {
  const remaining = entity.buffs
    .map((b) => ({ ...b, duration: b.duration - 1 }))
    .filter((b) => b.duration > 0);

  let { maxMp, maxAp } = entity;
  for (const expired of entity.buffs.filter((b) => b.duration <= 1)) {
    if (expired.stat === "mp") maxMp -= expired.value;
    if (expired.stat === "damage") maxAp -= 0;
  }

  let hp = entity.hp;
  const regen = entity.buffs.find((b) => b.stat === "regen" && b.duration > 1);
  if (regen) hp = Math.min(entity.maxHp, hp + regen.value);

  return {
    ...entity,
    buffs: remaining,
    maxMp: Math.max(1, maxMp),
    hp,
  };
}

export function getDamageBonus(entity: CombatEntityWithBuffs): number {
  const dmgBuff = entity.buffs.find((b) => b.stat === "damage");
  if (!dmgBuff) return 0;
  return Math.floor(dmgBuff.value / 10);
}

export function getDefenseReduction(entity: CombatEntityWithBuffs): number {
  const defDebuff = entity.buffs.find((b) => b.stat === "defense" && b.value < 0);
  const defBuff = entity.buffs.find((b) => b.stat === "defense" && b.value > 0);
  let mod = 0;
  if (defDebuff) mod -= Math.abs(defDebuff.value) / 10;
  if (defBuff) mod += defBuff.value / 10;
  return mod;
}

export function formatBuffs(buffs: CombatBuff[]): string {
  if (buffs.length === 0) return "";
  return buffs.map((b) => `${b.stat}${b.value > 0 ? "+" : ""}${b.value}(${b.duration})`).join(" ");
}
