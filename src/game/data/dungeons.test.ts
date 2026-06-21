import { describe, it, expect } from "vitest";
import { DUNGEONS } from "./dungeons";
import { MONSTERS } from "./monsters";

describe("dungeons v2.4", () => {
  it("has 70 dungeons total", () => {
    expect(DUNGEONS).toHaveLength(70);
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
