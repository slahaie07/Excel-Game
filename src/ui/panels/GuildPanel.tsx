import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import {
  GUILD_PERKS,
  getGuildInfo,
  getNextPerk,
  getPlayerMembership,
  getUnlockedPerks,
  listGuildMembers,
  listGuilds,
  roleLabel,
  type GuestGuild,
  type GuestGuildMember,
} from "../../lib/guildEngine";
import { unlockLocalAchievement } from "../../screens/AchievementsScreen";

export default function GuildPanel({ cloud }: { cloud?: boolean }) {
  const characterId = useGameStore((s) => s.characterId)!;
  const guildId = useGameStore((s) => s.guildId);
  const playerCharacter = useGameStore((s) => s.playerCharacter);
  const setScreen = useGameStore((s) => s.setScreen);
  const setGuildId = useGameStore((s) => s.setGuildId);
  const createGuildAction = useGameStore((s) => s.createGuild);
  const joinGuildAction = useGameStore((s) => s.joinGuild);
  const leaveGuildAction = useGameStore((s) => s.leaveGuild);
  const donateToGuildAction = useGameStore((s) => s.donateToGuild);
  const refreshPlayerCharacter = useGameStore((s) => s.refreshPlayerCharacter);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildTag, setGuildTag] = useState("");
  const [donateAmount, setDonateAmount] = useState("100");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    refreshPlayerCharacter();
  }, [refreshPlayerCharacter, tick]);

  const myGuild = useMemo(() => {
    if (cloud) return guildId ? getGuildInfo(guildId) : null;
    return guildId ? getGuildInfo(guildId) : getPlayerMembership(characterId) ? getGuildInfo(getPlayerMembership(characterId)!.guildId) : null;
  }, [cloud, guildId, characterId, tick]);

  const members = useMemo(
    () => (myGuild ? listGuildMembers(myGuild.id) : []),
    [myGuild, tick]
  );

  const browseGuilds = useMemo(() => listGuilds(search), [search, tick]);

  const membership = useMemo(() => getPlayerMembership(characterId), [characterId, tick]);

  const eclats = playerCharacter?.eclats ?? 0;

  const handleCreate = async () => {
    setError("");
    const result = await createGuildAction(guildName, guildTag);
    if (result.success) {
      setMessage("Guilde créée !");
      setShowCreate(false);
      setGuildName("");
      setGuildTag("");
      if (result.guildId) setGuildId(result.guildId);
      unlockLocalAchievement(characterId, "guild_member");
      refresh();
      refreshPlayerCharacter();
    } else {
      setError(result.error ?? "Erreur");
    }
  };

  const handleJoin = async (id: string) => {
    setError("");
    const result = await joinGuildAction(id);
    if (result.success) {
      setMessage("Vous avez rejoint la guilde !");
      setGuildId(id);
      unlockLocalAchievement(characterId, "guild_member");
      refresh();
      refreshPlayerCharacter();
    } else {
      setError(result.error ?? "Erreur");
    }
  };

  const handleLeave = () => {
    setError("");
    const result = leaveGuildAction();
    if (result.success) {
      setMessage("Vous avez quitté la guilde.");
      setGuildId(null);
      refresh();
      refreshPlayerCharacter();
    } else {
      setError(result.error ?? "Erreur");
    }
  };

  const handleDonate = () => {
    setError("");
    const amount = parseInt(donateAmount, 10);
    if (!myGuild) return;
    const result = donateToGuildAction(amount);
    if (result.success) {
      setMessage(`${amount} éclats donnés au trésor !`);
      refresh();
      refreshPlayerCharacter();
    } else {
      setError(result.error ?? "Erreur");
    }
  };

  const nextPerk = myGuild ? getNextPerk(myGuild.level) : null;
  const unlockedPerks = myGuild ? getUnlockedPerks(myGuild.level) : [];

  return (
    <div className="flex-1 flex flex-col bg-aether-950 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-xl font-bold">Guildes</h1>
        {cloud && <span className="ml-auto text-green-400/70 text-xs">☁️ Live</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
        {message && <p className="text-green-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {myGuild ? (
          <GuildDetailView
            guild={myGuild}
            members={members}
            membership={membership}
            eclats={eclats}
            donateAmount={donateAmount}
            onDonateAmountChange={setDonateAmount}
            onDonate={handleDonate}
            onLeave={handleLeave}
            unlockedPerks={unlockedPerks}
            nextPerk={nextPerk}
            onOpenHall={() => setScreen("guild-hall")}
          />
        ) : (
          <GuildBrowseView
            guilds={browseGuilds}
            search={search}
            onSearchChange={setSearch}
            showCreate={showCreate}
            onToggleCreate={() => setShowCreate(!showCreate)}
            guildName={guildName}
            guildTag={guildTag}
            onGuildNameChange={setGuildName}
            onGuildTagChange={setGuildTag}
            onCreate={() => void handleCreate()}
            onJoin={(id) => void handleJoin(id)}
          />
        )}
      </div>
    </div>
  );
}

function GuildDetailView({
  guild,
  members,
  membership,
  eclats,
  donateAmount,
  onDonateAmountChange,
  onDonate,
  onLeave,
  unlockedPerks,
  nextPerk,
  onOpenHall,
}: {
  guild: GuestGuild;
  members: GuestGuildMember[];
  membership: GuestGuildMember | null;
  eclats: number;
  donateAmount: string;
  onDonateAmountChange: (v: string) => void;
  onDonate: () => void;
  onLeave: () => void;
  unlockedPerks: typeof GUILD_PERKS;
  nextPerk: (typeof GUILD_PERKS)[number] | null;
  onOpenHall: () => void;
}) {
  const xpToNext = guild.level * 1000;
  const xpPercent = Math.min(100, (guild.xp / xpToNext) * 100);

  return (
    <>
      <div className="card border-crystal-gold/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{guild.emblem}</span>
          <div className="flex-1">
            <p className="font-bold text-white">
              [{guild.tag}] {guild.name}
            </p>
            <p className="text-aether-400 text-xs">{guild.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-aether-900/50 rounded-lg p-2">
            <p className="text-aether-500">Niveau</p>
            <p className="text-white font-bold">{guild.level}</p>
          </div>
          <div className="bg-aether-900/50 rounded-lg p-2">
            <p className="text-aether-500">Membres</p>
            <p className="text-white font-bold">
              {guild.memberCount}/{guild.maxMembers}
            </p>
          </div>
          <div className="bg-aether-900/50 rounded-lg p-2">
            <p className="text-aether-500">Trésor</p>
            <p className="text-crystal-gold font-bold">✦ {guild.treasury.toLocaleString("fr-FR")}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-aether-500 mb-1">
            <span>XP de guilde</span>
            <span>
              {guild.xp}/{xpToNext}
            </span>
          </div>
          <div className="h-1.5 bg-aether-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-aether-600 to-crystal-cyan"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-aether-400 text-sm mb-2">Membres ({members.length})</h2>
        {members.map((m) => (
          <div key={m.playerKey} className="card mb-2 flex items-center gap-3 py-2">
            <span className="text-lg">
              {m.role === "leader" ? "👑" : m.role === "officer" ? "⚔️" : "🛡️"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{m.playerName}</p>
              <p className="text-aether-500 text-[10px]">
                {roleLabel(m.role)} • Contribution : ✦ {m.contribution.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-aether-400 text-sm mb-2">Avantages de guilde</h2>
        {unlockedPerks.map((perk) => (
          <div key={perk.level} className="card mb-2 flex items-center gap-3 py-2 border-green-500/20">
            <span className="text-xl">{perk.icon}</span>
            <div>
              <p className="text-white text-sm font-medium">
                Niv. {perk.level} — {perk.name}
              </p>
              <p className="text-aether-500 text-xs">{perk.description}</p>
            </div>
          </div>
        ))}
        {nextPerk && (
          <p className="text-aether-600 text-xs text-center">
            Prochain avantage (niv. {nextPerk.level}) : {nextPerk.name}
          </p>
        )}
      </section>

      <div className="card space-y-3">
        <h2 className="text-crystal-gold text-xs font-bold uppercase">Trésor de guilde</h2>
        <p className="text-aether-400 text-xs">
          Vos éclats : ✦ {eclats.toLocaleString("fr-FR")}
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={donateAmount}
            onChange={(e) => onDonateAmountChange(e.target.value)}
            className="flex-1 bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <button onClick={onDonate} className="btn-primary text-sm px-4">
            Donner
          </button>
        </div>
        <p className="text-aether-600 text-[10px]">
          Chaque don augmente le trésor et l&apos;XP de guilde.
        </p>
      </div>

      <button onClick={onOpenHall} className="btn-secondary w-full text-sm">
        🏰 Hall de guilde
      </button>

      {membership?.role !== "leader" && (
        <button onClick={onLeave} className="btn-secondary w-full text-sm text-red-400 border-red-500/30">
          Quitter la guilde
        </button>
      )}
    </>
  );
}

function GuildBrowseView({
  guilds,
  search,
  onSearchChange,
  showCreate,
  onToggleCreate,
  guildName,
  guildTag,
  onGuildNameChange,
  onGuildTagChange,
  onCreate,
  onJoin,
}: {
  guilds: GuestGuild[];
  search: string;
  onSearchChange: (v: string) => void;
  showCreate: boolean;
  onToggleCreate: () => void;
  guildName: string;
  guildTag: string;
  onGuildNameChange: (v: string) => void;
  onGuildTagChange: (v: string) => void;
  onCreate: () => void;
  onJoin: (id: string) => void;
}) {
  return (
    <>
      <button onClick={onToggleCreate} className="btn-primary w-full">
        Créer une guilde
      </button>

      {showCreate && (
        <div className="card space-y-3">
          <input
            value={guildName}
            onChange={(e) => onGuildNameChange(e.target.value)}
            placeholder="Nom de la guilde"
            className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <input
            value={guildTag}
            onChange={(e) => onGuildTagChange(e.target.value.toUpperCase())}
            placeholder="Tag (2-4 lettres)"
            maxLength={4}
            className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <div className="flex gap-2">
            <button onClick={onCreate} className="btn-primary flex-1 text-sm">
              Créer
            </button>
            <button onClick={onToggleCreate} className="btn-secondary flex-1 text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une guilde..."
          className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
        />
      </div>

      <section>
        <h2 className="text-aether-400 text-sm mb-2">
          Guildes disponibles ({guilds.length})
        </h2>
        {guilds.length === 0 ? (
          <p className="text-aether-500 text-sm text-center py-6">
            Aucune guilde trouvée. Créez la première !
          </p>
        ) : (
          guilds.map((guild) => (
            <div key={guild.id} className="card mb-2 flex items-center gap-3">
              <span className="text-2xl">{guild.emblem}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">
                  [{guild.tag}] {guild.name}
                </p>
                <p className="text-aether-500 text-xs">
                  Niv. {guild.level} • {guild.memberCount}/{guild.maxMembers} membres
                </p>
              </div>
              <button
                onClick={() => onJoin(guild.id)}
                className="btn-secondary text-xs py-1 px-3 shrink-0"
              >
                Rejoindre
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}
