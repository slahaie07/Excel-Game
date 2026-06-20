import { useGameStore } from "../stores/gameStore";

export function DailyRewardsUI({
  canClaim,
  streak,
  reward,
  onClaim,
  loading,
}: {
  canClaim: boolean;
  streak: number;
  reward: number;
  onClaim: () => Promise<void>;
  loading?: boolean;
}) {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Récompense quotidienne</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {loading ? <p className="text-aether-400">Chargement...</p> : (
          <>
            <p className="text-6xl mb-4">🎁</p>
            <p className="text-aether-300 mb-2">Série : <span className="text-crystal-gold font-bold">{streak} jours</span></p>
            <p className="text-aether-400 text-sm mb-6">Récompense : ✦ {reward}</p>
            <button onClick={() => void onClaim()} disabled={!canClaim} className="btn-primary px-8 disabled:opacity-40">
              {canClaim ? "Réclamer" : "Déjà réclamé"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
