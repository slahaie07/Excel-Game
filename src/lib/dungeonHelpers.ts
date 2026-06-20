import { getDungeonById, getRoomMonsters } from "../game/data";
import { loadCharacter, loadDungeonRun, saveDungeonRun } from "./characterStorage";

export function advanceDungeonRoom(characterId: string): { complete: boolean; rewards?: { xp: number; eclats: number } } {
  const run = loadDungeonRun(characterId);
  if (!run) return { complete: false };

  const dungeon = getDungeonById(run.dungeonId);
  if (!dungeon) return { complete: false };

  const nextRoom = run.currentRoom + 1;
  const isComplete = dungeon.rooms !== 999 && nextRoom >= dungeon.rooms;

  if (isComplete) {
    saveDungeonRun(characterId, null);
    const char = loadCharacter(characterId);
    if (char) {
      char.eclats += dungeon.rewards.eclats;
      char.xp += dungeon.rewards.xp;
      localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(char));
    }
    return { complete: true, rewards: dungeon.rewards };
  }

  saveDungeonRun(characterId, {
    ...run,
    currentRoom: nextRoom,
    monstersDefeated: run.monstersDefeated + 1,
    status: "active",
  });
  return { complete: false };
}

export function createNextRoomCombat(characterId: string): string | null {
  const run = loadDungeonRun(characterId);
  if (!run) return null;

  const dungeon = getDungeonById(run.dungeonId);
  if (!dungeon) return null;

  const monsters = getRoomMonsters(dungeon, run.currentRoom);
  const combatId = `dungeon_${Date.now()}`;
  localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
    type: "dungeon",
    dungeonId: run.dungeonId,
    roomIndex: run.currentRoom,
    monsterIds: monsters,
    zoneId: dungeon.zoneId,
    characterId,
  }));
  return combatId;
}
