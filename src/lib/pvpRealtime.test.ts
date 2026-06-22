import { describe, it, expect } from "vitest";
import { didPlayerWin, mapLiveEntitiesForPlayer } from "./pvpRealtime";

describe("pvpRealtime", () => {
  const entities = [
    { entityId: "a", playerKey: "player_a", team: "player" as const, classId: "pyromancien" },
    { entityId: "b", playerKey: "player_b", team: "enemy" as const, classId: "gardien" },
  ];

  it("mapLiveEntitiesForPlayer assigns teams from player key", () => {
    const mapped = mapLiveEntitiesForPlayer(entities, "player_a", "archer");
    expect(mapped[0]?.team).toBe("player");
    expect(mapped[0]?.classId).toBe("archer");
    expect(mapped[1]?.team).toBe("enemy");
  });

  it("didPlayerWin resolves victory_a for player A", () => {
    expect(didPlayerWin("victory_a", "player_a", "player_a", "player_b")).toBe(true);
    expect(didPlayerWin("victory_a", "player_b", "player_a", "player_b")).toBe(false);
  });

  it("didPlayerWin resolves abandoned with winner key", () => {
    expect(
      didPlayerWin("abandoned", "player_b", "player_a", "player_b", "player_b")
    ).toBe(true);
    expect(
      didPlayerWin("abandoned", "player_a", "player_a", "player_b", "player_b")
    ).toBe(false);
  });

  it("didPlayerWin returns null for active match", () => {
    expect(didPlayerWin("active", "player_a", "player_a", "player_b")).toBeNull();
  });
});
