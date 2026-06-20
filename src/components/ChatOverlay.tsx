import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  channel: string;
  createdAt: number;
}

const CHAT_KEY = "aetheris-chat";

function loadMessages(channel: string): ChatMessage[] {
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
    return all.filter((m) => m.channel === channel).slice(-50);
  } catch {
    return [];
  }
}

function saveMessage(msg: ChatMessage) {
  const all: ChatMessage[] = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
  all.push(msg);
  localStorage.setItem(CHAT_KEY, JSON.stringify(all.slice(-200)));
}

interface ChatOverlayProps {
  channel?: "global" | "zone" | "guild" | "trade";
}

export default function ChatOverlay({ channel = "zone" }: ChatOverlayProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeChannel, setActiveChannel] = useState(channel);
  const characterName = useGameStore((s) => s.characterName);
  const zoneId = useGameStore((s) => s.zoneId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages(activeChannel));
  }, [activeChannel, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !characterName) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: characterName,
      content: input.trim(),
      channel: activeChannel,
      createdAt: Date.now(),
    };
    saveMessage(msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const channels = ["global", "zone", "guild", "trade"] as const;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-aether-700 border border-aether-500 shadow-lg flex items-center justify-center text-xl active:scale-95"
        aria-label="Ouvrir le chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 game-panel rounded-t-2xl flex flex-col" style={{ height: "45vh" }}>
      <div className="flex items-center justify-between p-3 border-b border-aether-700/40">
        <div className="flex gap-1">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`text-xs px-2 py-1 rounded-lg capitalize ${
                activeChannel === ch ? "bg-aether-600 text-white" : "text-aether-400"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="text-aether-400 text-lg">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-aether-500 text-xs text-center py-4">
            {activeChannel === "zone" ? `Chat de ${zoneId}` : `Canal ${activeChannel}`} — soyez le premier à parler !
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
              <span className="font-bold text-aether-300">{msg.senderName}</span>
              <span className="text-aether-500 text-xs ml-2">
                {new Date(msg.createdAt).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <p className="text-aether-200">{msg.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 flex gap-2 border-t border-aether-700/40">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Votre message..."
          maxLength={200}
          className="flex-1 bg-aether-950 border border-aether-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-aether-500"
        />
        <button onClick={send} className="btn-primary px-4 py-2 text-sm">Envoyer</button>
      </div>
    </div>
  );
}
