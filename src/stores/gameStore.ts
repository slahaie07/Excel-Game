import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadCharacter, saveCharacter } from "../lib/characterStorage";
import { buyMount as buyMountEngine, equipMount as equipMountEngine } from "../lib/mountEngine";
import {
  createGuild as createGuildEngine,
  joinGuild as joinGuildEngine,
  leaveGuild as leaveGuildEngine,
  donateToGuild as donateToGuildEngine,
  getPlayerMembership,
} from "../lib/guildEngine";
import {
  claimSeasonReward as engineClaimTier,
  buySeasonItem as engineBuyItem,
  updateSeasonProgress as engineUpdateProgress,
} from "../lib/seasonEngine";
import type { SeasonProgress } from "../lib/characterStorage";

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
  | "mounts"
  | "haven"
  | "events"
  | "live-events"
  | "daily"
  | "achievements"
  | "friends"
  | "trade"
  | "settings"
  | "hall-of-fame"
  | "season";

export interface PlayerCharacter {
  level: number;
  eclats: number;
  mountId?: string;
  ownedMounts: string[];
  guildId?: string;
  petId?: string;
  seasonProgress?: SeasonProgress;
}

type ActionResult = { success: true } | { success: false; error: string };
type GuildActionResult = ActionResult & { guildId?: string };

function buildPlayerCharacter(characterId: string): PlayerCharacter | null {
  const char = loadCharacter(characterId);
  if (!char) return null;
  return {
    level: char.level,
    eclats: char.eclats,
    mountId: char.mountId,
    ownedMounts: char.ownedMounts ?? [],
    guildId: char.guildId,
    petId: char.petId,
    seasonProgress: char.seasonProgress,
  };
}

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
  combatSource: "world" | "dungeon" | "pvp" | "pvp_live" | "event" | "raid" | null;
  dungeonId: string | null;
  convexDungeonRunId: string | null;
  pvpMode: "1v1" | "2v2" | "3v3" | null;
  pvpArenaMode: "bot" | "live";
  liveMatchId: string | null;
  livePlayerKey: string | null;
  convexPvpMatchId: string | null;
  convexRaidRunId: string | null;
  raidId: string | null;
  guildId: string | null;
  tradePartnerId: string | null;
  viewingGuildHallId: string | null;
  isOnline: boolean;
  playerCharacter: PlayerCharacter | null;

  setScreen: (screen: GameScreen) => void;
  setAccount: (accountId: string, username: string) => void;
  setCharacter: (characterId: string, name: string, classId: string, options?: { guildId?: string }) => void;
  setZone: (zoneId: string) => void;
  setCombat: (combatId: string | null, options?: { convexCombatId?: string; combatSource?: GameState["combatSource"] }) => void;
  setDungeon: (dungeonId: string | null, options?: { convexRunId?: string }) => void;
  setPvpMode: (mode: "1v1" | "2v2" | "3v3" | null, options?: { matchId?: string }) => void;
  setPvpArenaMode: (mode: "bot" | "live") => void;
  setLiveMatch: (matchId: string | null, playerKey?: string | null) => void;
  startLivePvpCombat: (matchId: string, playerKey: string, localCombatId: string) => void;
  endLivePvpCombat: () => void;
  setRaid: (raidId: string | null, options?: { convexRunId?: string }) => void;
  setGuildId: (guildId: string | null) => void;
  setTradePartner: (partnerId: string | null) => void;
  setViewingGuildHall: (guildId: string | null) => void;
  refreshPlayerCharacter: () => void;
  buyMount: (mountId: string) => ActionResult;
  equipMount: (mountId: string | null) => ActionResult;
  createGuild: (name: string, tag: string) => Promise<GuildActionResult>;
  joinGuild: (guildId: string) => Promise<GuildActionResult>;
  leaveGuild: () => ActionResult;
  donateToGuild: (amount: number) => ActionResult;
  claimSeasonTier: (tier: number) => { ok: boolean; error?: string };
  buySeasonItem: (shopItemId: string) => { ok: boolean; error?: string };
  updateSeasonProgress: (
    patch: Partial<Pick<SeasonProgress, "currency" | "passXp" | "claimedTiers" | "shopPurchases">>
  ) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      accountId: null,
      username: null,
      characterId: null,
      characterName: null,
      classId: null,
      zoneId: "vallee_eveils",
      combatId: null,
      convexCombatId: null,
      combatSource: null,
      dungeonId: null,
      convexDungeonRunId: null,
      pvpMode: null,
      pvpArenaMode: "bot",
      liveMatchId: null,
      livePlayerKey: null,
      convexPvpMatchId: null,
      convexRaidRunId: null,
      raidId: null,
      guildId: null,
      tradePartnerId: null,
      viewingGuildHallId: null,
      isOnline: !!import.meta.env.VITE_CONVEX_URL,
      playerCharacter: null,

      setScreen: (screen) => set({ screen }),
      setAccount: (accountId, username) => set({ accountId, username }),
      setCharacter: (characterId, name, classId, options) => {
        const membership = getPlayerMembership(characterId);
        const charGuildId = options?.guildId ?? loadCharacter(characterId)?.guildId ?? membership?.guildId ?? null;
        set({
          characterId,
          characterName: name,
          classId,
          guildId: charGuildId,
          playerCharacter: buildPlayerCharacter(characterId),
        });
      },
      setZone: (zoneId) => set({ zoneId }),
      setCombat: (combatId, options) =>
        set({
          combatId,
          convexCombatId: options?.convexCombatId ?? null,
          combatSource: combatId ? (options?.combatSource ?? null) : null,
          screen: combatId ? "combat" : "world",
        }),
      setDungeon: (dungeonId, options) =>
        set({ dungeonId, convexDungeonRunId: options?.convexRunId ?? null }),
      setPvpMode: (pvpMode, options) =>
        set({ pvpMode, convexPvpMatchId: options?.matchId ?? null }),
      setPvpArenaMode: (pvpArenaMode) => set({ pvpArenaMode }),
      setLiveMatch: (liveMatchId, livePlayerKey = null) =>
        set({ liveMatchId, livePlayerKey: livePlayerKey ?? null }),
      startLivePvpCombat: (liveMatchId, livePlayerKey, combatId) =>
        set({
          liveMatchId,
          livePlayerKey,
          combatId,
          combatSource: "pvp_live",
          convexCombatId: null,
          screen: "combat",
        }),
      endLivePvpCombat: () =>
        set({
          liveMatchId: null,
          livePlayerKey: null,
          combatId: null,
          combatSource: null,
        }),
      setRaid: (raidId, options) =>
        set({ raidId, convexRaidRunId: options?.convexRunId ?? null }),
      setGuildId: (guildId) => {
        const { characterId } = get();
        if (characterId) {
          const char = loadCharacter(characterId);
          if (char) saveCharacter(characterId, { ...char, guildId: guildId ?? undefined });
        }
        set({ guildId, playerCharacter: characterId ? buildPlayerCharacter(characterId) : null });
      },
      setTradePartner: (tradePartnerId) => set({ tradePartnerId }),
      setViewingGuildHall: (viewingGuildHallId) => set({ viewingGuildHallId }),

      refreshPlayerCharacter: () => {
        const { characterId } = get();
        if (!characterId) return;
        set({ playerCharacter: buildPlayerCharacter(characterId) });
      },

      buyMount: (mountId) => {
        const { characterId } = get();
        if (!characterId) return { success: false, error: "Aucun personnage" };
        const result = buyMountEngine(characterId, mountId);
        if (!result.success) return { success: false, error: result.error };
        set({ playerCharacter: buildPlayerCharacter(characterId) });
        return { success: true };
      },

      equipMount: (mountId) => {
        const { characterId } = get();
        if (!characterId) return { success: false, error: "Aucun personnage" };
        const result = equipMountEngine(characterId, mountId);
        if (!result.success) return { success: false, error: result.error };
        set({ playerCharacter: buildPlayerCharacter(characterId) });
        return { success: true };
      },

      createGuild: async (name, tag) => {
        const { characterId, characterName } = get();
        if (!characterId || !characterName) {
          return { success: false, error: "Aucun personnage" };
        }
        const result = createGuildEngine(name, tag, characterId, characterName);
        if (!result.success) return { success: false, error: result.error };

        const char = loadCharacter(characterId);
        if (char) {
          saveCharacter(characterId, { ...char, guildId: result.data.id });
        }
        set({
          guildId: result.data.id,
          playerCharacter: buildPlayerCharacter(characterId),
        });
        return { success: true, guildId: result.data.id };
      },

      joinGuild: async (guildId) => {
        const { characterId, characterName } = get();
        if (!characterId || !characterName) {
          return { success: false, error: "Aucun personnage" };
        }
        const result = joinGuildEngine(guildId, characterId, characterName);
        if (!result.success) return { success: false, error: result.error };

        const char = loadCharacter(characterId);
        if (char) {
          saveCharacter(characterId, { ...char, guildId });
        }
        set({
          guildId,
          playerCharacter: buildPlayerCharacter(characterId),
        });
        return { success: true, guildId };
      },

      leaveGuild: () => {
        const { characterId } = get();
        if (!characterId) return { success: false, error: "Aucun personnage" };
        const result = leaveGuildEngine(characterId);
        if (!result.success) return { success: false, error: result.error };

        const char = loadCharacter(characterId);
        if (char) {
          const { guildId: _, ...rest } = char;
          saveCharacter(characterId, { ...rest, guildId: undefined });
        }
        set({
          guildId: null,
          playerCharacter: buildPlayerCharacter(characterId),
        });
        return { success: true };
      },

      donateToGuild: (amount) => {
        const { characterId, guildId } = get();
        if (!characterId || !guildId) {
          return { success: false, error: "Aucune guilde" };
        }
        const char = loadCharacter(characterId);
        if (!char) return { success: false, error: "Personnage introuvable" };

        const result = donateToGuildEngine(guildId, characterId, amount, char.eclats);
        if (!result.success) return { success: false, error: result.error };

        saveCharacter(characterId, { ...char, eclats: result.data.newEclats });
        set({ playerCharacter: buildPlayerCharacter(characterId) });
        return { success: true };
      },

      claimSeasonTier: (tier) => {
        const { characterId } = get();
        if (!characterId) return { ok: false, error: "Aucun personnage" };
        const result = engineClaimTier(characterId, tier);
        if (result.ok) set({ playerCharacter: buildPlayerCharacter(characterId) });
        return result;
      },

      buySeasonItem: (shopItemId) => {
        const { characterId } = get();
        if (!characterId) return { ok: false, error: "Aucun personnage" };
        const result = engineBuyItem(characterId, shopItemId);
        if (result.ok) set({ playerCharacter: buildPlayerCharacter(characterId) });
        return result;
      },

      updateSeasonProgress: (patch) => {
        const { characterId } = get();
        if (!characterId) return;
        engineUpdateProgress(characterId, patch);
        set({ playerCharacter: buildPlayerCharacter(characterId) });
      },

      logout: () =>
        set({
          accountId: null,
          username: null,
          characterId: null,
          characterName: null,
          classId: null,
          combatId: null,
          convexCombatId: null,
          combatSource: null,
          dungeonId: null,
          convexDungeonRunId: null,
          pvpMode: null,
          pvpArenaMode: "bot",
          liveMatchId: null,
          livePlayerKey: null,
          convexPvpMatchId: null,
          convexRaidRunId: null,
          raidId: null,
          guildId: null,
          tradePartnerId: null,
          viewingGuildHallId: null,
          playerCharacter: null,
          screen: "login",
        }),
    }),
    {
      name: "aetheris-save",
      partialize: (state) => ({
        screen: state.screen,
        accountId: state.accountId,
        username: state.username,
        characterId: state.characterId,
        characterName: state.characterName,
        classId: state.classId,
        zoneId: state.zoneId,
        guildId: state.guildId,
        isOnline: state.isOnline,
      }),
    }
  )
);
