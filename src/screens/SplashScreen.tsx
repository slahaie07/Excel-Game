import { useEffect, useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { APP_VERSION, VERSION_LABEL } from "../lib/userPreferences";

export default function SplashScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const accountId = useGameStore((s) => s.accountId);
  const characterId = useGameStore((s) => s.characterId);

  const goNext = useCallback(() => {
    if (characterId) setScreen("world");
    else if (accountId) setScreen("character-select");
    else setScreen("login");
  }, [accountId, characterId, setScreen]);

  useEffect(() => {
    const timer = setTimeout(goNext, 2800);
    return () => clearTimeout(timer);
  }, [goNext]);

  return (
    <button
      type="button"
      onClick={goNext}
      className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-aether-950 via-aether-900 to-aether-950 px-6 text-center"
      aria-label="Entrer dans Aetheris"
    >
      <div className="text-6xl mb-4 animate-pulse-crystal">💎</div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-crystal-cyan border border-crystal-cyan/40 rounded-full px-3 py-0.5 mb-3">
        {VERSION_LABEL} — v{APP_VERSION}
      </span>
      <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-crystal-cyan to-aether-400 mb-2">
        AETHERIS
      </h1>
      <p className="text-aether-300 text-lg font-display">L&apos;Éveil des Cristaux</p>
      <p className="text-aether-500 text-xs mt-4 max-w-xs leading-relaxed">
        Les fragments d&apos;Aether attendent ceux qui osent les canaliser.
      </p>
      <p className="text-aether-600 text-[10px] mt-10 uppercase tracking-wider">Toucher pour continuer</p>
    </button>
  );
}
