import { useGameStore } from "../stores/gameStore";
import { DUNGEONS, getDungeonById, getRoomMonsters } from "../game/data";
import {
  loadCharacter,
  loadDungeonRun,
  saveDungeonRun,
} from "../lib/characterStorage";

export default function DungeonsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setDungeon = useGameStore((s) => s.setDungeon);

  const char = loadCharacter(characterId);
  const activeRun = loadDungeonRun(characterId);

  const zoneDungeons = DUNGEONS.filter((d) => d.zoneId === zoneId);
  const allDungeons = zoneDungeons.length > 0 ? zoneDungeons : DUNGEONS;

  const startDungeon = (dungeonId: string) => {
    const dungeon = getDungeonById(dungeonId);
    if (!dungeon) return;
    if ((char?.level ?? 1) < dungeon.levelRequired) return;

    const run = {
      dungeonId,
      currentRoom: 0,
      totalRooms: dungeon.rooms === 999 ? 999 : dungeon.rooms,
      monstersDefeated: 0,
      startedAt: Date.now(),
      status: "active" as const,
    };
    saveDungeonRun(characterId, run);
    setDungeon(dungeonId);
    startRoomCombat(dungeonId, 0);
  };

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

  const continueRun = () => {
    if (!activeRun) return;
    startRoomCombat(activeRun.dungeonId, activeRun.currentRoom);
  };

  const abandonRun = () => {
    saveDungeonRun(characterId, null);
    setDungeon(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Donjons</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRun && activeRun.status === "active" && (
          <div className="card border-orange-500/50 bg-orange-950/20">
            <p className="font-bold text-orange-300 mb-1">Donjon en cours</p>
            <p className="text-aether-300 text-sm">
              {getDungeonById(activeRun.dungeonId)?.name} — Salle {activeRun.currentRoom + 1}/{activeRun.totalRooms === 999 ? "∞" : activeRun.totalRooms}
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={continueRun} className="btn-primary flex-1 text-sm">Continuer</button>
              <button onClick={abandonRun} className="btn-secondary flex-1 text-sm">Abandonner</button>
            </div>
          </div>
        )}

        {allDungeons.map((dungeon) => {
          const locked = (char?.level ?? 1) < dungeon.levelRequired;
          return (
            <div key={dungeon.id} className={`card ${locked ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{dungeon.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{dungeon.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{dungeon.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">
                      Niv. {dungeon.levelRequired}+
                    </span>
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">
                      {dungeon.rooms === 999 ? "∞" : dungeon.rooms} salles
                    </span>
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">
                      {dungeon.groupSize.min}-{dungeon.groupSize.max} joueurs
                    </span>
                  </div>
                  <p className="text-crystal-gold text-xs mt-2">
                    Récompense : {dungeon.rewards.xp} XP • {dungeon.rewards.eclats} ✦
                  </p>
                </div>
              </div>
              {!locked && !activeRun && (
                <button
                  onClick={() => startDungeon(dungeon.id)}
                  className="btn-primary w-full mt-3 text-sm"
                >
                  Entrer dans le donjon
                </button>
              )}
              {locked && (
                <p className="text-red-400 text-xs mt-2 text-center">Niveau {dungeon.levelRequired} requis</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Called from CombatScreen on dungeon victory
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
