import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudLiveEventsScreen from "./CloudLiveEventsScreen";

export default function LiveEventsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  if (isConvexEnabled() && isCloudCharacter(characterId)) {
    return <CloudLiveEventsScreen />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-aether-950 p-6">
      <p className="text-aether-400 text-center mb-4">
        Les événements live cross-serveur nécessitent un compte cloud.
      </p>
      <button onClick={() => setScreen("events")} className="btn-primary">Retour aux événements</button>
    </div>
  );
}
