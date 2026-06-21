import { describe, expect, it } from "vitest";
import { EXPANSION_QUESTS_V41 } from "./expansionQuestsV41";
import { QUESTS } from "./quests";
import { MONSTERS } from "./monsters";

describe("expansionQuestsV41", () => {
  const questIds = new Set(QUESTS.map((q) => q.id));
  const monsterIds = new Set(MONSTERS.map((m) => m.id));

  it("exports 41 regional Terreval quests", () => {
    expect(EXPANSION_QUESTS_V41).toHaveLength(41);
  });

  it("references valid monster ids for kill objectives", () => {
    for (const quest of EXPANSION_QUESTS_V41) {
      for (const objective of quest.objectives) {
        if (objective.type !== "kill" || objective.targetId === "any") continue;
        expect(monsterIds.has(objective.targetId), `${quest.id} → ${objective.targetId}`).toBe(true);
      }
    }
  });

  it("has valid prerequisite quest chains", () => {
    for (const quest of EXPANSION_QUESTS_V41) {
      for (const prereq of quest.prerequisiteQuests ?? []) {
        expect(questIds.has(prereq), `${quest.id} requires ${prereq}`).toBe(true);
      }
    }
  });

  it("includes 4 regional master quests and cartographe endgame", () => {
    const masters = EXPANSION_QUESTS_V41.filter((q) => q.id.startsWith("maitre_region_"));
    expect(masters).toHaveLength(4);
    expect(EXPANSION_QUESTS_V41.some((q) => q.id === "cartographe_terreval")).toBe(true);
  });
});
