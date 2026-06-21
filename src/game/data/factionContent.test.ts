import { describe, expect, it } from "vitest";
import {
  FACTION_QUESTS,
  FACTION_SHOP_ITEMS,
  getFactionRank,
  getNextFactionRank,
  meetsRankRequirement,
  getWeekKey,
} from "./factionContent";

describe("factionContent", () => {
  it("has quests for all three factions", () => {
    const factions = new Set(FACTION_QUESTS.map((q) => q.factionId));
    expect(factions).toEqual(new Set(["lumina", "umbra", "neutre"]));
    expect(FACTION_QUESTS.length).toBeGreaterThanOrEqual(6);
  });

  it("has shop items gated by rank", () => {
    for (const item of FACTION_SHOP_ITEMS) {
      expect(item.costEclats).toBeGreaterThan(0);
      expect(item.weeklyLimit).toBeGreaterThan(0);
      expect(["known", "ally", "champion", "exalted"]).toContain(item.requiredRankId);
    }
  });

  it("computes faction ranks from reputation", () => {
    expect(getFactionRank(0).id).toBe("stranger");
    expect(getFactionRank(100).id).toBe("known");
    expect(getFactionRank(1000).id).toBe("exalted");
    expect(getNextFactionRank(50)?.id).toBe("known");
    expect(getNextFactionRank(1000)).toBeNull();
  });

  it("checks rank requirements", () => {
    expect(meetsRankRequirement("ally", "known")).toBe(true);
    expect(meetsRankRequirement("known", "ally")).toBe(false);
    expect(meetsRankRequirement("exalted", "champion")).toBe(true);
  });

  it("generates stable week keys", () => {
    const key = getWeekKey(new Date("2026-06-20T12:00:00Z").getTime());
    expect(key).toMatch(/^\d{4}-W\d{2}$/);
  });
});
