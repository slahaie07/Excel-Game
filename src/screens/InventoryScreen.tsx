import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { getItemById, EQUIPMENT_SLOTS, type EquipmentSlot } from "../game/data";
import { loadCharacter } from "../lib/characterStorage";
import { equipItem, unequipItem, useConsumable } from "../lib/inventoryActions";
import { EQUIPMENT_SLOT_LABELS } from "../lib/gameTerms";

export default function InventoryScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const charData = loadCharacter(characterId);
  if (!charData) {
    return (
      <div className="flex-1 flex items-center justify-center text-aether-400">
        Personnage introuvable
      </div>
    );
  }

  const inventory = charData.inventory ?? [];
  const equipment = charData.equipment ?? {};

  const handleEquip = (itemId: string) => {
    if (equipItem(characterId, itemId)) refresh();
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    if (unequipItem(characterId, slot)) refresh();
  };

  const handleUse = (itemId: string) => {
    const err = useConsumable(characterId, itemId);
    if (!err) refresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Inventaire</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {charData.eclats ?? 0}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-aether-400 text-sm mb-3">Équipement</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {EQUIPMENT_SLOTS.map((slot) => {
            const itemId = equipment[slot];
            const item = itemId ? getItemById(itemId) : null;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => item && handleUnequip(slot)}
                className="card-premium p-3 text-center min-h-[80px] flex flex-col items-center justify-center"
              >
                {item ? (
                  <>
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-[10px] text-aether-300 mt-1">{item.name}</p>
                    <p className="text-[8px] text-aether-600">Retirer</p>
                  </>
                ) : (
                  <p className="text-aether-600 text-xs">{EQUIPMENT_SLOT_LABELS[slot] ?? slot}</p>
                )}
              </button>
            );
          })}
        </div>

        <h2 className="text-aether-400 text-sm mb-3">Sac ({inventory.length} piles)</h2>
        <div className="grid grid-cols-2 gap-2">
          {inventory.map((inv) => {
            const item = getItemById(inv.itemId);
            if (!item) return null;
            const isEquip = EQUIPMENT_SLOTS.includes(item.type as EquipmentSlot);
            const isConsumable = item.type === "consumable";
            return (
              <div key={inv.itemId} className="card-premium p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-aether-200 font-medium truncate">{item.name}</p>
                    <p className="text-[9px] text-aether-500">x{inv.quantity}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {isEquip && (
                    <button
                      type="button"
                      onClick={() => handleEquip(inv.itemId)}
                      className="btn-secondary text-[10px] py-0.5 px-2 flex-1"
                    >
                      Équiper
                    </button>
                  )}
                  {isConsumable && (
                    <button
                      type="button"
                      onClick={() => handleUse(inv.itemId)}
                      className="btn-primary text-[10px] py-0.5 px-2 flex-1"
                    >
                      Utiliser
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
