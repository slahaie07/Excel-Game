import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useGameStore, type ChatMessage } from "../../store/gameStore";
import { api } from "../../../convex/_generated/api";
import { convexClient } from "../../lib/convex";

type Channel = "global" | "zone" | "guild" | "trade";
type PublicChannel = "global" | "zone" | "trade";

interface DisplayMessage {
  id: string;
  channel: Channel;
  sender: string;
  message: string;
  timestamp: number;
}

export function SocialPanel() {
  const setScreen = useGameStore((s) => s.setScreen);
  const localMessages = useGameStore((s) => s.chatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);
  const player = useGameStore((s) => s.player);
  const [channel, setChannel] = useState<Channel>("global");
  const [input, setInput] = useState("");

  const isPublicChannel = channel !== "guild";
  const online = convexClient !== null && isPublicChannel;
  const convexChannel: PublicChannel = channel === "guild" ? "global" : channel;

  const remoteMessages = useQuery(
    api.guest.getPublicChat,
    online ? { channel: convexChannel, limit: 50 } : "skip",
  );

  const sendPublic = useMutation(api.guest.sendPublicChat);

  const messages: DisplayMessage[] =
    online && remoteMessages
      ? remoteMessages.map((m) => ({
          id: m._id,
          channel: channel,
          sender: m.senderName,
          message: m.message,
          timestamp: m.timestamp,
        }))
      : localMessages
          .filter((m: ChatMessage) => m.channel === channel)
          .map((m) => ({
            id: m.id,
            channel,
            sender: m.sender,
            message: m.message,
            timestamp: m.timestamp,
          }));

  const sendMessage = async () => {
    if (!input.trim() || !player) return;
    const text = input.trim();
    setInput("");

    if (online) {
      try {
        await sendPublic({
          channel: convexChannel,
          senderName: player.name,
          message: text,
          zone: channel === "zone" ? player.zone : undefined,
        });
      } catch {
        addChatMessage({
          id: `msg_${Date.now()}`,
          channel,
          sender: player.name,
          message: text,
          timestamp: Date.now(),
        });
      }
    } else {
      addChatMessage({
        id: `msg_${Date.now()}`,
        channel,
        sender: player.name,
        message: text,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>💬 Social {online && <span className="online-badge">● En ligne</span>}</h2>
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
          {messages.length === 0 && (
            <p className="chat-empty">Aucun message dans ce canal.</p>
          )}
          {messages.map((msg) => (
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
            onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
            placeholder="Écrire un message..."
          />
          <button className="btn-primary" onClick={() => void sendMessage()}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
