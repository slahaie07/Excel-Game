import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudFactions from "./CloudFactions";
import LocalFactions from "./LocalFactions";

export default function FactionsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudFactions />;
  return <LocalFactions />;
}
