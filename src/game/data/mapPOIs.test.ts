import { describe, expect, it } from "vitest";
import { MAP_POIS, getPOIsForZone } from "./mapPOIs";
import { ZONES } from "./zones";

describe("mapPOIs", () => {
  it("has 40+ points of interest", () => {
    expect(MAP_POIS.length).toBeGreaterThanOrEqual(40);
  });

  it("references valid zones only", () => {
    const zoneIds = new Set(ZONES.map((z) => z.id));
    for (const poi of MAP_POIS) {
      expect(zoneIds.has(poi.zoneId), poi.id).toBe(true);
    }
  });

  it("covers all POI types", () => {
    const types = new Set(MAP_POIS.map((p) => p.type));
    expect(types.has("landmark")).toBe(true);
    expect(types.has("dungeon")).toBe(true);
    expect(types.has("teleporter")).toBe(true);
  });

  it("returns POIs per zone", () => {
    const pois = getPOIsForZone("plateau_givre");
    expect(pois.length).toBeGreaterThanOrEqual(2);
  });
});
