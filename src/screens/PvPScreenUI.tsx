import { useState } from "react";
import { CLASSES, COSMETICS, getCosmeticById } from "../game/data";
import { formatCountdown } from "../lib/formatTime";

export interface PvpLeaderboardEntry {
  name: string;
  rating: number;
  wins: number;
  classId: string;
}

export interface SeasonInfo {
  name: string;
  seasonNumber: number;
  endsAt: number;
  daysLeft: number;
}

export interface SeasonRating {
  rating: number;
  wins: number;
  losses: number;
  rank: number;
}

export interface SeasonReward {
  _id: string;
  seasonName: string;
  rank: number;
  eclatsReward: number;
  cosmeticIds: string[];
  rewardLabel: string;
}

export interface EquippedCosmetics {
  equippedTitle: string | null;
  equippedFrame: string | null;
  titles: string[];
  frames: string[];
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
  queueStatus?: { playersWaiting: number; playersNeeded: number } | null;
  error: string;
  leaderboard: PvpLeaderboardEntry[];
  seasonLeaderboard?: PvpLeaderboardEntry[];
  season?: SeasonInfo | null;
  seasonRating?: SeasonRating | null;
  pendingRewards?: SeasonReward[];
  cosmetics?: EquippedCosmetics | null;
  claimMessage?: string;
  now?: number;
  loading?: boolean;
  onClaimReward?: (claimId: string) => void;
  onEquipCosmetic?: (cosmeticId: string | null, slot: "title" | "frame") => void;
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
  queueStatus,
  error,
  leaderboard,
  seasonLeaderboard,
  season,
  seasonRating,
  pendingRewards,
  cosmetics,
  claimMessage,
  now = Date.now(),
  loading,
  onClaimReward,
  onEquipCosmetic,
  onMatchmake,
  onBack,
}: PvPScreenUIProps) {
  const classData = CLASSES.find((c) => c.id === classId);
  const [boardTab, setBoardTab] = useState<"global" | "season">("season");
  const [showCosmetics, setShowCosmetics] = useState(false);
  const activeBoard = boardTab === "season" && season ? (seasonLeaderboard ?? []) : leaderboard;
  const equippedTitle = cosmetics?.equippedTitle ? getCosmeticById(cosmetics.equippedTitle) : null;
  const equippedFrame = cosmetics?.equippedFrame ? getCosmeticById(cosmetics.equippedFrame) : null;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-red-950/20">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={onBack} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">⚔️ Arène PvP</h1>
        {loading && <span className="ml-auto text-aether-500 text-xs">Sync...</span>}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {(pendingRewards ?? []).length > 0 && (
          <div className="card border-crystal-gold/40 bg-crystal-gold/5 space-y-2">
            <p className="text-crystal-gold text-xs font-bold uppercase">Récompenses de saison</p>
            {pendingRewards!.map((reward) => (
              <div key={reward._id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{reward.seasonName}</p>
                  <p className="text-aether-400 text-xs">
                    {reward.rewardLabel} • #{reward.rank} • ✦ {reward.eclatsReward}
                    {reward.cosmeticIds.length > 0 && ` • ${reward.cosmeticIds.length} cosmétique(s)`}
                  </p>
                </div>
                <button
                  onClick={() => onClaimReward?.(reward._id)}
                  className="btn-primary text-xs py-1 px-3"
                >
                  Réclamer
                </button>
              </div>
            ))}
            {claimMessage && <p className="text-green-400 text-xs">{claimMessage}</p>}
          </div>
        )}

        {season && (
          <div className="card bg-gradient-to-r from-crystal-gold/10 to-red-900/20 border-crystal-gold/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-crystal-gold text-xs font-bold uppercase tracking-wide">Saison ranked</p>
                <p className="font-display font-bold text-white">{season.name}</p>
                <p className="text-aether-400 text-xs mt-1">
                  {season.daysLeft} jour{season.daysLeft > 1 ? "s" : ""} restant{season.daysLeft > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 text-xs">⏱ {formatCountdown(season.endsAt, now)}</p>
                {seasonRating ? (
                  <p className="text-crystal-gold font-bold text-sm mt-1">#{seasonRating.rank} • {seasonRating.rating}</p>
                ) : (
                  <p className="text-aether-500 text-xs mt-1">Pas encore classé</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`card flex items-center gap-4 ${equippedFrame ? "ring-2 ring-crystal-gold/40" : ""}`}>
          <span className="text-3xl">{classData?.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-white">
              {equippedTitle ? `${equippedTitle.icon} ` : ""}{characterName}
            </p>
            {equippedTitle && (
              <p className="text-crystal-gold text-xs">{equippedTitle.name}</p>
            )}
            <p className="text-aether-400 text-sm">Rating global : {rating}</p>
            {seasonRating && (
              <p className="text-crystal-gold text-xs">Saison : {seasonRating.rating} ({seasonRating.wins}V / {seasonRating.losses}D)</p>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="text-green-400">{wins}V</p>
            <p className="text-red-400">{losses}D</p>
            {streak > 0 && <p className="text-crystal-gold">🔥 {streak}</p>}
          </div>
        </div>

        {cosmetics && (cosmetics.titles.length > 0 || cosmetics.frames.length > 0) && (
          <div>
            <button
              onClick={() => setShowCosmetics(!showCosmetics)}
              className="text-aether-400 text-sm mb-2"
            >
              {showCosmetics ? "▼" : "▶"} Cosmétiques saison ({cosmetics.titles.length + cosmetics.frames.length})
            </button>
            {showCosmetics && (
              <div className="space-y-2">
                {COSMETICS.filter((c) =>
                  c.type === "title" ? cosmetics.titles.includes(c.id) : cosmetics.frames.includes(c.id)
                ).map((c) => {
                  const isEquipped =
                    (c.type === "title" && cosmetics.equippedTitle === c.id) ||
                    (c.type === "frame" && cosmetics.equippedFrame === c.id);
                  return (
                    <div key={c.id} className="card flex items-center gap-3 py-2">
                      <span>{c.icon}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{c.name}</p>
                        <p className="text-aether-500 text-xs">{c.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          onEquipCosmetic?.(isEquipped ? null : c.id, c.type)
                        }
                        className={`text-xs py-1 px-2 rounded ${isEquipped ? "bg-crystal-gold text-black" : "btn-secondary"}`}
                      >
                        {isEquipped ? "Équipé" : "Équiper"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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

        {searching && queueStatus && (
          <p className="text-aether-400 text-xs text-center">
            Joueurs en file : {queueStatus.playersWaiting}/{queueStatus.playersNeeded}
          </p>
        )}

        <button
          onClick={onMatchmake}
          disabled={searching || loading}
          className="btn-primary w-full bg-gradient-to-r from-red-700 to-red-500 disabled:opacity-60"
        >
          {searching
            ? queueStatus
              ? `Recherche ${mode} (${queueStatus.playersWaiting}/${queueStatus.playersNeeded})...`
              : "Recherche d'adversaire..."
            : `Lancer un ${mode}`}
        </button>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-aether-400 text-sm">Classement</h2>
            {season && (
              <div className="flex gap-1">
                {(["season", "global"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBoardTab(tab)}
                    className={`text-xs px-2 py-1 rounded ${boardTab === tab ? "bg-aether-700 text-white" : "text-aether-500"}`}
                  >
                    {tab === "season" ? "Saison" : "Global"}
                  </button>
                ))}
              </div>
            )}
          </div>
          {activeBoard.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">Aucun joueur classé</p>
          ) : (
            activeBoard
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
