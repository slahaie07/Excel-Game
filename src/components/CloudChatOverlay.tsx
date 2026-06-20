import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  createdAt: number;
}

export default function CloudChatOverlay({ channel = "zone" }: { channel?: "global" | "zone" | "guild" | "trade" }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeChannel, setActiveChannel] = useState(channel);
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const guildId = useGameStore((s) => s.guildId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cloudMessages = useQuery(api.social.getMessages, open ? {
    channel: activeChannel,
    zoneId: activeChannel === "zone" ? zoneId : undefined,
    guildId: activeChannel === "guild" && guildId ? guildId as Id<"guilds"> : undefined,
    limit: 50,
  } : "skip");

  const sendMessage = useMutation(api.social.sendMessage);

  const messages: ChatMessage[] = (cloudMessages ?? []).slice().reverse().map((m: {
    _id: string; senderName: string; content: string; createdAt: number;
  }) => ({
    id: m._id,
    senderName: m.senderName,
    content: m.content,
    createdAt: m.createdAt,
  }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    await sendMessage({
      channel: activeChannel,
      senderId: characterId as Id<"characters">,
      senderName: characterName,
      content: input.trim(),
      zoneId: activeChannel === "zone" ? zoneId : undefined,
      guildId: activeChannel === "guild" && guildId ? guildId as Id<"guilds"> : undefined,
    });
    setInput("");
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-aether-700 border border-aether-500 shadow-lg flex items-center justify-center text-xl">
        💬
      </button>
    );
  }

  const channels = ["global", "zone", "guild", "trade"] as const;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 game-panel rounded-t-2xl flex flex-col" style={{ height: "45vh" }}>
      <div className="flex items-center justify-between p-3 border-b border-aether-700/40">
        <div className="flex gap-1">
          {channels.map((ch) => (
            <button key={ch} onClick={() => setActiveChannel(ch)} className={`px-2 py-1 rounded-lg text-xs capitalize ${activeChannel === ch ? "bg-aether-700 text-white" : "text-aether-400"}`}>
              {ch} ☁️
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="text-aether-400 text-lg">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="text-aether-300 font-semibold">{msg.senderName}: </span>
            <span className="text-aether-400">{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 flex gap-2 border-t border-aether-700/40">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void send()} className="flex-1 bg-aether-900 border border-aether-700 rounded-xl px-3 py-2 text-sm text-white" maxLength={200} />
        <button onClick={() => void send()} className="btn-primary px-4 py-2 text-sm">Envoyer</button>
      </div>
    </div>
  );
}
