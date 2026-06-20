import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { FURNITURE, GUILD_HALL_EMOTES, getFurnitureById } from "../game/data";

const GUILD_FURNITURE_IDS = [
  "lit_cristal",
  "tapis_lumina",
  "forge_portable",
  "plante_ether",
  "bibliotheque",
  "coffre_tresor",
  "fontaine_stellaire",
];

const GUILD_HALL_LEVELS = [
  { level: 1, gridW: 6, gridH: 4, maxFurniture: 12, upgradeCost: 0 },
  { level: 2, gridW: 8, gridH: 5, maxFurniture: 20, upgradeCost: 2000 },
  { level: 3, gridW: 10, gridH: 6, maxFurniture: 32, upgradeCost: 5000 },
];

function getGuildHallLevel(level: number) {
  return GUILD_HALL_LEVELS[Math.min(level - 1, GUILD_HALL_LEVELS.length - 1)]!;
}

function formatVisitTime(visitedAt: number): string {
  const diff = Date.now() - visitedAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default function CloudGuildHallScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const myGuildId = useGameStore((s) => s.guildId);
  const viewingGuildHallId = useGameStore((s) => s.viewingGuildHallId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setViewingGuildHall = useGameStore((s) => s.setViewingGuildHall);

  const guildId = (viewingGuildHallId ?? myGuildId)! as Id<"guilds">;
  const isOwnGuild = !viewingGuildHallId || viewingGuildHallId === myGuildId;

  const [tab, setTab] = useState<"hall" | "social" | "browse" | "shop">("hall");
  const [error, setError] = useState("");
  const visitedRef = useRef(false);

  const guild = useQuery(api.social.getGuild, isOwnGuild ? { guildId } : "skip");
  const ownHall = useQuery(api.guildHall.getGuildHall, isOwnGuild ? { guildId } : "skip");
  const publicHall = useQuery(api.guildHall.getGuildHallPublic, !isOwnGuild ? { guildId } : "skip");
  const hall = isOwnGuild ? ownHall : publicHall;
  const publicHalls = useQuery(api.guildHall.listPublicGuildHalls, { limit: 15 });
  const recentVisitors = useQuery(api.guildHall.listGuildHallVisitors, { guildId, limit: 15 });

  const initGuildHall = useMutation(api.guildHall.initGuildHall);
  const placeFurniture = useMutation(api.guildHall.placeGuildFurniture);
  const removeFurniture = useMutation(api.guildHall.removeGuildFurniture);
  const upgradeHall = useMutation(api.guildHall.upgradeGuildHall);
  const visitHall = useMutation(api.guildHall.visitGuildHall);

  useEffect(() => {
    if (isOwnGuild && ownHall === null) {
      void initGuildHall({ guildId });
    }
  }, [ownHall, guildId, initGuildHall, isOwnGuild]);

  useEffect(() => {
    if (visitedRef.current) return;
    visitedRef.current = true;
    void visitHall({
      guildId,
      visitorId: characterId,
      visitorName: characterName,
      message: isOwnGuild ? "🏠 De retour au hall" : "👋 Salut !",
    });
  }, [guildId, characterId, characterName, visitHall, isOwnGuild]);

  const level = hall?.level ?? 1;
  const hallConfig = getGuildHallLevel(level);
  const treasury = isOwnGuild ? (guild?.treasury ?? 0) : 0;
  const furniture = hall?.furniture ?? [];
  const visitors = hall?.visitors ?? 0;
  const guildName = isOwnGuild ? guild?.name : publicHall?.guildName;
  const guildTag = isOwnGuild ? guild?.tag : publicHall?.guildTag;
  const nextUpgrade = isOwnGuild && level < 3 ? getGuildHallLevel(level + 1) : null;

  const handleBuy = async (itemId: string) => {
    const item = getFurnitureById(itemId);
    if (!item || treasury < item.cost) return;
    const x = Math.floor(Math.random() * Math.max(1, hallConfig.gridW - item.size.w));
    const y = Math.floor(Math.random() * Math.max(1, hallConfig.gridH - item.size.h));
    try {
      await placeFurniture({ guildId, characterId, characterName, itemId, x, y });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeHall({ guildId, characterId });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removeFurniture({ guildId, characterId, index });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const postEmote = async (message: string) => {
    try {
      await visitHall({ guildId, visitorId: characterId, visitorName: characterName, message });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < hallConfig.gridH; y++) {
      for (let x = 0; x < hallConfig.gridW; x++) {
        const placed = furniture.find((f) => f.x === x && f.y === y);
        const item = placed ? getFurnitureById(placed.itemId) : null;
        const idx = furniture.findIndex((f) => f.x === x && f.y === y);

        cells.push(
          <button
            key={`${x}-${y}`}
            onClick={() => isOwnGuild && item && void handleRemove(idx)}
            disabled={!isOwnGuild}
            className={`aspect-square rounded-lg flex items-center justify-center text-lg border ${
              item ? "bg-aether-800 border-aether-500" : "bg-aether-950/50 border-aether-800/50"
            }`}
          >
            {item?.icon ?? ""}
          </button>
        );
      }
    }
    return cells;
  };

  if (hall === undefined || (isOwnGuild && guild === undefined)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-aether-950 text-aether-400">
        Synchronisation du guild hall...
      </div>
    );
  }

  const back = () => {
    if (viewingGuildHallId) {
      setViewingGuildHall(null);
      setScreen("friends");
      return;
    }
    setScreen("guild");
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={back} className="text-aether-400 text-xl">←</button>
        <div>
          <h1 className="font-display text-xl font-bold">🏰 Guild Hall</h1>
          {guildTag && (
            <p className="text-aether-500 text-xs">[{guildTag}] {guildName}</p>
          )}
        </div>
        {viewingGuildHallId && myGuildId && (
          <button
            onClick={() => {
              setViewingGuildHall(null);
              visitedRef.current = false;
              setTab("hall");
            }}
            className="btn-secondary text-xs py-1 px-2"
          >
            Mon hall
          </button>
        )}
        <span className="ml-auto text-green-400/70 text-xs">
          {isOwnGuild ? "☁️ Mon hall" : "👀 Visite"}
        </span>
        {isOwnGuild && <span className="text-crystal-gold text-sm">💰 {treasury}</span>}
      </div>

      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <p className="text-aether-300 text-sm">Niveau {level}</p>
          <p className="text-aether-500 text-xs">
            {furniture.length}/{hallConfig.maxFurniture} meubles • {visitors} visiteurs
          </p>
        </div>
        {nextUpgrade && (
          <button onClick={() => void handleUpgrade()} className="btn-secondary text-xs py-1 px-3">
            Améliorer (💰 {nextUpgrade.upgradeCost})
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs px-4">{error}</p>}

      {!isOwnGuild && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {GUILD_HALL_EMOTES.map((e) => (
            <button
              key={e.id}
              onClick={() => void postEmote(e.message)}
              className="btn-secondary text-xs py-1 px-2"
            >
              {e.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-2">
        <div
          className="grid gap-1 p-2 bg-aether-900/40 rounded-xl border border-aether-700/30"
          style={{ gridTemplateColumns: `repeat(${hallConfig.gridW}, 1fr)` }}
        >
          {renderGrid()}
        </div>
        {isOwnGuild && (
          <p className="text-aether-600 text-xs text-center mt-1">Appuyez sur un meuble pour le retirer</p>
        )}
      </div>

      <div className="flex border-t border-aether-700/40 mt-2">
        {(["hall", "social", ...(isOwnGuild ? ["shop"] as const : []), "browse"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs ${tab === t ? "text-aether-300 border-b-2 border-aether-500" : "text-aether-500"}`}
          >
            {t === "hall" ? "Hall" : t === "social" ? "Social" : t === "shop" ? "Boutique" : "Explorer"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "social" && (
          (recentVisitors ?? []).length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">Aucune visite récente</p>
          ) : (
            (recentVisitors ?? []).map((v, i) => (
              <div key={i} className="card mb-2 py-2">
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm font-semibold">{v.visitorName}</p>
                  <span className="text-aether-600 text-[10px]">{formatVisitTime(v.visitedAt)}</span>
                </div>
                <p className="text-aether-400 text-xs mt-1">{v.message}</p>
              </div>
            ))
          )
        )}

        {tab === "browse" && (
          (publicHalls ?? []).map((g) => (
            <button
              key={g.guildId}
              onClick={() => {
                setViewingGuildHall(g.guildId);
                visitedRef.current = false;
                setTab("hall");
              }}
              disabled={g.guildId === guildId}
              className="card mb-2 w-full text-left disabled:opacity-50"
            >
              <div className="flex justify-between items-center">
                <p className="text-white text-sm font-bold">[{g.guildTag}] {g.guildName}</p>
                <span className="text-aether-500 text-xs">Nv.{g.level}</span>
              </div>
              <p className="text-aether-500 text-xs mt-1">
                {g.furnitureCount} meubles • {g.visitors} visiteurs
              </p>
            </button>
          ))
        )}

        {tab === "shop" && isOwnGuild && (
          FURNITURE.filter((f) => GUILD_FURNITURE_IDS.includes(f.id)).map((item) => (
            <div key={item.id} className="card mb-2 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-aether-500 text-xs">{item.description}</p>
              </div>
              <button
                onClick={() => void handleBuy(item.id)}
                disabled={treasury < item.cost}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                💰 {item.cost}
              </button>
            </div>
          ))
        )}

        {tab === "hall" && isOwnGuild && furniture.length > 0 && (
          furniture.map((f, i) => {
            const item = getFurnitureById(f.itemId);
            const placedByName = "placedByName" in f ? f.placedByName : "";
            return item ? (
              <div key={i} className="card mb-2 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-aether-300 text-sm">{item.name}</p>
                  {placedByName && <p className="text-aether-600 text-xs">par {placedByName}</p>}
                </div>
                <button onClick={() => void handleRemove(i)} className="text-red-400 text-xs">Retirer</button>
              </div>
            ) : null;
          })
        )}
      </div>
    </div>
  );
}
