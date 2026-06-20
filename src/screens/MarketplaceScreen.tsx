import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudMarketplace from "./CloudMarketplace";
import LocalMarketplace from "./LocalMarketplace";

export default function MarketplaceScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudMarketplace />;
  return <LocalMarketplace />;
}
