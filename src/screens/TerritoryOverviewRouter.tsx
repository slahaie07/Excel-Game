import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import { getLocalFactionCampaigns, loadLocalFactionBadge } from "../lib/factionProgress";
import TerritoryOverviewScreen from "./TerritoryOverviewScreen";

function CloudTerritoryOverview() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const zoneId = useGameStore((s) => s.zoneId);
  const campaignsData = useQuery(api.factionCampaigns.getFactionCampaigns, { characterId });
  const history = useQuery(api.factionCampaigns.getTerritoryHistory, { limit: 4 });
  const myFactions = useQuery(api.factions.getMyFactions, { characterId });

  if (!campaignsData) {
    return <div className="flex-1 flex items-center justify-center text-aether-400">Chargement...</div>;
  }

  return (
    <TerritoryOverviewScreen
      campaigns={campaignsData.campaigns}
      pledgedFactionId={myFactions?.pledgedFactionId ?? campaignsData.pledgedFactionId}
      currentZoneId={zoneId}
      historyWeeks={history ?? []}
    />
  );
}

function LocalTerritoryOverview() {
  const characterId = useGameStore((s) => s.characterId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const badge = loadLocalFactionBadge(characterId);
  return (
    <TerritoryOverviewScreen
      campaigns={getLocalFactionCampaigns(characterId)}
      pledgedFactionId={badge.pledgedFactionId}
      currentZoneId={zoneId}
    />
  );
}

export default function TerritoryOverviewRouter() {
  const characterId = useGameStore((s) => s.characterId);
  if (isConvexEnabled() && isCloudCharacter(characterId)) {
    return <CloudTerritoryOverview />;
  }
  return <LocalTerritoryOverview />;
}
