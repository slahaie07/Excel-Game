import { useGameStore } from "../stores/gameStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { RAIDS, getRaidById, getPhaseMonsters } from "../game/data/raids";
import { loadCharacter } from "../lib/characterStorage";
import { cacheCloudCombat, buildCloudCombatLocalId } from "../lib/cloudCombat";
import { RaidsUI } from "./RaidsUI";

export default function CloudRaidsScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setRaid = useGameStore((s) => s.setRaid);

  const char = loadCharacter(characterId);
  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const waitingRaids = useQuery(api.raids.listActiveRaids, {});
  const startRun = useMutation(api.raids.startRaidRun);
  const joinRun = useMutation(api.raids.joinRaidRun);
  const launchRaid = useMutation(api.raids.launchRaid);
  const startRaidCombat = useMutation(api.combat.startRaidCombat);

  const convexRaidRunId = useGameStore((s) => s.convexRaidRunId);
  const raidRun = useQuery(
    api.raids.getRaidRun,
    convexRaidRunId ? { runId: convexRaidRunId as Id<"raidRuns"> } : "skip"
  );

  const level = cloudChar?.level ?? char?.level ?? 1;

  const startPhaseCombat = async (raidId: string, phaseIndex: number, runId: string) => {
    const raid = getRaidById(raidId);
    if (!raid) return;

    const monsters = getPhaseMonsters(raid, phaseIndex);
    const convexCombatId = await startRaidCombat({
      runId: runId as Id<"raidRuns">,
      monsterIds: monsters,
      zoneId: raid.zoneId,
      leaderId: characterId,
    });

    const localId = buildCloudCombatLocalId("raid");
    cacheCloudCombat(localId, convexCombatId, {
      type: "raid",
      raidId,
      phaseIndex,
      monsterIds: monsters,
      zoneId: raid.zoneId,
      characterId,
      convexRaidRunId: runId,
    });
    setCombat(localId, { convexCombatId });
  };

  const createRaid = async (raidId: string) => {
    const raid = getRaidById(raidId);
    if (!raid || level < raid.levelRequired) return;

    const runId = await startRun({
      raidId,
      leaderId: characterId,
      leaderName: characterName,
      classId,
      level,
      totalPhases: raid.phases,
    });
    setRaid(raidId, { convexRunId: runId });
  };

  const activeRun = raidRun
    ? {
        raidId: raidRun.raidId,
        currentPhase: raidRun.currentPhase,
        totalPhases: raidRun.totalPhases,
        status: raidRun.status,
        memberCount: raidRun.members.length,
        isLeader: raidRun.leaderId === characterId,
      }
    : null;

  return (
    <RaidsUI
      raids={RAIDS}
      charLevel={level}
      activeRun={activeRun}
      loading={cloudChar === undefined}
      waitingRuns={(waitingRaids ?? []).map((r: {
        _id: string; raidId: string; members: unknown[]; leaderId: string;
      }) => ({
        id: r._id,
        raidId: r.raidId,
        members: r.members.length,
        maxPlayers: 8,
        leaderName: (r.members[0] as { name: string })?.name ?? "???",
      }))}
      onCreate={(id) => void createRaid(id)}
      onJoin={async (runId) => {
        await joinRun({
          runId: runId as Id<"raidRuns">,
          characterId,
          name: characterName,
          classId,
          level,
        });
        const run = waitingRaids?.find((r: { _id: string }) => r._id === runId);
        if (run) setRaid(run.raidId, { convexRunId: runId });
      }}
      onLaunch={async () => {
        if (!convexRaidRunId || !raidRun) return;
        const raid = getRaidById(raidRun.raidId);
        if (!raid) return;
        await launchRaid({
          runId: convexRaidRunId as Id<"raidRuns">,
          leaderId: characterId,
          minPlayers: raid.minPlayers,
        });
        await startPhaseCombat(raidRun.raidId, 0, convexRaidRunId);
      }}
      onContinue={() => {
        if (activeRun && convexRaidRunId) {
          void startPhaseCombat(activeRun.raidId, activeRun.currentPhase, convexRaidRunId);
        }
      }}
      onAbandon={() => setRaid(null)}
      onBack={() => setScreen("world")}
    />
  );
}
