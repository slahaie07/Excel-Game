import { ZONES, type ZoneDefinition } from "./zones";
import type { TerritoryStatus } from "./factionTerritories";

export interface MapNodePosition {
  x: number;
  y: number;
}

const MAP_BOUNDS = { minX: 2, maxX: 9, minY: 1, maxY: 9 };

export function zoneToMapPosition(zone: ZoneDefinition): MapNodePosition {
  const x =
    ((zone.x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)) * 100;
  const y =
    ((MAP_BOUNDS.maxY - zone.y) / (MAP_BOUNDS.maxY - MAP_BOUNDS.minY)) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
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
