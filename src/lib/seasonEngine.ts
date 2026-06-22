import {
  getCurrentSeason,
  getSeasonById,
  type GameSeason,
  type SeasonQuest,
} from "../data/seasons";
import {
  loadCharacter,
  saveCharacter,
  addXp,
  addToInventory,
  type CharacterData,
  type SeasonProgress,
  type SeasonObjectiveProgress,
} from "./characterStorage";

export type { SeasonProgress, SeasonObjectiveProgress };

export interface SeasonProgressView {
  season: GameSeason;
  progress: SeasonProgress;
  passXp: number;
  maxPassXp: number;
  passPercent: number;
  nextTier: number | null;
  currency: number;
}

function createEmptyObjectives(season: GameSeason): SeasonObjectiveProgress[] {
  return season.quests.map((quest) => ({
    questId: quest.id,
    objectives: quest.objectives.map((o) => ({ current: 0, required: o.count })),
    completed: false,
    claimed: false,
  }));
}

export function ensureSeasonProgress(characterId: string): SeasonProgress {
  const season = getCurrentSeason();
  const char = loadCharacter(characterId);
  if (!char) {
    return {
      seasonId: season.id,
      currency: 0,
      passXp: 0,
      claimedTiers: [],
      objectives: createEmptyObjectives(season),
      shopPurchases: {},
    };
  }

  if (!char.seasonProgress || char.seasonProgress.seasonId !== season.id) {
    const progress: SeasonProgress = {
      seasonId: season.id,
      currency: 0,
      passXp: 0,
      claimedTiers: [],
      objectives: createEmptyObjectives(season),
      shopPurchases: {},
    };
    saveCharacter(characterId, { ...char, seasonProgress: progress });
    return progress;
  }

  return char.seasonProgress;
}

export function getSeasonProgress(player: CharacterData | null): SeasonProgressView | null {
  const season = getCurrentSeason();
  const progress = player?.seasonProgress?.seasonId === season.id
    ? player.seasonProgress
    : {
        seasonId: season.id,
        currency: 0,
        passXp: 0,
        claimedTiers: [],
        objectives: createEmptyObjectives(season),
        shopPurchases: {},
      };

  const maxPassXp = season.passTiers[season.passTiers.length - 1]?.passXpRequired ?? 1;
  const passPercent = Math.min(100, Math.round((progress.passXp / maxPassXp) * 100));
  const nextTierDef = season.passTiers.find(
    (t) => !progress.claimedTiers.includes(t.tier) && progress.passXp >= t.passXpRequired
  );
  const nextLocked = season.passTiers.find((t) => progress.passXp < t.passXpRequired);

  return {
    season,
    progress,
    passXp: progress.passXp,
    maxPassXp,
    passPercent,
    nextTier: nextTierDef?.tier ?? nextLocked?.tier ?? null,
    currency: progress.currency,
  };
}

function getQuestDef(season: GameSeason, questId: string): SeasonQuest | undefined {
  return season.quests.find((q) => q.id === questId);
}

function applyQuestRewards(characterId: string, quest: SeasonQuest, progress: SeasonProgress): void {
  progress.currency += quest.rewards.seasonCurrency;
  progress.passXp += quest.rewards.passXp;

  const char = loadCharacter(characterId);
  if (!char) return;

  if (quest.rewards.xp) addXp(characterId, quest.rewards.xp);
  if (quest.rewards.eclats) {
    saveCharacter(characterId, {
      ...char,
      eclats: char.eclats + quest.rewards.eclats,
    });
  }
}

function checkQuestCompletion(
  characterId: string,
  season: GameSeason,
  progress: SeasonProgress
): boolean {
  let changed = false;

  for (const objProgress of progress.objectives) {
    if (objProgress.completed) continue;
    const quest = getQuestDef(season, objProgress.questId);
    if (!quest) continue;

    const allDone = objProgress.objectives.every((o) => o.current >= o.required);
    if (allDone) {
      objProgress.completed = true;
      changed = true;
      pushSeasonNotification(characterId, `Quête saisonnière terminée : ${quest.name}`);
    }
  }

  return changed;
}

export function awardSeasonCurrency(
  characterId: string,
  amount: number,
  passXp = 0
): SeasonProgress | null {
  if (amount <= 0 && passXp <= 0) return null;

  const char = loadCharacter(characterId);
  if (!char) return null;

  const progress = ensureSeasonProgress(characterId);
  progress.currency += amount;
  progress.passXp += passXp;

  saveCharacter(characterId, { ...char, seasonProgress: progress });
  return progress;
}

export function updateSeasonProgress(
  characterId: string,
  patch: Partial<Pick<SeasonProgress, "currency" | "passXp" | "claimedTiers" | "shopPurchases">>
): SeasonProgress | null {
  const char = loadCharacter(characterId);
  if (!char) return null;

  const progress = ensureSeasonProgress(characterId);
  const updated: SeasonProgress = {
    ...progress,
    ...patch,
    claimedTiers: patch.claimedTiers ?? progress.claimedTiers,
    shopPurchases: patch.shopPurchases ?? progress.shopPurchases,
  };

  saveCharacter(characterId, { ...char, seasonProgress: updated });
  return updated;
}

function incrementObjective(
  characterId: string,
  type: "kill" | "dungeon" | "pvp_win",
  targetId?: string
): void {
  const season = getCurrentSeason();
  const char = loadCharacter(characterId);
  if (!char) return;

  const progress = ensureSeasonProgress(characterId);
  let changed = false;

  for (const objProgress of progress.objectives) {
    if (objProgress.completed) continue;
    const quest = getQuestDef(season, objProgress.questId);
    if (!quest) continue;

    quest.objectives.forEach((objDef, i) => {
      if (objDef.type !== type) return;
      if (type === "kill" && objDef.targetId !== "any" && objDef.targetId !== targetId) return;

      const slot = objProgress.objectives[i];
      if (slot && slot.current < slot.required) {
        slot.current += 1;
        changed = true;
      }
    });
  }

  if (changed && checkQuestCompletion(characterId, season, progress)) {
    saveCharacter(characterId, { ...char, seasonProgress: progress });
  } else if (changed) {
    saveCharacter(characterId, { ...char, seasonProgress: progress });
  }
}

export function trackSeasonKill(characterId: string, monsterId?: string): void {
  const season = getCurrentSeason();
  const rewards = season.activityRewards.kill;
  awardSeasonCurrency(characterId, rewards.seasonCurrency, rewards.passXp);
  incrementObjective(characterId, "kill", monsterId ?? "any");
}

export function trackSeasonDungeonComplete(characterId: string): void {
  const season = getCurrentSeason();
  const rewards = season.activityRewards.dungeon;
  awardSeasonCurrency(characterId, rewards.seasonCurrency, rewards.passXp);
  incrementObjective(characterId, "dungeon");
}

export function trackSeasonPvpWin(characterId: string): void {
  const season = getCurrentSeason();
  const rewards = season.activityRewards.pvpWin;
  awardSeasonCurrency(characterId, rewards.seasonCurrency, rewards.passXp);
  incrementObjective(characterId, "pvp_win");
}

export function claimSeasonQuestReward(characterId: string, questId: string): { ok: boolean; error?: string } {
  const char = loadCharacter(characterId);
  if (!char) return { ok: false, error: "Personnage introuvable" };

  const season = getCurrentSeason();
  const progress = ensureSeasonProgress(characterId);
  const objProgress = progress.objectives.find((o) => o.questId === questId);
  const quest = getQuestDef(season, questId);

  if (!objProgress || !quest) return { ok: false, error: "Quête introuvable" };
  if (!objProgress.completed) return { ok: false, error: "Quête non terminée" };
  if (objProgress.claimed) return { ok: false, error: "Récompense déjà réclamée" };

  applyQuestRewards(characterId, quest, progress);
  objProgress.claimed = true;
  saveCharacter(characterId, { ...loadCharacter(characterId)!, seasonProgress: progress });
  return { ok: true };
}

export function claimSeasonReward(characterId: string, tier: number): { ok: boolean; error?: string } {
  const char = loadCharacter(characterId);
  if (!char) return { ok: false, error: "Personnage introuvable" };

  const season = getCurrentSeason();
  const progress = ensureSeasonProgress(characterId);
  const tierDef = season.passTiers.find((t) => t.tier === tier);

  if (!tierDef) return { ok: false, error: "Palier introuvable" };
  if (progress.claimedTiers.includes(tier)) return { ok: false, error: "Palier déjà réclamé" };
  if (progress.passXp < tierDef.passXpRequired) {
    return { ok: false, error: "Progression insuffisante" };
  }

  progress.claimedTiers.push(tier);
  progress.claimedTiers.sort((a, b) => a - b);

  if (tierDef.reward.seasonCurrency) {
    progress.currency += tierDef.reward.seasonCurrency;
  }
  if (tierDef.reward.eclats) {
    char.eclats += tierDef.reward.eclats;
  }
  if (tierDef.reward.itemId) {
    addToInventory(characterId, tierDef.reward.itemId, tierDef.reward.itemQuantity ?? 1);
  }

  saveCharacter(characterId, { ...char, seasonProgress: progress });
  pushSeasonNotification(characterId, `Palier ${tier} du pass réclamé !`);
  return { ok: true };
}

export function buySeasonItem(characterId: string, shopItemId: string): { ok: boolean; error?: string } {
  const char = loadCharacter(characterId);
  if (!char) return { ok: false, error: "Personnage introuvable" };

  const season = getCurrentSeason();
  const item = season.shopItems.find((s) => s.id === shopItemId);
  if (!item) return { ok: false, error: "Article introuvable" };

  const progress = ensureSeasonProgress(characterId);
  const bought = progress.shopPurchases[item.id] ?? 0;
  if (bought >= item.stock) return { ok: false, error: "Stock épuisé" };
  if (progress.currency < item.cost) return { ok: false, error: "Éclats saisonniers insuffisants" };

  progress.currency -= item.cost;
  progress.shopPurchases[item.id] = bought + 1;
  addToInventory(characterId, item.itemId, 1);
  saveCharacter(characterId, { ...char, seasonProgress: progress });

  return { ok: true };
}

export function getSeasonLeaderboardScore(progress: SeasonProgress): number {
  return progress.passXp + progress.currency * 2;
}

function pushSeasonNotification(characterId: string, message: string): void {
  const key = `aetheris-season-notifications-${characterId}`;
  try {
    const list: { message: string; at: number }[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    list.unshift({ message, at: Date.now() });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  } catch {
    localStorage.setItem(key, JSON.stringify([{ message, at: Date.now() }]));
  }
}

export function getSeasonNotifications(characterId: string): { message: string; at: number }[] {
  try {
    return JSON.parse(localStorage.getItem(`aetheris-season-notifications-${characterId}`) ?? "[]");
  } catch {
    return [];
  }
}

export { getCurrentSeason, getSeasonById };
