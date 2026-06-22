import { describe, it, expect } from "vitest";
import { getSeasonLeaderboardScore } from "./seasonEngine";
import type { SeasonProgress } from "./characterStorage";

describe("seasonEngine", () => {
  it("computes leaderboard score from pass XP and currency", () => {
    const progress: SeasonProgress = {
      seasonId: "test",
      currency: 50,
      passXp: 200,
      claimedTiers: [],
      objectives: [],
      shopPurchases: {},
    };
    expect(getSeasonLeaderboardScore(progress)).toBe(300);
  });
});
