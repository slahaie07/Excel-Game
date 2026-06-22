import type { ClassId } from "../data/classes";
import { CLASSES } from "../data/classes";
import { DUNGEONS, type Dungeon, type DungeonId, type DungeonRoom } from "../data/dungeons";
import { MONSTERS, type Monster } from "../data/monsters";
import {
  createCombatEntity,
  entityFromMonster,
  initCombatState,
  type CombatState,
} from "../game/combat/CombatEngine";
import type { PlayerCharacter } from "../store/gameStore";

export interface DungeonRun {
  dungeonId: DungeonId;
  roomIndex: number;
  status: "active" | "completed" | "failed";
  startedAt: number;
}

export function canEnterDungeon(player: PlayerCharacter, dungeonId: DungeonId): string | null {
  const dungeon = DUNGEONS[dungeonId];
  if (!dungeon) return "Donjon introuvable.";
  if (player.level < dungeon.levelRequired) {
    return `Niveau ${dungeon.levelRequired} requis (vous êtes niveau ${player.level}).`;
  }
  if (player.zone !== dungeon.zone) {
    return `Vous devez être dans la zone ${dungeon.zone.replace(/_/g, " ")}.`;
  }
  return null;
}

function scaleMonster(monster: Monster, scale: number): Monster {
  return {
    ...monster,
    hp: Math.floor(monster.hp * scale),
    force: Math.floor(monster.force * scale),
    intelligence: Math.floor(monster.intelligence * scale),
    dommages: Math.floor(monster.dommages * scale),
    resistance: Math.floor(monster.resistance * scale),
    xpReward: Math.floor(monster.xpReward * scale),
  };
}

export function createDungeonCombat(
  player: PlayerCharacter,
  room: DungeonRoom,
): CombatState {
  const gameClass = CLASSES[player.classId as ClassId];

  const playerEntity = createCombatEntity(
    "player_0",
    player.name,
    "player",
    { ...player.stats },
    { x: 2, y: 5 },
    player.spells,
    gameClass.name[0] ?? "H",
    0x3498db,
    { classId: player.classId },
  );

  const enemies = [];
  let enemyIdx = 0;
  for (const spawn of room.monsters) {
    const base = MONSTERS[spawn.id];
    if (!base) continue;
    const scaled = scaleMonster(base, spawn.scale ?? 1);
    for (let i = 0; i < spawn.count; i++) {
      enemies.push(
        entityFromMonster(scaled, `enemy_${enemyIdx}`, {
          x: 9 + (enemyIdx % 3),
          y: 3 + Math.floor(enemyIdx / 3) * 2,
        }),
      );
      enemyIdx++;
    }
  }

  return initCombatState([playerEntity], enemies);
}

export function getCurrentRoom(run: DungeonRun): DungeonRoom | null {
  const dungeon = DUNGEONS[run.dungeonId];
  return dungeon.rooms[run.roomIndex] ?? null;
}

export function rollCompletionLoot(dungeon: Dungeon): string[] {
  const loot: string[] = [];
  for (const item of dungeon.completionRewards.items) {
    if (item.chance === undefined || Math.random() < item.chance) {
      for (let i = 0; i < item.quantity; i++) {
        loot.push(item.itemId);
      }
    }
  }
  return loot;
}

export function isLastRoom(run: DungeonRun): boolean {
  const dungeon = DUNGEONS[run.dungeonId];
  return run.roomIndex >= dungeon.rooms.length - 1;
}

export function getDungeon(dungeonId: DungeonId): Dungeon {
  return DUNGEONS[dungeonId];
}
