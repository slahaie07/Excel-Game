import { useGameStore } from "../stores/gameStore";
import { FACTION_META, type FactionId } from "../game/data/factionContent";
import type { FactionCampaignView } from "../screens/FactionsUI";

export function WorldCampaignBanner({
  pledgedFactionId,
  campaigns,
}: {
  pledgedFactionId: FactionId | null;
  campaigns: FactionCampaignView[];
}) {
  const setScreen = useGameStore((s) => s.setScreen);
  if (!pledgedFactionId) return null;

  const campaign = campaigns.find((c) => c.factionId === pledgedFactionId);
  if (!campaign) return null;

  const meta = FACTION_META[pledgedFactionId];

  return (
    <button
      type="button"
      onClick={() => setScreen("factions")}
      className="mx-3 mt-2 w-[calc(100%-1.5rem)] flex items-center gap-3 p-2 rounded-xl bg-aether-900/90 border border-aether-600/50 hover:border-crystal-cyan/40 transition-colors"
    >
      <span className="text-xl">{meta.icon}</span>
      <div className="flex-1 text-left min-w-0">
        <p className="text-white text-xs font-semibold truncate">{campaign.name}</p>
        <div className="mt-1 h-1.5 bg-aether-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-aether-500 to-crystal-cyan"
            style={{ width: `${campaign.progressPercent}%` }}
          />
        </div>
        <p className="text-aether-500 text-[10px] mt-0.5">
          {campaign.progress}/{campaign.target} pts • Vous : {campaign.myPoints} pts
          {campaign.status === "completed" && !campaign.rewardClaimed && (
            <span className="text-green-400 ml-1">— Récompense disponible !</span>
          )}
        </p>
      </div>
      <span className="text-aether-400 text-xs shrink-0">→</span>
    </button>
  );
}
