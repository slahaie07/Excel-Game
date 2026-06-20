import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import {
  FACTION_META,
  FACTION_QUESTS,
  FACTION_SHOP_ITEMS,
  FACTION_RANKS,
  getFactionRank,
  getNextFactionRank,
  getWeekKey,
  meetsRankRequirement,
  type FactionId,
} from "../game/data/factionContent";
import {
  equipLocalFactionCosmetic,
  loadLocalFactionCosmetics,
} from "../lib/factionProgress";
import { FactionsUI } from "./FactionsUI";

interface LocalFactionState {
  reputations: Record<FactionId, number>;
  pledgedFactionId: FactionId | null;
  weekKey: string;
  quests: Record<string, { progress: number; completed: boolean; claimed: boolean }>;
  purchases: Record<string, number>;
}

function storageKey(characterId: string) {
  return `aetheris-factions-${characterId}`;
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

function loadEclats(characterId: string): number {
  try {
    const char = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
    return char.eclats ?? 0;
  } catch {
    return 0;
  }
}

function saveEclats(characterId: string, eclats: number) {
  const charKey = `aetheris-char-${characterId}`;
  const char = JSON.parse(localStorage.getItem(charKey) ?? "{}");
  char.eclats = eclats;
  localStorage.setItem(charKey, JSON.stringify(char));
}

function addInventoryItem(characterId: string, itemId: string, quantity: number) {
  const charKey = `aetheris-char-${characterId}`;
  const char = JSON.parse(localStorage.getItem(charKey) ?? "{}");
  const inventory = char.inventory ?? [];
  const existing = inventory.find((i: { itemId: string }) => i.itemId === itemId);
  if (existing) existing.quantity += quantity;
  else inventory.push({ itemId, quantity });
  char.inventory = inventory;
  localStorage.setItem(charKey, JSON.stringify(char));
}

export default function LocalFactions() {
  const characterId = useGameStore((s) => s.characterId)!;
  const [state, setState] = useState(() => loadState(characterId));
  const [eclats, setEclats] = useState(() => loadEclats(characterId));
  const [message, setMessage] = useState("");
  const [, bump] = useState(0);
  const [cosmetics, setCosmetics] = useState(() => loadLocalFactionCosmetics(characterId));

  const refresh = (next: LocalFactionState, nextEclats?: number) => {
    saveState(characterId, next);
    setState(next);
    if (nextEclats !== undefined) {
      saveEclats(characterId, nextEclats);
      setEclats(nextEclats);
    }
    bump((n) => n + 1);
    setCosmetics(loadLocalFactionCosmetics(characterId));
  };

  const factions = (["lumina", "umbra", "neutre"] as const).map((factionId) => {
    const meta = FACTION_META[factionId];
    const rep = state.reputations[factionId] ?? 0;
    const rank = getFactionRank(rep);
    const next = getNextFactionRank(rep);
    const pointsToNext = next ? next.minReputation - rep : null;
    const progressPercent = next
      ? Math.min(100, Math.round(((rep - rank.minReputation) / (next.minReputation - rank.minReputation)) * 100))
      : 100;

    return {
      factionId,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      reputation: rep,
      rank: rank.id,
      rankLabel: rank.label,
      rankIcon: rank.icon,
      nextRankLabel: next?.label ?? null,
      pointsToNext,
      progressPercent,
      isPledged: state.pledgedFactionId === factionId,
    };
  });

  const quests = FACTION_QUESTS.map((template) => {
    const row = state.quests[template.id] ?? { progress: 0, completed: false, claimed: false };
    return {
      _id: template.id,
      questId: template.id,
      factionId: template.factionId,
      label: template.label,
      description: template.description,
      target: template.target,
      progress: row.progress,
      completed: row.completed,
      claimed: row.claimed,
      rewardReputation: template.rewardReputation,
      rewardEclats: template.rewardEclats,
    };
  });

  const shopItems = FACTION_SHOP_ITEMS.map((item) => {
    const faction = factions.find((f) => f.factionId === item.factionId);
    const rank = FACTION_RANKS.find((r) => r.id === item.requiredRankId);
    const purchased = state.purchases[item.id] ?? 0;
    const locked = !faction || !meetsRankRequirement(faction.rank, item.requiredRankId);
    const canPurchase = !locked && purchased < item.weeklyLimit && eclats >= item.costEclats;

    return {
      id: item.id,
      factionId: item.factionId,
      itemId: item.itemId,
      quantity: item.quantity,
      label: item.label,
      requiredRankId: item.requiredRankId,
      requiredRankLabel: rank?.label ?? item.requiredRankId,
      costEclats: item.costEclats,
      weeklyLimit: item.weeklyLimit,
      purchasedThisWeek: purchased,
      canPurchase,
      locked,
    };
  });

  return (
    <FactionsUI
      weekKey={state.weekKey}
      eclats={eclats}
      pledgedFactionId={state.pledgedFactionId}
      factions={factions}
      quests={quests}
      shopItems={shopItems}
      message={message}
      cosmetics={cosmetics}
      onPledge={async (factionId) => {
        const next = { ...state };
        next.pledgedFactionId = factionId;
        next.reputations = { ...next.reputations, [factionId]: (next.reputations[factionId] ?? 0) + 25 };
        refresh(next);
        setMessage(`Allégeance à ${FACTION_META[factionId].name} !`);
      }}
      onClaimQuest={async (questId) => {
        const template = FACTION_QUESTS.find((q) => q.id === questId);
        if (!template) return;
        const row = state.quests[questId];
        if (!row?.completed || row.claimed) return;

        let bonus = 0;
        if (state.pledgedFactionId === template.factionId) {
          bonus = Math.round(template.rewardReputation * 0.5);
        }
        const totalRep = template.rewardReputation + bonus;
        const nextEclats = eclats + template.rewardEclats;

        const next = { ...state };
        next.quests = {
          ...next.quests,
          [questId]: { ...row, claimed: true },
        };
        next.reputations = {
          ...next.reputations,
          [template.factionId]: (next.reputations[template.factionId] ?? 0) + totalRep,
        };
        refresh(next, nextEclats);
        setMessage(`+${totalRep} réputation • +${template.rewardEclats} ✦`);
      }}
      onPurchase={async (shopItemId) => {
        const item = FACTION_SHOP_ITEMS.find((s) => s.id === shopItemId);
        if (!item) return;
        const purchased = state.purchases[shopItemId] ?? 0;
        const faction = factions.find((f) => f.factionId === item.factionId);
        if (!faction || !meetsRankRequirement(faction.rank, item.requiredRankId)) return;
        if (purchased >= item.weeklyLimit || eclats < item.costEclats) return;

        addInventoryItem(characterId, item.itemId, item.quantity);
        const next = { ...state };
        next.purchases = { ...next.purchases, [shopItemId]: purchased + 1 };
        refresh(next, eclats - item.costEclats);
        setMessage(`Acheté : ${item.label}`);
      }}
      onEquipCosmetic={async (cosmeticId, slot) => {
        equipLocalFactionCosmetic(characterId, cosmeticId, slot);
        setCosmetics(loadLocalFactionCosmetics(characterId));
        setMessage(cosmeticId ? "Cosmétique équipé !" : "Cosmétique retiré");
      }}
    />
  );
}
