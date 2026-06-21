import { useGameStore } from "../stores/gameStore";
import { APP_VERSION, VERSION_LABEL } from "../lib/userPreferences";

const CREDITS = [
  { role: "Univers & design", name: "Aetheris — Terreval" },
  { role: "Moteur tactique", name: "Phaser 3 + React 19" },
  { role: "Backend multijoueur", name: "Convex" },
  { role: "Classes & sorts", name: "15 archétypes, 4 branches de talents" },
  { role: "Contenu monde", name: "24 zones · 260 quêtes · 120 donjons · 30 métiers" },
  { role: "Version", name: `${VERSION_LABEL} — v${APP_VERSION}` },
];

export default function CreditsScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button type="button" onClick={() => setScreen("settings")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-xl font-bold">Crédits</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="text-5xl mb-4">💎</div>
        <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-crystal-cyan to-aether-400 mb-1">
          AETHERIS
        </h2>
        <p className="text-aether-400 text-sm mb-8">L&apos;Éveil des Cristaux</p>

        <div className="w-full max-w-sm space-y-3">
          {CREDITS.map((entry) => (
            <div key={entry.role} className="card flex justify-between items-center py-2 px-3">
              <span className="text-aether-500 text-xs">{entry.role}</span>
              <span className="text-aether-200 text-sm">{entry.name}</span>
            </div>
          ))}
        </div>

        <p className="text-aether-600 text-xs mt-8 text-center">
          Merci d&apos;avoir exploré Terreval.
          <br />
          Que les Cristaux d&apos;Aether vous guident.
        </p>
      </div>
    </div>
  );
}
