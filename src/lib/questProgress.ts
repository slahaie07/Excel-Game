import { getQuestById } from "../game/data";
import type { QuestDefinition } from "../game/data/quests";
import {
  addToInventory,
  addXp,
  loadCharacter,
  updateCharacter,
} from "./characterStorage";

export interface ActiveQuestObjective {
  type: string;
  targetId: string;
  description: string;
  current: number;
  required: number;
}

export interface ActiveQuest {
  questId: string;
  status: string;
  objectives: ActiveQuestObjective[];
}

function asActiveQuests(activeQuests: unknown): ActiveQuest[] {
  return Array.isArray(activeQuests) ? (activeQuests as ActiveQuest[]) : [];
}

function incrementMatchingObjectives(
  activeQuests: ActiveQuest[],
  matcher: (obj: ActiveQuestObjective) => boolean,
  increment = 1
): ActiveQuest[] {
  return activeQuests.map((quest) => {
    if (quest.status !== "active") return quest;

    const objectives = quest.objectives.map((obj) => {
      if (!matcher(obj) || obj.current >= obj.required) return obj;
      return {
        ...obj,
        current: Math.min(obj.required, obj.current + increment),
      };
    });

    return { ...quest, objectives };
  });
}

export function meetsQuestPrerequisites(
  quest: QuestDefinition,
  completedQuests: string[]
): boolean {
  if (!quest.prerequisiteQuests?.length) return true;
  return quest.prerequisiteQuests.every((id) => completedQuests.includes(id));
}

export function advanceQuestOnZoneVisit(characterId: string, zoneId: string): void {
  const char = loadCharacter(characterId);
  if (!char) return;

  const activeQuests = incrementMatchingObjectives(
    asActiveQuests(char.activeQuests),
    (obj) =>
      obj.type === "explore" &&
      !obj.targetId.startsWith("poi_") &&
      obj.targetId === zoneId
  );

  updateCharacter(characterId, { activeQuests });
  completeQuestIfReady(characterId);
}

export function advanceQuestOnKill(
  characterId: string,
  monsterId: string,
  _zoneId?: string
): void {
  const char = loadCharacter(characterId);
  if (!char) return;

  const activeQuests = incrementMatchingObjectives(
    asActiveQuests(char.activeQuests),
    (obj) =>
      obj.type === "kill" &&
      (obj.targetId === "any" || obj.targetId === monsterId)
  );

  updateCharacter(characterId, { activeQuests });
  completeQuestIfReady(characterId);
}

export function advanceQuestOnPOIVisit(characterId: string, poiId: string): void {
  const char = loadCharacter(characterId);
  if (!char) return;

  const activeQuests = incrementMatchingObjectives(
    asActiveQuests(char.activeQuests),
    (obj) =>
      obj.type === "explore" &&
      obj.targetId.startsWith("poi_") &&
      obj.targetId === poiId
  );

  updateCharacter(characterId, { activeQuests });
  completeQuestIfReady(characterId);
}

export function completeQuestIfReady(characterId: string): string[] {
  const char = loadCharacter(characterId);
  if (!char) return [];

  const activeQuests = asActiveQuests(char.activeQuests);
  const completedQuests = [...(char.completedQuests ?? [])];
  const stillActive: ActiveQuest[] = [];
  const newlyCompleted: string[] = [];

  let totalXp = 0;
  let totalEclats = 0;
  const itemsToAdd: { itemId: string; quantity: number }[] = [];
  const spellsToAdd: string[] = [];

  for (const quest of activeQuests) {
    const allDone = quest.objectives.every((o) => o.current >= o.required);
    if (!allDone) {
      stillActive.push(quest);
      continue;
    }

    const def = getQuestById(quest.questId);
    if (!def) {
      stillActive.push(quest);
      continue;
    }

    if (completedQuests.includes(quest.questId)) {
      continue;
    }

    newlyCompleted.push(quest.questId);
    completedQuests.push(quest.questId);
    totalXp += def.rewards.xp;
    totalEclats += def.rewards.eclats;
    if (def.rewards.items) itemsToAdd.push(...def.rewards.items);
    if (def.rewards.spells) spellsToAdd.push(...def.rewards.spells);
  }

  if (newlyCompleted.length === 0) return [];

  updateCharacter(characterId, {
    activeQuests: stillActive,
    completedQuests,
    eclats: (char.eclats ?? 0) + totalEclats,
  });

  if (totalXp > 0) addXp(characterId, totalXp);

  for (const item of itemsToAdd) {
    addToInventory(characterId, item.itemId, item.quantity);
  }

  if (spellsToAdd.length > 0) {
    const updated = loadCharacter(characterId);
    if (updated) {
      const spells = [...new Set([...(updated.spells ?? []), ...spellsToAdd])];
      updateCharacter(characterId, { spells });
    }
  }

  return newlyCompleted;
}
