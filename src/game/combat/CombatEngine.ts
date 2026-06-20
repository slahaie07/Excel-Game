/** Moteur de combat tactique au tour par tour */

import type { CharacterStats } from "../../data/classes";
import { SPELLS, type Spell } from "../../data/spells";
import type { Monster } from "../../data/monsters";
import { MONSTERS } from "../../data/monsters";

export type CombatTeam = "player" | "enemy";
export type CombatPhase = "placement" | "combat" | "victory" | "defeat";

export interface GridPosition {
  x: number;
  y: number;
}

export interface CombatEntity {
  id: string;
  name: string;
  team: CombatTeam;
  stats: CharacterStats;
  position: GridPosition;
  spells: string[];
  icon: string;
  color: number;
  isAlive: boolean;
  effects: ActiveEffect[];
  monsterId?: string;
  classId?: string;
}

export interface ActiveEffect {
  type: string;
  duration: number;
  value: number;
  sourceId: string;
}

export interface CombatState {
  phase: CombatPhase;
  turn: number;
  currentEntityId: string | null;
  entities: CombatEntity[];
  gridWidth: number;
  gridHeight: number;
  obstacles: GridPosition[];
  selectedSpell: string | null;
  hoveredCell: GridPosition | null;
  log: CombatLogEntry[];
  turnOrder: string[];
}

export interface CombatLogEntry {
  turn: number;
  message: string;
  type: "damage" | "heal" | "effect" | "move" | "info";
}

export const COMBAT_GRID = { width: 14, height: 10 };

export function createCombatEntity(
  id: string,
  name: string,
  team: CombatTeam,
  stats: CharacterStats,
  position: GridPosition,
  spells: string[],
  icon: string,
  color: number,
  extra?: { monsterId?: string; classId?: string },
): CombatEntity {
  return {
    id,
    name,
    team,
    stats: { ...stats, hp: stats.maxHp },
    position,
    spells,
    icon,
    color,
    isAlive: true,
    effects: [],
    ...extra,
  };
}

export function entityFromMonster(
  monster: Monster,
  id: string,
  position: GridPosition,
): CombatEntity {
  return createCombatEntity(
    id,
    monster.name,
    "enemy",
    {
      hp: monster.hp,
      maxHp: monster.hp,
      pa: monster.pa,
      maxPa: monster.pa,
      pm: monster.pm,
      maxPm: monster.pm,
      force: monster.force,
      intelligence: monster.intelligence,
      agilite: monster.agilite,
      chance: 10,
      sagesse: 10,
      initiative: monster.initiative,
      dommages: monster.dommages,
      resistance: monster.resistance,
    },
    position,
    monster.spells,
    monster.icon,
    monster.color,
    { monsterId: monster.id },
  );
}

export function initCombatState(
  playerEntities: CombatEntity[],
  enemyEntities: CombatEntity[],
): CombatState {
  const entities = [...playerEntities, ...enemyEntities];
  const turnOrder = [...entities]
    .sort((a, b) => b.stats.initiative - a.stats.initiative)
    .map((e) => e.id);

  return {
    phase: "combat",
    turn: 1,
    currentEntityId: turnOrder[0] ?? null,
    entities,
    gridWidth: COMBAT_GRID.width,
    gridHeight: COMBAT_GRID.height,
    obstacles: generateObstacles(),
    selectedSpell: null,
    hoveredCell: null,
    log: [{ turn: 1, message: "Le combat commence !", type: "info" }],
    turnOrder,
  };
}

function generateObstacles(): GridPosition[] {
  const obs: GridPosition[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 3 + Math.floor(Math.random() * 8);
    const y = 2 + Math.floor(Math.random() * 6);
    if (!obs.some((o) => o.x === x && o.y === y)) {
      obs.push({ x, y });
    }
  }
  return obs;
}

export function getEntity(state: CombatState, id: string): CombatEntity | undefined {
  return state.entities.find((e) => e.id === id);
}

export function getCurrentEntity(state: CombatState): CombatEntity | undefined {
  if (!state.currentEntityId) return undefined;
  return getEntity(state, state.currentEntityId);
}

export function manhattanDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isCellOccupied(
  state: CombatState,
  pos: GridPosition,
  excludeId?: string,
): boolean {
  if (state.obstacles.some((o) => o.x === pos.x && o.y === pos.y)) return true;
  return state.entities.some(
    (e) => e.isAlive && e.id !== excludeId && e.position.x === pos.x && e.position.y === pos.y,
  );
}

export function getReachableCells(
  state: CombatState,
  entity: CombatEntity,
): GridPosition[] {
  const reachable: GridPosition[] = [];
  const visited = new Set<string>();
  const queue: { pos: GridPosition; dist: number }[] = [
    { pos: entity.position, dist: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const key = `${current.pos.x},${current.pos.y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (current.dist > 0 && current.dist <= entity.stats.pm) {
      reachable.push(current.pos);
    }

    if (current.dist >= entity.stats.pm) continue;

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    for (const d of dirs) {
      const next = { x: current.pos.x + d.x, y: current.pos.y + d.y };
      if (
        next.x >= 0 &&
        next.x < state.gridWidth &&
        next.y >= 0 &&
        next.y < state.gridHeight &&
        !isCellOccupied(state, next, entity.id)
      ) {
        queue.push({ pos: next, dist: current.dist + 1 });
      }
    }
  }
  return reachable;
}

export function getSpellTargets(
  state: CombatState,
  caster: CombatEntity,
  spell: Spell,
): GridPosition[] {
  const targets: GridPosition[] = [];
  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      const pos = { x, y };
      const dist = manhattanDistance(caster.position, pos);
      if (dist >= spell.minRange && dist <= spell.range) {
        targets.push(pos);
      }
    }
  }
  return targets;
}

export function calculateDamage(
  caster: CombatEntity,
  target: CombatEntity,
  spell: Spell,
): number {
  let base = spell.baseDamage;
  if (spell.damageType === "physical") {
    base += caster.stats.force * 0.5 + caster.stats.dommages;
  } else {
    base += caster.stats.intelligence * 0.5;
  }

  const buffForce = caster.effects.find((e) => e.type === "buff_force");
  if (buffForce) base += buffForce.value;

  const resistance = target.stats.resistance;
  const debuffRes = target.effects.find((e) => e.type === "debuff_resistance");
  const effectiveRes = resistance - (debuffRes?.value ?? 0);

  const damage = Math.max(1, Math.floor(base * (1 - effectiveRes / 100)));
  return damage;
}

export function moveEntity(
  state: CombatState,
  entityId: string,
  targetPos: GridPosition,
): CombatState {
  const entity = getEntity(state, entityId);
  if (!entity) return state;

  const dist = manhattanDistance(entity.position, targetPos);
  if (dist > entity.stats.pm) return state;

  const newEntities = state.entities.map((e) =>
    e.id === entityId
      ? {
          ...e,
          position: targetPos,
          stats: { ...e.stats, pm: e.stats.pm - dist },
        }
      : e,
  );

  return {
    ...state,
    entities: newEntities,
    log: [
      ...state.log,
      {
        turn: state.turn,
        message: `${entity.name} se déplace.`,
        type: "move",
      },
    ],
  };
}

export function castSpell(
  state: CombatState,
  casterId: string,
  spellId: string,
  targetPos: GridPosition,
): CombatState {
  const caster = getEntity(state, casterId);
  const spell = SPELLS[spellId];
  if (!caster || !spell || !caster.isAlive) return state;
  if (caster.stats.pa < spell.paCost) return state;

  const dist = manhattanDistance(caster.position, targetPos);
  if (dist < spell.minRange || dist > spell.range) return state;

  let newEntities = [...state.entities];
  const newLog = [...state.log];

  const affected = newEntities.filter((e) => {
    if (!e.isAlive) return false;
    const d = manhattanDistance(e.position, targetPos);
    if (spell.area === 0) {
      return e.position.x === targetPos.x && e.position.y === targetPos.y;
    }
    return d <= spell.area;
  });

  if (spell.target === "enemy") {
    const filtered = affected.filter((e) => e.team !== caster.team);
    for (const target of filtered) {
      if (spell.baseDamage > 0) {
        const dmg = calculateDamage(caster, target, spell);
        newEntities = applyDamage(newEntities, target.id, dmg);
        newLog.push({
          turn: state.turn,
          message: `${caster.name} inflige ${dmg} dégâts à ${target.name} avec ${spell.name}.`,
          type: "damage",
        });
      }
      for (const effect of spell.effects) {
        newEntities = applyEffect(newEntities, target.id, effect, caster.id);
      }
    }
  } else if (spell.target === "ally" || spell.target === "self") {
    const allies =
      spell.target === "self"
        ? [caster]
        : affected.filter((e) => e.team === caster.team);
    for (const ally of allies) {
      if (spell.healAmount > 0) {
        newEntities = applyHeal(newEntities, ally.id, spell.healAmount);
        newLog.push({
          turn: state.turn,
          message: `${caster.name} soigne ${ally.name} pour ${spell.healAmount} PV.`,
          type: "heal",
        });
      }
      for (const effect of spell.effects) {
        newEntities = applyEffect(newEntities, ally.id, effect, caster.id);
      }
    }
  } else if (spell.target === "area") {
    for (const target of affected) {
      if (target.team !== caster.team && spell.baseDamage > 0) {
        const dmg = calculateDamage(caster, target, spell);
        newEntities = applyDamage(newEntities, target.id, dmg);
        newLog.push({
          turn: state.turn,
          message: `${spell.name} inflige ${dmg} à ${target.name}.`,
          type: "damage",
        });
      }
      for (const effect of spell.effects) {
        newEntities = applyEffect(newEntities, target.id, effect, caster.id);
      }
    }
  }

  newEntities = newEntities.map((e) =>
    e.id === casterId
      ? { ...e, stats: { ...e.stats, pa: e.stats.pa - spell.paCost } }
      : e,
  );

  const phase = checkCombatEnd(newEntities);
  return { ...state, entities: newEntities, log: newLog, phase };
}

function applyDamage(
  entities: CombatEntity[],
  targetId: string,
  damage: number,
): CombatEntity[] {
  return entities.map((e) => {
    if (e.id !== targetId) return e;
    const shield = e.effects.find((ef) => ef.type === "shield");
    let remaining = damage;
    let newEffects = [...e.effects];
    if (shield) {
      const absorbed = Math.min(shield.value, remaining);
      remaining -= absorbed;
      newEffects = newEffects
        .map((ef) =>
          ef.type === "shield" ? { ...ef, value: ef.value - absorbed } : ef,
        )
        .filter((ef) => ef.value > 0);
    }
    const newHp = Math.max(0, e.stats.hp - remaining);
    return {
      ...e,
      stats: { ...e.stats, hp: newHp },
      isAlive: newHp > 0,
      effects: newEffects,
    };
  });
}

function applyHeal(
  entities: CombatEntity[],
  targetId: string,
  amount: number,
): CombatEntity[] {
  return entities.map((e) => {
    if (e.id !== targetId) return e;
    const newHp = Math.min(e.stats.maxHp, e.stats.hp + amount);
    return { ...e, stats: { ...e.stats, hp: newHp }, isAlive: true };
  });
}

function applyEffect(
  entities: CombatEntity[],
  targetId: string,
  effect: { type: string; duration: number; value: number },
  sourceId: string,
): CombatEntity[] {
  return entities.map((e) => {
    if (e.id !== targetId) return e;
    return {
      ...e,
      effects: [
        ...e.effects,
        { type: effect.type, duration: effect.duration, value: effect.value, sourceId },
      ],
    };
  });
}

function checkCombatEnd(entities: CombatEntity[]): CombatPhase {
  const playersAlive = entities.some((e) => e.team === "player" && e.isAlive);
  const enemiesAlive = entities.some((e) => e.team === "enemy" && e.isAlive);
  if (!playersAlive) return "defeat";
  if (!enemiesAlive) return "victory";
  return "combat";
}

export function endTurn(state: CombatState): CombatState {
  const currentIdx = state.turnOrder.indexOf(state.currentEntityId ?? "");
  let nextIdx = (currentIdx + 1) % state.turnOrder.length;
  let attempts = 0;

  let newEntities = state.entities.map((e) => {
    const newEffects = e.effects
      .map((ef) => ({ ...ef, duration: ef.duration - 1 }))
      .filter((ef) => ef.duration > 0);

    let poisonDmg = 0;
    for (const ef of e.effects) {
      if (ef.type === "poison" && ef.duration <= 1) {
        poisonDmg += ef.value;
      }
    }

    const hp = Math.max(0, e.stats.hp - poisonDmg);
    return {
      ...e,
      effects: newEffects,
      stats: {
        ...e.stats,
        hp,
        pa: e.stats.maxPa,
        pm: e.stats.maxPm,
      },
      isAlive: hp > 0,
    };
  });

  while (attempts < state.turnOrder.length) {
    const nextId = state.turnOrder[nextIdx];
    const next = newEntities.find((e) => e.id === nextId);
    if (next?.isAlive) {
      const newTurn = nextIdx <= currentIdx ? state.turn + 1 : state.turn;
      return {
        ...state,
        entities: newEntities,
        currentEntityId: nextId ?? null,
        turn: newTurn,
        selectedSpell: null,
        phase: checkCombatEnd(newEntities),
      };
    }
    nextIdx = (nextIdx + 1) % state.turnOrder.length;
    attempts++;
  }

  return { ...state, entities: newEntities, phase: checkCombatEnd(newEntities) };
}

export function getCombatRewards(state: CombatState): {
  xp: number;
  kamas: number;
  loot: string[];
} {
  let xp = 0;
  let kamas = 0;
  const loot: string[] = [];

  for (const e of state.entities) {
    if (e.team === "enemy" && e.monsterId) {
      const monster = MONSTERS[e.monsterId];
      if (monster) {
        xp += monster.xpReward;
        kamas += Math.floor(
          Math.random() * (monster.kamasReward[1] - monster.kamasReward[0]) +
            monster.kamasReward[0],
        );
        if (Math.random() < 0.4 && monster.lootTable.length > 0) {
          const item =
            monster.lootTable[Math.floor(Math.random() * monster.lootTable.length)];
          if (item) loot.push(item);
        }
      }
    }
  }
  return { xp, kamas, loot };
}
