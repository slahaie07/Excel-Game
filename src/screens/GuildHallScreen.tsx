import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudGuildHallScreen from "./CloudGuildHallScreen";

export default function GuildHallScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const guildId = useGameStore((s) => s.guildId);
  const viewingGuildHallId = useGameStore((s) => s.viewingGuildHallId);
  const setScreen = useGameStore((s) => s.setScreen);

  const canVisit = viewingGuildHallId || guildId;

  if (!canVisit) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-aether-950 p-6">
        <p className="text-aether-400 text-center mb-4">
          Rejoignez une guilde ou visitez le hall d&apos;un ami pour accéder aux guild halls.
        </p>
        <button onClick={() => setScreen("guild")} className="btn-primary">Retour aux guildes</button>
      </div>
    );
  }

  if (isConvexEnabled() && isCloudCharacter(characterId)) {
    return <CloudGuildHallScreen />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-aether-950 p-6">
      <p className="text-aether-400 text-center mb-4">Le guild hall partagé nécessite un compte cloud.</p>
      <button onClick={() => setScreen("guild")} className="btn-primary">Retour</button>
    </div>
  );
}
