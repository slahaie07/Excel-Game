import { useEffect } from "react";
import { useGameStore } from "../stores/gameStore";

export default function SplashScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const accountId = useGameStore((s) => s.accountId);
  const characterId = useGameStore((s) => s.characterId);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (characterId) setScreen("world");
      else if (accountId) setScreen("character-select");
      else setScreen("login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [accountId, characterId, setScreen]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-aether-950 via-aether-900 to-aether-950">
      <div className="text-6xl mb-6 animate-pulse">💎</div>
      <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-crystal-cyan to-aether-400 mb-2">
        AETHERIS
      </h1>
      <p className="text-aether-300 text-lg font-display">L&apos;Éveil des Cristaux</p>
      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-aether-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
