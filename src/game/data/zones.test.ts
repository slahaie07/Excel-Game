import { describe, expect, it } from "vitest";
import { ZONES } from "./zones";
import { EXPANSION_ZONES_V40, MAP_REGIONS } from "./expansionZonesV40";
import { MAP_POIS } from "./mapPOIs";

describe("zones v4.0", () => {
  it("has 25 zones across 6 regions", () => {
    expect(ZONES.length).toBe(25);
    expect(EXPANSION_ZONES_V40.length).toBe(12);
    expect(MAP_REGIONS.length).toBe(6);
    const covered = new Set(MAP_REGIONS.flatMap((r) => r.zoneIds));
    expect(covered.size).toBe(25);
    for (const zone of ZONES) {
      expect(covered.has(zone.id)).toBe(true);
    }
  });

  it("has valid bidirectional connections", () => {
    for (const zone of ZONES) {
      for (const conn of zone.connections) {
        const target = ZONES.find((z) => z.id === conn);
        expect(target, `${zone.id} → ${conn}`).toBeDefined();
        expect(target!.connections).toContain(zone.id);
      }
    }
  });

  it("assigns POIs to every zone", () => {
    for (const zone of ZONES) {
      const pois = MAP_POIS.filter((p) => p.zoneId === zone.id);
      expect(pois.length, zone.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("new zones have monsters and dungeons", () => {
    for (const zone of EXPANSION_ZONES_V40) {
      const full = ZONES.find((z) => z.id === zone.id)!;
      expect(full.monsters.length).toBeGreaterThanOrEqual(3);
      expect(full.dungeons.length).toBeGreaterThanOrEqual(2);
    }
  });
});
