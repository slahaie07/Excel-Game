import { CLASSES } from "../game/data";

export interface PvpLeaderboardEntry {
  name: string;
  rating: number;
  wins: number;
  classId: string;
}

interface PvPScreenUIProps {
  characterName: string;
  classId: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  mode: "1v1" | "2v2" | "3v3";
  onModeChange: (mode: "1v1" | "2v2" | "3v3") => void;
  searching: boolean;
  error: string;
  leaderboard: PvpLeaderboardEntry[];
  loading?: boolean;
  onMatchmake: () => void;
  onBack: () => void;
}

export function PvPScreenUI({
  characterName,
  classId,
  rating,
  wins,
  losses,
  streak,
  mode,
  onModeChange,
  searching,
  error,
  leaderboard,
  loading,
  onMatchmake,
  onBack,
}: PvPScreenUIProps) {
  const classData = CLASSES.find((c) => c.id === classId);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-red-950/20">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={onBack} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">⚔️ Arène PvP</h1>
        {loading && <span className="ml-auto text-aether-500 text-xs">Sync...</span>}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="card flex items-center gap-4">
          <span className="text-3xl">{classData?.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-white">{characterName}</p>
            <p className="text-aether-400 text-sm">Rating : {rating}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-green-400">{wins}V</p>
            <p className="text-red-400">{losses}D</p>
            {streak > 0 && <p className="text-crystal-gold">🔥 {streak}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-aether-400 text-sm mb-2">Mode de combat</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["1v1", "2v2", "3v3"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`card py-3 text-center ${mode === m ? "border-red-500 ring-2 ring-red-500/30" : ""}`}
              >
                <p className="font-bold text-white">{m}</p>
                <p className="text-aether-500 text-xs">
                  {m === "1v1" ? "Duel" : m === "2v2" ? "Équipe" : "Groupe"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={onMatchmake}
          disabled={searching || loading}
          className="btn-primary w-full bg-gradient-to-r from-red-700 to-red-500 disabled:opacity-60"
        >
          {searching ? "Recherche d'adversaire..." : `Lancer un ${mode}`}
        </button>

        <div>
          <h2 className="text-aether-400 text-sm mb-2">Classement</h2>
          {leaderboard.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">Aucun joueur classé</p>
          ) : (
            leaderboard
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 10)
              .map((entry, i) => {
                const cls = CLASSES.find((c) => c.id === entry.classId);
                return (
                  <div
                    key={`${entry.name}-${i}`}
                    className={`card mb-1 flex items-center gap-3 py-2 ${entry.name === characterName ? "border-aether-500" : ""}`}
                  >
                    <span className="text-aether-500 w-6 text-center font-bold">#{i + 1}</span>
                    <span className="text-lg">{cls?.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{entry.name}</p>
                      <p className="text-aether-500 text-xs">{entry.wins} victoires</p>
                    </div>
                    <span className="text-crystal-gold font-bold text-sm">{entry.rating}</span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
