import {
  getZoneTerritory,
  type CampaignProgressInput,
  type TerritoryStatus,
} from "../game/data/factionTerritories";
import type { FactionCampaignView } from "../screens/FactionsUI";

const STATUS_ICONS: Record<TerritoryStatus, string> = {
  fortified: "🛡️",
  stable: "⚖️",
  contested: "⚔️",
};

const STATUS_TEXT: Record<TerritoryStatus, string> = {
  fortified: "Fortifié",
  stable: "Stable",
  contested: "Contesté",
};

const STATUS_COLORS: Record<TerritoryStatus, string> = {
  fortified: "text-green-400",
  stable: "text-aether-400",
  contested: "text-red-400",
};

function campaignsToInput(campaigns: FactionCampaignView[]): CampaignProgressInput[] {
  return campaigns.map((c) => ({
    factionId: c.factionId,
    progressPercent: c.progressPercent,
    status: c.status,
  }));
}

export function ZoneTerritoryBadge({
  zoneId,
  campaigns,
  compact = false,
}: {
  zoneId: string;
  campaigns: FactionCampaignView[];
  compact?: boolean;
}) {
  const territory = getZoneTerritory(zoneId, campaignsToInput(campaigns));
  const icon = STATUS_ICONS[territory.status];
  const label = STATUS_TEXT[territory.status];
  const color = STATUS_COLORS[territory.status];

  if (compact) {
    return (
      <span className={`text-[10px] ${color}`} title={territory.label}>
        {icon} {label}
        {territory.xpBonusPercent > 0 && territory.status === "fortified" && (
          <span className="text-green-300"> +{territory.xpBonusPercent}%</span>
        )}
      </span>
    );
  }

  return (
    <div className={`text-xs ${color}`}>
      <span>{icon} {label}</span>
      {territory.xpBonusPercent > 0 && territory.status === "fortified" && (
        <span className="text-green-300 ml-1">+{territory.xpBonusPercent}% XP</span>
      )}
    </div>
  );
}
