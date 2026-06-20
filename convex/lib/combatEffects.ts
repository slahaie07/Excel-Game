import type { SpellEffect } from "./spells";

export interface CombatBuff {
  stat: string;
  value: number;
  duration: number;
}

export interface CombatEntityState {
  entityId: string;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  buffs: CombatBuff[];
  isAlive: boolean;
  team: "player" | "enemy";
}

function addBuff(entity: CombatEntityState, stat: string, value: number, duration: number): CombatEntityState {
  const buffs = [...entity.buffs, { stat, value, duration }];
  let maxMp = entity.maxMp;
  if (stat === "mp" && value > 0) maxMp += value;
  if (stat === "mp" && value < 0) maxMp = Math.max(1, maxMp + value);
  return { ...entity, buffs, maxMp };
}

function getDamageBonus(entity: CombatEntityState): number {
  const dmgBuff = entity.buffs.find((b) => b.stat === "damage");
  return dmgBuff ? Math.floor(dmgBuff.value / 10) : 0;
}

export function applySpellEffects(
  caster: CombatEntityState,
  target: CombatEntityState | undefined,
  effects: SpellEffect[]
): { caster: CombatEntityState; target?: CombatEntityState; damage?: number; heal?: number } {
  let updatedCaster = { ...caster, buffs: [...caster.buffs] };
  let updatedTarget = target ? { ...target, buffs: [...target.buffs] } : undefined;
  let damage: number | undefined;
  let heal: number | undefined;

  for (const effect of effects) {
    if (effect.type === "damage" && updatedTarget) {
      const dmg = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min + getDamageBonus(updatedCaster);
      damage = (damage ?? 0) + dmg;
      const newHp = Math.max(0, updatedTarget.hp - dmg);
      updatedTarget = { ...updatedTarget, hp: newHp, isAlive: newHp > 0 };
    } else if (effect.type === "heal") {
      const amount = Math.floor(Math.random() * (effect.max - effect.min + 1)) + effect.min;
      heal = (heal ?? 0) + amount;
      updatedCaster = { ...updatedCaster, hp: Math.min(updatedCaster.maxHp, updatedCaster.hp + amount) };
    } else if (effect.type === "buff") {
      const entity = effect.stat === "shield" || effect.stat === "regen" || effect.stat === "damage" || effect.stat === "invisibility"
        ? updatedCaster
        : updatedTarget ?? updatedCaster;
      const buffed = addBuff(entity, effect.stat, effect.value, effect.duration);
      if (entity === updatedCaster) updatedCaster = buffed;
      else if (updatedTarget) updatedTarget = buffed;
    } else if (effect.type === "debuff" && updatedTarget) {
      updatedTarget = addBuff(updatedTarget, effect.stat, effect.value, effect.duration);
    }
  }

  return { caster: updatedCaster, target: updatedTarget, damage, heal };
}

export function tickBuffs(entity: CombatEntityState): CombatEntityState {
  const remaining = entity.buffs
    .map((b) => ({ ...b, duration: b.duration - 1 }))
    .filter((b) => b.duration > 0);

  let maxMp = entity.maxMp;
  for (const expired of entity.buffs.filter((b) => b.duration <= 1)) {
    if (expired.stat === "mp") maxMp -= expired.value;
  }

  let hp = entity.hp;
  const regen = entity.buffs.find((b) => b.stat === "regen" && b.duration > 1);
  if (regen) hp = Math.min(entity.maxHp, hp + regen.value);

  return { ...entity, buffs: remaining, maxMp: Math.max(1, maxMp), hp };
}
