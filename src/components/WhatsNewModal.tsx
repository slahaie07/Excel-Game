import { APP_VERSION, VERSION_LABEL, saveUserPreferences } from "../lib/userPreferences";

const RELEASE_HIGHLIGHTS = [
  "Carte interactive de Terreval avec contrôle territorial",
  "15 sprites monstres + animations de combat",
  "Campagnes faction hebdo et récompenses top 3",
  "10 classes, talents actifs, progression complète",
  "Multijoueur Convex : donjons, raids, PvP, guildes",
];

export function WhatsNewModal({ onClose }: { onClose: () => void }) {
  const dismiss = () => {
    saveUserPreferences({ lastSeenVersion: APP_VERSION });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4">
      <div className="card max-w-sm w-full p-6">
        <p className="text-crystal-cyan text-xs font-semibold uppercase mb-1">
          {VERSION_LABEL} — v{APP_VERSION}
        </p>
        <h2 className="font-display text-xl font-bold text-white mb-3">Bienvenue sur Aetheris</h2>
        <p className="text-aether-400 text-sm mb-4">
          La version finale rassemble tout le contenu développé jusqu&apos;ici :
        </p>
        <ul className="space-y-2 mb-6">
          {RELEASE_HIGHLIGHTS.map((item) => (
            <li key={item} className="text-aether-300 text-xs flex gap-2">
              <span className="text-crystal-cyan">✦</span>
              {item}
            </li>
          ))}
        </ul>
        <button type="button" onClick={dismiss} className="btn-primary w-full">
          Explorer Terreval
        </button>
      </div>
    </div>
  );
}
