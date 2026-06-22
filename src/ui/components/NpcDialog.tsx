import { useGameStore } from "../../store/gameStore";
import { NPCS, QUESTS } from "../../data/quests";
import { ITEMS } from "../../data/items";
import { acceptQuest } from "../../lib/questEngine";
import { saveCharacter } from "../../lib/saveManager";

export function NpcDialog() {
  const selectedNpc = useGameStore((s) => s.selectedNpc);
  const setSelectedNpc = useGameStore((s) => s.setSelectedNpc);
  const setScreen = useGameStore((s) => s.setScreen);
  const addNotification = useGameStore((s) => s.addNotification);
  const addItem = useGameStore((s) => s.addItem);
  const player = useGameStore((s) => s.player);

  if (!selectedNpc || !player) return null;

  const npc = NPCS[selectedNpc];
  if (!npc) return null;

  const handleShop = () => {
    setSelectedNpc(null);
    setScreen("shop");
  };

  const handleAcceptQuest = (questId: string) => {
    const quest = QUESTS[questId];
    if (!quest) return;
    const updated = acceptQuest(player, questId);
    if (!updated) {
      addNotification("Quête déjà terminée ou indisponible.", "warning");
      return;
    }
    useGameStore.setState({ player: updated });
    saveCharacter(updated);
    addNotification(`Quête acceptée : ${quest.name}`, "success");
  };

  const handleBuy = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (player.kamas < item.price) {
      addNotification("Pas assez de Kamas !", "warning");
      return;
    }
    useGameStore.getState().addKamas(-item.price);
    addItem(itemId, 1);
    addNotification(`${item.name} acheté !`, "success");
  };

  return (
    <div className="npc-overlay" onClick={() => setSelectedNpc(null)}>
      <div className="npc-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="npc-header">
          <span className="npc-icon">{npc.icon}</span>
          <h3>{npc.name}</h3>
          <button className="btn-close" onClick={() => setSelectedNpc(null)}>
            ✕
          </button>
        </div>
        <p className="npc-text">{npc.dialogues.greeting}</p>

        {npc.quests && npc.quests.length > 0 && (
          <div className="npc-actions">
            <p className="npc-text">{npc.dialogues.quest ?? "J'ai une mission pour toi."}</p>
            {npc.quests.map((questId) => {
              const quest = QUESTS[questId];
              if (!quest) return null;
              const status = player.questProgress[questId]?.status ?? "available";
              return (
                <div key={questId} className="npc-quest-offer">
                  <strong>{quest.name}</strong>
                  <p className="quest-desc">{quest.description}</p>
                  {status === "completed" ? (
                    <span className="quest-done">✅ Terminée</span>
                  ) : status === "active" ? (
                    <span className="quest-active-label">En cours...</span>
                  ) : (
                    <button className="btn-secondary" onClick={() => handleAcceptQuest(questId)}>
                      Accepter la quête
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {npc.shop && (
          <div className="npc-shop">
            <p>{npc.dialogues.shop ?? "Voici mes marchandises :"}</p>
            <div className="shop-items">
              {npc.shopItems?.map((itemId) => {
                const item = ITEMS[itemId];
                if (!item) return null;
                return (
                  <button
                    key={itemId}
                    className="shop-item-btn"
                    onClick={() => handleBuy(itemId)}
                  >
                    {item.icon} {item.name} — {item.price} 💰
                  </button>
                );
              })}
            </div>
            <button className="btn-secondary" onClick={handleShop}>
              Ouvrir la boutique
            </button>
          </div>
        )}

        {npc.role === "craft" && (
          <button className="btn-secondary" onClick={() => { setSelectedNpc(null); setScreen("craft"); }}>
            🔨 Atelier d&apos;artisanat
          </button>
        )}

        {npc.role === "bank" && (
          <p className="npc-text">{npc.dialogues.bank}</p>
        )}
      </div>
    </div>
  );
}
