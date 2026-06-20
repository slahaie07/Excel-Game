import { useGameStore } from "../../store/gameStore";
import { PROFESSIONS, ITEMS } from "../../data/items";

export function CraftPanel() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const addItem = useGameStore((s) => s.addItem);
  const removeItem = useGameStore((s) => s.removeItem);
  const addNotification = useGameStore((s) => s.addNotification);

  if (!player) return null;

  const craftableItems = Object.values(ITEMS).filter((i) => i.craftRecipe);

  const handleCraft = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item?.craftRecipe) return;

    for (const ing of item.craftRecipe.ingredients) {
      const slot = player.inventory.find((s) => s.itemId === ing.itemId);
      if (!slot || slot.quantity < ing.quantity) {
        addNotification("Ressources insuffisantes !", "warning");
        return;
      }
    }

    for (const ing of item.craftRecipe.ingredients) {
      removeItem(ing.itemId, ing.quantity);
    }
    addItem(itemId, 1);
    addNotification(`${item.name} fabriqué !`, "success");
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>🔨 Artisanat</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <div className="profession-list">
          <h3 className="section-title">Métiers</h3>
          <div className="feature-grid">
            {Object.entries(PROFESSIONS).map(([id, prof]) => {
              const level = player.professions[id]?.level ?? 1;
              return (
                <div key={id} className="feature-card">
                  <strong>{prof.name}</strong>
                  <span>Niv. {level}</span>
                  <p>{prof.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="craft-recipes">
          <h3 className="section-title">Recettes disponibles</h3>
          {craftableItems.map((item) => (
            <div key={item.id} className="craft-recipe">
              <div className="craft-info">
                <span>{item.icon} {item.name}</span>
                <span className="craft-prof">
                  {PROFESSIONS[item.craftRecipe!.profession].name} — Niv. {item.craftRecipe!.levelRequired}
                </span>
              </div>
              <div className="craft-ingredients">
                {item.craftRecipe!.ingredients.map((ing) => (
                  <span key={ing.itemId}>
                    {ITEMS[ing.itemId]?.icon} x{ing.quantity}
                  </span>
                ))}
              </div>
              <button className="btn-secondary" onClick={() => handleCraft(item.id)}>
                Fabriquer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
