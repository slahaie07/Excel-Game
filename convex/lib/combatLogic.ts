import { getSpellById } from "./spells";
import { applySpellEffects, tickBuffs, type CombatEntityState } from "./combatEffects";

export type LiveCombatEntity = {
  entityId: string;
  name: string;
  isPlayer: boolean;
  classId?: string;
  playerKey?: string;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  x: number;
  y: number;
  team: "player" | "enemy";
  buffs: { stat: string; value: number; duration: number }[];
  isAlive: boolean;
};

export type PvpLiveAction =
  | { type: "move"; targetX: number; targetY: number }
  | { type: "cast"; spellId: string; targetX: number; targetY: number }
  | { type: "endTurn" };

export function generateEntityId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function calcMaxHp(level: number, vitality: number): number {
  return 50 + vitality * 5 + level * 10;
}

export function buildLivePlayerEntity(opts: {
  playerKey: string;
  name: string;
  classId: string;
  level: number;
  stats: { vitality: number; agility: number; strength: number };
  team: "player" | "enemy";
  x: number;
  y: number;
}): LiveCombatEntity {
  const maxHp = calcMaxHp(opts.level, opts.stats.vitality);
  const maxAp = 6;
  const maxMp = 3 + Math.floor(opts.stats.agility / 10);
  return {
    entityId: generateEntityId(),
    name: opts.name,
    isPlayer: true,
    classId: opts.classId,
    playerKey: opts.playerKey,
    hp: maxHp,
    maxHp,
    ap: maxAp,
    maxAp,
    mp: maxMp,
    maxMp,
    x: opts.x,
    y: opts.y,
    team: opts.team,
    buffs: [],
    isAlive: true,
  };
}

export function resolveLiveCombatStatus(
  entities: LiveCombatEntity[]
): "active" | "victory_a" | "victory_b" | null {
  const teamPlayer = entities.filter((e) => e.team === "player" && e.isAlive);
  const teamEnemy = entities.filter((e) => e.team === "enemy" && e.isAlive);
  if (teamEnemy.length === 0) return "victory_a";
  if (teamPlayer.length === 0) return "victory_b";
  return null;
}

function entityToState(entity: LiveCombatEntity): CombatEntityState {
  return {
    entityId: entity.entityId,
    hp: entity.hp,
    maxHp: entity.maxHp,
    ap: entity.ap,
    maxAp: entity.maxAp,
    mp: entity.mp,
    maxMp: entity.maxMp,
    buffs: entity.buffs,
    isAlive: entity.isAlive,
    team: entity.team,
  };
}

function stateToEntity(base: LiveCombatEntity, state: CombatEntityState): LiveCombatEntity {
  return {
    ...base,
    hp: state.hp,
    maxHp: state.maxHp,
    ap: state.ap,
    maxAp: state.maxAp,
    mp: state.mp,
    maxMp: state.maxMp,
    buffs: state.buffs,
    isAlive: state.isAlive,
  };
}

export function applyMove(
  entities: LiveCombatEntity[],
  entityId: string,
  targetX: number,
  targetY: number
): LiveCombatEntity[] {
  const entity = entities.find((e) => e.entityId === entityId);
  if (!entity || !entity.isAlive) throw new Error("Entité invalide");

  const distance = Math.abs(targetX - entity.x) + Math.abs(targetY - entity.y);
  if (distance > entity.mp) throw new Error("Pas assez de PM");
  if (distance === 0) throw new Error("Déplacement invalide");

  const occupied = entities.some((e) => e.isAlive && e.x === targetX && e.y === targetY);
  if (occupied) throw new Error("Case occupée");

  return entities.map((e) =>
    e.entityId === entityId
      ? { ...e, x: targetX, y: targetY, mp: e.mp - distance }
      : e
  );
}

export function applyCast(
  entities: LiveCombatEntity[],
  entityId: string,
  spellId: string,
  targetX: number,
  targetY: number
): { entities: LiveCombatEntity[]; damage?: number; heal?: number; log: string } {
  const spell = getSpellById(spellId);
  if (!spell) throw new Error("Sort inconnu");

  const casterIdx = entities.findIndex((e) => e.entityId === entityId);
  const caster = entities[casterIdx];
  if (!caster || !caster.isAlive) throw new Error("Lanceur invalide");
  if (caster.ap < spell.apCost) throw new Error("Pas assez de PA");

  const distance = Math.abs(targetX - caster.x) + Math.abs(targetY - caster.y);
  if (distance < spell.minRange || distance > spell.maxRange) {
    throw new Error("Hors de portée");
  }

  const targetIdx = entities.findIndex(
    (e) => e.x === targetX && e.y === targetY && e.isAlive
  );
  const target = targetIdx >= 0 ? entities[targetIdx] : undefined;

  const result = applySpellEffects(
    entityToState(caster),
    target ? entityToState(target) : undefined,
    spell.effects
  );

  const updated = entities.map((e, i) => {
    if (i === casterIdx) {
      return stateToEntity(e, { ...result.caster, ap: e.ap - spell.apCost });
    }
    if (targetIdx >= 0 && i === targetIdx && result.target) {
      return stateToEntity(e, result.target);
    }
    return e;
  });

  const parts: string[] = [spell.id];
  if (result.damage) parts.push(`${result.damage} dégâts`);
  if (result.heal) parts.push(`+${result.heal} PV`);

  return {
    entities: updated,
    damage: result.damage,
    heal: result.heal,
    log: parts.join(" : "),
  };
}

export function applyEndTurn(
  entities: LiveCombatEntity[],
  currentEntityId: string,
  currentTurn: number
): { entities: LiveCombatEntity[]; nextEntityId: string; turn: number } {
  let updated = entities.map((e) => {
    const ticked = tickBuffs(entityToState(e));
    const merged = stateToEntity(e, ticked);
    if (e.entityId === currentEntityId) {
      return { ...merged, ap: merged.maxAp, mp: merged.maxMp };
    }
    return merged;
  });

  const alive = updated.filter((e) => e.isAlive);
  const currentIndex = alive.findIndex((e) => e.entityId === currentEntityId);
  const nextIndex = (currentIndex + 1) % alive.length;
  const nextEntity = alive[nextIndex];
  if (!nextEntity) throw new Error("Aucune entité suivante");

  const newTurn = nextIndex === 0 ? currentTurn + 1 : currentTurn;
  updated = updated.map((e) =>
    e.entityId === nextEntity.entityId ? { ...e, ap: e.maxAp, mp: e.maxMp } : e
  );

  return {
    entities: updated,
    nextEntityId: nextEntity.entityId,
    turn: newTurn,
  };
}

export function getEntityForPlayerKey(
  entities: LiveCombatEntity[],
  playerKey: string
): LiveCombatEntity | undefined {
  return entities.find((e) => e.playerKey === playerKey);
}

export function applyLiveAction(
  match: {
    entities: LiveCombatEntity[];
    turn: number;
    currentPlayerKey: string;
  },
  playerKey: string,
  action: PvpLiveAction
): {
  entities: LiveCombatEntity[];
  turn: number;
  currentPlayerKey: string;
  currentEntityId: string;
  combatLog: string[];
  status: "active" | "victory_a" | "victory_b" | null;
} {
  const turnEntity = getEntityForPlayerKey(match.entities, match.currentPlayerKey);
  if (!turnEntity || turnEntity.playerKey !== playerKey) {
    throw new Error("Ce n'est pas votre tour");
  }

  let entities = match.entities;
  const combatLog: string[] = [];
  let turn = match.turn;
  let currentPlayerKey = match.currentPlayerKey;

  if (action.type === "move") {
    entities = applyMove(entities, turnEntity.entityId, action.targetX, action.targetY);
    combatLog.push(`${turnEntity.name} se déplace`);
  } else if (action.type === "cast") {
    const result = applyCast(
      entities,
      turnEntity.entityId,
      action.spellId,
      action.targetX,
      action.targetY
    );
    entities = result.entities;
    combatLog.push(`${turnEntity.name} : ${result.log}`);
  } else if (action.type === "endTurn") {
    const result = applyEndTurn(entities, turnEntity.entityId, match.turn);
    entities = result.entities;
    turn = result.turn;
    const nextEntity = entities.find((e) => e.entityId === result.nextEntityId);
    if (!nextEntity?.playerKey) throw new Error("Tour suivant invalide");
    currentPlayerKey = nextEntity.playerKey;
    combatLog.push(`${turnEntity.name} termine son tour`);
  } else {
    throw new Error("Action inconnue");
  }

  const status = resolveLiveCombatStatus(entities);
  return {
    entities,
    turn,
    currentPlayerKey,
    currentEntityId: getEntityForPlayerKey(entities, currentPlayerKey)?.entityId ?? turnEntity.entityId,
    combatLog,
    status,
  };
}
