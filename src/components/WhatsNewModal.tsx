import { APP_VERSION, VERSION_LABEL, saveUserPreferences } from "../lib/userPreferences";

const RELEASE_HIGHLIGHTS = [
  "24 zones Terreval — 6 régions jouables",
  "4 nouvelles régions : Givre, Marais, Cendres, Îles Stellaires",
  "40+ points d'intérêt (téléporteurs, trésors, donjons, lore)",
  "+24 donjons et 50 monstres sur les nouveaux continents",
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
        <h2 className="font-display text-xl font-bold text-white mb-3">Terreval — Carte Mondiale</h2>
        <p className="text-aether-400 text-sm mb-4">
          v4.0 : explorez le monde élargi style Dofus Touch.
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
