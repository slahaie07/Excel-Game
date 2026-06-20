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
  | "guild-hall"
  | "marketplace"
  | "professions"
  | "pvp"
  | "dungeons"
  | "dungeon-run"
  | "raids"
  | "pets"
  | "haven"
  | "events"
  | "live-events"
  | "daily"
  | "achievements"
  | "friends"
  | "trade"
  | "settings"
  | "hall-of-fame";

interface GameState {
  screen: GameScreen;
  accountId: string | null;
  username: string | null;
  characterId: string | null;
  characterName: string | null;
  classId: string | null;
  zoneId: string;
  combatId: string | null;
  convexCombatId: string | null;
  dungeonId: string | null;
  convexDungeonRunId: string | null;
  pvpMode: "1v1" | "2v2" | "3v3" | null;
  convexPvpMatchId: string | null;
  convexRaidRunId: string | null;
  raidId: string | null;
  guildId: string | null;
  tradePartnerId: string | null;
  viewingGuildHallId: string | null;
  isOnline: boolean;

  setScreen: (screen: GameScreen) => void;
  setAccount: (accountId: string, username: string) => void;
  setCharacter: (characterId: string, name: string, classId: string, options?: { guildId?: string }) => void;
  setZone: (zoneId: string) => void;
  setCombat: (combatId: string | null, options?: { convexCombatId?: string }) => void;
  setDungeon: (dungeonId: string | null, options?: { convexRunId?: string }) => void;
  setPvpMode: (mode: "1v1" | "2v2" | "3v3" | null, options?: { matchId?: string }) => void;
  setRaid: (raidId: string | null, options?: { convexRunId?: string }) => void;
  setGuildId: (guildId: string | null) => void;
  setTradePartner: (partnerId: string | null) => void;
  setViewingGuildHall: (guildId: string | null) => void;
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
      convexCombatId: null,
      dungeonId: null,
      convexDungeonRunId: null,
      pvpMode: null,
      convexPvpMatchId: null,
      convexRaidRunId: null,
      raidId: null,
      guildId: null,
      tradePartnerId: null,
      viewingGuildHallId: null,
      isOnline: !!import.meta.env.VITE_CONVEX_URL,

      setScreen: (screen) => set({ screen }),
      setAccount: (accountId, username) => set({ accountId, username }),
      setCharacter: (characterId, name, classId, options) =>
        set({
          characterId,
          characterName: name,
          classId,
          guildId: options?.guildId ?? null,
        }),
      setZone: (zoneId) => set({ zoneId }),
      setCombat: (combatId, options) =>
        set({
          combatId,
          convexCombatId: options?.convexCombatId ?? null,
          screen: combatId ? "combat" : "world",
        }),
      setDungeon: (dungeonId, options) =>
        set({ dungeonId, convexDungeonRunId: options?.convexRunId ?? null }),
      setPvpMode: (pvpMode, options) =>
        set({ pvpMode, convexPvpMatchId: options?.matchId ?? null }),
      setRaid: (raidId, options) =>
        set({ raidId, convexRaidRunId: options?.convexRunId ?? null }),
      setGuildId: (guildId) => set({ guildId }),
      setTradePartner: (tradePartnerId) => set({ tradePartnerId }),
      setViewingGuildHall: (viewingGuildHallId) => set({ viewingGuildHallId }),
      logout: () =>
        set({
          accountId: null,
          username: null,
          characterId: null,
          characterName: null,
          classId: null,
          combatId: null,
          convexCombatId: null,
          dungeonId: null,
          convexDungeonRunId: null,
          pvpMode: null,
          convexPvpMatchId: null,
          convexRaidRunId: null,
          raidId: null,
          guildId: null,
          tradePartnerId: null,
          viewingGuildHallId: null,
          screen: "login",
        }),
    }),
    { name: "aetheris-save" }
  )
);
