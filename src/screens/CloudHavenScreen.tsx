import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { FURNITURE, getFurnitureById, getHavenLevel } from "../game/data";

export default function CloudHavenScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"decorate" | "shop">("decorate");
  const [error, setError] = useState("");

  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const haven = useQuery(api.havens.getHaven, { characterId });
  const createHaven = useMutation(api.havens.createHaven);
  const buyFurniture = useMutation(api.havens.buyFurniture);
  const removeFurnitureMut = useMutation(api.havens.removeFurniture);
  const upgradeHavenMut = useMutation(api.havens.upgradeHaven);

  useEffect(() => {
    if (haven === null && cloudChar) {
      void createHaven({ characterId });
    }
  }, [haven, cloudChar, characterId, createHaven]);

  const level = haven?.level ?? 1;
  const havenLevel = getHavenLevel(level);
  const eclats = cloudChar?.eclats ?? 0;
  const furniture = haven?.furniture ?? [];
  const visitors = haven?.visitors ?? 0;

  const handleBuy = async (itemId: string) => {
    const item = getFurnitureById(itemId);
    if (!item || eclats < item.cost) return;
    const x = Math.floor(Math.random() * Math.max(1, havenLevel.gridSize.w - item.size.w));
    const y = Math.floor(Math.random() * Math.max(1, havenLevel.gridSize.h - item.size.h));
    try {
      await buyFurniture({ characterId, itemId, x, y });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeHavenMut({ characterId });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removeFurnitureMut({ characterId, index });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < havenLevel.gridSize.h; y++) {
      for (let x = 0; x < havenLevel.gridSize.w; x++) {
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

  const nextUpgrade = level < 5 ? getHavenLevel(level + 1) : null;

  if (haven === undefined || cloudChar === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-aether-950 text-aether-400">
        Synchronisation du havre...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Mon Havre</h1>
        <span className="ml-auto text-green-400/70 text-xs">☁️ Sync</span>
        <span className="text-crystal-gold text-sm">✦ {eclats}</span>
      </div>

      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <p className="text-aether-300 text-sm">Niveau {level}</p>
          <p className="text-aether-500 text-xs">
            {furniture.length}/{havenLevel.maxFurniture} meubles • {visitors} visiteurs
          </p>
        </div>
        {nextUpgrade && (
          <button onClick={() => void handleUpgrade()} className="btn-secondary text-xs py-1 px-3">
            Améliorer (✦ {nextUpgrade.upgradeCost})
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs px-4">{error}</p>}

      <div className="px-4 pb-2">
        <div
          className="grid gap-1 p-2 bg-aether-900/40 rounded-xl border border-aether-700/30"
          style={{ gridTemplateColumns: `repeat(${havenLevel.gridSize.w}, 1fr)` }}
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
            {t === "decorate" ? "Mes meubles" : "Boutique"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "shop" ? (
          FURNITURE.filter((f) => f.cost > 0).map((item) => (
            <div key={item.id} className="card mb-2 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-aether-500 text-xs">{item.description}</p>
              </div>
              <button
                onClick={() => void handleBuy(item.id)}
                disabled={eclats < item.cost}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                ✦ {item.cost}
              </button>
            </div>
          ))
        ) : furniture.length === 0 ? (
          <p className="text-aether-500 text-sm text-center py-4">Achetez des meubles dans la boutique !</p>
        ) : (
          furniture.map((f, i) => {
            const item = getFurnitureById(f.itemId);
            return item ? (
              <div key={i} className="card mb-2 flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-aether-300 text-sm flex-1">{item.name}</p>
                <button onClick={() => void handleRemove(i)} className="text-red-400 text-xs">Retirer</button>
              </div>
            ) : null;
          })
        )}
      </div>
    </div>
  );
}
