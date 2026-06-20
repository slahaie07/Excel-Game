import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { unlockLocalAchievement } from "./AchievementsScreen";

interface Guild {
  id: string;
  name: string;
  tag: string;
  level: number;
  members: number;
  emblem: string;
}

export function GuildScreenUI({
  guilds,
  loading,
  cloud,
  error,
  onCreate,
  onJoin,
  onError,
}: {
  guilds: Guild[];
  loading?: boolean;
  cloud?: boolean;
  error?: string;
  onCreate: (name: string, tag: string) => Promise<void>;
  onJoin: (guildId: string) => Promise<void>;
  onError?: (msg: string) => void;
}) {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [showCreate, setShowCreate] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildTag, setGuildTag] = useState("");

  const handleCreate = async () => {
    if (guildName.length < 3 || guildTag.length < 2) return;
    try {
      await onCreate(guildName, guildTag.toUpperCase());
      unlockLocalAchievement(characterId, "guild_member");
      setShowCreate(false);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleJoin = async (guildId: string) => {
    try {
      await onJoin(guildId);
      unlockLocalAchievement(characterId, "guild_member");
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Guildes</h1>
        {cloud && <span className="ml-auto text-green-400/70 text-xs">☁️ Live</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <button onClick={() => setShowCreate(true)} className="btn-primary w-full mb-4">Créer une guilde</button>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {loading && <p className="text-aether-400 text-sm text-center">Chargement...</p>}
        {showCreate && (
          <div className="card mb-4 space-y-3">
            <input value={guildName} onChange={(e) => setGuildName(e.target.value)} placeholder="Nom" className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm" />
            <input value={guildTag} onChange={(e) => setGuildTag(e.target.value.toUpperCase())} placeholder="Tag" maxLength={4} className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm" />
            <div className="flex gap-2">
              <button onClick={() => void handleCreate()} className="btn-primary flex-1 text-sm">Créer</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 text-sm">Annuler</button>
            </div>
          </div>
        )}
        {guilds.map((guild) => (
          <div key={guild.id} className="card mb-2 flex items-center gap-3">
            <span className="text-2xl">{guild.emblem}</span>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">[{guild.tag}] {guild.name}</p>
              <p className="text-aether-500 text-xs">Niv. {guild.level} • {guild.members} membres</p>
            </div>
            <button onClick={() => void handleJoin(guild.id)} className="btn-secondary text-xs py-1 px-3">Rejoindre</button>
          </div>
        ))}
      </div>
    </div>
  );
}
