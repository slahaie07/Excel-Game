import { useState } from "react";
import { useGameStore } from "../../store/gameStore";

type Channel = "global" | "zone" | "guild" | "trade";

export function SocialPanel() {
  const setScreen = useGameStore((s) => s.setScreen);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);
  const player = useGameStore((s) => s.player);
  const [channel, setChannel] = useState<Channel>("global");
  const [input, setInput] = useState("");

  const filtered = chatMessages.filter((m) => m.channel === channel);

  const sendMessage = () => {
    if (!input.trim() || !player) return;
    addChatMessage({
      id: `msg_${Date.now()}`,
      channel,
      sender: player.name,
      message: input.trim(),
      timestamp: Date.now(),
    });
    setInput("");
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>💬 Social</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <div className="chat-channels">
          {(["global", "zone", "guild", "trade"] as Channel[]).map((ch) => (
            <button
              key={ch}
              className={`channel-btn ${channel === ch ? "active" : ""}`}
              onClick={() => setChannel(ch)}
            >
              {ch === "global" && "🌍 Global"}
              {ch === "zone" && "📍 Zone"}
              {ch === "guild" && "⚔️ Guilde"}
              {ch === "trade" && "💰 Commerce"}
            </button>
          ))}
        </div>

        <div className="chat-messages">
          {filtered.length === 0 && (
            <p className="chat-empty">Aucun message dans ce canal.</p>
          )}
          {filtered.map((msg) => (
            <div key={msg.id} className="chat-msg">
              <span className="chat-sender">{msg.sender}</span>
              <span className="chat-text">{msg.message}</span>
            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrire un message..."
          />
          <button className="btn-primary" onClick={sendMessage}>
            Envoyer
          </button>
        </div>

        <div className="social-features">
          <h3 className="section-title">Fonctionnalités Sociales</h3>
          <div className="feature-grid">
            <div className="feature-card">👥 Liste d&apos;amis</div>
            <div className="feature-card">📨 Messages privés</div>
            <div className="feature-card">🤝 Échanges directs</div>
            <div className="feature-card">🏆 Classements PvP</div>
            <div className="feature-card">📢 Annonces de guilde</div>
            <div className="feature-card">🎉 Événements communautaires</div>
          </div>
        </div>
      </div>
    </div>
  );
}
