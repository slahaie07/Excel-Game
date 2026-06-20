import { useState } from "react";
import { useGameStore } from "../../store/gameStore";

export function GuildPanel() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const addNotification = useGameStore((s) => s.addNotification);
  const [guildName, setGuildName] = useState("");

  if (!player) return null;

  const createGuild = () => {
    if (guildName.trim().length < 3) return;
    if (player.kamas < 1000) {
      addNotification("Il faut 1000 Kamas pour créer une guilde.", "warning");
      return;
    }
    useGameStore.getState().addKamas(-1000);
    addNotification(`Guilde "${guildName}" créée !`, "success");
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>⚔️ Guilde</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        {player.guildId ? (
          <div className="guild-info">
            <h3>Votre Guilde</h3>
            <div className="feature-grid">
              <div className="feature-card">👥 Membres</div>
              <div className="feature-card">📊 Percepteur</div>
              <div className="feature-card">🏰 Enclos</div>
              <div className="feature-card">⚔️ Guerre de guildes</div>
              <div className="feature-card">📦 Coffre de guilde</div>
              <div className="feature-card">🎯 Missions de guilde</div>
            </div>
          </div>
        ) : (
          <div className="guild-create">
            <h3>Créer une Guilde</h3>
            <p>Coût : 1000 Kamas</p>
            <input
              className="input-field"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="Nom de la guilde..."
              maxLength={20}
            />
            <button className="btn-primary" onClick={createGuild}>
              Fonder la Guilde
            </button>

            <h3 className="section-title">Rejoindre une Guilde</h3>
            <div className="feature-grid">
              <div className="feature-card">⚔️ Étherium — Niv. 15</div>
              <div className="feature-card">🌟 Lumina — Niv. 8</div>
              <div className="feature-card">🔥 Pyros — Niv. 22</div>
              <div className="feature-card">🌊 Aqua — Niv. 12</div>
            </div>
          </div>
        )}

        <h3 className="section-title">Fonctionnalités de Guilde</h3>
        <ul className="guild-features-list">
          <li>Percepteur — collecte de ressources sur les cartes</li>
          <li>Enclos — élevage de montures et familiers</li>
          <li>Coffre partagé — banque de guilde</li>
          <li>Guerres de guildes — conquête territoriale</li>
          <li>Missions coopératives — donjons de guilde</li>
          <li>Grades et permissions — gestion des membres</li>
        </ul>
      </div>
    </div>
  );
}
