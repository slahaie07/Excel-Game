import { ZONES } from "../game/data";
import { getActiveEvent } from "../game/data/events";
import {
  getZoneTerritory,
  type CampaignProgressInput,
} from "../game/data/factionTerritories";
import {
  getZoneConnections,
  zoneToMapPosition,
  TERRITORY_NODE_COLORS,
} from "../game/data/worldMap";
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
  const height = compact ? "h-36" : "h-56";

  const nodeById = Object.fromEntries(
    ZONES.map((z) => [z.id, { zone: z, pos: zoneToMapPosition(z) }])
  );

  return (
    <div className={`relative w-full ${height} rounded-xl bg-aether-950/80 border border-aether-700/50 overflow-hidden`}>
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
              strokeWidth={2}
              strokeOpacity={0.5}
            />
          );
        })}
      </svg>

      {ZONES.map((zone) => {
        const { x, y } = zoneToMapPosition(zone);
        const territory = getZoneTerritory(zone.id, input);
        const isCurrent = zone.id === currentZoneId;
        const hasEvent =
          activeEvent &&
          (activeEvent.exclusiveMonsters.some((m) => zone.monsters.includes(m)) ||
            zone.monsters.some((m) => activeEvent.exclusiveMonsters.includes(m)));

        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => onSelectZone(zone.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-transform active:scale-95 ${
              isCurrent ? "z-20 scale-110" : "z-10"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={zone.name}
          >
            <span
              className={`flex items-center justify-center rounded-full border-2 shadow-lg ${
                compact ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
              } ${isCurrent ? "ring-2 ring-crystal-cyan ring-offset-1 ring-offset-aether-950" : ""}`}
              style={{
                backgroundColor: TERRITORY_NODE_COLORS[territory.status] + "33",
                borderColor: TERRITORY_NODE_COLORS[territory.status],
              }}
            >
              {zone.icon}
            </span>
            {!compact && (
              <span className="text-[9px] text-aether-300 max-w-[72px] truncate text-center">
                {zone.name.split(" ")[0]}
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
          </button>
        );
      })}
    </div>
  );
}
