import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameScreen =
  | "splash"
  | "login"
  | "character-select"
  | "character-create"
  | "world"
  | "combat"
  | "inventory"
  | "quests"
  | "guild"
  | "marketplace"
  | "professions"
  | "settings";

interface GameState {
  screen: GameScreen;
  accountId: string | null;
  username: string | null;
  characterId: string | null;
  characterName: string | null;
  classId: string | null;
  zoneId: string;
  combatId: string | null;
  isOnline: boolean;

  setScreen: (screen: GameScreen) => void;
  setAccount: (accountId: string, username: string) => void;
  setCharacter: (characterId: string, name: string, classId: string) => void;
  setZone: (zoneId: string) => void;
  setCombat: (combatId: string | null) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      screen: "splash",
      accountId: null,
      username: null,
      characterId: null,
      characterName: null,
      classId: null,
      zoneId: "vallee_eveils",
      combatId: null,
      isOnline: !!import.meta.env.VITE_CONVEX_URL,

      setScreen: (screen) => set({ screen }),
      setAccount: (accountId, username) => set({ accountId, username }),
      setCharacter: (characterId, name, classId) =>
        set({ characterId, characterName: name, classId }),
      setZone: (zoneId) => set({ zoneId }),
      setCombat: (combatId) => set({ combatId, screen: combatId ? "combat" : "world" }),
      logout: () =>
        set({
          accountId: null,
          username: null,
          characterId: null,
          characterName: null,
          classId: null,
          combatId: null,
          screen: "login",
        }),
    }),
    { name: "aetheris-save" }
  )
);
