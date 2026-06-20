import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { FURNITURE, getFurnitureById, getHavenLevel } from "../game/data";
import { loadCharacter, saveCharacter, type HavenData } from "../lib/characterStorage";

export default function HavenScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"decorate" | "shop">("decorate");

  const char = loadCharacter(characterId);
  const haven: HavenData = char?.haven ?? { level: 1, furniture: [], visitors: 0 };
  const havenLevel = getHavenLevel(haven.level);
  const eclats = char?.eclats ?? 0;

  const saveHaven = (updated: HavenData) => {
    if (!char) return;
    saveCharacter(characterId, { ...char, haven: updated });
  };

  const buyFurniture = (itemId: string) => {
    const item = getFurnitureById(itemId);
    if (!item || !char) return;
    if (eclats < item.cost) return;
    if (haven.furniture.length >= havenLevel.maxFurniture) return;

    const x = Math.floor(Math.random() * (havenLevel.gridSize.w - item.size.w));
    const y = Math.floor(Math.random() * (havenLevel.gridSize.h - item.size.h));

    saveCharacter(characterId, {
      ...char,
      eclats: eclats - item.cost,
      haven: {
        ...haven,
        furniture: [...haven.furniture, { itemId, x, y }],
      },
    });
    window.location.reload();
  };

  const upgradeHaven = () => {
    if (!char || haven.level >= 5) return;
    const nextLevel = getHavenLevel(haven.level + 1);
    const cost = nextLevel.upgradeCost;
    if (eclats < cost) return;

    saveCharacter(characterId, {
      ...char,
      eclats: eclats - cost,
      haven: { ...haven, level: haven.level + 1 },
    });
    window.location.reload();
  };

  const removeFurniture = (index: number) => {
    saveHaven({
      ...haven,
      furniture: haven.furniture.filter((_, i) => i !== index),
    });
    window.location.reload();
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < havenLevel.gridSize.h; y++) {
      for (let x = 0; x < havenLevel.gridSize.w; x++) {
        const placed = haven.furniture.find((f) => f.x === x && f.y === y);
        const item = placed ? getFurnitureById(placed.itemId) : null;
        const idx = haven.furniture.findIndex((f) => f.x === x && f.y === y);

        cells.push(
          <button
            key={`${x}-${y}`}
            onClick={() => item && removeFurniture(idx)}
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

  const nextUpgrade = haven.level < 5 ? getHavenLevel(haven.level + 1) : null;

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Mon Havre</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {eclats}</span>
      </div>

      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <p className="text-aether-300 text-sm">Niveau {haven.level}</p>
          <p className="text-aether-500 text-xs">
            {haven.furniture.length}/{havenLevel.maxFurniture} meubles • {haven.visitors} visiteurs
          </p>
        </div>
        {nextUpgrade && (
          <button onClick={upgradeHaven} className="btn-secondary text-xs py-1 px-3">
            Améliorer (✦ {nextUpgrade.upgradeCost})
          </button>
        )}
      </div>

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
                {item.bonus && (
                  <p className="text-green-400 text-xs">+{item.bonus.value} {item.bonus.type}</p>
                )}
              </div>
              <button
                onClick={() => buyFurniture(item.id)}
                disabled={eclats < item.cost}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                ✦ {item.cost}
              </button>
            </div>
          ))
        ) : (
          haven.furniture.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">Achetez des meubles dans la boutique !</p>
          ) : (
            haven.furniture.map((f, i) => {
              const item = getFurnitureById(f.itemId);
              return item ? (
                <div key={i} className="card mb-2 flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-aether-300 text-sm flex-1">{item.name}</p>
                  <button onClick={() => removeFurniture(i)} className="text-red-400 text-xs">Retirer</button>
                </div>
              ) : null;
            })
          )
        )}
      </div>
    </div>
  );
}
