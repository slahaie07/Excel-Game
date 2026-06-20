import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudTradeScreen from "./CloudTradeScreen";

export default function TradeScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  if (!isConvexEnabled() || !isCloudCharacter(characterId)) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950">
        <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
          <button onClick={() => setScreen("friends")} className="text-aether-400 text-xl">←</button>
          <h1 className="font-display text-xl font-bold">Échange</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center text-aether-400">
          Mode multijoueur requis pour l'échange direct.
        </div>
      </div>
    );
  }

  return <CloudTradeScreen />;
}
