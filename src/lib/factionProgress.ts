import {
  FACTION_QUESTS,
  getFactionRank,
  getWeekKey,
  ZONE_FACTION_MAP,
  type FactionId,
} from "../game/data/factionContent";
import { getFactionRankCosmeticIds } from "../game/data/factionRewards";

interface LocalFactionState {
  reputations: Record<FactionId, number>;
  pledgedFactionId: FactionId | null;
  weekKey: string;
  quests: Record<string, { progress: number; completed: boolean; claimed: boolean }>;
  purchases: Record<string, number>;
}

interface LocalCosmetics {
  titles: string[];
  frames: string[];
  equippedTitle?: string;
  equippedFrame?: string;
}

function storageKey(characterId: string) {
  return `aetheris-factions-${characterId}`;
}

function charKey(characterId: string) {
  return `aetheris-char-${characterId}`;
}

function loadState(characterId: string): LocalFactionState {
  const weekKey = getWeekKey();
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(characterId)) ?? "{}") as LocalFactionState;
    if (raw.weekKey !== weekKey) {
      return {
        reputations: raw.reputations ?? { lumina: 0, umbra: 0, neutre: 0 },
        pledgedFactionId: raw.pledgedFactionId ?? null,
        weekKey,
        quests: {},
        purchases: {},
      };
    }
    return {
      reputations: raw.reputations ?? { lumina: 0, umbra: 0, neutre: 0 },
      pledgedFactionId: raw.pledgedFactionId ?? null,
      weekKey: raw.weekKey ?? weekKey,
      quests: raw.quests ?? {},
      purchases: raw.purchases ?? {},
    };
  } catch {
    return {
      reputations: { lumina: 0, umbra: 0, neutre: 0 },
      pledgedFactionId: null,
      weekKey,
      quests: {},
      purchases: {},
    };
  }
}

function saveState(characterId: string, state: LocalFactionState) {
  localStorage.setItem(storageKey(characterId), JSON.stringify(state));
}

function loadCosmetics(characterId: string): LocalCosmetics {
  try {
    const char = JSON.parse(localStorage.getItem(charKey(characterId)) ?? "{}");
    return char.cosmetics ?? { titles: [], frames: [] };
  } catch {
    return { titles: [], frames: [] };
  }
}

function saveCosmetics(characterId: string, cosmetics: LocalCosmetics) {
  const char = JSON.parse(localStorage.getItem(charKey(characterId)) ?? "{}");
  char.cosmetics = cosmetics;
  localStorage.setItem(charKey(characterId), JSON.stringify(char));
}

function grantLocalRankCosmetics(
  characterId: string,
  factionId: FactionId,
  previousReputation: number,
  newReputation: number
) {
  const oldRank = getFactionRank(previousReputation);
  const newRank = getFactionRank(newReputation);
  if (newRank.minReputation <= oldRank.minReputation) return;

  const rankOrder = ["stranger", "known", "ally", "champion", "exalted"] as const;
  const oldIdx = rankOrder.indexOf(oldRank.id as (typeof rankOrder)[number]);
  const newIdx = rankOrder.indexOf(newRank.id as (typeof rankOrder)[number]);

  const cosmetics = loadCosmetics(characterId);
  const titles = new Set(cosmetics.titles);
  const frames = new Set(cosmetics.frames);

  for (let i = oldIdx + 1; i <= newIdx; i++) {
    const rankId = rankOrder[i]!;
    if (rankId !== "champion" && rankId !== "exalted") continue;
    for (const id of getFactionRankCosmeticIds(factionId, rankId)) {
      if (id.startsWith("title_")) titles.add(id);
      else if (id.startsWith("frame_")) frames.add(id);
    }
  }

  saveCosmetics(characterId, {
    ...cosmetics,
    titles: [...titles],
    frames: [...frames],
  });
}

function addLocalReputation(
  characterId: string,
  factionId: FactionId,
  amount: number
) {
  if (amount <= 0) return;
  const state = loadState(characterId);
  const previous = state.reputations[factionId] ?? 0;
  const next = previous + amount;
  state.reputations[factionId] = next;
  saveState(characterId, state);
  grantLocalRankCosmetics(characterId, factionId, previous, next);
}

function incrementQuests(
  characterId: string,
  event: { type: "world_kills" | "zone_kills" | "pvp_wins"; zoneId?: string }
) {
  const state = loadState(characterId);
  for (const template of FACTION_QUESTS) {
    if (template.type !== event.type) continue;
    if (template.type === "zone_kills") {
      if (!event.zoneId || !template.zoneIds?.includes(event.zoneId)) continue;
    }

    const row = state.quests[template.id] ?? { progress: 0, completed: false, claimed: false };
    if (row.completed) continue;

    const progress = row.progress + 1;
    state.quests[template.id] = {
      progress,
      completed: progress >= template.target,
      claimed: row.claimed,
    };
  }
  saveState(characterId, state);
}

export function recordLocalWorldVictory(characterId: string, zoneId: string) {
  const factionId = ZONE_FACTION_MAP[zoneId];
  if (factionId) {
    addLocalReputation(characterId, factionId, 2);
  }
  incrementQuests(characterId, { type: "world_kills" });
  incrementQuests(characterId, { type: "zone_kills", zoneId });
}

export function recordLocalPvpVictory(characterId: string) {
  addLocalReputation(characterId, "umbra", 5);
  incrementQuests(characterId, { type: "pvp_wins" });
}

export function loadLocalFactionBadge(characterId: string): {
  pledgedFactionId: FactionId | null;
  rankLabel: string | null;
  rankIcon: string | null;
} {
  const state = loadState(characterId);
  if (!state.pledgedFactionId) {
    return { pledgedFactionId: null, rankLabel: null, rankIcon: null };
  }
  const rank = getFactionRank(state.reputations[state.pledgedFactionId] ?? 0);
  return {
    pledgedFactionId: state.pledgedFactionId,
    rankLabel: rank.label,
    rankIcon: rank.icon,
  };
}

export function loadLocalFactionCosmetics(characterId: string): LocalCosmetics {
  return loadCosmetics(characterId);
}

export function equipLocalFactionCosmetic(
  characterId: string,
  cosmeticId: string | null,
  slot: "title" | "frame"
) {
  const cosmetics = loadCosmetics(characterId);
  if (cosmeticId === null) {
    if (slot === "title") delete cosmetics.equippedTitle;
    else delete cosmetics.equippedFrame;
  } else if (slot === "title") {
    if (!cosmetics.titles.includes(cosmeticId)) return;
    cosmetics.equippedTitle = cosmeticId;
  } else {
    if (!cosmetics.frames.includes(cosmeticId)) return;
    cosmetics.equippedFrame = cosmeticId;
  }
  saveCosmetics(characterId, cosmetics);
}
