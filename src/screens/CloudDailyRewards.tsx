import { useGameStore } from "../stores/gameStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { DailyRewardsUI } from "./DailyRewardsUI";

export default function CloudDailyRewards() {
  const characterId = useGameStore((s) => s.characterId)!;
  const status = useQuery(api.achievements.getDailyRewardStatus, { characterId: characterId as Id<"characters"> });
  const claimDaily = useMutation(api.social.claimDailyReward);

  return (
    <DailyRewardsUI
      loading={status === undefined}
      canClaim={status?.canClaim ?? false}
      streak={status?.streak ?? 0}
      reward={status?.nextReward ?? 50}
      onClaim={async () => {
        const result = await claimDaily({ characterId: characterId as Id<"characters"> });
        alert(`+${result.eclats} ✦ • Série ${result.streak}j`);
      }}
    />
  );
}
