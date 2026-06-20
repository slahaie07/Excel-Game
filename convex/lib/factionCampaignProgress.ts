import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { FactionId } from "./factions";
import {
  CAMPAIGN_POINT_VALUES,
  FACTION_CAMPAIGN_TEMPLATES,
  getCampaignTemplate,
  getWeekKey,
  type CampaignPointEvent,
} from "./factionCampaigns";

export async function ensureFactionCampaigns(ctx: MutationCtx, weekKey = getWeekKey()) {
  const now = Date.now();
  for (const template of FACTION_CAMPAIGN_TEMPLATES) {
    const existing = await ctx.db
      .query("factionCampaigns")
      .withIndex("by_week_and_faction", (q) =>
        q.eq("weekKey", weekKey).eq("factionId", template.factionId)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("factionCampaigns", {
        weekKey,
        factionId: template.factionId,
        campaignId: template.id,
        name: template.name,
        description: template.description,
        target: template.target,
        progress: 0,
        status: "active",
        updatedAt: now,
      });
    }
  }
}

export async function recordFactionCampaignPoints(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  factionId: FactionId,
  event: CampaignPointEvent,
  amount = 1
) {
  await ensureFactionCampaigns(ctx);
  const weekKey = getWeekKey();
  const points = CAMPAIGN_POINT_VALUES[event] * amount;
  if (points <= 0) return;

  const campaign = await ctx.db
    .query("factionCampaigns")
    .withIndex("by_week_and_faction", (q) =>
      q.eq("weekKey", weekKey).eq("factionId", factionId)
    )
    .unique();
  if (!campaign || campaign.status !== "active") return;

  const contribution = await ctx.db
    .query("factionCampaignContributions")
    .withIndex("by_week_faction_character", (q) =>
      q.eq("weekKey", weekKey).eq("factionId", factionId).eq("characterId", characterId)
    )
    .unique();

  const now = Date.now();
  if (contribution) {
    await ctx.db.patch("factionCampaignContributions", contribution._id, {
      points: contribution.points + points,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("factionCampaignContributions", {
      weekKey,
      factionId,
      characterId,
      points,
      rewardClaimed: false,
      updatedAt: now,
    });
  }

  const newProgress = campaign.progress + points;
  const completed = newProgress >= campaign.target;
  await ctx.db.patch("factionCampaigns", campaign._id, {
    progress: newProgress,
    status: completed ? "completed" : "active",
    updatedAt: now,
  });
}

export async function recordPledgedCampaignEvent(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  event: CampaignPointEvent,
  amount = 1
) {
  const profile = await ctx.db
    .query("factionProfiles")
    .withIndex("by_character", (q) => q.eq("characterId", characterId))
    .unique();
  if (!profile?.pledgedFactionId) return;
  await recordFactionCampaignPoints(ctx, characterId, profile.pledgedFactionId, event, amount);
}

export { getCampaignTemplate, getWeekKey, FACTION_CAMPAIGN_TEMPLATES };
