import type { DungeonDefinition } from "../game/data/dungeons";
import { getDungeonById } from "../game/data";

export interface DungeonRunView {
  dungeonId: string;
  currentRoom: number;
  totalRooms: number;
  status: string;
}

interface DungeonsUIProps {
  dungeons: DungeonDefinition[];
  charLevel: number;
  activeRun: DungeonRunView | null;
  onStart: (dungeonId: string) => void;
  onContinue: () => void;
  onAbandon: () => void;
  onBack: () => void;
  loading?: boolean;
  waitingRuns?: { id: string; dungeonId: string; members: number; leaderName: string }[];
  onJoinRun?: (runId: string) => void;
}

export function DungeonsUI({
  dungeons,
  charLevel,
  activeRun,
  onStart,
  onContinue,
  onAbandon,
  onBack,
  loading,
  waitingRuns,
  onJoinRun,
}: DungeonsUIProps) {
  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={onBack} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Donjons</h1>
        {loading && <span className="ml-auto text-aether-500 text-xs">Sync...</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRun && activeRun.status === "active" && (
          <div className="card border-orange-500/50 bg-orange-950/20">
            <p className="font-bold text-orange-300 mb-1">Donjon en cours</p>
            <p className="text-aether-300 text-sm">
              {getDungeonById(activeRun.dungeonId)?.name} — Salle {activeRun.currentRoom + 1}/{activeRun.totalRooms === 999 ? "∞" : activeRun.totalRooms}
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={onContinue} className="btn-primary flex-1 text-sm">Continuer</button>
              <button onClick={onAbandon} className="btn-secondary flex-1 text-sm">Abandonner</button>
            </div>
          </div>
        )}

        {waitingRuns && waitingRuns.length > 0 && (
          <div>
            <h2 className="text-aether-400 text-sm mb-2">Groupes en attente</h2>
            {waitingRuns.map((run) => (
              <div key={run.id} className="card mb-2 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{getDungeonById(run.dungeonId)?.name}</p>
                  <p className="text-aether-500 text-xs">{run.leaderName} • {run.members} joueur(s)</p>
                </div>
                {onJoinRun && (
                  <button onClick={() => onJoinRun(run.id)} className="btn-secondary text-xs py-1 px-3">
                    Rejoindre
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {dungeons.map((dungeon) => {
          const locked = charLevel < dungeon.levelRequired;
          return (
            <div key={dungeon.id} className={`card ${locked ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{dungeon.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{dungeon.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{dungeon.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">Niv. {dungeon.levelRequired}+</span>
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
                <button onClick={() => onStart(dungeon.id)} className="btn-primary w-full mt-3 text-sm">
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
