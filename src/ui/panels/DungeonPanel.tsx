import { useGameStore } from "../../store/gameStore";
import { DUNGEONS, type DungeonId } from "../../data/dungeons";
import { MONSTERS } from "../../data/monsters";
import {
  canEnterDungeon,
  getCurrentRoom,
  getDungeon,
} from "../../lib/dungeonEngine";

export function DungeonPanel() {
  const player = useGameStore((s) => s.player);
  const dungeonRun = useGameStore((s) => s.dungeonRun);
  const setScreen = useGameStore((s) => s.setScreen);
  const startDungeon = useGameStore((s) => s.startDungeon);
  const startDungeonCombat = useGameStore((s) => s.startDungeonCombat);
  const abandonDungeon = useGameStore((s) => s.abandonDungeon);

  if (!player) return null;

  const zoneDungeons = Object.values(DUNGEONS).filter((d) => d.zone === player.zone);

  if (!dungeonRun) {
    return (
      <div className="panel-overlay">
        <div className="panel panel-wide">
          <div className="panel-header">
            <h2>🏰 Donjons</h2>
            <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
          </div>

          <p className="dungeon-zone-hint">
            Donjons disponibles dans votre zone actuelle.
          </p>

          {zoneDungeons.length === 0 ? (
            <p className="char-select-empty">Aucun donjon dans cette zone.</p>
          ) : (
            <div className="dungeon-list">
              {zoneDungeons.map((dungeon) => {
                const error = canEnterDungeon(player, dungeon.id);
                return (
                  <div key={dungeon.id} className="dungeon-card">
                    <div className="dungeon-card-header">
                      <span className="dungeon-icon">{dungeon.icon}</span>
                      <div>
                        <strong>{dungeon.name}</strong>
                        <span className="dungeon-level">Niv. {dungeon.levelRequired}+</span>
                      </div>
                    </div>
                    <p className="dungeon-desc">{dungeon.description}</p>
                    <p className="dungeon-rooms">
                      {dungeon.rooms.length} salles — Boss final
                    </p>
                    <div className="dungeon-rewards-preview">
                      <span>✨ {dungeon.completionRewards.xp} XP</span>
                      <span>💰 {dungeon.completionRewards.kamas}</span>
                    </div>
                    {error ? (
                      <p className="dungeon-locked">{error}</p>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => startDungeon(dungeon.id as DungeonId)}
                      >
                        Entrer dans le donjon
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const dungeon = getDungeon(dungeonRun.dungeonId);
  const room = getCurrentRoom(dungeonRun);
  if (!room) return null;

  const progress = `${dungeonRun.roomIndex + 1} / ${dungeon.rooms.length}`;

  return (
    <div className="panel-overlay dungeon-run-overlay">
      <div className="panel panel-wide dungeon-run-panel">
        <div className="panel-header">
          <h2>
            {dungeon.icon} {dungeon.name}
          </h2>
          <button className="btn-close" onClick={abandonDungeon}>✕</button>
        </div>

        <div className="dungeon-progress-bar">
          <div
            className="dungeon-progress-fill"
            style={{ width: `${((dungeonRun.roomIndex + 1) / dungeon.rooms.length) * 100}%` }}
          />
        </div>
        <p className="dungeon-progress-text">Salle {progress}</p>

        <div className={`dungeon-room-card ${room.isBoss ? "boss-room" : ""}`}>
          <h3>
            {room.isBoss ? "👑 " : "🚪 "}
            {room.name}
          </h3>
          <p>{room.description}</p>
          <p className="dungeon-enemies">
            Ennemis :{" "}
            {room.monsters
              .map((m) => `${m.count}x ${MONSTERS[m.id]?.name ?? m.id}`)
              .join(", ")}
          </p>
        </div>

        <div className="dungeon-actions">
          <button className="btn-primary dungeon-fight-btn" onClick={startDungeonCombat}>
            ⚔️ Engager le combat
          </button>
          <button className="btn-secondary" onClick={abandonDungeon}>
            Abandonner le donjon
          </button>
        </div>

        <p className="dungeon-hp-hint">
          ❤️ {player.stats.hp}/{player.stats.maxHp} — Les PV ne se régénèrent pas entre les salles.
        </p>
      </div>
    </div>
  );
}
