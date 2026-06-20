import { useGameStore } from "../../store/gameStore";

export function SettingsPanel() {
  const setScreen = useGameStore((s) => s.setScreen);
  const setScreen2 = useGameStore((s) => s.setScreen);

  return (
    <div className="panel-overlay">
      <div className="panel">
        <div className="panel-header">
          <h2>⚙️ Paramètres</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <div className="settings-section">
          <h3>Audio</h3>
          <label className="setting-row">
            <span>Musique</span>
            <input type="range" min="0" max="100" defaultValue="70" />
          </label>
          <label className="setting-row">
            <span>Effets sonores</span>
            <input type="range" min="0" max="100" defaultValue="80" />
          </label>
        </div>

        <div className="settings-section">
          <h3>Graphismes</h3>
          <label className="setting-row">
            <span>Qualité</span>
            <select className="input-field" defaultValue="medium">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </label>
        </div>

        <div className="settings-section">
          <h3>Compte</h3>
          <button className="btn-secondary" onClick={() => setScreen2("splash")}>
            Retour à l&apos;écran titre
          </button>
        </div>

        <p className="panel-footer">Chroniques d&apos;Étheris v0.1.0</p>
      </div>
    </div>
  );
}
