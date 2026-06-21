import { useGameStore } from "../stores/gameStore";
import { ZONES } from "../game/data";
import { getAllZoneTerritories } from "../game/data/factionTerritories";
import { FACTION_META } from "../game/data/factionContent";
import { WorldMapPanel } from "../components/WorldMapPanel";
import { ZoneTerritoryBadge } from "../components/ZoneTerritoryBadge";
import type { FactionCampaignView } from "./FactionsUI";

function campaignsToInput(campaigns: FactionCampaignView[]) {
  return campaigns.map((c) => ({
    factionId: c.factionId,
    progressPercent: c.progressPercent,
    status: c.status,
  }));
}

export function TerritoryOverviewContent({
  campaigns,
  pledgedFactionId,
  currentZoneId,
  historyWeeks = [],
  onSelectZone,
}: {
  campaigns: FactionCampaignView[];
  pledgedFactionId: string | null;
  currentZoneId: string;
  historyWeeks?: { weekKey: string; dominantFaction: string; lumina: number; umbra: number; neutre: number }[];
  onSelectZone?: (zoneId: string) => void;
}) {
  const zoneIds = ZONES.map((z) => z.id);
  const territories = getAllZoneTerritories(zoneIds, campaignsToInput(campaigns));
  const fortified = territories.filter((t) => t.status === "fortified").length;
  const contested = territories.filter((t) => t.status === "contested").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-2 text-center">
          <p className="text-green-400 text-lg font-bold">{fortified}</p>
          <p className="text-aether-500 text-[10px]">Fortifiées</p>
        </div>
        <div className="card p-2 text-center">
          <p className="text-aether-300 text-lg font-bold">{territories.length - fortified - contested}</p>
          <p className="text-aether-500 text-[10px]">Stables</p>
        </div>
        <div className="card p-2 text-center">
          <p className="text-red-400 text-lg font-bold">{contested}</p>
          <p className="text-aether-500 text-[10px]">Contestées</p>
        </div>
      </div>

      {pledgedFactionId && (
        <p className="text-aether-400 text-xs text-center">
          Allégeance : {FACTION_META[pledgedFactionId as keyof typeof FACTION_META]?.icon}{" "}
          {FACTION_META[pledgedFactionId as keyof typeof FACTION_META]?.name}
        </p>
      )}

      <WorldMapPanel
        currentZoneId={currentZoneId}
        campaigns={campaigns}
        onSelectZone={(id) => onSelectZone?.(id)}
      />

      <div className="space-y-2">
        {territories.map((t) => {
          const zone = ZONES.find((z) => z.id === t.zoneId);
          return (
            <div key={t.zoneId} className="card flex items-center gap-3 p-2">
              <span className="text-xl">{zone?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{zone?.name}</p>
                <ZoneTerritoryBadge zoneId={t.zoneId} campaigns={campaigns} />
              </div>
            </div>
          );
        })}
      </div>

      {historyWeeks.length > 0 && (
        <div className="card p-3">
          <h3 className="text-aether-300 text-sm font-semibold mb-2">Historique hebdo</h3>
          <div className="space-y-1">
            {historyWeeks.map((w) => (
              <div key={w.weekKey} className="flex justify-between text-[10px] text-aether-400">
                <span>{w.weekKey}</span>
                <span>
                  ✨{w.lumina}% 🌑{w.umbra}% ⚖️{w.neutre}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TerritoryOverviewScreen({
  campaigns,
  pledgedFactionId,
  currentZoneId,
  historyWeeks,
}: {
  campaigns: FactionCampaignView[];
  pledgedFactionId: string | null;
  currentZoneId: string;
  historyWeeks?: { weekKey: string; dominantFaction: string; lumina: number; umbra: number; neutre: number }[];
}) {
  const setScreen = useGameStore((s) => s.setScreen);
  const setZone = useGameStore((s) => s.setZone);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900">
      <div className="p-4 flex items-center gap-3 border-b border-aether-800">
        <button type="button" onClick={() => setScreen("world")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-lg font-bold text-white">Contrôle territorial</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <TerritoryOverviewContent
          campaigns={campaigns}
          pledgedFactionId={pledgedFactionId}
          currentZoneId={currentZoneId}
          historyWeeks={historyWeeks}
          onSelectZone={(id) => {
            setZone(id);
            setScreen("world");
          }}
        />
      </div>
    </div>
  );
}
