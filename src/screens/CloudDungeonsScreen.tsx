import { useGameStore } from "../stores/gameStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { DUNGEONS, getDungeonById, getRoomMonsters } from "../game/data";
import { loadCharacter } from "../lib/characterStorage";
import { DungeonsUI } from "./DungeonsUI";

export default function CloudDungeonsScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setDungeon = useGameStore((s) => s.setDungeon);

  const char = loadCharacter(characterId);
  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const waitingRuns = useQuery(api.dungeons.listActiveRuns, {});
  const startRun = useMutation(api.dungeons.startDungeonRun);
  const joinRun = useMutation(api.dungeons.joinDungeonRun);

  const convexDungeonRunId = useGameStore((s) => s.convexDungeonRunId);
  const dungeonRun = useQuery(
    api.dungeons.getDungeonRun,
    convexDungeonRunId ? { runId: convexDungeonRunId as Id<"dungeonRuns"> } : "skip"
  );

  const zoneDungeons = DUNGEONS.filter((d) => d.zoneId === zoneId);
  const allDungeons = zoneDungeons.length > 0 ? zoneDungeons : DUNGEONS;
  const level = cloudChar?.level ?? char?.level ?? 1;

  const startRoomCombat = (dungeonId: string, roomIndex: number, runId?: string) => {
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
      convexRunId: runId,
    }));
    setCombat(combatId);
  };

  const startDungeon = async (dungeonId: string) => {
    const dungeon = getDungeonById(dungeonId);
    if (!dungeon || level < dungeon.levelRequired) return;

    const runId = await startRun({
      dungeonId,
      leaderId: characterId,
      leaderName: characterName,
      classId,
      level,
      totalRooms: dungeon.rooms === 999 ? 999 : dungeon.rooms,
    });
    setDungeon(dungeonId, { convexRunId: runId });
    startRoomCombat(dungeonId, 0, runId);
  };

  const activeRun = dungeonRun
    ? {
        dungeonId: dungeonRun.dungeonId,
        currentRoom: dungeonRun.currentRoom,
        totalRooms: dungeonRun.totalRooms,
        status: dungeonRun.status,
      }
    : null;

  return (
    <DungeonsUI
      dungeons={allDungeons}
      charLevel={level}
      activeRun={activeRun?.status === "active" ? activeRun : null}
      loading={cloudChar === undefined}
      waitingRuns={(waitingRuns ?? []).map((r: {
        _id: string; dungeonId: string; members: { name: string }[]; leaderId: string;
      }) => ({
        id: r._id,
        dungeonId: r.dungeonId,
        members: r.members.length,
        leaderName: r.members[0]?.name ?? "???",
      }))}
      onJoinRun={async (runId) => {
        await joinRun({
          runId: runId as Id<"dungeonRuns">,
          characterId,
          name: characterName,
          classId,
          level,
        });
        setDungeon(null, { convexRunId: runId });
      }}
      onStart={(id) => void startDungeon(id)}
      onContinue={() => {
        if (activeRun) startRoomCombat(activeRun.dungeonId, activeRun.currentRoom, convexDungeonRunId ?? undefined);
      }}
      onAbandon={() => setDungeon(null)}
      onBack={() => setScreen("world")}
    />
  );
}

export async function advanceCloudDungeonRoom(
  advanceRoom: (args: { runId: Id<"dungeonRuns"> }) => Promise<{ currentRoom: number; isComplete: boolean }>,
  runId: string
) {
  return await advanceRoom({ runId: runId as Id<"dungeonRuns"> });
}
