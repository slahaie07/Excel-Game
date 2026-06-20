import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudDailyRewards from "./CloudDailyRewards";
import LocalDailyRewards from "./LocalDailyRewards";

export default function DailyRewardsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudDailyRewards />;
  return <LocalDailyRewards />;
}
