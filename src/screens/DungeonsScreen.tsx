import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudDungeonsScreen from "./CloudDungeonsScreen";
import LocalDungeonsScreen from "./LocalDungeonsScreen";

export { advanceDungeonRoom, createNextRoomCombat } from "../lib/dungeonHelpers";

export default function DungeonsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudDungeonsScreen />;
  return <LocalDungeonsScreen />;
}
