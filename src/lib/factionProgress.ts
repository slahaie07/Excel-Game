import {
  FACTION_QUESTS,
  getFactionRank,
  getWeekKey,
  ZONE_FACTION_MAP,
  type FactionId,
} from "../game/data/factionContent";
import { getFactionRankCosmeticIds } from "../game/data/factionRewards";
import {
  CAMPAIGN_POINT_VALUES,
  FACTION_CAMPAIGN_TEMPLATES,
  type CampaignPointEvent,
} from "../game/data/factionCampaigns";

interface LocalFactionState {
  reputations: Record<FactionId, number>;
  pledgedFactionId: FactionId | null;
  weekKey: string;
  quests: Record<string, { progress: number; completed: boolean; claimed: boolean }>;
  purchases: Record<string, number>;
  campaigns: Record<FactionId, { progress: number; status: "active" | "completed" }>;
  campaignContrib: Record<FactionId, { points: number; rewardClaimed: boolean }>;
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

function defaultCampaigns(): LocalFactionState["campaigns"] {
  return {
    lumina: { progress: 0, status: "active" },
    umbra: { progress: 0, status: "active" },
    neutre: { progress: 0, status: "active" },
  };
}

function defaultCampaignContrib(): LocalFactionState["campaignContrib"] {
  return {
    lumina: { points: 0, rewardClaimed: false },
    umbra: { points: 0, rewardClaimed: false },
    neutre: { points: 0, rewardClaimed: false },
  };
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
        campaigns: defaultCampaigns(),
        campaignContrib: defaultCampaignContrib(),
      };
    }
    return {
      reputations: raw.reputations ?? { lumina: 0, umbra: 0, neutre: 0 },
      pledgedFactionId: raw.pledgedFactionId ?? null,
      weekKey: raw.weekKey ?? weekKey,
      quests: raw.quests ?? {},
      purchases: raw.purchases ?? {},
      campaigns: raw.campaigns ?? defaultCampaigns(),
      campaignContrib: raw.campaignContrib ?? defaultCampaignContrib(),
    };
  } catch {
    return {
      reputations: { lumina: 0, umbra: 0, neutre: 0 },
      pledgedFactionId: null,
      weekKey,
      quests: {},
      purchases: {},
      campaigns: defaultCampaigns(),
      campaignContrib: defaultCampaignContrib(),
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

function recordPledgedCampaignPoints(characterId: string, event: CampaignPointEvent, amount = 1) {
  const state = loadState(characterId);
  if (!state.pledgedFactionId) return;
  const factionId = state.pledgedFactionId;
  const points = CAMPAIGN_POINT_VALUES[event] * amount;
  if (points <= 0) return;

  const template = FACTION_CAMPAIGN_TEMPLATES.find((c) => c.factionId === factionId);
  if (!template) return;

  const campaign = state.campaigns[factionId] ?? { progress: 0, status: "active" as const };
  const contrib = state.campaignContrib[factionId] ?? { points: 0, rewardClaimed: false };

  campaign.progress += points;
  if (campaign.progress >= template.target) {
    campaign.status = "completed";
  }
  contrib.points += points;

  state.campaigns[factionId] = campaign;
  state.campaignContrib[factionId] = contrib;
  saveState(characterId, state);
}

export function recordLocalWorldVictory(characterId: string, zoneId: string) {
  const factionId = ZONE_FACTION_MAP[zoneId];
  if (factionId) {
    addLocalReputation(characterId, factionId, 2);
  }
  incrementQuests(characterId, { type: "world_kills" });
  incrementQuests(characterId, { type: "zone_kills", zoneId });
  recordPledgedCampaignPoints(characterId, "world_kill");
}

export function recordLocalPvpVictory(characterId: string) {
  addLocalReputation(characterId, "umbra", 5);
  incrementQuests(characterId, { type: "pvp_wins" });
  recordPledgedCampaignPoints(characterId, "pvp_win");
}

export function recordLocalFactionQuestClaim(characterId: string) {
  recordPledgedCampaignPoints(characterId, "quest_claim");
}

export function recordLocalFactionShopPurchase(characterId: string) {
  recordPledgedCampaignPoints(characterId, "shop_purchase");
}

export function getLocalFactionCampaigns(characterId: string) {
  const state = loadState(characterId);
  return FACTION_CAMPAIGN_TEMPLATES.map((template) => {
    const campaign = state.campaigns[template.factionId] ?? { progress: 0, status: "active" as const };
    const contrib = state.campaignContrib[template.factionId] ?? { points: 0, rewardClaimed: false };
    const completed = campaign.status === "completed";
    return {
      factionId: template.factionId,
      campaignId: template.id,
      name: template.name,
      description: template.description,
      target: template.target,
      progress: campaign.progress,
      status: campaign.status,
      progressPercent: Math.min(100, Math.round((campaign.progress / template.target) * 100)),
      myPoints: contrib.points,
      minContribution: template.minContribution,
      rewardReputation: template.rewardReputation,
      rewardEclats: template.rewardEclats,
      canClaim: completed && contrib.points >= template.minContribution && !contrib.rewardClaimed,
      rewardClaimed: contrib.rewardClaimed,
    };
  });
}

export function claimLocalFactionCampaignReward(characterId: string, factionId: FactionId) {
  const state = loadState(characterId);
  const template = FACTION_CAMPAIGN_TEMPLATES.find((c) => c.factionId === factionId);
  if (!template) throw new Error("Campagne introuvable");

  const campaign = state.campaigns[factionId];
  const contrib = state.campaignContrib[factionId];
  if (!campaign || campaign.status !== "completed") throw new Error("Campagne non terminée");
  if (!contrib || contrib.points < template.minContribution) throw new Error("Contribution insuffisante");
  if (contrib.rewardClaimed) throw new Error("Déjà réclamée");

  contrib.rewardClaimed = true;
  state.campaignContrib[factionId] = contrib;
  state.reputations[factionId] = (state.reputations[factionId] ?? 0) + template.rewardReputation;
  saveState(characterId, state);

  const char = JSON.parse(localStorage.getItem(charKey(characterId)) ?? "{}");
  char.eclats = (char.eclats ?? 0) + template.rewardEclats;
  localStorage.setItem(charKey(characterId), JSON.stringify(char));

  return { reputation: template.rewardReputation, eclats: template.rewardEclats };
}

export function getLocalEquippedTitleId(characterId: string): string | null {
  return loadCosmetics(characterId).equippedTitle ?? null;
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
