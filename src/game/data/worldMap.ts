import { ZONES, type ZoneDefinition } from "./zones";
import type { TerritoryStatus } from "./factionTerritories";
import { MAP_REGIONS, getRegionForZone, type MapRegionId } from "./expansionZonesV40";

export interface MapNodePosition {
  x: number;
  y: number;
}

/** Bornes étendues pour Terreval v4.0 (24 zones) */
export const MAP_BOUNDS = { minX: 0, maxX: 12, minY: 0, maxY: 11 };

export function zoneToMapPosition(zone: ZoneDefinition): MapNodePosition {
  const x =
    ((zone.x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)) * 100;
  const y =
    ((MAP_BOUNDS.maxY - zone.y) / (MAP_BOUNDS.maxY - MAP_BOUNDS.minY)) * 100;
  return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
}

export const TERRITORY_NODE_COLORS: Record<TerritoryStatus, string> = {
  fortified: "#22c55e",
  stable: "#6366f1",
  contested: "#ef4444",
};

export function getZoneConnections(): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (const zone of ZONES) {
    for (const conn of zone.connections) {
      const key = [zone.id, conn].sort().join(":");
      if (!edges.some((e) => [e.from, e.to].sort().join(":") === key)) {
        edges.push({ from: zone.id, to: conn });
      }
    }
  }
  return edges;
}

export { MAP_REGIONS, getRegionForZone };
export type { MapRegionId };

export function getZonesByRegion(): { region: (typeof MAP_REGIONS)[number]; zones: ZoneDefinition[] }[] {
  return MAP_REGIONS.map((region) => ({
    region,
    zones: region.zoneIds
      .map((id) => ZONES.find((z) => z.id === id))
      .filter((z): z is ZoneDefinition => z !== undefined),
  }));
}

export function getRegionColor(zoneId: string): string {
  return getRegionForZone(zoneId)?.color ?? "#6366f1";
}

export function canTravelBetween(fromZoneId: string, toZoneId: string): boolean {
  if (fromZoneId === toZoneId) return true;
  const from = ZONES.find((z) => z.id === fromZoneId);
  return from?.connections.includes(toZoneId) ?? false;
}
