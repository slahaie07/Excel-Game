import { useGameStore } from "../stores/gameStore";
import { getItemById, EQUIPMENT_SLOTS } from "../game/data";

export default function InventoryScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
  const inventory: { itemId: string; quantity: number }[] = charData.inventory ?? [];
  const equipment = charData.equipment ?? {};

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Inventaire</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {charData.eclats ?? 0}</span>
      </div>

      <div className="p-4">
        <h2 className="text-aether-400 text-sm mb-3">Équipement</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {EQUIPMENT_SLOTS.map((slot) => {
            const itemId = equipment[slot];
            const item = itemId ? getItemById(itemId) : null;
            return (
              <div key={slot} className="card p-3 text-center min-h-[80px] flex flex-col items-center justify-center">
                {item ? (
                  <>
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-[10px] text-aether-300 mt-1">{item.name}</p>
                  </>
                ) : (
                  <p className="text-aether-600 text-xs capitalize">{slot}</p>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="text-aether-400 text-sm mb-3">Sac ({inventory.length} objets)</h2>
        <div className="grid grid-cols-4 gap-2">
          {inventory.map((inv) => {
            const item = getItemById(inv.itemId);
            if (!item) return null;
            return (
              <div key={inv.itemId} className="card p-2 text-center">
                <span className="text-xl">{item.icon}</span>
                <p className="text-[9px] text-aether-400 mt-1 truncate">{item.name}</p>
                {inv.quantity > 1 && (
                  <span className="text-[10px] text-aether-500">x{inv.quantity}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
