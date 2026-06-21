/**
 * Territoires faction — contrôle des zones selon les campagnes hebdomadaires.
 */

import { FACTION_META, ZONE_FACTION_MAP, type FactionId } from "./factionContent";

export type TerritoryStatus = "fortified" | "stable" | "contested";

export interface CampaignProgressInput {
  factionId: FactionId;
  progressPercent: number;
  status: "active" | "completed";
}

export interface ZoneTerritory {
  zoneId: string;
  homeFaction: FactionId;
  status: TerritoryStatus;
  dominantFaction: FactionId;
  xpBonusPercent: number;
  label: string;
}

const STATUS_LABELS: Record<TerritoryStatus, string> = {
  fortified: "Fortifié",
  stable: "Stable",
  contested: "Contesté",
};

function getProgress(
  campaigns: CampaignProgressInput[],
  factionId: FactionId
): number {
  return campaigns.find((c) => c.factionId === factionId)?.progressPercent ?? 0;
}

function getDominantFaction(campaigns: CampaignProgressInput[]): FactionId {
  const sorted = [...campaigns].sort((a, b) => b.progressPercent - a.progressPercent);
  return sorted[0]?.factionId ?? "neutre";
}

export function getZoneTerritory(
  zoneId: string,
  campaigns: CampaignProgressInput[]
): ZoneTerritory {
  const homeFaction = ZONE_FACTION_MAP[zoneId] ?? "neutre";
  const dominantFaction = getDominantFaction(campaigns);
  const lumina = getProgress(campaigns, "lumina");
  const umbra = getProgress(campaigns, "umbra");
  const neutre = getProgress(campaigns, "neutre");

  let status: TerritoryStatus = "stable";
  let xpBonusPercent = 0;

  if (homeFaction === "lumina") {
    if (lumina >= umbra + 15) {
      status = "fortified";
      xpBonusPercent = 15;
    } else if (umbra >= lumina + 15) {
      status = "contested";
    }
  } else if (homeFaction === "umbra") {
    if (umbra >= lumina + 15) {
      status = "fortified";
      xpBonusPercent = 15;
    } else if (lumina >= umbra + 15) {
      status = "contested";
    }
  } else {
    const top = Math.max(lumina, umbra, neutre);
    if (neutre === top && neutre > 0) {
      status = "fortified";
      xpBonusPercent = 10;
    } else if (lumina === top || umbra === top) {
      status = top >= 50 ? "contested" : "stable";
    }
  }

  const dominant = FACTION_META[dominantFaction];
  const label = `${STATUS_LABELS[status]} • ${dominant.icon} ${dominant.name}`;

  return {
    zoneId,
    homeFaction,
    status,
    dominantFaction,
    xpBonusPercent,
    label,
  };
}

export function getTerritoryXpMultiplier(
  zoneId: string,
  campaigns: CampaignProgressInput[],
  pledgedFactionId: FactionId | null
): number {
  if (!pledgedFactionId) return 1;
  const territory = getZoneTerritory(zoneId, campaigns);
  if (territory.status !== "fortified") return 1;
  if (territory.homeFaction === pledgedFactionId) return 1 + territory.xpBonusPercent / 100;
  if (territory.homeFaction === "neutre" && territory.dominantFaction === pledgedFactionId) {
    return 1 + territory.xpBonusPercent / 100;
  }
  return 1;
}

export function getAllZoneTerritories(
  zoneIds: string[],
  campaigns: CampaignProgressInput[]
): ZoneTerritory[] {
  return zoneIds.map((zoneId) => getZoneTerritory(zoneId, campaigns));
}
