import { describe, it, expect } from "vitest";
import { DUNGEONS } from "./dungeons";
import { MONSTERS } from "./monsters";

describe("dungeons", () => {
  it("has 121 dungeons total (70 + 24 v4.0 + 26 v5.0 + 1 tutorial)", () => {
    expect(DUNGEONS).toHaveLength(121);
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
