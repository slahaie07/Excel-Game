import { QUESTS, type Quest } from "../data/quests";
import type { PlayerCharacter } from "../store/gameStore";
import type { CombatState } from "../game/combat/CombatEngine";

export interface QuestCompletion {
  questId: string;
  quest: Quest;
}

export function recordMonsterKills(
  player: PlayerCharacter,
  killedMonsterIds: string[],
): { player: PlayerCharacter; completed: QuestCompletion[] } {
  const questProgress = { ...player.questProgress };
  const completed: QuestCompletion[] = [];

  for (const quest of Object.values(QUESTS)) {
    const entry = questProgress[quest.id] ?? {
      status: "available" as const,
      objectives: {},
    };

    if (entry.status === "completed") continue;

    if (quest.prerequisites?.length) {
      const prereqsMet = quest.prerequisites.every(
        (id) => questProgress[id]?.status === "completed",
      );
      if (!prereqsMet) continue;
    }

    if (entry.status === "available") {
      entry.status = "active";
    }

    for (const obj of quest.objectives) {
      if (obj.type !== "kill") continue;
      const current = entry.objectives[obj.id] ?? 0;
      if (obj.target === "any") {
        entry.objectives[obj.id] = current + killedMonsterIds.length;
      } else {
        const kills = killedMonsterIds.filter((id) => id === obj.target).length;
        entry.objectives[obj.id] = current + kills;
      }
    }

    const allDone = quest.objectives.every(
      (obj) => (entry.objectives[obj.id] ?? 0) >= obj.quantity,
    );

    if (allDone && entry.status === "active") {
      entry.status = "completed";
      completed.push({ questId: quest.id, quest });
    }

    questProgress[quest.id] = entry;
  }

  return { player: { ...player, questProgress }, completed };
}

export function getKilledMonsterIds(combat: CombatState): string[] {
  return combat.entities
    .filter((e) => e.team === "enemy" && !e.isAlive && e.monsterId)
    .map((e) => e.monsterId!);
}

export function applyQuestRewards(
  player: PlayerCharacter,
  completed: QuestCompletion[],
): PlayerCharacter {
  let updated = { ...player };
  for (const { quest } of completed) {
    updated = {
      ...updated,
      xp: updated.xp + quest.rewards.xp,
      kamas: updated.kamas + quest.rewards.kamas,
    };
    if (quest.rewards.items) {
      for (const item of quest.rewards.items) {
        const inv = [...updated.inventory];
        const existing = inv.find((s) => s.itemId === item.itemId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          const nextSlot =
            inv.length > 0 ? Math.max(...inv.map((s) => s.slot)) + 1 : 0;
          inv.push({ itemId: item.itemId, quantity: item.quantity, slot: nextSlot });
        }
        updated = { ...updated, inventory: inv };
      }
    }
    if (quest.rewards.title) {
      updated = {
        ...updated,
        achievements: [...updated.achievements, quest.rewards.title],
      };
    }
  }
  return updated;
}

export function getActiveQuests(player: PlayerCharacter): Quest[] {
  return Object.values(QUESTS).filter((q) => {
    const status = player.questProgress[q.id]?.status;
    return status === "active" || status === "available";
  });
}

export function acceptQuest(
  player: PlayerCharacter,
  questId: string,
): PlayerCharacter | null {
  const quest = QUESTS[questId];
  if (!quest) return null;

  const questProgress = { ...player.questProgress };
  if (questProgress[questId]?.status === "completed") return null;

  questProgress[questId] = {
    status: "active",
    objectives: Object.fromEntries(
      quest.objectives.map((o) => [o.id, questProgress[questId]?.objectives[o.id] ?? 0]),
    ),
  };

  return { ...player, questProgress };
}
