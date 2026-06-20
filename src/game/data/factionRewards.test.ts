import { describe, expect, it } from "vitest";
import {
  FACTION_RANK_COSMETICS,
  getFactionRankCosmeticIds,
  getAllFactionCosmeticIds,
} from "./factionRewards";

describe("factionRewards", () => {
  it("defines cosmetics for champion and exalted per faction", () => {
    for (const faction of ["lumina", "umbra", "neutre"] as const) {
      expect(FACTION_RANK_COSMETICS[faction].champion?.length).toBeGreaterThan(0);
      expect(FACTION_RANK_COSMETICS[faction].exalted?.length).toBeGreaterThan(0);
    }
  });

  it("returns champion rewards at champion rank", () => {
    const ids = getFactionRankCosmeticIds("lumina", "champion");
    expect(ids).toContain("title_lumina_champion");
    expect(ids).not.toContain("title_lumina_exalted");
  });

  it("returns all exalted rewards at exalted rank", () => {
    const ids = getFactionRankCosmeticIds("umbra", "exalted");
    expect(ids).toContain("title_umbra_champion");
    expect(ids).toContain("title_umbra_exalted");
    expect(ids).toContain("frame_umbra");
  });

  it("lists unique faction cosmetic ids", () => {
    const ids = getAllFactionCosmeticIds();
    expect(ids.length).toBe(new Set(ids).size);
    expect(ids.length).toBeGreaterThanOrEqual(9);
  });
});
