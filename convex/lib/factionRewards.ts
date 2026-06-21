import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { FactionId } from "./factions";
import { getFactionRank } from "./factions";

type CharacterCosmetics = {
  titles: string[];
  frames: string[];
  equippedTitle?: string;
  equippedFrame?: string;
};

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

function emptyCosmetics(): CharacterCosmetics {
  return { titles: [], frames: [] };
}

function getCosmetics(character: { cosmetics?: CharacterCosmetics }): CharacterCosmetics {
  return character.cosmetics ?? emptyCosmetics();
}

async function grantCosmeticIds(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  cosmeticIds: string[]
) {
  if (cosmeticIds.length === 0) return;

  const character = await ctx.db.get("characters", characterId);
  if (!character) return;

  const current = getCosmetics(character);
  const titles = new Set(current.titles);
  const frames = new Set(current.frames);

  for (const id of cosmeticIds) {
    if (id.startsWith("title_")) titles.add(id);
    else if (id.startsWith("frame_")) frames.add(id);
  }

  await ctx.db.patch("characters", characterId, {
    cosmetics: {
      titles: [...titles],
      frames: [...frames],
      equippedTitle: current.equippedTitle,
      equippedFrame: current.equippedFrame,
    },
  });
}

export async function grantFactionRankCosmetics(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  factionId: FactionId,
  rankId: string
) {
  const rewards = FACTION_RANK_COSMETICS[factionId];
  if (!rewards) return;

  const cosmeticIds: string[] = [];
  if (rankId === "champion" || rankId === "exalted") {
    cosmeticIds.push(...(rewards.champion ?? []));
  }
  if (rankId === "exalted") {
    cosmeticIds.push(...(rewards.exalted ?? []));
  }

  await grantCosmeticIds(ctx, characterId, cosmeticIds);
}

export async function syncFactionRankRewards(
  ctx: MutationCtx,
  characterId: Id<"characters">,
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

  for (let i = oldIdx + 1; i <= newIdx; i++) {
    const rankId = rankOrder[i]!;
    if (rankId === "champion" || rankId === "exalted") {
      await grantFactionRankCosmetics(ctx, characterId, factionId, rankId);
    }
  }
}

export function getFactionRankCosmeticIds(
  factionId: FactionId,
  rankId: string
): string[] {
  const rewards = FACTION_RANK_COSMETICS[factionId];
  if (!rewards) return [];
  const ids: string[] = [];
  if (rankId === "champion" || rankId === "exalted") {
    ids.push(...(rewards.champion ?? []));
  }
  if (rankId === "exalted") {
    ids.push(...(rewards.exalted ?? []));
  }
  return ids;
}
