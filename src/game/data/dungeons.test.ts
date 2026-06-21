import { describe, it, expect } from "vitest";
import { DUNGEONS } from "./dungeons";
import { MONSTERS } from "./monsters";

describe("dungeons", () => {
  it("has 120 dungeons total (70 + 24 v4.0 + 26 v5.0)", () => {
    expect(DUNGEONS).toHaveLength(120);
  });

  it("every dungeon boss exists as a monster", () => {
    const monsterIds = new Set(MONSTERS.map((m) => m.id));
    for (const dungeon of DUNGEONS) {
      if (dungeon.bossId !== "random") {
        expect(monsterIds.has(dungeon.bossId)).toBe(true);
      }
    }
  });
});
