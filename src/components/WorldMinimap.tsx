import { WorldMapPanel } from "./WorldMapPanel";
import type { FactionCampaignView } from "../screens/FactionsUI";

export function WorldMinimap({
  zoneId,
  campaigns,
  onOpenMap,
  onSelectZone,
}: {
  zoneId: string;
  campaigns: FactionCampaignView[];
  onOpenMap: () => void;
  onSelectZone: (zoneId: string) => void;
}) {
  return (
    <div className="absolute bottom-2 right-2 z-20 w-40">
      <button
        type="button"
        onClick={onOpenMap}
        className="w-full text-left mb-1 text-[9px] text-aether-400 hover:text-aether-200"
      >
        Carte de Terreval ↗
      </button>
      <WorldMapPanel
        currentZoneId={zoneId}
        campaigns={campaigns}
        onSelectZone={onSelectZone}
        compact
      />
    </div>
  );
}
