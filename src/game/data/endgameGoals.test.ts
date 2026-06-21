import { describe, expect, it } from "vitest";
import { getEndgameProgress, ENDGAME_GOALS } from "./endgameGoals";

describe("endgameGoals", () => {
  const baseCtx = {
    level: 1,
    zoneId: "vallee_eveils",
    pvpWins: 0,
    guildId: undefined as string | undefined,
    achievementsUnlocked: 0,
    achievementsTotal: 10,
    pledgedFaction: false,
  };

  it("defines 7 endgame goals", () => {
    expect(ENDGAME_GOALS).toHaveLength(7);
  });

  it("starts at 0% with fresh character", () => {
    const progress = getEndgameProgress(baseCtx);
    expect(progress.completedCount).toBe(0);
    expect(progress.percent).toBe(0);
  });

  it("tracks level milestones", () => {
    const at30 = getEndgameProgress({ ...baseCtx, level: 30 });
    expect(at30.completedCount).toBe(1);
    expect(at30.goals.find((g) => g.id === "level_30")?.done).toBe(true);

    const at60 = getEndgameProgress({ ...baseCtx, level: 60 });
    expect(at60.completedCount).toBe(2);
  });

  it("tracks citadelle exploration", () => {
    const progress = getEndgameProgress({ ...baseCtx, zoneId: "citadelle_stellaire" });
    expect(progress.goals.find((g) => g.id === "citadelle")?.done).toBe(true);
  });

  it("tracks PvP, guild and faction goals", () => {
    const progress = getEndgameProgress({
      ...baseCtx,
      pvpWins: 10,
      guildId: "guild_1",
      pledgedFaction: true,
      achievementsUnlocked: 5,
    });
    expect(progress.goals.find((g) => g.id === "pvp_10")?.done).toBe(true);
    expect(progress.goals.find((g) => g.id === "guild")?.done).toBe(true);
    expect(progress.goals.find((g) => g.id === "faction")?.done).toBe(true);
    expect(progress.goals.find((g) => g.id === "achievements_half")?.done).toBe(true);
    expect(progress.completedCount).toBe(4);
  });
});
