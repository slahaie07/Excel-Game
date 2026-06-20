import { useGameStore } from "../stores/gameStore";
import { isCloudAccount, isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";

export default function SettingsScreen() {
  const username = useGameStore((s) => s.username);
  const characterName = useGameStore((s) => s.characterName);
  const accountId = useGameStore((s) => s.accountId);
  const characterId = useGameStore((s) => s.characterId);
  const isOnline = useGameStore((s) => s.isOnline);
  const setScreen = useGameStore((s) => s.setScreen);
  const logout = useGameStore((s) => s.logout);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Paramètres</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="card space-y-2">
          <h2 className="text-aether-400 text-sm font-semibold">Compte</h2>
          <p className="text-white text-sm">{username}</p>
          <p className="text-aether-500 text-xs">
            Mode : {isConvexEnabled() && isCloudAccount(accountId) ? "☁️ Cloud Convex" : "📱 Local"}
          </p>
        </section>

        {characterName && (
          <section className="card space-y-2">
            <h2 className="text-aether-400 text-sm font-semibold">Personnage actif</h2>
            <p className="text-white text-sm">{characterName}</p>
            <p className="text-aether-500 text-xs font-mono truncate">{characterId}</p>
          </section>
        )}

        <section className="card space-y-2">
          <h2 className="text-aether-400 text-sm font-semibold">Multijoueur</h2>
          <p className="text-aether-300 text-sm">
            {isOnline && isConvexEnabled()
              ? "Convex connecté — chat, présence, PvP et guildes synchronisés"
              : "Hors-ligne — configurez VITE_CONVEX_URL pour le multijoueur"}
          </p>
        </section>

        <section className="card space-y-2">
          <h2 className="text-aether-400 text-sm font-semibold">Jeu</h2>
          <button onClick={() => setScreen("daily")} className="w-full text-left text-aether-300 text-sm py-1">
            🎁 Récompense quotidienne
          </button>
          <button onClick={() => setScreen("achievements")} className="w-full text-left text-aether-300 text-sm py-1">
            🏆 Succès
          </button>
          {isCloudCharacter(characterId) && (
            <button onClick={() => setScreen("friends")} className="w-full text-left text-aether-300 text-sm py-1">
              👥 Amis
            </button>
          )}
        </section>

        <button onClick={logout} className="btn-secondary w-full text-red-400 border-red-500/30">
          Déconnexion
        </button>

        <p className="text-aether-600 text-xs text-center">Aetheris v1.0 — L&apos;Éveil des Cristaux</p>
      </div>
    </div>
  );
}
