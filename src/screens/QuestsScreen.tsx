import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { QUESTS, getQuestById, getZoneById } from "../game/data";
import { loadCharacter, saveCharacter } from "../lib/characterStorage";
import { meetsQuestPrerequisites } from "../lib/questProgress";
import { cloudStartQuest } from "../lib/cloudQuestProgress";
import { QUEST_TYPE_COLORS, QUEST_TYPE_LABELS } from "../lib/gameTerms";

interface ActiveQuest {
  questId: string;
  status: string;
  objectives: { description: string; current: number; required: number }[];
}

function QuestTypeChip({ type }: { type: string }) {
  const label = QUEST_TYPE_LABELS[type] ?? type;
  const colors = QUEST_TYPE_COLORS[type] ?? QUEST_TYPE_COLORS.side;
  return (
    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${colors}`}>
      {label}
    </span>
  );
}

export default function QuestsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [, setRefreshKey] = useState(0);

  const charData = loadCharacter(characterId);
  const activeQuests: ActiveQuest[] = (charData?.activeQuests as ActiveQuest[]) ?? [];
  const completedQuests: string[] = charData?.completedQuests ?? [];

  const startQuest = (questId: string) => {
    const quest = getQuestById(questId);
    if (!quest || !charData) return;

    saveCharacter(characterId, {
      ...charData,
      activeQuests: [
        ...activeQuests,
        {
          questId,
          status: "active",
          objectives: quest.objectives.map((o) => ({
            type: o.type,
            targetId: o.targetId,
            description: o.description,
            current: 0,
            required: o.count,
          })),
        },
      ],
    });
    cloudStartQuest(
      characterId,
      questId,
      quest.objectives.map((o) => ({
        type: o.type,
        targetId: o.targetId,
        current: 0,
        required: o.count,
      }))
    );
    setRefreshKey((k) => k + 1);
  };

  const availableQuests = QUESTS.filter(
    (q) =>
      !completedQuests.includes(q.id) &&
      !activeQuests.some((aq) => aq.questId === q.id) &&
      meetsQuestPrerequisites(q, completedQuests)
  );

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Quêtes</h1>
        <span className="ml-auto text-aether-500 text-xs">{completedQuests.length} terminées</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeQuests.length > 0 && (
          <section>
            <h2 className="text-aether-400 text-sm mb-2">En cours</h2>
            {activeQuests.map((aq) => {
              const quest = getQuestById(aq.questId);
              if (!quest) return null;
              const zone = getZoneById(quest.zoneId);
              return (
                <div key={aq.questId} className="card-premium mb-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <QuestTypeChip type={quest.type} />
                    <span className="text-aether-500 text-[10px]">Niv. {quest.levelRequired}</span>
                    {zone && <span className="text-aether-600 text-[10px]">· {zone.name}</span>}
                  </div>
                  <p className="font-bold text-white text-sm">{quest.name}</p>
                  <p className="text-aether-400 text-xs mb-2">{quest.description}</p>
                  {aq.objectives?.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-aether-950 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-aether-600 to-crystal-cyan rounded-full"
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
          {availableQuests.map((quest) => {
            const zone = getZoneById(quest.zoneId);
            return (
            <div key={quest.id} className="card-premium mb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <QuestTypeChip type={quest.type} />
                    <span className="text-aether-500 text-[10px]">Niv. {quest.levelRequired}</span>
                    {zone && <span className="text-aether-600 text-[10px]">· {zone.name}</span>}
                  </div>
                  <p className="font-bold text-white text-sm">{quest.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{quest.description}</p>
                  <p className="text-aether-500 text-xs mt-1">
                    Récompense : {quest.rewards.xp} XP, {quest.rewards.eclats} ✦
                  </p>
                </div>
                <button
                  onClick={() => startQuest(quest.id)}
                  className="btn-secondary text-xs py-1 px-3 shrink-0"
                >
                  Accepter
                </button>
              </div>
            </div>
          );
          })}
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
