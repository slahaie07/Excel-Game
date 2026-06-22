import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudCombatScreen from "./CloudCombatScreen";
import LocalCombatScreen from "./LocalCombatScreen";
import LivePvpCombatScreen from "./LivePvpCombatScreen";

export default function CombatScreen() {
  const characterId = useGameStore((s) => s.characterId);
  const convexCombatId = useGameStore((s) => s.convexCombatId);
  const combatSource = useGameStore((s) => s.combatSource);
  const liveMatchId = useGameStore((s) => s.liveMatchId);

  if (combatSource === "pvp_live" && liveMatchId && isConvexEnabled()) {
    return <LivePvpCombatScreen />;
  }
  if (isConvexEnabled() && isCloudCharacter(characterId) && convexCombatId) {
    return <CloudCombatScreen />;
  }
  return <LocalCombatScreen />;
}
