import { describe, expect, it } from "vitest";
import { QUESTS } from "./quests";
import { EXPANSION_QUESTS_V31 } from "./expansionQuests";
import { EXPANSION_DUNGEONS_V30 } from "./expansionV30";

describe("quests", () => {
  it("has 100+ quests after v3.1 expansion", () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(100);
    expect(EXPANSION_QUESTS_V31.length).toBe(86);
  });

  it("has unique quest ids", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("dungeon quests reference valid expansion bosses", () => {
    const dungeonQuests = QUESTS.filter((q) => q.type === "dungeon");
    expect(dungeonQuests.length).toBe(EXPANSION_DUNGEONS_V30.length);
    for (const quest of dungeonQuests) {
      const kill = quest.objectives.find((o) => o.type === "kill");
      expect(kill?.targetId).toMatch(/^boss_/);
    }
  });

  it("covers all quest types", () => {
    const types = new Set(QUESTS.map((q) => q.type));
    expect(types.has("main")).toBe(true);
    expect(types.has("side")).toBe(true);
    expect(types.has("daily")).toBe(true);
    expect(types.has("dungeon")).toBe(true);
    expect(types.has("guild")).toBe(true);
  });
});
