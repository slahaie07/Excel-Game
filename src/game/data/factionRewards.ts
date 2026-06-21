import type { FactionId } from "./factionContent";

export const FACTION_RANK_COSMETICS: Record<
  FactionId,
  Partial<Record<"champion" | "exalted", string[]>>
> = {
  lumina: {
    champion: ["title_lumina_champion"],
    exalted: ["title_lumina_exalted", "frame_lumina"],
  },
  umbra: {
    champion: ["title_umbra_champion"],
    exalted: ["title_umbra_exalted", "frame_umbra"],
  },
  neutre: {
    champion: ["title_neutre_champion"],
    exalted: ["title_neutre_exalted", "frame_neutre"],
  },
};

export function getFactionRankCosmeticIds(factionId: FactionId, rankId: string): string[] {
  const rewards = FACTION_RANK_COSMETICS[factionId];
  if (!rewards) return [];
  const ids: string[] = [];
  if (rankId === "champion" || rankId === "exalted") {
    ids.push(...(rewards.champion ?? []));
  }
  if (rankId === "exalted") {
    ids.push(...(rewards.exalted ?? []));
  }
  return [...new Set(ids)];
}

export function getAllFactionCosmeticIds(): string[] {
  const ids = new Set<string>();
  for (const faction of Object.values(FACTION_RANK_COSMETICS)) {
    for (const list of Object.values(faction)) {
      for (const id of list ?? []) ids.add(id);
    }
  }
  return [...ids];
}
