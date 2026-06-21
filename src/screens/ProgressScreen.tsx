import { useGameStore } from "../stores/gameStore";
import { loadCharacter } from "../lib/characterStorage";
import { loadLocalFactionBadge } from "../lib/factionProgress";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import { getEndgameProgress } from "../game/data/endgameGoals";
import { LOCAL_ACHIEVEMENTS } from "./AchievementsScreen";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function ProgressScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const guildId = useGameStore((s) => s.guildId);
  const setScreen = useGameStore((s) => s.setScreen);

  const char = loadCharacter(characterId);
  const localBadge = loadLocalFactionBadge(characterId);
  const cloudFactions = useQuery(
    api.factions.getMyFactions,
    isConvexEnabled() && isCloudCharacter(characterId)
      ? { characterId: characterId as Id<"characters"> }
      : "skip"
  );
  const cloudAchievements = useQuery(
    api.achievements.listAchievements,
    isConvexEnabled() && isCloudCharacter(characterId)
      ? { characterId: characterId as Id<"characters"> }
      : "skip"
  );

  const unlockedLocal: string[] = JSON.parse(
    localStorage.getItem(`aetheris-achievements-${characterId}`) ?? "[]"
  );
  const achievementsUnlocked = isCloudCharacter(characterId)
    ? (cloudAchievements?.filter((a) => a.unlocked).length ?? 0)
    : unlockedLocal.length;
  const achievementsTotal = isCloudCharacter(characterId)
    ? (cloudAchievements?.length ?? 0)
    : LOCAL_ACHIEVEMENTS.length;

  const progress = getEndgameProgress({
    level: char?.level ?? 1,
    zoneId,
    pvpWins: char?.pvpWins ?? 0,
    guildId: guildId ?? char?.guildId,
    achievementsUnlocked,
    achievementsTotal,
    pledgedFaction: !!(cloudFactions?.pledgedFactionId ?? localBadge.pledgedFactionId),
    completedQuests: char?.completedQuests ?? [],
  });

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button type="button" onClick={() => setScreen("settings")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-xl font-bold">Progression endgame</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="card p-4 text-center">
          <p className="text-4xl font-display font-bold text-crystal-cyan">{progress.percent}%</p>
          <p className="text-aether-400 text-sm mt-1">
            {progress.completedCount} / {progress.total} objectifs
          </p>
          <div className="mt-3 h-2 bg-aether-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crystal-cyan to-aether-400 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {progress.goals.map((goal) => (
            <div
              key={goal.id}
              className={`card flex items-center gap-3 py-3 px-4 ${
                goal.done ? "border-green-500/40" : "border-aether-700/40"
              }`}
            >
              <span className="text-2xl">{goal.icon}</span>
              <span className={`text-sm flex-1 ${goal.done ? "text-green-400 line-through" : "text-aether-200"}`}>
                {goal.label}
              </span>
              <span className="text-lg">{goal.done ? "✓" : "○"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
