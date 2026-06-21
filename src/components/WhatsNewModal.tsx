import { APP_VERSION, VERSION_LABEL, saveUserPreferences } from "../lib/userPreferences";

const RELEASE_HIGHLIGHTS = [
  "22 métiers — récolte et craft style Dofus Touch",
  "16 nouveaux métiers : Pêcheur, Tailleur, Cuisine, Orfèvre…",
  "Recettes endgame : Couronne d'Aether, Baguette des Abysses",
  "5 emplacements métiers (au lieu de 3)",
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
        <h2 className="font-display text-xl font-bold text-white mb-3">Artisanat — 22 Métiers</h2>
        <p className="text-aether-400 text-sm mb-4">
          v3.2 : l'économie et le craft rejoignent l'échelle Dofus Touch.
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
          Maîtriser les métiers
        </button>
      </div>
    </div>
  );
}
