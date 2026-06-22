import { useGameStore } from "../../store/gameStore";
import { ZONES } from "../../data/universe";
import { xpForLevel } from "../../data/classes";

export function HUD() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const screen = useGameStore((s) => s.screen);
  const dungeonRun = useGameStore((s) => s.dungeonRun);

  if (!player) return null;

  const zone = ZONES[player.zone];
  const xpNeeded = xpForLevel(player.level);
  const xpPercent = (player.xp / xpNeeded) * 100;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-player">
          <span className="hud-name">{player.name}</span>
          <span className="hud-level">Niv. {player.level}</span>
          <div className="hud-xp-bar">
            <div className="hud-xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="hud-stats">
            <span>❤️ {player.stats.hp}/{player.stats.maxHp}</span>
            <span>💰 {player.kamas}</span>
          </div>
        </div>
        <div className="hud-zone">
          <span className="hud-zone-name">{zone.name}</span>
          <span className="hud-zone-level">Niv. {zone.levelRange[0]}-{zone.levelRange[1]}</span>
        </div>
      </div>

      {(screen === "world" || screen === "dungeon") && (
        <nav className="hud-menu">
          <button className="hud-btn" onClick={() => setScreen("inventory")} title="Inventaire">
            🎒
          </button>
          <button className="hud-btn" onClick={() => setScreen("quests")} title="Quêtes">
            📜
          </button>
          {!dungeonRun && (
            <button className="hud-btn" onClick={() => setScreen("dungeon")} title="Donjons">
              🏰
            </button>
          )}
          <button className="hud-btn" onClick={() => setScreen("craft")} title="Artisanat">
            🔨
          </button>
          <button className="hud-btn" onClick={() => setScreen("social")} title="Social">
            💬
          </button>
          <button className="hud-btn" onClick={() => setScreen("guild")} title="Guilde">
            ⚔️
          </button>
          <button className="hud-btn" onClick={() => setScreen("settings")} title="Paramètres">
            ⚙️
          </button>
        </nav>
      )}
    </div>
  );
}
