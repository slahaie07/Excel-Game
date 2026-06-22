import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudPvPScreen from "./CloudPvPScreen";
import LocalPvPScreen, { applyLocalPvpResult } from "./LocalPvPScreen";

export default function PvPScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const pvpArenaMode = useGameStore((s) => s.pvpArenaMode);

  if (pvpArenaMode === "live" && isConvexEnabled()) {
    return <LocalPvPScreen />;
  }
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudPvPScreen />;
  return <LocalPvPScreen />;
}

export function applyPvpResult(characterId: string, won: boolean, convexMatchId?: string) {
  if (isCloudCharacter(characterId) && convexMatchId) {
    return;
  }
  applyLocalPvpResult(characterId, won);
}
