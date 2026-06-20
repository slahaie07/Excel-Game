import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter } from "../lib/convexUtils";
import { formatCountdown, warProgressPercent } from "../lib/formatTime";
import { GuildScreenUI } from "./GuildScreenUI";

function CloudGuild() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const guildId = useGameStore((s) => s.guildId);
  const setGuildId = useGameStore((s) => s.setGuildId);
  const setScreen = useGameStore((s) => s.setScreen);
  const cloudGuilds = useQuery(api.social.listGuilds, {});
  const activeWars = useQuery(api.guildWars.listActiveWars, {});
  const myWar = useQuery(
    api.guildWars.getGuildWar,
    guildId ? { guildId: guildId as Id<"guilds"> } : "skip"
  );
  const createGuildMutation = useMutation(api.social.createGuild);
  const joinGuildMutation = useMutation(api.social.joinGuild);
  const declareWarMutation = useMutation(api.guildWars.declareWar);
  const contributeMutation = useMutation(api.guildWars.contributeToWar);
  const [error, setError] = useState("");
  const [targetGuildId, setTargetGuildId] = useState("");
  const [warMsg, setWarMsg] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const guilds = (cloudGuilds ?? []).map((g) => ({
    id: g._id as string,
    name: g.name,
    tag: g.tag,
    level: g.level,
    members: g.memberCount,
    emblem: g.emblem,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0">
        <GuildScreenUI
        guilds={guilds}
        loading={cloudGuilds === undefined}
        cloud
        error={error}
        onCreate={async (name, tag) => {
          const newGuildId = await createGuildMutation({
            name,
            tag,
            description: `Guilde fondée par ${characterName}`,
            leaderId: characterId as Id<"characters">,
            emblem: "🏰",
          });
          setGuildId(newGuildId);
        }}
        onJoin={async (gid) => {
          await joinGuildMutation({
            guildId: gid as Id<"guilds">,
            characterId: characterId as Id<"characters">,
          });
          setGuildId(gid);
        }}
        onError={setError}
        />
      </div>
      {guildId && (
        <div className="p-4 border-t border-aether-700/40 space-y-3">
          <button
            onClick={() => setScreen("guild-hall")}
            className="btn-secondary w-full text-sm"
          >
            🏰 Guild Hall partagé
          </button>
          <h2 className="font-display font-bold text-white text-sm">⚔️ Guerres de guildes</h2>
          {myWar ? (
            <div className="card">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white text-xs font-bold">
                  {myWar.guildAName} vs {myWar.guildBName}
                </p>
                <span className="text-orange-400 text-[10px]">⏱ {formatCountdown(myWar.endsAt, now)}</span>
              </div>
              <div className="h-2 bg-aether-900 rounded-full overflow-hidden flex mb-2">
                <div
                  className="h-full bg-aether-500 transition-all"
                  style={{ width: `${warProgressPercent(myWar.isGuildA ? myWar.guildAScore : myWar.guildBScore, myWar.isGuildA ? myWar.guildBScore : myWar.guildAScore)}%` }}
                />
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${100 - warProgressPercent(myWar.isGuildA ? myWar.guildAScore : myWar.guildBScore, myWar.isGuildA ? myWar.guildBScore : myWar.guildAScore)}%` }}
                />
              </div>
              <p className="text-aether-400 text-[10px] mb-2">
                Notre score : {myWar.isGuildA ? myWar.guildAScore : myWar.guildBScore} •
                Ennemi : {myWar.isGuildA ? myWar.guildBScore : myWar.guildAScore}
              </p>
              <button
                onClick={async () => {
                  try {
                    const r = await contributeMutation({
                      warId: myWar._id,
                      characterId: characterId as Id<"characters">,
                    });
                    setWarMsg(`+dégâts ! Score: ${r.guildScore} vs ${r.enemyScore}`);
                  } catch (err) {
                    setWarMsg(err instanceof Error ? err.message : "Erreur");
                  }
                }}
                className="btn-primary w-full text-xs mt-2"
              >
                Contribuer au combat
              </button>
              {warMsg && <p className="text-aether-400 text-[10px] mt-1">{warMsg}</p>}
            </div>
          ) : (
            <div className="card space-y-2">
              <select
                value={targetGuildId}
                onChange={(e) => setTargetGuildId(e.target.value)}
                className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Choisir une guilde ennemie</option>
                {guilds.filter((g) => g.id !== guildId).map((g) => (
                  <option key={g.id} value={g.id}>[{g.tag}] {g.name}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  if (!targetGuildId) return;
                  try {
                    await declareWarMutation({
                      guildAId: guildId as Id<"guilds">,
                      guildBId: targetGuildId as Id<"guilds">,
                      characterId: characterId as Id<"characters">,
                    });
                    setWarMsg("Guerre déclarée !");
                  } catch (err) {
                    setWarMsg(err instanceof Error ? err.message : "Erreur");
                  }
                }}
                className="btn-primary w-full text-xs"
              >
                Déclarer la guerre
              </button>
              {warMsg && <p className="text-aether-400 text-[10px]">{warMsg}</p>}
            </div>
          )}
          {(activeWars ?? []).length > 0 && (
            <div>
              <p className="text-aether-500 text-xs mb-1">Guerres actives</p>
              {activeWars!.map((w) => (
                <p key={w._id} className="text-aether-400 text-[10px]">
                  {w.guildAName} ({w.guildAScore}) vs {w.guildBName} ({w.guildBScore})
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LocalGuild() {
  const characterId = useGameStore((s) => s.characterId)!;
  const [guilds, setGuilds] = useState(() =>
    JSON.parse(localStorage.getItem("aetheris-guilds") ?? "[]") as {
      id: string; name: string; tag: string; level: number; members: number; emblem: string;
    }[]
  );

  return (
    <GuildScreenUI
      guilds={guilds}
      onCreate={async (name, tag) => {
        const newGuild = { id: `guild_${Date.now()}`, name, tag, level: 1, members: 1, emblem: "🏰" };
        const updated = [...guilds, newGuild];
        setGuilds(updated);
        localStorage.setItem("aetheris-guilds", JSON.stringify(updated));
        const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
        charData.guildId = newGuild.id;
        localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
      }}
      onJoin={async (guildId) => {
        const updated = guilds.map((g) => g.id === guildId ? { ...g, members: g.members + 1 } : g);
        setGuilds(updated);
        localStorage.setItem("aetheris-guilds", JSON.stringify(updated));
        const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
        charData.guildId = guildId;
        localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
      }}
    />
  );
}

export default function GuildScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  return isCloudCharacter(characterId) ? <CloudGuild /> : <LocalGuild />;
}
