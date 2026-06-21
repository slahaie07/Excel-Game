import { APP_VERSION, VERSION_LABEL, saveUserPreferences } from "../lib/userPreferences";
import { useGameStore } from "../stores/gameStore";

const RELEASE_HIGHLIGHTS = [
  "260 quêtes — Terreval entièrement cartographié",
  "120 donjons dont 26 raids mythiques régionaux",
  "30 métiers et sync cloud des quêtes en temps réel",
  "Chronique Finale — capstone endgame v5.0",
];

export function WhatsNewModal({ onClose }: { onClose: () => void }) {
  const setScreen = useGameStore((s) => s.setScreen);

  const dismiss = () => {
    saveUserPreferences({ lastSeenVersion: APP_VERSION });
    onClose();
  };

  const openGuide = () => {
    saveUserPreferences({ lastSeenVersion: APP_VERSION });
    onClose();
    setScreen("guide");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4">
      <div className="card-premium max-w-sm w-full p-6">
        <p className="text-crystal-cyan text-xs font-semibold uppercase mb-1">
          {VERSION_LABEL} — v{APP_VERSION}
        </p>
        <h2 className="font-display text-xl font-bold text-white mb-3">Terreval Finale</h2>
        <p className="text-aether-400 text-sm mb-4">
          Le monde d&apos;Aetheris est complet. Quêtes, donjons mythiques et métiers au sommet.
        </p>
        <ul className="space-y-2 mb-6">
          {RELEASE_HIGHLIGHTS.map((item) => (
            <li key={item} className="text-aether-300 text-xs flex gap-2">
              <span className="text-crystal-cyan">✦</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <button type="button" onClick={dismiss} className="btn-primary w-full">
            Continuer l&apos;aventure
          </button>
          <button type="button" onClick={openGuide} className="btn-secondary w-full text-sm">
            Voir le guide
          </button>
        </div>
      </div>
    </div>
  );
}
