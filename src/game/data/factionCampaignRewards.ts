export const CAMPAIGN_RANK_REWARDS: Record<
  number,
  { title?: string; frame?: string }
> = {
  1: { title: "title_campaign_hero", frame: "frame_campaign_gold" },
  2: { frame: "frame_campaign_silver" },
  3: { frame: "frame_campaign_bronze" },
};

export function getCampaignRankCosmeticIds(rank: number): string[] {
  const reward = CAMPAIGN_RANK_REWARDS[rank];
  if (!reward) return [];
  const ids: string[] = [];
  if (reward.title) ids.push(reward.title);
  if (reward.frame) ids.push(reward.frame);
  return ids;
}
