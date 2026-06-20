import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudCombatScreen from "./CloudCombatScreen";
import LocalCombatScreen from "./LocalCombatScreen";

export default function CombatScreen() {
  const characterId = useGameStore((s) => s.characterId);
  const convexCombatId = useGameStore((s) => s.convexCombatId);
  if (isConvexEnabled() && isCloudCharacter(characterId) && convexCombatId) {
    return <CloudCombatScreen />;
  }
  return <LocalCombatScreen />;
}
