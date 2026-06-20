import { useGameStore } from "../../store/gameStore";
import { ITEMS, RARITY_COLORS } from "../../data/items";

export function ShopPanel() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const addItem = useGameStore((s) => s.addItem);
  const addKamas = useGameStore((s) => s.addKamas);
  const addNotification = useGameStore((s) => s.addNotification);

  if (!player) return null;

  const shopItems = Object.values(ITEMS).filter(
    (i) => i.price > 0 && i.type !== "resource" && i.type !== "quest",
  );

  const buy = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (player.kamas < item.price) {
      addNotification("Pas assez de Kamas !", "warning");
      return;
    }
    addKamas(-item.price);
    addItem(itemId, 1);
    addNotification(`${item.name} acheté !`, "success");
  };

  const sell = (itemId: string) => {
    const slot = player.inventory.find((s) => s.itemId === itemId);
    if (!slot) return;
    const item = ITEMS[itemId];
    if (!item) return;
    const sellPrice = Math.floor(item.price * 0.5);
    useGameStore.getState().removeItem(itemId, 1);
    addKamas(sellPrice);
    addNotification(`Vendu pour ${sellPrice} Kamas`, "success");
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>🏪 Boutique</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>
        <p className="panel-footer">💰 {player.kamas} Kamas</p>

        <h3 className="section-title">Acheter</h3>
        <div className="shop-grid">
          {shopItems.map((item) => (
            <button
              key={item.id}
              className="shop-card"
              style={{ borderColor: RARITY_COLORS[item.rarity] }}
              onClick={() => buy(item.id)}
            >
              <span className="shop-icon">{item.icon}</span>
              <span className="shop-name">{item.name}</span>
              <span className="shop-price">{item.price} 💰</span>
            </button>
          ))}
        </div>

        <h3 className="section-title">Vendre</h3>
        <div className="shop-grid">
          {player.inventory.map((slot) => {
            const item = ITEMS[slot.itemId];
            if (!item) return null;
            return (
              <button
                key={slot.itemId}
                className="shop-card"
                onClick={() => sell(slot.itemId)}
              >
                <span className="shop-icon">{item.icon}</span>
                <span className="shop-name">{item.name} x{slot.quantity}</span>
                <span className="shop-price">{Math.floor(item.price * 0.5)} 💰</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
