import { useGameStore } from "../stores/gameStore";
import { QUESTS, getQuestById } from "../game/data";

interface ActiveQuest {
  questId: string;
  status: string;
  objectives: { description: string; current: number; required: number }[];
}

export default function QuestsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
  const activeQuests: ActiveQuest[] = charData.activeQuests ?? [];
  const completedQuests: string[] = charData.completedQuests ?? [];

  const startQuest = (questId: string) => {
    const quest = getQuestById(questId);
    if (!quest) return;

    const updated = {
      ...charData,
      activeQuests: [
        ...activeQuests,
        {
          questId,
          status: "active",
          objectives: quest.objectives.map((o) => ({
            ...o,
            current: 0,
            required: o.count,
          })),
        },
      ],
    };
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(updated));
  };

  const availableQuests = QUESTS.filter(
    (q) => !completedQuests.includes(q.id) && !activeQuests.some((aq) => aq.questId === q.id)
  );

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Quêtes</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeQuests.length > 0 && (
          <section>
            <h2 className="text-aether-400 text-sm mb-2">En cours</h2>
            {activeQuests.map((aq) => {
              const quest = getQuestById(aq.questId);
              if (!quest) return null;
              return (
                <div key={aq.questId} className="card mb-2">
                  <p className="font-bold text-white text-sm">{quest.name}</p>
                  <p className="text-aether-400 text-xs mb-2">{quest.description}</p>
                  {aq.objectives?.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-aether-950 rounded-full h-2">
                        <div
                          className="h-full bg-aether-500 rounded-full"
                          style={{ width: `${(obj.current / obj.required) * 100}%` }}
                        />
                      </div>
                      <span className="text-aether-500">{obj.current}/{obj.required}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        <section>
          <h2 className="text-aether-400 text-sm mb-2">Disponibles</h2>
          {availableQuests.map((quest) => (
            <div key={quest.id} className="card mb-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white text-sm">
                    {quest.type === "main" ? "⭐ " : quest.type === "daily" ? "🔄 " : ""}
                    {quest.name}
                  </p>
                  <p className="text-aether-400 text-xs mt-1">{quest.description}</p>
                  <p className="text-aether-500 text-xs mt-1">
                    Récompense : {quest.rewards.xp} XP, {quest.rewards.eclats} ✦
                  </p>
                </div>
                <button
                  onClick={() => startQuest(quest.id)}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  Accepter
                </button>
              </div>
            </div>
          ))}
        </section>

        {completedQuests.length > 0 && (
          <section>
            <h2 className="text-aether-400 text-sm mb-2">Terminées ({completedQuests.length})</h2>
            {completedQuests.map((id: string) => {
              const quest = getQuestById(id);
              return quest ? (
                <div key={id} className="card mb-2 opacity-60">
                  <p className="text-aether-300 text-sm">✅ {quest.name}</p>
                </div>
              ) : null;
            })}
          </section>
        )}
      </div>
    </div>
  );
}
