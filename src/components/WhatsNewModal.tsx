import { APP_VERSION, VERSION_LABEL, saveUserPreferences } from "../lib/userPreferences";

const RELEASE_HIGHLIGHTS = [
  "30 donjons — +18 nouveaux sur toutes les zones de Terreval",
  "15 classes (style Dofus Touch) : Druide, Fulgurancien, Paladin, Faucheur, Artilleur",
  "75 sorts joueur (5 par classe), 18 boss de donjons additionnels",
  "17 items de loot donjons et progression serveur synchronisée",
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
        <h2 className="font-display text-xl font-bold text-white mb-3">Légions & Donjons</h2>
        <p className="text-aether-400 text-sm mb-4">
          v2.4 + v2.5 : expansion massive vers l&apos;échelle Dofus Touch.
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
          Conquérir les donjons
        </button>
      </div>
    </div>
  );
}
