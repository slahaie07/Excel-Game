import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { UNIVERSE } from "../../data/universe";

export function SplashScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFade(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`splash ${fade ? "fade-in" : ""}`}>
      <div className="splash-content">
        <div className="splash-orb" />
        <h1 className="splash-title">{UNIVERSE.subtitle}</h1>
        <p className="splash-tagline">{UNIVERSE.tagline}</p>
        <p className="splash-lore">{UNIVERSE.lore}</p>
        <button
          className="btn-primary splash-btn"
          onClick={() => setScreen("character_create")}
        >
          Commencer l&apos;Aventure
        </button>
        <p className="splash-version">v0.1.0 — Univers d&apos;Étheris</p>
      </div>
    </div>
  );
}
