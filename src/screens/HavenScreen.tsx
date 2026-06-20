import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudHavenScreen from "./CloudHavenScreen";
import LocalHavenScreen from "./LocalHavenScreen";

export default function HavenScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudHavenScreen />;
  return <LocalHavenScreen />;
}
