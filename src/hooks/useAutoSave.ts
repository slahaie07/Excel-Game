import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { saveCharacter } from "../lib/saveManager";

const AUTO_SAVE_MS = 30_000;

export function useAutoSave() {
  const player = useGameStore((s) => s.player);
  const screen = useGameStore((s) => s.screen);

  useEffect(() => {
    if (!player || screen === "splash" || screen === "character_select") return;

    saveCharacter(player);

    const interval = setInterval(() => {
      const current = useGameStore.getState().player;
      if (current) saveCharacter(current);
    }, AUTO_SAVE_MS);

    return () => clearInterval(interval);
  }, [player, screen]);
}
