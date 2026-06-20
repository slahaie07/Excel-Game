import { useGameStore } from "../stores/gameStore";

interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function AchievementsUI({ achievements, loading }: { achievements: Achievement[]; loading?: boolean }) {
  const setScreen = useGameStore((s) => s.setScreen);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Succès</h1>
        <span className="ml-auto text-aether-400 text-sm">{unlockedCount}/{achievements.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-aether-400 text-center text-sm">Chargement...</p>}
        {achievements.map((a) => (
          <div key={a.achievementId} className={`card flex items-center gap-3 ${a.unlocked ? "border-green-500/40" : "opacity-60"}`}>
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{a.name}</p>
              <p className="text-aether-500 text-xs">{a.description}</p>
            </div>
            {a.unlocked && <span className="text-green-400">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
