import { describe, expect, it } from "vitest";
import { QUESTS } from "./quests";
import { EXPANSION_QUESTS_V50 } from "./expansionQuestsV50";
import { EXPANSION_DUNGEONS_V50 } from "./expansionDungeonsV50";
import { MAP_POIS } from "./mapPOIs";

describe("expansionQuestsV50", () => {
  it("exports 64 quests (32 POI + 26 dungeon + 6 endgame)", () => {
    expect(EXPANSION_QUESTS_V50.length).toBe(64);
    expect(EXPANSION_DUNGEONS_V50.length).toBe(26);
  });

  it("has POI quests for landmark, vendor, teleporter and dungeon types", () => {
    const poiQuests = EXPANSION_QUESTS_V50.filter((q) => q.id.startsWith("quete_poi_"));
    const expectedCount = MAP_POIS.filter(
      (p) => p.type === "landmark" || p.type === "vendor" || p.type === "teleporter" || p.type === "dungeon"
    ).length;
    expect(poiQuests).toHaveLength(expectedCount);
    expect(poiQuests.length).toBe(32);
  });

  it("has mythic dungeon quests linked to v5 bosses", () => {
    const mythicQuests = EXPANSION_QUESTS_V50.filter((q) => q.type === "dungeon");
    expect(mythicQuests).toHaveLength(26);
    for (const quest of mythicQuests) {
      const kill = quest.objectives.find((o) => o.type === "kill");
      expect(kill?.targetId.startsWith("boss_mythique_")).toBe(true);
    }
  });

  it("merges into QUESTS with 250+ total", () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(250);
  });
});
