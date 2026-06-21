import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { FactionId } from "./factions";

type CharacterCosmetics = {
  titles: string[];
  frames: string[];
  equippedTitle?: string;
  equippedFrame?: string;
};

export const CAMPAIGN_RANK_REWARDS: Record<
  number,
  { title?: string; frame?: string }
> = {
  1: { title: "title_campaign_hero", frame: "frame_campaign_gold" },
  2: { frame: "frame_campaign_silver" },
  3: { frame: "frame_campaign_bronze" },
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

export function getCampaignRankCosmeticIds(rank: number): string[] {
  const reward = CAMPAIGN_RANK_REWARDS[rank];
  if (!reward) return [];
  const ids: string[] = [];
  if (reward.title) ids.push(reward.title);
  if (reward.frame) ids.push(reward.frame);
  return ids;
}

export async function distributeCampaignRankRewards(
  ctx: MutationCtx,
  weekKey: string,
  factionId: FactionId
) {
  const campaign = await ctx.db
    .query("factionCampaigns")
    .withIndex("by_week_and_faction", (q) =>
      q.eq("weekKey", weekKey).eq("factionId", factionId)
    )
    .unique();

  if (!campaign || campaign.status !== "completed" || campaign.rewardsDistributed) {
    return;
  }

  const contributions = await ctx.db
    .query("factionCampaignContributions")
    .withIndex("by_week_and_faction", (q) =>
      q.eq("weekKey", weekKey).eq("factionId", factionId)
    )
    .collect();

  const top = contributions
    .filter((c) => c.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  for (let i = 0; i < top.length; i++) {
    const rank = i + 1;
    const cosmeticIds = getCampaignRankCosmeticIds(rank);
    await grantCosmeticIds(ctx, top[i]!.characterId, cosmeticIds);
  }

  await ctx.db.patch("factionCampaigns", campaign._id, {
    rewardsDistributed: true,
    updatedAt: Date.now(),
  });
}
