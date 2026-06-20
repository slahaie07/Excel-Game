import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import {
  getActiveEvent,
  getEventTimeRemaining,
  type EventQuest,
} from "../game/data/events";
import { loadCharacter, saveCharacter, addXp } from "../lib/characterStorage";
import { getMonsterIcon } from "../game/rendering/isometric";

interface EventProgress {
  eventId: string;
  quests: { questId: string; objectives: { current: number; required: number }[]; completed: boolean }[];
  shopPurchases: Record<string, number>;
}

function loadEventProgress(characterId: string): EventProgress | null {
  try {
    const raw = localStorage.getItem(`aetheris-event-${characterId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveEventProgress(characterId: string, progress: EventProgress) {
  localStorage.setItem(`aetheris-event-${characterId}`, JSON.stringify(progress));
}

export default function EventsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const zoneId = useGameStore((s) => s.zoneId);

  const [tab, setTab] = useState<"overview" | "quests" | "shop">("overview");
  const activeEvent = getActiveEvent();
  const char = loadCharacter(characterId);

  if (!activeEvent) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950">
        <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
          <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
          <h1 className="font-display text-xl font-bold">Événements</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-aether-300">Aucun événement saisonnier en cours.</p>
          <p className="text-aether-500 text-sm mt-2">Revenez bientôt pour des aventures exclusives !</p>
        </div>
      </div>
    );
  }

  const progress = loadEventProgress(characterId);
  const timeLeft = getEventTimeRemaining(activeEvent);

  const startEventCombat = (monsterId: string) => {
    const combatId = `event_${Date.now()}`;
    localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
      type: "event",
      eventId: activeEvent.id,
      monsterIds: [monsterId],
      zoneId,
      characterId,
      xpMultiplier: activeEvent.bonuses.xpMultiplier,
      eclatsMultiplier: activeEvent.bonuses.eclatsMultiplier,
    }));
    setCombat(combatId);
  };

  const acceptQuest = (quest: EventQuest) => {
    const current = progress ?? { eventId: activeEvent.id, quests: [], shopPurchases: {} };
    if (current.quests.some((q) => q.questId === quest.id)) return;

    current.quests.push({
      questId: quest.id,
      objectives: quest.objectives.map((o) => ({ current: 0, required: o.count })),
      completed: false,
    });
    saveEventProgress(characterId, current);
    window.location.reload();
  };

  const buyShopItem = (itemId: string, cost: number, currency: "eclats" | "stardust") => {
    if (!char) return;
    if (currency === "eclats" && char.eclats < cost) return;

    const inventory = [...char.inventory];
    const existing = inventory.find((i) => i.itemId === itemId);
    if (existing) existing.quantity += 1;
    else inventory.push({ itemId, quantity: 1 });

    saveCharacter(characterId, {
      ...char,
      eclats: currency === "eclats" ? char.eclats - cost : char.eclats,
      inventory,
    });

    const current = progress ?? { eventId: activeEvent.id, quests: [], shopPurchases: {} };
    current.shopPurchases[itemId] = (current.shopPurchases[itemId] ?? 0) + 1;
    saveEventProgress(characterId, current);
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40" style={{ borderColor: activeEvent.color + "40" }}>
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <span className="text-2xl">{activeEvent.icon}</span>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold" style={{ color: activeEvent.color }}>{activeEvent.name}</h1>
          <p className="text-aether-500 text-xs">Se termine dans {timeLeft}</p>
        </div>
      </div>

      {/* Bonus banner */}
      <div className="mx-4 mt-3 card py-2 px-3 flex justify-around text-center" style={{ borderColor: activeEvent.color + "60" }}>
        <div>
          <p className="text-green-400 font-bold text-sm">x{activeEvent.bonuses.xpMultiplier}</p>
          <p className="text-aether-500 text-[10px]">XP</p>
        </div>
        <div>
          <p className="text-crystal-gold font-bold text-sm">x{activeEvent.bonuses.eclatsMultiplier}</p>
          <p className="text-aether-500 text-[10px]">Éclats</p>
        </div>
        <div>
          <p className="text-purple-400 font-bold text-sm">+{Math.round(activeEvent.bonuses.dropRateBonus * 100)}%</p>
          <p className="text-aether-500 text-[10px]">Drop</p>
        </div>
      </div>

      <div className="flex border-b border-aether-700/40 mx-4 mt-3">
        {(["overview", "quests", "shop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm capitalize ${tab === t ? "text-aether-200 border-b-2" : "text-aether-500"}`}
            style={tab === t ? { borderColor: activeEvent.color } : {}}
          >
            {t === "overview" ? "Aperçu" : t === "quests" ? "Quêtes" : "Boutique"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <p className="text-aether-300 text-sm">{activeEvent.description}</p>

            <section>
              <h2 className="text-aether-400 text-sm mb-2">Monstres exclusifs</h2>
              {activeEvent.exclusiveMonsters.map((mId) => (
                <div key={mId} className="card mb-2 flex items-center gap-3">
                  <span className="text-2xl">{getMonsterIcon(mId)}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold capitalize">{mId.replace(/_/g, " ")}</p>
                    <p className="text-aether-500 text-xs">Monstre d'événement</p>
                  </div>
                  <button
                    onClick={() => startEventCombat(mId)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Combattre
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "quests" && (
          <div className="space-y-3">
            {activeEvent.quests.map((quest) => {
              const qProgress = progress?.quests.find((q) => q.questId === quest.id);
              const isDone = qProgress?.completed;
              const isActive = qProgress && !isDone;

              return (
                <div key={quest.id} className="card">
                  <p className="font-bold text-white text-sm">{quest.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{quest.description}</p>
                  <p className="text-crystal-gold text-xs mt-1">
                    +{quest.rewards.xp} XP • +{quest.rewards.eclats} ✦
                  </p>
                  {isActive && qProgress.objectives.map((obj, i) => (
                    <div key={i} className="mt-2">
                      <div className="flex justify-between text-xs text-aether-500 mb-1">
                        <span>{quest.objectives[i]?.description}</span>
                        <span>{obj.current}/{obj.required}</span>
                      </div>
                      <div className="h-1.5 bg-aether-950 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(obj.current / obj.required) * 100}%`, backgroundColor: activeEvent.color }}
                        />
                      </div>
                    </div>
                  ))}
                  {isDone && <p className="text-green-400 text-xs mt-2">✅ Terminée</p>}
                  {!qProgress && (
                    <button onClick={() => acceptQuest(quest)} className="btn-secondary text-xs py-1 px-3 mt-2">
                      Accepter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "shop" && (
          <div className="space-y-2">
            {activeEvent.shopItems.map((item) => {
              const bought = progress?.shopPurchases[item.itemId] ?? 0;
              const remaining = item.stock - bought;
              return (
                <div key={item.itemId} className="card flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{item.name}</p>
                    <p className="text-aether-500 text-xs">Stock : {remaining}/{item.stock}</p>
                  </div>
                  <button
                    onClick={() => buyShopItem(item.itemId, item.cost, item.currency)}
                    disabled={remaining <= 0 || (item.currency === "eclats" && (char?.eclats ?? 0) < item.cost)}
                    className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                  >
                    {item.currency === "eclats" ? `✦ ${item.cost}` : `✧ ${item.cost}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function getEventBonuses(): { xpMultiplier: number; eclatsMultiplier: number } {
  const event = getActiveEvent();
  return event
    ? { xpMultiplier: event.bonuses.xpMultiplier, eclatsMultiplier: event.bonuses.eclatsMultiplier }
    : { xpMultiplier: 1, eclatsMultiplier: 1 };
}

export function recordEventKill(characterId: string, monsterId: string, eventId: string) {
  const activeEvent = getActiveEvent();
  if (!activeEvent || activeEvent.id !== eventId) return;

  const raw = localStorage.getItem(`aetheris-event-${characterId}`);
  if (!raw) return;

  try {
    const progress: EventProgress = JSON.parse(raw);
    let changed = false;

    for (const quest of progress.quests) {
      if (quest.completed) continue;
      const questDef = activeEvent.quests.find((q) => q.id === quest.questId);
      if (!questDef) continue;

      questDef.objectives.forEach((obj, i) => {
        if (obj.type === "kill" && (obj.targetId === monsterId || obj.targetId === "any")) {
          const current = quest.objectives[i];
          if (current && current.current < current.required) {
            current.current += 1;
            changed = true;
          }
        }
      });

      const allDone = quest.objectives.every((o) => o.current >= o.required);
      if (allDone && !quest.completed) {
        quest.completed = true;
        const char = loadCharacter(characterId);
        if (char) {
          addXp(characterId, questDef.rewards.xp);
          saveCharacter(characterId, {
            ...char,
            eclats: char.eclats + questDef.rewards.eclats,
          });
        }
        changed = true;
      }
    }

    if (changed) saveEventProgress(characterId, progress);
  } catch {
    // ignore corrupt progress
  }
}
