import { useGameStore } from "../stores/gameStore";
import { getTutorialHint, isInTutorialZone } from "../lib/tutorialProgress";

export function TutorialZoneBanner({
  characterId,
  zoneId,
}: {
  characterId: string;
  zoneId: string;
}) {
  if (!isInTutorialZone(zoneId)) return null;

  const hint = getTutorialHint(characterId);
  if (!hint) return null;

  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="mx-4 mt-2 card-premium border-crystal-cyan/40 py-2.5 px-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-crystal-cyan text-xs font-semibold uppercase tracking-wide">
          🌱 Initiation
        </p>
        {hint.action && (
          <span className="text-[10px] text-aether-500 border border-aether-700/50 rounded-full px-2 py-0.5">
            {hint.action}
          </span>
        )}
      </div>
      <p className="text-white text-sm font-medium">{hint.title}</p>
      <p className="text-aether-400 text-xs leading-relaxed">{hint.body}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setScreen("quests")}
          className="text-[10px] text-crystal-cyan hover:text-crystal-cyan/80"
        >
          📜 Quêtes
        </button>
        <button
          type="button"
          onClick={() => setScreen("dungeons")}
          className="text-[10px] text-aether-400 hover:text-aether-300"
        >
          🏰 Donjons
        </button>
        <button
          type="button"
          onClick={() => setScreen("inventory")}
          className="text-[10px] text-aether-400 hover:text-aether-300"
        >
          🎒 Inventaire
        </button>
      </div>
    </div>
  );
}
