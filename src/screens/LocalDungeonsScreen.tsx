import { useGameStore } from "../stores/gameStore";
import { DUNGEONS, getDungeonById, getRoomMonsters } from "../game/data";
import { loadCharacter, loadDungeonRun, saveDungeonRun } from "../lib/characterStorage";
import { DungeonsUI } from "./DungeonsUI";

export default function LocalDungeonsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setDungeon = useGameStore((s) => s.setDungeon);

  const char = loadCharacter(characterId);
  const activeRun = loadDungeonRun(characterId);

  const zoneDungeons = DUNGEONS.filter((d) => d.zoneId === zoneId);
  const allDungeons = zoneDungeons.length > 0 ? zoneDungeons : DUNGEONS;

  const startRoomCombat = (dungeonId: string, roomIndex: number) => {
    const dungeon = getDungeonById(dungeonId);
    if (!dungeon) return;

    const monsters = getRoomMonsters(dungeon, roomIndex);
    const combatId = `dungeon_${Date.now()}`;
    localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
      type: "dungeon",
      dungeonId,
      roomIndex,
      monsterIds: monsters,
      zoneId: dungeon.zoneId,
      characterId,
    }));
    setCombat(combatId);
  };

  const startDungeon = (dungeonId: string) => {
    const dungeon = getDungeonById(dungeonId);
    if (!dungeon) return;
    if ((char?.level ?? 1) < dungeon.levelRequired) return;

    saveDungeonRun(characterId, {
      dungeonId,
      currentRoom: 0,
      totalRooms: dungeon.rooms === 999 ? 999 : dungeon.rooms,
      monstersDefeated: 0,
      startedAt: Date.now(),
      status: "active",
    });
    setDungeon(dungeonId);
    startRoomCombat(dungeonId, 0);
  };

  return (
    <DungeonsUI
      dungeons={allDungeons}
      charLevel={char?.level ?? 1}
      activeRun={activeRun}
      onStart={startDungeon}
      onContinue={() => activeRun && startRoomCombat(activeRun.dungeonId, activeRun.currentRoom)}
      onAbandon={() => { saveDungeonRun(characterId, null); setDungeon(null); }}
      onBack={() => setScreen("world")}
    />
  );
}
