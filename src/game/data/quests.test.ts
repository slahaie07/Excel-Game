import { describe, expect, it } from "vitest";
import { QUESTS } from "./quests";
import { EXPANSION_QUESTS_V31 } from "./expansionQuests";
import { EXPANSION_QUESTS_V41 } from "./expansionQuestsV41";
import { EXPANSION_QUESTS_V42 } from "./expansionQuestsV42";
import { EXPANSION_DUNGEONS_V30 } from "./expansionV30";
import { EXPANSION_DUNGEONS_V40 } from "./expansionDungeonsV40";

describe("quests", () => {
  it("has 190+ quests after v4.2 expansion", () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(190);
    expect(EXPANSION_QUESTS_V31.length).toBe(86);
    expect(EXPANSION_QUESTS_V41.length).toBe(41);
    expect(EXPANSION_QUESTS_V42.length).toBe(47);
  });

  it("has 24+ daily quests including v4.2 zone dailies", () => {
    const dailies = QUESTS.filter((q) => q.type === "daily");
    expect(dailies.length).toBeGreaterThanOrEqual(24);
    expect(dailies.some((q) => q.zoneId === "glaise_nord")).toBe(true);
    expect(dailies.some((q) => q.zoneId === "observatoire_lune")).toBe(true);
  });

  it("has POI treasure and lore quests from v4.2", () => {
    const poiQuests = QUESTS.filter((q) => q.id.startsWith("quete_poi_"));
    expect(poiQuests.length).toBeGreaterThan(0);
    for (const quest of poiQuests) {
      const explore = quest.objectives.find((o) => o.type === "explore");
      expect(explore?.targetId.startsWith("poi_")).toBe(true);
    }
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
