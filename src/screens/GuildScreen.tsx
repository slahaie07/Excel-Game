import { useState } from "react";
import { useGameStore } from "../stores/gameStore";

export default function GuildScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const setScreen = useGameStore((s) => s.setScreen);

  const [showCreate, setShowCreate] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildTag, setGuildTag] = useState("");

  const guildsKey = "aetheris-guilds";
  const guilds: { id: string; name: string; tag: string; level: number; members: number; emblem: string }[] =
    JSON.parse(localStorage.getItem(guildsKey) ?? "[]");

  const createGuild = () => {
    if (guildName.length < 3 || guildTag.length < 2) return;

    const newGuild = {
      id: `guild_${Date.now()}`,
      name: guildName,
      tag: guildTag.toUpperCase(),
      level: 1,
      members: 1,
      emblem: "🏰",
      leaderId: characterId,
      leaderName: characterName,
    };

    localStorage.setItem(guildsKey, JSON.stringify([...guilds, newGuild]));

    const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
    charData.guildId = newGuild.id;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));

    setShowCreate(false);
  };

  const joinGuild = (guildId: string) => {
    const updated = guilds.map((g) =>
      g.id === guildId ? { ...g, members: g.members + 1 } : g
    );
    localStorage.setItem(guildsKey, JSON.stringify(updated));

    const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
    charData.guildId = guildId;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Guildes</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary w-full mb-4"
        >
          Créer une guilde
        </button>

        {showCreate && (
          <div className="card mb-4 space-y-3">
            <input
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="Nom de la guilde"
              className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input
              type="text"
              value={guildTag}
              onChange={(e) => setGuildTag(e.target.value.toUpperCase())}
              placeholder="Tag (ex: AETH)"
              maxLength={4}
              className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <div className="flex gap-2">
              <button onClick={createGuild} className="btn-primary flex-1 text-sm">Créer</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 text-sm">Annuler</button>
            </div>
          </div>
        )}

        <h2 className="text-aether-400 text-sm mb-3">Guildes disponibles</h2>
        {guilds.length === 0 ? (
          <p className="text-aether-500 text-sm text-center py-8">Aucune guilde pour le moment. Soyez le premier !</p>
        ) : (
          guilds.map((guild) => (
            <div key={guild.id} className="card mb-2 flex items-center gap-3">
              <span className="text-2xl">{guild.emblem}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">[{guild.tag}] {guild.name}</p>
                <p className="text-aether-500 text-xs">Niv. {guild.level} • {guild.members} membres</p>
              </div>
              <button onClick={() => joinGuild(guild.id)} className="btn-secondary text-xs py-1 px-3">
                Rejoindre
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
