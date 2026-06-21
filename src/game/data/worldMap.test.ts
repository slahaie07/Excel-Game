import { describe, expect, it } from "vitest";
import { ZONES } from "./zones";
import { getZoneConnections, zoneToMapPosition } from "./worldMap";

describe("worldMap", () => {
  it("positions all zones within map bounds", () => {
    for (const zone of ZONES) {
      const pos = zoneToMapPosition(zone);
      expect(pos.x).toBeGreaterThanOrEqual(4);
      expect(pos.x).toBeLessThanOrEqual(96);
      expect(pos.y).toBeGreaterThanOrEqual(4);
      expect(pos.y).toBeLessThanOrEqual(96);
    }
  });

  it("lists zone connections without duplicates", () => {
    const edges = getZoneConnections();
    expect(edges.length).toBeGreaterThan(0);
    const keys = edges.map((e) => [e.from, e.to].sort().join(":"));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
