import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import { ChatSenderLine } from "./ChatSenderLine";
import { getLocalEquippedTitleId, getLocalEquippedFrameId } from "../lib/factionProgress";
import CloudChatOverlay from "./CloudChatOverlay";

interface ChatMessage {
  id: string;
  senderName: string;
  senderTitleId?: string | null;
  senderFrameId?: string | null;
  content: string;
  channel: string;
  createdAt: number;
}

const CHAT_KEY = "aetheris-chat";

function LocalChatOverlay({ channel = "zone" }: { channel?: "global" | "zone" | "guild" | "trade" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeChannel, setActiveChannel] = useState(channel);
  const characterId = useGameStore((s) => s.characterId);
  const characterName = useGameStore((s) => s.characterName);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
    setMessages(all.filter((m) => m.channel === activeChannel).slice(-50));
  }, [activeChannel, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !characterName) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: characterName,
      senderTitleId: characterId ? getLocalEquippedTitleId(characterId) : null,
      senderFrameId: characterId ? getLocalEquippedFrameId(characterId) : null,
      content: input.trim(),
      channel: activeChannel,
      createdAt: Date.now(),
    };
    const all: ChatMessage[] = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
    all.push(msg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(all.slice(-200)));
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-aether-700 border border-aether-500 shadow-lg flex items-center justify-center text-xl">
        💬
      </button>
    );
  }

  return (
    <ChatPanel
      messages={messages}
      activeChannel={activeChannel}
      setActiveChannel={setActiveChannel}
      input={input}
      setInput={setInput}
      onSend={send}
      onClose={() => setOpen(false)}
      bottomRef={bottomRef}
    />
  );
}

function ChatPanel({
  messages, activeChannel, setActiveChannel, input, setInput, onSend, onClose, bottomRef,
}: {
  messages: ChatMessage[];
  activeChannel: string;
  setActiveChannel: (c: "global" | "zone" | "guild" | "trade") => void;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  const channels = ["global", "zone", "guild", "trade"] as const;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 game-panel rounded-t-2xl flex flex-col" style={{ height: "45vh" }}>
      <div className="flex items-center justify-between p-3 border-b border-aether-700/40">
        <div className="flex gap-1">
          {channels.map((ch) => (
            <button key={ch} onClick={() => setActiveChannel(ch)} className={`px-2 py-1 rounded-lg text-xs capitalize ${activeChannel === ch ? "bg-aether-700 text-white" : "text-aether-400"}`}>
              {ch}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-aether-400 text-lg">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <ChatSenderLine
            key={msg.id}
            name={msg.senderName}
            titleId={msg.senderTitleId}
            frameId={msg.senderFrameId}
            content={msg.content}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 flex gap-2 border-t border-aether-700/40">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSend()} placeholder="Message..." className="flex-1 bg-aether-900 border border-aether-700 rounded-xl px-3 py-2 text-sm text-white" maxLength={200} />
        <button onClick={onSend} className="btn-primary px-4 py-2 text-sm">Envoyer</button>
      </div>
    </div>
  );
}

export default function ChatOverlay(props: { channel?: "global" | "zone" | "guild" | "trade" }) {
  const characterId = useGameStore((s) => s.characterId);
  if (isConvexEnabled() && isCloudCharacter(characterId)) {
    return <CloudChatOverlay {...props} />;
  }
  return <LocalChatOverlay {...props} />;
}
