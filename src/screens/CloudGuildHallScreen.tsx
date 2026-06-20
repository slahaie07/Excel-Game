import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { FURNITURE, getFurnitureById } from "../game/data";

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

export default function CloudGuildHallScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const guildId = useGameStore((s) => s.guildId)! as Id<"guilds">;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"decorate" | "shop">("decorate");
  const [error, setError] = useState("");

  const guild = useQuery(api.social.getGuild, { guildId });
  const hall = useQuery(api.guildHall.getGuildHall, { guildId });
  const initGuildHall = useMutation(api.guildHall.initGuildHall);
  const placeFurniture = useMutation(api.guildHall.placeGuildFurniture);
  const removeFurniture = useMutation(api.guildHall.removeGuildFurniture);
  const upgradeHall = useMutation(api.guildHall.upgradeGuildHall);
  const visitHall = useMutation(api.guildHall.visitGuildHall);

  useEffect(() => {
    if (hall === null) {
      void initGuildHall({ guildId });
    }
  }, [hall, guildId, initGuildHall]);

  useEffect(() => {
    void visitHall({ guildId, visitorId: characterId });
  }, [guildId, characterId, visitHall]);

  const level = hall?.level ?? 1;
  const hallConfig = getGuildHallLevel(level);
  const treasury = guild?.treasury ?? 0;
  const furniture = hall?.furniture ?? [];
  const visitors = hall?.visitors ?? 0;
  const nextUpgrade = level < 3 ? getGuildHallLevel(level + 1) : null;

  const handleBuy = async (itemId: string) => {
    const item = getFurnitureById(itemId);
    if (!item || treasury < item.cost) return;
    const x = Math.floor(Math.random() * Math.max(1, hallConfig.gridW - item.size.w));
    const y = Math.floor(Math.random() * Math.max(1, hallConfig.gridH - item.size.h));
    try {
      await placeFurniture({
        guildId,
        characterId,
        characterName,
        itemId,
        x,
        y,
      });
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
            onClick={() => item && void handleRemove(idx)}
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

  if (hall === undefined || guild === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-aether-950 text-aether-400">
        Synchronisation du guild hall...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("guild")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">🏰 Guild Hall</h1>
        <span className="ml-auto text-green-400/70 text-xs">☁️ Partagé</span>
        <span className="text-crystal-gold text-sm">💰 {treasury}</span>
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

      <div className="px-4 pb-2">
        <div
          className="grid gap-1 p-2 bg-aether-900/40 rounded-xl border border-aether-700/30"
          style={{ gridTemplateColumns: `repeat(${hallConfig.gridW}, 1fr)` }}
        >
          {renderGrid()}
        </div>
        <p className="text-aether-600 text-xs text-center mt-1">Appuyez sur un meuble pour le retirer</p>
      </div>

      <div className="flex border-t border-aether-700/40 mt-2">
        {(["decorate", "shop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm ${tab === t ? "text-aether-300 border-b-2 border-aether-500" : "text-aether-500"}`}
          >
            {t === "decorate" ? "Meubles" : "Boutique"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "shop" ? (
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
        ) : furniture.length === 0 ? (
          <p className="text-aether-500 text-sm text-center py-4">Achetez des meubles avec le trésor de guilde !</p>
        ) : (
          furniture.map((f, i) => {
            const item = getFurnitureById(f.itemId);
            return item ? (
              <div key={i} className="card mb-2 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-aether-300 text-sm">{item.name}</p>
                  <p className="text-aether-600 text-xs">par {f.placedByName}</p>
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
