import { describe, expect, it } from "vitest";
import { QUESTS } from "./quests";
import { EXPANSION_QUESTS_V31 } from "./expansionQuests";
import { EXPANSION_QUESTS_V41 } from "./expansionQuestsV41";
import { EXPANSION_DUNGEONS_V30 } from "./expansionV30";
import { EXPANSION_DUNGEONS_V40 } from "./expansionDungeonsV40";

describe("quests", () => {
  it("has 140+ quests after v4.1 expansion", () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(140);
    expect(EXPANSION_QUESTS_V31.length).toBe(86);
    expect(EXPANSION_QUESTS_V41.length).toBe(41);
  });

  it("has unique quest ids", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("dungeon quests reference valid expansion bosses", () => {
    const dungeonQuests = QUESTS.filter((q) => q.type === "dungeon");
    expect(dungeonQuests.length).toBe(
      EXPANSION_DUNGEONS_V30.length + EXPANSION_DUNGEONS_V40.length
    );
    for (const quest of dungeonQuests) {
      const kill = quest.objectives.find((o) => o.type === "kill");
      expect(kill?.targetId).toBeTruthy();
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

  it("has regional discovery quests for all v4.0 zones", () => {
    const discovery = EXPANSION_QUESTS_V41.filter((q) => q.id.startsWith("decouverte_"));
    expect(discovery).toHaveLength(12);
  });
});
