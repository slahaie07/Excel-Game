import { FACTION_META, type FactionId } from "../game/data/factionContent";
import {
  getZoneTerritory,
  type CampaignProgressInput,
  type TerritoryStatus,
} from "../game/data/factionTerritories";
import type { FactionCampaignView } from "../screens/FactionsUI";

const STATUS_STYLES: Record<TerritoryStatus, string> = {
  fortified: "border-green-500/50 bg-green-950/30",
  stable: "border-aether-600/50 bg-aether-900/90",
  contested: "border-red-500/50 bg-red-950/30",
};

const STATUS_ICONS: Record<TerritoryStatus, string> = {
  fortified: "🛡️",
  stable: "⚖️",
  contested: "⚔️",
};

function campaignsToInput(campaigns: FactionCampaignView[]): CampaignProgressInput[] {
  return campaigns.map((c) => ({
    factionId: c.factionId,
    progressPercent: c.progressPercent,
    status: c.status,
  }));
}

export function WorldTerritoryBanner({
  zoneId,
  pledgedFactionId,
  campaigns,
}: {
  zoneId: string;
  pledgedFactionId: FactionId | null;
  campaigns: FactionCampaignView[];
}) {
  const territory = getZoneTerritory(zoneId, campaignsToInput(campaigns));
  const homeMeta = FACTION_META[territory.homeFaction];

  const showBonus =
    pledgedFactionId &&
    territory.status === "fortified" &&
    (territory.homeFaction === pledgedFactionId ||
      (territory.homeFaction === "neutre" && territory.dominantFaction === pledgedFactionId));

  return (
    <div
      className={`mx-3 mt-2 w-[calc(100%-1.5rem)] flex items-center gap-3 p-2 rounded-xl border ${STATUS_STYLES[territory.status]}`}
    >
      <span className="text-xl shrink-0">{STATUS_ICONS[territory.status]}</span>
      <div className="flex-1 text-left min-w-0">
        <p className="text-white text-xs font-semibold truncate">
          Territoire {homeMeta.icon} {homeMeta.name}
        </p>
        <p className="text-aether-400 text-[10px] mt-0.5 truncate">{territory.label}</p>
        {showBonus && (
          <p className="text-green-400 text-[10px] mt-0.5">
            +{territory.xpBonusPercent}% XP (zone fortifiée)
          </p>
        )}
      </div>
    </div>
  );
}
