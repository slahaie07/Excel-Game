import { useGameStore } from "../../store/gameStore";
import { ITEMS, RARITY_COLORS } from "../../data/items";

export function InventoryPanel() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const equipItem = useGameStore((s) => s.equipItem);

  if (!player) return null;

  const slots = Array.from({ length: 30 }, (_, i) => {
    return player.inventory.find((s) => s.slot === i) ?? null;
  });

  return (
    <div className="panel-overlay">
      <div className="panel">
        <div className="panel-header">
          <h2>🎒 Inventaire</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <div className="equipment-slots">
          {(["helmet", "weapon", "armor", "shield", "boots", "amulet", "ring"] as const).map(
            (slot) => {
              const itemId = player.equipment[slot];
              const item = itemId ? ITEMS[itemId] : null;
              return (
                <div key={slot} className="equip-slot" title={slot}>
                  {item ? (
                    <span style={{ color: RARITY_COLORS[item.rarity] }}>
                      {item.icon}
                    </span>
                  ) : (
                    <span className="equip-empty">{slot[0]?.toUpperCase()}</span>
                  )}
                </div>
              );
            },
          )}
        </div>

        <div className="inventory-grid">
          {slots.map((slot, i) => {
            if (!slot) {
              return <div key={i} className="inv-slot empty" />;
            }
            const item = ITEMS[slot.itemId];
            if (!item) return <div key={i} className="inv-slot empty" />;
            return (
              <button
                key={i}
                className="inv-slot"
                style={{ borderColor: RARITY_COLORS[item.rarity] }}
                onClick={() => equipItem(slot.itemId)}
                title={`${item.name} x${slot.quantity}`}
              >
                <span>{item.icon}</span>
                {slot.quantity > 1 && (
                  <span className="inv-qty">{slot.quantity}</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="panel-footer">💰 {player.kamas} Kamas</p>
      </div>
    </div>
  );
}
