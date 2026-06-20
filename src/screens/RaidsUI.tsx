import type { RaidDefinition } from "../game/data/raids";
import { getRaidById } from "../game/data";

export interface RaidRunView {
  raidId: string;
  currentPhase: number;
  totalPhases: number;
  status: string;
  memberCount: number;
  isLeader: boolean;
}

interface RaidsUIProps {
  raids: RaidDefinition[];
  charLevel: number;
  activeRun: RaidRunView | null;
  onCreate: (raidId: string) => void;
  onJoin: (runId: string) => void;
  onLaunch: () => void;
  onContinue: () => void;
  onAbandon: () => void;
  onBack: () => void;
  loading?: boolean;
  waitingRuns?: {
    id: string;
    raidId: string;
    members: number;
    maxPlayers: number;
    leaderName: string;
  }[];
}

export function RaidsUI({
  raids,
  charLevel,
  activeRun,
  onCreate,
  onJoin,
  onLaunch,
  onContinue,
  onAbandon,
  onBack,
  loading,
  waitingRuns,
}: RaidsUIProps) {
  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={onBack} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Raids</h1>
        <span className="ml-auto text-purple-400/70 text-xs">8 joueurs max ☁️</span>
        {loading && <span className="text-aether-500 text-xs">Sync...</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRun && activeRun.status === "waiting" && (
          <div className="card border-purple-500/50 bg-purple-950/20">
            <p className="font-bold text-purple-300 mb-1">Raid en préparation</p>
            <p className="text-aether-300 text-sm">
              {getRaidById(activeRun.raidId)?.name} — {activeRun.memberCount} joueur(s)
            </p>
            {activeRun.isLeader && (
              <button onClick={onLaunch} className="btn-primary w-full mt-3 text-sm">
                Lancer le raid
              </button>
            )}
            {!activeRun.isLeader && (
              <p className="text-aether-500 text-xs mt-2">En attente du chef...</p>
            )}
          </div>
        )}

        {activeRun && activeRun.status === "active" && (
          <div className="card border-orange-500/50 bg-orange-950/20">
            <p className="font-bold text-orange-300 mb-1">Raid en cours</p>
            <p className="text-aether-300 text-sm">
              {getRaidById(activeRun.raidId)?.name} — Phase {activeRun.currentPhase + 1}/{activeRun.totalPhases}
            </p>
            <p className="text-aether-500 text-xs">{activeRun.memberCount} joueurs</p>
            <div className="flex gap-2 mt-3">
              <button onClick={onContinue} className="btn-primary flex-1 text-sm">Continuer</button>
              <button onClick={onAbandon} className="btn-secondary flex-1 text-sm">Quitter</button>
            </div>
          </div>
        )}

        {waitingRuns && waitingRuns.length > 0 && (
          <div>
            <h2 className="text-aether-400 text-sm mb-2">Raids ouverts</h2>
            {waitingRuns.map((run) => (
              <div key={run.id} className="card mb-2 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{getRaidById(run.raidId)?.name}</p>
                  <p className="text-aether-500 text-xs">
                    {run.leaderName} • {run.members}/{run.maxPlayers} joueurs
                  </p>
                </div>
                <button onClick={() => onJoin(run.id)} className="btn-secondary text-xs py-1 px-3">
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        )}

        {raids.map((raid) => {
          const locked = charLevel < raid.levelRequired;
          return (
            <div key={raid.id} className={`card ${locked ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{raid.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{raid.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{raid.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">Niv. {raid.levelRequired}+</span>
                    <span className="bg-aether-950 px-2 py-0.5 rounded text-aether-400">{raid.phases} phases</span>
                    <span className="bg-purple-950 px-2 py-0.5 rounded text-purple-300">
                      {raid.minPlayers}-{raid.maxPlayers} joueurs
                    </span>
                  </div>
                  <p className="text-crystal-gold text-xs mt-2">
                    Récompense : {raid.rewards.xp} XP • {raid.rewards.eclats} ✦
                  </p>
                </div>
              </div>
              {!locked && !activeRun && (
                <button onClick={() => onCreate(raid.id)} className="btn-primary w-full mt-3 text-sm">
                  Créer un raid
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
