import { useGameStore } from "../../store/gameStore";
import { QUESTS } from "../../data/quests";

export function QuestPanel() {
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);

  if (!player) return null;

  const mainQuests = Object.values(QUESTS).filter((q) => q.type === "main");
  const sideQuests = Object.values(QUESTS).filter((q) => q.type === "side");
  const dailyQuests = Object.values(QUESTS).filter((q) => q.type === "daily");
  const dungeonQuests = Object.values(QUESTS).filter((q) => q.type === "dungeon");

  const renderQuest = (quest: (typeof QUESTS)[string]) => {
    const progress = player.questProgress[quest.id];
    const status = progress?.status ?? "available";
    return (
      <div key={quest.id} className={`quest-card quest-${status}`}>
        <div className="quest-header">
          <h4>{quest.name}</h4>
          <span className="quest-type">{quest.type}</span>
        </div>
        <p className="quest-desc">{quest.description}</p>
        <div className="quest-objectives">
          {quest.objectives.map((obj) => {
            const current = progress?.objectives[obj.id] ?? 0;
            return (
              <div key={obj.id} className="quest-obj">
                <span>{obj.description}</span>
                <span className="quest-progress">
                  {current}/{obj.quantity}
                </span>
              </div>
            );
          })}
        </div>
        <div className="quest-rewards">
          <span>✨ {quest.rewards.xp} XP</span>
          <span>💰 {quest.rewards.kamas}</span>
          {quest.rewards.items?.map((item) => (
            <span key={item.itemId}>🎁 x{item.quantity}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="panel-overlay">
      <div className="panel panel-wide">
        <div className="panel-header">
          <h2>📜 Journal de Quêtes</h2>
          <button className="btn-close" onClick={() => setScreen("world")}>✕</button>
        </div>

        <section>
          <h3 className="section-title">Quêtes Principales</h3>
          {mainQuests.map(renderQuest)}
        </section>
        <section>
          <h3 className="section-title">Quêtes Secondaires</h3>
          {sideQuests.map(renderQuest)}
        </section>
        <section>
          <h3 className="section-title">Quêtes Quotidiennes</h3>
          {dailyQuests.map(renderQuest)}
        </section>
        <section>
          <h3 className="section-title">Donjons</h3>
          {dungeonQuests.map(renderQuest)}
        </section>
      </div>
    </div>
  );
}
