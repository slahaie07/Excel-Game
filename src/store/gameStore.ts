import { create } from "zustand";
import type { ClassId, CharacterStats } from "../data/classes";
import { CLASSES, scaleStatsForLevel, xpForLevel } from "../data/classes";
import type { ZoneId } from "../data/universe";
import type { CombatState } from "../game/combat/CombatEngine";
import type { QuestStatus } from "../data/quests";
import { ITEMS } from "../data/items";
import { saveCharacter } from "../lib/saveManager";
import {
  applyQuestRewards,
  getKilledMonsterIds,
  recordMonsterKills,
  recordDungeonCompletion,
} from "../lib/questEngine";
import {
  type DungeonRun,
  createDungeonCombat,
  getCurrentRoom,
  isLastRoom,
  rollCompletionLoot,
  canEnterDungeon,
} from "../lib/dungeonEngine";
import type { DungeonId } from "../data/dungeons";
import { DUNGEONS } from "../data/dungeons";

export type GameScreen =
  | "splash"
  | "character_select"
  | "login"
  | "character_create"
  | "world"
  | "combat"
  | "inventory"
  | "quests"
  | "social"
  | "craft"
  | "shop"
  | "guild"
  | "settings"
  | "dungeon"
  | "pvp";

export interface InventorySlot {
  itemId: string;
  quantity: number;
  slot: number;
}

export interface EquippedItems {
  weapon?: string;
  helmet?: string;
  armor?: string;
  boots?: string;
  amulet?: string;
  ring?: string;
  shield?: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  kamas: number;
  stats: CharacterStats;
  zone: ZoneId;
  position: { x: number; y: number };
  inventory: InventorySlot[];
  equipment: EquippedItems;
  spells: string[];
  questProgress: Record<string, { status: QuestStatus; objectives: Record<string, number> }>;
  professions: Record<string, { level: number; xp: number }>;
  petId?: string;
  guildId?: string;
  achievements: string[];
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  level: number;
  xp: number;
  stats: { force: number; hp: number };
  icon: string;
}

export interface GameState {
  screen: GameScreen;
  player: PlayerCharacter | null;
  combat: CombatState | null;
  combatSource: "world" | "dungeon";
  dungeonRun: DungeonRun | null;
  selectedNpc: string | null;
  chatMessages: ChatMessage[];
  notifications: Notification[];
  isLoading: boolean;
  playerId: string | null;
  guestMode: boolean;

  setScreen: (screen: GameScreen) => void;
  createCharacter: (name: string, classId: ClassId) => void;
  loadCharacter: (player: PlayerCharacter) => void;
  movePlayer: (x: number, y: number) => void;
  changeZone: (zone: ZoneId, x: number, y: number) => void;
  startCombat: (combat: CombatState) => void;
  endCombat: (victory: boolean, rewards?: { xp: number; kamas: number; loot: string[] }) => void;
  startDungeon: (dungeonId: DungeonId) => void;
  startDungeonCombat: () => void;
  advanceDungeon: () => void;
  completeDungeon: () => void;
  abandonDungeon: () => void;
  failDungeon: () => void;
  addItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, quantity: number) => boolean;
  equipItem: (itemId: string) => void;
  addKamas: (amount: number) => void;
  addXp: (amount: number) => void;
  updateQuest: (questId: string, objectiveId: string, progress: number) => void;
  addNotification: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  addChatMessage: (message: ChatMessage) => void;
  setSelectedNpc: (npcId: string | null) => void;
}

export interface ChatMessage {
  id: string;
  channel: "global" | "zone" | "guild" | "trade" | "private";
  sender: string;
  message: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

const STARTER_ITEMS: InventorySlot[] = [
  { itemId: "pain_ether", quantity: 10, slot: 0 },
  { itemId: "potion_vie", quantity: 5, slot: 1 },
];

export const useGameStore = create<GameState>((set, get) => ({
  screen: "splash",
  player: null,
  combat: null,
  combatSource: "world",
  dungeonRun: null,
  selectedNpc: null,
  chatMessages: [],
  notifications: [],
  isLoading: false,
  playerId: null,
  guestMode: true,

  setScreen: (screen) => set({ screen }),

  createCharacter: (name, classId) => {
    const gameClass = CLASSES[classId];
    const stats = scaleStatsForLevel(gameClass.baseStats, 1);
    const player: PlayerCharacter = {
      id: `player_${Date.now()}`,
      name,
      classId,
      level: 1,
      xp: 0,
      kamas: 100,
      stats,
      zone: "lumineth_village",
      position: { x: 10, y: 12 },
      inventory: [...STARTER_ITEMS],
      equipment: {},
      spells: [...gameClass.spells],
      questProgress: {},
      professions: {},
      achievements: [],
    };
    set({ player, screen: "world" });
    saveCharacter(useGameStore.getState().player!);
    get().addNotification(`Bienvenue, ${name} ! Votre aventure commence.`, "success");
  },

  loadCharacter: (player) => {
    set({ player, screen: "world" });
    saveCharacter(player);
  },

  movePlayer: (x, y) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, position: { x, y } } });
  },

  changeZone: (zone, x, y) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, zone, position: { x, y } } });
    get().addNotification(`Vous entrez dans une nouvelle zone.`, "info");
  },

  startCombat: (combat) => set({ combat, combatSource: "world", screen: "combat" }),

  startDungeon: (dungeonId) => {
    const { player } = get();
    if (!player) return;
    const error = canEnterDungeon(player, dungeonId);
    if (error) {
      get().addNotification(error, "warning");
      return;
    }
    const dungeon = DUNGEONS[dungeonId];
    set({
      dungeonRun: {
        dungeonId,
        roomIndex: 0,
        status: "active",
        startedAt: Date.now(),
      },
      screen: "dungeon",
    });
    get().addNotification(`Vous entrez dans ${dungeon.name}...`, "info");
  },

  startDungeonCombat: () => {
    const { player, dungeonRun } = get();
    if (!player || !dungeonRun) return;
    const room = getCurrentRoom(dungeonRun);
    if (!room) return;
    const combat = createDungeonCombat(player, room);
    set({ combat, combatSource: "dungeon", screen: "combat" });
  },

  advanceDungeon: () => {
    const { dungeonRun } = get();
    if (!dungeonRun) return;
    set({
      dungeonRun: { ...dungeonRun, roomIndex: dungeonRun.roomIndex + 1 },
      screen: "dungeon",
    });
    const room = getCurrentRoom({ ...dungeonRun, roomIndex: dungeonRun.roomIndex + 1 });
    if (room) {
      get().addNotification(`Salle suivante : ${room.name}`, "info");
    }
  },

  completeDungeon: () => {
    const { player, dungeonRun } = get();
    if (!player || !dungeonRun) return;

    const dungeon = DUNGEONS[dungeonRun.dungeonId];
    const loot = rollCompletionLoot(dungeon);

    get().addXp(dungeon.completionRewards.xp);
    get().addKamas(dungeon.completionRewards.kamas);
    for (const itemId of loot) {
      get().addItem(itemId, 1);
    }

    const { player: withQuest, completed } = recordDungeonCompletion(
      useGameStore.getState().player!,
      dungeonRun.dungeonId,
    );
    const updated = applyQuestRewards(withQuest, completed);

    set({ player: updated, dungeonRun: null, screen: "world" });

    get().addNotification(
      `Donjon terminé ! +${dungeon.completionRewards.xp} XP, +${dungeon.completionRewards.kamas} Kamas`,
      "success",
    );
    for (const { quest } of completed) {
      get().addNotification(`Quête terminée : ${quest.name} !`, "success");
    }

    saveCharacter(updated);
  },

  abandonDungeon: () => {
    set({ dungeonRun: null, screen: "world" });
    get().addNotification("Vous quittez le donjon.", "info");
  },

  failDungeon: () => {
    const { player, dungeonRun } = get();
    if (!player) return;
    const revived = {
      ...player,
      stats: { ...player.stats, hp: Math.floor(player.stats.maxHp * 0.2) },
    };
    set({
      player: revived,
      dungeonRun: dungeonRun ? { ...dungeonRun, status: "failed" } : null,
      screen: "world",
    });
    get().addNotification("Échec dans le donjon... Vous êtes évacué.", "warning");
    set({ dungeonRun: null });
    saveCharacter(revived);
  },

  endCombat: (victory, rewards) => {
    const { player, combat, combatSource, dungeonRun } = get();
    if (!player) return;

    if (combatSource === "dungeon" && dungeonRun) {
      if (victory) {
        let currentPlayer = player;

        if (combat) {
          const killed = getKilledMonsterIds(combat);
          const afterKills = recordMonsterKills(currentPlayer, killed);
          currentPlayer = afterKills.player;

          const playerEntity = combat.entities.find(
            (e) => e.team === "player" && e.isAlive,
          );
          if (playerEntity) {
            currentPlayer = {
              ...currentPlayer,
              stats: {
                ...currentPlayer.stats,
                hp: playerEntity.stats.hp,
                pa: currentPlayer.stats.maxPa,
                pm: currentPlayer.stats.maxPm,
              },
            };
          }
          set({ player: currentPlayer });
        }

        if (isLastRoom(dungeonRun)) {
          get().completeDungeon();
        } else {
          get().advanceDungeon();
        }
      } else {
        get().failDungeon();
      }
      set({ combat: null, combatSource: "world" });
      return;
    }

    let updatedPlayer = { ...player };

    if (victory && rewards) {
      get().addXp(rewards.xp);
      get().addKamas(rewards.kamas);
      for (const item of rewards.loot) {
        get().addItem(item, 1);
      }

      if (combat) {
        const killed = getKilledMonsterIds(combat);
        const afterKills = recordMonsterKills(
          useGameStore.getState().player!,
          killed,
        );
        const withRewards = applyQuestRewards(
          afterKills.player,
          afterKills.completed,
        );
        updatedPlayer = withRewards;

        for (const { quest } of afterKills.completed) {
          get().addNotification(`Quête terminée : ${quest.name} !`, "success");
        }

        set({ player: updatedPlayer });
      }

      get().addNotification(
        `Victoire ! +${rewards.xp} XP, +${rewards.kamas} Kamas`,
        "success",
      );
    } else if (!victory) {
      const revived = {
        ...player,
        stats: { ...player.stats, hp: Math.floor(player.stats.maxHp * 0.3) },
      };
      set({ player: revived });
      get().addNotification("Défaite... Vous reprenez conscience au village.", "warning");
    }

    const finalPlayer = useGameStore.getState().player;
    if (finalPlayer) saveCharacter(finalPlayer);
    set({ combat: null, screen: "world" });
  },

  addItem: (itemId, quantity) => {
    const { player } = get();
    if (!player) return;
    const inv = [...player.inventory];
    const existing = inv.find((s) => s.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const nextSlot = inv.length > 0 ? Math.max(...inv.map((s) => s.slot)) + 1 : 0;
      inv.push({ itemId, quantity, slot: nextSlot });
    }
    set({ player: { ...player, inventory: inv } });
  },

  removeItem: (itemId, quantity) => {
    const { player } = get();
    if (!player) return false;
    const slot = player.inventory.find((s) => s.itemId === itemId);
    if (!slot || slot.quantity < quantity) return false;
    const inv = player.inventory
      .map((s) =>
        s.itemId === itemId ? { ...s, quantity: s.quantity - quantity } : s,
      )
      .filter((s) => s.quantity > 0);
    set({ player: { ...player, inventory: inv } });
    return true;
  },

  equipItem: (itemId) => {
    const { player } = get();
    if (!player) return;
    const item = ITEMS[itemId];
    if (!item || !["weapon", "helmet", "armor", "boots", "amulet", "ring", "shield"].includes(item.type)) return;

    const equipment = { ...player.equipment, [item.type]: itemId };
    set({ player: { ...player, equipment } });
    get().addNotification(`${item.name} équipé !`, "success");
  },

  addKamas: (amount) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, kamas: player.kamas + amount } });
  },

  addXp: (amount) => {
    const { player } = get();
    if (!player) return;
    let newXp = player.xp + amount;
    let newLevel = player.level;
    let leveled = false;

    while (newXp >= xpForLevel(newLevel) && newLevel < 80) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
      leveled = true;
    }

    const gameClass = CLASSES[player.classId];
    const stats = scaleStatsForLevel(gameClass.baseStats, newLevel);

    set({
      player: {
        ...player,
        xp: newXp,
        level: newLevel,
        stats: { ...stats, hp: stats.maxHp, pa: stats.maxPa, pm: stats.maxPm },
      },
    });

    if (leveled) {
      get().addNotification(`Niveau ${newLevel} atteint !`, "success");
    }
  },

  updateQuest: (questId, objectiveId, progress) => {
    const { player } = get();
    if (!player) return;
    const qp = { ...player.questProgress };
    if (!qp[questId]) {
      qp[questId] = { status: "active", objectives: {} };
    }
    const entry = qp[questId];
    if (entry) {
      entry.objectives[objectiveId] = progress;
    }
    set({ player: { ...player, questProgress: qp } });
  },

  addNotification: (message, type = "info") => {
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    set((s) => ({ notifications: [...s.notifications.slice(-20), notif] }));
  },

  addChatMessage: (message) => {
    set((s) => ({ chatMessages: [...s.chatMessages.slice(-100), message] }));
  },

  setSelectedNpc: (npcId) => set({ selectedNpc: npcId }),
}));
