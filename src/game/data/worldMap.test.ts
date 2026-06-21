import { describe, expect, it } from "vitest";
import { ZONES } from "./zones";
import { getZoneConnections, zoneToMapPosition, getZonesByRegion, canTravelBetween } from "./worldMap";

describe("worldMap", () => {
  it("positions all zones within map bounds", () => {
    for (const zone of ZONES) {
      const pos = zoneToMapPosition(zone);
      expect(pos.x).toBeGreaterThanOrEqual(3);
      expect(pos.x).toBeLessThanOrEqual(97);
      expect(pos.y).toBeGreaterThanOrEqual(3);
      expect(pos.y).toBeLessThanOrEqual(97);
    }
  });

  it("lists zone connections without duplicates", () => {
    const edges = getZoneConnections();
    expect(edges.length).toBeGreaterThan(30);
    const keys = edges.map((e) => [e.from, e.to].sort().join(":"));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("groups 25 zones into 6 regions", () => {
    const grouped = getZonesByRegion();
    expect(grouped).toHaveLength(6);
    expect(grouped.reduce((n, g) => n + g.zones.length, 0)).toBe(25);
  });

  it("validates travel between connected zones", () => {
    expect(canTravelBetween("port_nebula", "iles_stellaires")).toBe(true);
    expect(canTravelBetween("jardin_initiation", "vallee_eveils")).toBe(true);
    expect(canTravelBetween("vallee_eveils", "glaise_nord")).toBe(false);
  });
});
