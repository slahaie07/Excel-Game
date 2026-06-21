import type { Id } from "../../convex/_generated/dataModel";
import { isCloudCharacter, isConvexEnabled } from "./convexUtils";
import type { ActiveQuest } from "./questProgress";

interface CloudQuestMutations {
  startQuest: (args: {
    characterId: Id<"characters">;
    questId: string;
    objectives: { type: string; targetId: string; current: number; required: number }[];
  }) => Promise<null>;
  updateQuestProgress: (args: {
    characterId: Id<"characters">;
    questId: string;
    objectiveIndex: number;
    increment: number;
  }) => Promise<{ completed: boolean }>;
  syncQuestState: (args: {
    characterId: Id<"characters">;
    activeQuests: ActiveQuest[];
    completedQuests: string[];
    eclats?: number;
    xp?: number;
  }) => Promise<null>;
}

let cloudMutations: CloudQuestMutations | null = null;

export function registerCloudQuestMutations(mutations: CloudQuestMutations): void {
  cloudMutations = mutations;
}

function cloudId(characterId: string): Id<"characters"> | null {
  if (!isConvexEnabled() || !isCloudCharacter(characterId)) return null;
  return characterId as Id<"characters">;
}

export function cloudStartQuest(
  characterId: string,
  questId: string,
  objectives: { type: string; targetId: string; current: number; required: number }[]
): void {
  const id = cloudId(characterId);
  if (!id || !cloudMutations) return;
  void cloudMutations.startQuest({ characterId: id, questId, objectives });
}

export function cloudUpdateQuestProgress(
  characterId: string,
  questId: string,
  objectiveIndex: number,
  increment = 1
): void {
  const id = cloudId(characterId);
  if (!id || !cloudMutations) return;
  void cloudMutations.updateQuestProgress({
    characterId: id,
    questId,
    objectiveIndex,
    increment,
  });
}

export function cloudSyncQuestState(
  characterId: string,
  activeQuests: ActiveQuest[],
  completedQuests: string[],
  rewards?: { eclats?: number; xp?: number }
): void {
  const id = cloudId(characterId);
  if (!id || !cloudMutations) return;
  void cloudMutations.syncQuestState({
    characterId: id,
    activeQuests,
    completedQuests,
    eclats: rewards?.eclats,
    xp: rewards?.xp,
  });
}

export function syncQuestKillToCloud(
  characterId: string,
  activeQuests: ActiveQuest[],
  monsterId: string
): void {
  const id = cloudId(characterId);
  if (!id || !cloudMutations) return;

  for (const quest of activeQuests) {
    if (quest.status !== "active") continue;
    quest.objectives.forEach((obj, index) => {
      if (
        obj.type === "kill" &&
        obj.current < obj.required &&
        (obj.targetId === "any" || obj.targetId === monsterId)
      ) {
        cloudUpdateQuestProgress(characterId, quest.questId, index, 1);
      }
    });
  }
}

export function syncQuestExploreToCloud(
  characterId: string,
  activeQuests: ActiveQuest[],
  targetId: string
): void {
  const id = cloudId(characterId);
  if (!id || !cloudMutations) return;

  for (const quest of activeQuests) {
    if (quest.status !== "active") continue;
    quest.objectives.forEach((obj, index) => {
      if (
        obj.type === "explore" &&
        obj.current < obj.required &&
        obj.targetId === targetId
      ) {
        cloudUpdateQuestProgress(characterId, quest.questId, index, 1);
      }
    });
  }
}
