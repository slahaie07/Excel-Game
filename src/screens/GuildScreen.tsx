import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter } from "../lib/convexUtils";
import { formatCountdown, warProgressPercent } from "../lib/formatTime";
import { GUILD_EMBLEMS, GUILD_BANNERS } from "../game/data/guildCosmetics";
import GuildPanel from "../ui/panels/GuildPanel";
import { GuildScreenUI } from "./GuildScreenUI";

function CloudGuild() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const guildId = useGameStore((s) => s.guildId);
  const setGuildId = useGameStore((s) => s.setGuildId);
  const setScreen = useGameStore((s) => s.setScreen);
  const cloudGuilds = useQuery(api.social.listGuilds, {});
  const activeWars = useQuery(api.guildWars.listActiveWars, {});
  const warSeason = useQuery(api.guildWarSeasons.getActiveGuildWarSeason, {});
  const seasonLeaderboard = useQuery(
    api.guildWarSeasons.getGuildWarSeasonLeaderboard,
    warSeason ? { seasonId: warSeason._id, limit: 5 } : "skip"
  );
  const mySeasonScore = useQuery(
    api.guildWarSeasons.getMyGuildWarSeasonScore,
    warSeason && guildId ? { seasonId: warSeason._id, guildId: guildId as Id<"guilds"> } : "skip"
  );
  const initWarSeason = useMutation(api.guildWarSeasons.initGuildWarSeason);
  const myWar = useQuery(
    api.guildWars.getGuildWar,
    guildId ? { guildId: guildId as Id<"guilds"> } : "skip"
  );
  const createGuildMutation = useMutation(api.social.createGuild);
  const joinGuildMutation = useMutation(api.social.joinGuild);
  const declareWarMutation = useMutation(api.guildWars.declareWar);
  const contributeMutation = useMutation(api.guildWars.contributeToWar);
  const purchaseGuildCosmetic = useMutation(api.guildCosmetics.purchaseGuildCosmetic);
  const equipGuildCosmetic = useMutation(api.guildCosmetics.equipGuildCosmetic);
  const guildCosmetics = useQuery(
    api.guildCosmetics.getGuildCosmetics,
    guildId ? { guildId: guildId as Id<"guilds"> } : "skip"
  );
  const myMembership = useQuery(
    api.guildCosmetics.getMyGuildMembership,
    { characterId: characterId as Id<"characters"> }
  );
  const [error, setError] = useState("");
  const [targetGuildId, setTargetGuildId] = useState("");
  const [warMsg, setWarMsg] = useState("");
  const [cosmeticMsg, setCosmeticMsg] = useState("");
  const [showCosmetics, setShowCosmetics] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (warSeason === null) {
      void initWarSeason({});
    }
  }, [warSeason, initWarSeason]);

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
          {(myMembership?.role === "leader" || myMembership?.role === "officer") && (
            <div className="card border-crystal-gold/30 space-y-2">
              <button
                onClick={() => setShowCosmetics(!showCosmetics)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-crystal-gold text-xs font-bold uppercase">🎨 Cosmétiques de guilde</span>
                <span className="text-aether-500 text-xs">💰 {guildCosmetics?.treasury ?? 0}</span>
              </button>
              {showCosmetics && (
                <div className="space-y-3">
                  <div>
                    <p className="text-aether-400 text-[10px] mb-1 uppercase">Emblèmes</p>
                    {GUILD_EMBLEMS.map((item) => {
                      const owned = guildCosmetics?.unlockedEmblems.includes(item.id);
                      const equipped = guildCosmetics?.equippedEmblem === item.id;
                      return (
                        <div key={item.id} className="flex items-center gap-2 py-1">
                          <span>{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs">{item.name}</p>
                            <p className="text-aether-600 text-[10px]">
                              {item.cost > 0 ? `💰 ${item.cost}` : "Récompense guerre"}
                            </p>
                          </div>
                          {owned ? (
                            <button
                              onClick={() => {
                                void equipGuildCosmetic({
                                  guildId: guildId as Id<"guilds">,
                                  characterId: characterId as Id<"characters">,
                                  cosmeticId: equipped ? null : item.id,
                                  slot: "emblem",
                                }).then(() => setCosmeticMsg(equipped ? "Emblème retiré" : "Emblème équipé"))
                                  .catch((e) => setCosmeticMsg(e instanceof Error ? e.message : "Erreur"));
                              }}
                              className={`text-[10px] py-0.5 px-2 rounded ${equipped ? "bg-crystal-gold text-black" : "btn-secondary"}`}
                            >
                              {equipped ? "Équipé" : "Équiper"}
                            </button>
                          ) : item.cost > 0 ? (
                            <button
                              onClick={() => {
                                void purchaseGuildCosmetic({
                                  guildId: guildId as Id<"guilds">,
                                  characterId: characterId as Id<"characters">,
                                  cosmeticId: item.id,
                                }).then(() => setCosmeticMsg(`${item.name} acheté !`))
                                  .catch((e) => setCosmeticMsg(e instanceof Error ? e.message : "Erreur"));
                              }}
                              className="btn-primary text-[10px] py-0.5 px-2"
                            >
                              Acheter
                            </button>
                          ) : (
                            <span className="text-aether-600 text-[10px]">Verrouillé</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <p className="text-aether-400 text-[10px] mb-1 uppercase">Bannières</p>
                    {GUILD_BANNERS.map((item) => {
                      const owned = guildCosmetics?.unlockedBanners.includes(item.id);
                      const equipped = guildCosmetics?.equippedBanner === item.id;
                      return (
                        <div key={item.id} className="flex items-center gap-2 py-1">
                          <span>{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs">{item.name}</p>
                            <p className="text-aether-600 text-[10px]">
                              {item.cost > 0 ? `💰 ${item.cost}` : "Récompense guerre"}
                            </p>
                          </div>
                          {owned ? (
                            <button
                              onClick={() => {
                                void equipGuildCosmetic({
                                  guildId: guildId as Id<"guilds">,
                                  characterId: characterId as Id<"characters">,
                                  cosmeticId: equipped ? null : item.id,
                                  slot: "banner",
                                }).then(() => setCosmeticMsg(equipped ? "Bannière retirée" : "Bannière équipée"))
                                  .catch((e) => setCosmeticMsg(e instanceof Error ? e.message : "Erreur"));
                              }}
                              className={`text-[10px] py-0.5 px-2 rounded ${equipped ? "bg-crystal-gold text-black" : "btn-secondary"}`}
                            >
                              {equipped ? "Équipée" : "Équiper"}
                            </button>
                          ) : item.cost > 0 ? (
                            <button
                              onClick={() => {
                                void purchaseGuildCosmetic({
                                  guildId: guildId as Id<"guilds">,
                                  characterId: characterId as Id<"characters">,
                                  cosmeticId: item.id,
                                }).then(() => setCosmeticMsg(`${item.name} achetée !`))
                                  .catch((e) => setCosmeticMsg(e instanceof Error ? e.message : "Erreur"));
                              }}
                              className="btn-primary text-[10px] py-0.5 px-2"
                            >
                              Acheter
                            </button>
                          ) : (
                            <span className="text-aether-600 text-[10px]">Verrouillée</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {cosmeticMsg && <p className="text-green-400 text-[10px]">{cosmeticMsg}</p>}
                </div>
              )}
            </div>
          )}
          <h2 className="font-display font-bold text-white text-sm">⚔️ Guerres de guildes</h2>
          {warSeason && (
            <div className="card border-red-500/30 bg-red-950/20">
              <p className="text-red-300 text-xs font-bold uppercase">Campagne saisonnière</p>
              <p className="text-white text-sm font-semibold">{warSeason.name}</p>
              <p className="text-aether-400 text-[10px]">
                {warSeason.daysLeft} jour{warSeason.daysLeft > 1 ? "s" : ""} • Top 3 guildes → trésor
              </p>
              {mySeasonScore && (
                <p className="text-crystal-gold text-xs mt-1">
                  Notre guilde : #{mySeasonScore.rank} • {mySeasonScore.warWins} victoire(s) • {mySeasonScore.warPoints} pts
                </p>
              )}
              {(seasonLeaderboard ?? []).length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {seasonLeaderboard!.map((entry, i) => (
                    <p key={i} className="text-aether-500 text-[10px]">
                      #{i + 1} {entry.guildName} — {entry.warWins}V / {entry.warPoints} pts
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
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
  return <GuildPanel />;
}

export default function GuildScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  return isCloudCharacter(characterId) ? <CloudGuild /> : <LocalGuild />;
}
