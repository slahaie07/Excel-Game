import { ZONES, getMonstersByZone } from "../game/data";
import { getActiveEvent } from "../game/data/events";
import {
  getZoneTerritory,
  type CampaignProgressInput,
} from "../game/data/factionTerritories";
import {
  getZoneConnections,
  zoneToMapPosition,
  TERRITORY_NODE_COLORS,
  MAP_REGIONS,
  getRegionColor,
} from "../game/data/worldMap";
import { getPOIsForZone } from "../game/data/mapPOIs";
import type { FactionCampaignView } from "../screens/FactionsUI";

function campaignsToInput(campaigns: FactionCampaignView[]): CampaignProgressInput[] {
  return campaigns.map((c) => ({
    factionId: c.factionId,
    progressPercent: c.progressPercent,
    status: c.status,
  }));
}

export function WorldMapPanel({
  currentZoneId,
  campaigns,
  onSelectZone,
  compact = false,
}: {
  currentZoneId: string;
  campaigns: FactionCampaignView[];
  onSelectZone: (zoneId: string) => void;
  compact?: boolean;
}) {
  const activeEvent = getActiveEvent();
  const input = campaignsToInput(campaigns);
  const connections = getZoneConnections();
  const height = compact ? "h-40" : "h-80";

  const nodeById = Object.fromEntries(
    ZONES.map((z) => [z.id, { zone: z, pos: zoneToMapPosition(z) }])
  );

  return (
    <div className="space-y-2">
      <div
        className={`relative w-full ${height} rounded-xl bg-aether-950/80 border border-aether-700/50 overflow-hidden`}
      >
        {/* Légende des régions */}
        {!compact && (
          <div className="absolute top-1 left-1 right-1 z-30 flex flex-wrap gap-1 pointer-events-none">
            {MAP_REGIONS.map((region) => (
              <span
                key={region.id}
                className="text-[8px] px-1.5 py-0.5 rounded-full bg-black/50 border"
                style={{ borderColor: region.color, color: region.color }}
              >
                {region.name}
              </span>
            ))}
          </div>
        )}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(({ from, to }) => {
            const a = nodeById[from];
            const b = nodeById[to];
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={`${a.pos.x}%`}
                y1={`${a.pos.y}%`}
                x2={`${b.pos.x}%`}
                y2={`${b.pos.y}%`}
                stroke="#4c1d95"
                strokeWidth={compact ? 1.5 : 2}
                strokeOpacity={0.45}
              />
            );
          })}
        </svg>

        {ZONES.map((zone) => {
          const { x, y } = zoneToMapPosition(zone);
          const territory = getZoneTerritory(zone.id, input);
          const isCurrent = zone.id === currentZoneId;
          const pois = getPOIsForZone(zone.id);
          const hasEvent =
            activeEvent &&
            (activeEvent.exclusiveMonsters.some((m) => zone.monsters.includes(m)) ||
              zone.monsters.some((m) => activeEvent.exclusiveMonsters.includes(m)));
          const hasBoss = getMonstersByZone(zone.id).some((m) => m.isBoss);
          const regionColor = getRegionColor(zone.id);

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-transform active:scale-95 ${
                isCurrent ? "z-20 scale-110" : "z-10"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${zone.name} — Niv. ${zone.levelRange[0]}-${zone.levelRange[1]}${pois.length ? ` • ${pois.length} POI` : ""}`}
            >
              <span
                className={`relative flex items-center justify-center rounded-full border-2 shadow-lg ${
                  compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
                } ${isCurrent ? "ring-2 ring-crystal-cyan ring-offset-1 ring-offset-aether-950" : ""}`}
                style={{
                  backgroundColor: TERRITORY_NODE_COLORS[territory.status] + "44",
                  borderColor: isCurrent ? TERRITORY_NODE_COLORS[territory.status] : regionColor,
                }}
              >
                {zone.icon}
                {pois.length > 0 && !compact && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-crystal-cyan text-[7px] text-aether-950 flex items-center justify-center font-bold">
                    {pois.length}
                  </span>
                )}
              </span>
              {!compact && (
                <span className="text-[8px] text-aether-300 max-w-[64px] truncate text-center leading-tight">
                  {zone.name.split(" ").slice(0, 2).join(" ")}
                </span>
              )}
              {hasEvent && (
                <span
                  className="absolute -top-1 -right-1 text-xs"
                  style={{ color: activeEvent?.color }}
                  title={activeEvent?.name}
                >
                  ★
                </span>
              )}
              {hasBoss && !hasEvent && (
                <span className="absolute -top-1 -right-1 text-[10px]" title="Zone avec boss">
                  👹
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!compact && (
        <p className="text-aether-500 text-[10px] text-center">
          {ZONES.length} zones • {MAP_REGIONS.length} régions • Terreval v4.0
        </p>
      )}
    </div>
  );
}
