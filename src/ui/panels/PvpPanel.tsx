import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useGameStore } from "../../store/gameStore";
import { CLASSES } from "../../data/classes";
import { canEnterArena, getTierForRating, PVP_TIERS } from "../../data/pvp";
import { defaultPvpStats } from "../../lib/pvpEngine";
import { api } from "../../../convex/_generated/api";
import { convexClient } from "../../lib/convex";

export function PvpPanel() {
  const player = useGameStore((s) => s.player);
  const pvpRun = useGameStore((s) => s.pvpRun);
  const setScreen = useGameStore((s) => s.setScreen);
  const startPvpMatch = useGameStore((s) => s.startPvpMatch);
  const startPvpCombat = useGameStore((s) => s.startPvpCombat);
  const abandonPvp = useGameStore((s) => s.abandonPvp);

  const online = convexClient !== null;
  const leaderboard = useQuery(
    api.pvp.getLeaderboard,
    online ? { limit: 10 } : "skip",
  );
  const submitRanking = useMutation(api.pvp.submitRanking);

  useEffect(() => {
    if (!online || !player?.pvpStats) return;
    const stats = player.pvpStats;
    void submitRanking({
      playerKey: player.id,
      playerName: player.name,
      classId: player.classId,
      rating: stats.rating,
      wins: stats.wins,
      losses: stats.losses,
    });
  }, [
    online,
    player?.id,
    player?.name,
    player?.classId,
    player?.pvpStats?.rating,
    player?.pvpStats?.wins,
    player?.pvpStats?.losses,
    submitRanking,
  ]);

  if (!player) return null;

  const stats = player.pvpStats ?? defaultPvpStats();
  const tier = getTierForRating(stats.rating);
  const arenaError = canEnterArena(player.level);
  const winRate =
    stats.totalMatches > 0
      ? Math.round((stats.wins / stats.totalMatches) * 100)
      : 0;

  if (pvpRun) {
    const opp = pvpRun.opponent;
    const oppClass = CLASSES[opp.classId];
    return (
      <div className="panel-overlay">
        <div className="panel panel-wide pvp-match-panel">
          <div className="panel-header">
            <h2>🏟️ Match trouvé</h2>
            <button className="btn-close" onClick={abandonPvp}>✕</button>
          </div>

          <div className="pvp-vs">
            <div className="pvp-fighter">
              <span className="pvp-fighter-icon">
                {CLASSES[player.classId].name[0]}
              </span>
              <strong>{player.name}</strong>
              <span className="pvp-fighter-tier">
                {tier.icon} {stats.rating} pts
              </span>
            </div>
            <span className="pvp-vs-label">VS</span>
            <div className="pvp-fighter">
              <span className="pvp-fighter-icon">{oppClass.name[0]}</span>
              <strong>{opp.name}</strong>
              <span className="pvp-fighter-tier">
                {opp.tier.icon} {opp.rating} pts — Niv. {opp.level}
              </span>
            </div>
          </div>

          <p className="pvp-match-hint">
            {oppClass.name} — {oppClass.description}
          </p>

          <div className="pvp-actions">
            <button className="btn-primary pvp-fight-btn" onClick={startPvpCombat}>
              ⚔️ Commencer le duel
            </button>
            <button className="btn-secondary" onClick={abandonPvp}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>🏟️ Arène Classée</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <div className="pvp-rank-card">
          <div className="pvp-rank-main">
            <span className="pvp-rank-icon">{tier.icon}</span>
            <div>
              <strong className="pvp-rank-tier">{tier.name}</strong>
              <span className="pvp-rank-rating">{stats.rating} points</span>
            </div>
          </div>
          <div className="pvp-rank-stats">
            <span>✅ {stats.wins}V</span>
            <span>❌ {stats.losses}D</span>
            <span>📊 {winRate}%</span>
            <span>🔥 Série : {stats.winStreak}</span>
            <span>🏆 Max : {stats.bestStreak}</span>
          </div>
        </div>

        <div className="pvp-tiers">
          <h3>Paliers</h3>
          <div className="pvp-tier-list">
            {PVP_TIERS.map((t) => (
              <div
                key={t.id}
                className={`pvp-tier-item ${t.id === tier.id ? "active" : ""}`}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
                <span className="pvp-tier-range">{t.minRating}+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pvp-rewards-hint">
          <p>Récompenses par victoire selon votre palier :</p>
          <span>💰 {tier.winKamas} kamas</span>
          <span>✨ {tier.winXp} XP</span>
          <span>📈 ±32 pts ELO max</span>
        </div>

        {arenaError ? (
          <p className="dungeon-locked">{arenaError}</p>
        ) : (
          <button className="btn-primary pvp-queue-btn" onClick={startPvpMatch}>
            🎯 Trouver un adversaire
          </button>
        )}

        {online && leaderboard && leaderboard.length > 0 && (
          <div className="pvp-leaderboard">
            <h3>🏆 Classement global</h3>
            {leaderboard.map((entry, i) => (
              <div key={entry._id} className="pvp-lb-row">
                <span className="pvp-lb-rank">#{i + 1}</span>
                <span className="pvp-lb-name">{entry.playerName}</span>
                <span className="pvp-lb-rating">{entry.rating}</span>
              </div>
            ))}
          </div>
        )}

        {online && (
          <p className="pvp-online-hint">
            Classement en ligne actif — vos résultats sont synchronisés.
          </p>
        )}
      </div>
    </div>
  );
}
