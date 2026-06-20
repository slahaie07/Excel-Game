import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";

type HallOfFameCategory =
  | "pvp_legend"
  | "season_champion"
  | "tournament_champion"
  | "raid_hero"
  | "live_legend"
  | "guild_war_champion";

export default function HallOfFameScreen() {
  const characterId = useGameStore((s) => s.characterId);
  const setScreen = useGameStore((s) => s.setScreen);
  const [category, setCategory] = useState<HallOfFameCategory | undefined>(undefined);

  const categories = useQuery(
    api.hallOfFame.getHallOfFameCategories,
    isConvexEnabled() && characterId && isCloudCharacter(characterId) ? {} : "skip"
  );
  const entries = useQuery(
    api.hallOfFame.getHallOfFame,
    isConvexEnabled() && characterId && isCloudCharacter(characterId)
      ? { category, limit: 25 }
      : "skip"
  );

  if (!isConvexEnabled() || !characterId || !isCloudCharacter(characterId)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-aether-950 p-6">
        <p className="text-aether-400 text-center mb-4">Le Panthéon cross-serveur nécessite un compte cloud.</p>
        <button onClick={() => setScreen("world")} className="btn-primary">Retour</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">🏛️ Panthéon d&apos;Aetheris</h1>
        <span className="ml-auto text-crystal-gold text-xs">Cross-serveur</span>
      </div>

      <div className="flex gap-1 p-3 overflow-x-auto border-b border-aether-800/50">
        <button
          onClick={() => setCategory(undefined)}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${!category ? "bg-crystal-gold/20 text-crystal-gold" : "text-aether-500"}`}
        >
          Tous
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.category}
            onClick={() => setCategory(c.category as HallOfFameCategory)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${category === c.category ? "bg-crystal-gold/20 text-crystal-gold" : "text-aether-500"}`}
          >
            {c.icon} {c.label} ({c.count})
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {entries === undefined ? (
          <p className="text-aether-400 text-center text-sm">Chargement...</p>
        ) : entries.length === 0 ? (
          <p className="text-aether-500 text-center text-sm py-8">
            Aucune légende inscrite pour l&apos;instant. Soyez le premier !
          </p>
        ) : (
          entries.map((entry, i) => {
            return (
              <div key={entry._id} className="card flex items-center gap-3 border-crystal-gold/20">
                <span className="text-aether-500 font-bold w-6">#{i + 1}</span>
                <span className="text-2xl">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{entry.displayName}</p>
                  <p className="text-aether-400 text-xs truncate">{entry.subtitle}</p>
                  <p className="text-aether-600 text-[10px]">{entry.periodLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-crystal-gold text-sm font-bold">{entry.value}</p>
                  <p className="text-aether-600 text-[10px]">
                    {new Date(entry.achievedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
