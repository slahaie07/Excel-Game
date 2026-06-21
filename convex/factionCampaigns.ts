import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { addFactionReputation } from "./factions";
import {
  ensureFactionCampaigns,
  FACTION_CAMPAIGN_TEMPLATES,
  getCampaignTemplate,
  getWeekKey,
  recordPledgedCampaignEvent,
} from "./lib/factionCampaignProgress";

export { recordPledgedCampaignEvent };

const factionIdValidator = v.union(
  v.literal("lumina"),
  v.literal("umbra"),
  v.literal("neutre")
);

const campaignViewValidator = v.object({
  factionId: factionIdValidator,
  campaignId: v.string(),
  name: v.string(),
  description: v.string(),
  target: v.number(),
  progress: v.number(),
  status: v.union(v.literal("active"), v.literal("completed")),
  progressPercent: v.number(),
  myPoints: v.number(),
  minContribution: v.number(),
  rewardReputation: v.number(),
  rewardEclats: v.number(),
  canClaim: v.boolean(),
  rewardClaimed: v.boolean(),
});

export const getFactionCampaigns = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    weekKey: v.string(),
    pledgedFactionId: v.union(factionIdValidator, v.null()),
    campaigns: v.array(campaignViewValidator),
  }),
  handler: async (ctx, args) => {
    const weekKey = getWeekKey();
    const profile = await ctx.db
      .query("factionProfiles")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const rows = await ctx.db
      .query("factionCampaigns")
      .withIndex("by_week", (q) => q.eq("weekKey", weekKey))
      .collect();

    const contributions = await ctx.db
      .query("factionCampaignContributions")
      .withIndex("by_character_and_week", (q) =>
        q.eq("characterId", args.characterId).eq("weekKey", weekKey)
      )
      .collect();
    const contribMap = new Map(contributions.map((c) => [c.factionId, c]));

    const campaigns = FACTION_CAMPAIGN_TEMPLATES.map((template) => {
      const row = rows.find((r) => r.factionId === template.factionId);
      const contrib = contribMap.get(template.factionId);
      const progress = row?.progress ?? 0;
      const status = row?.status ?? "active";
      const myPoints = contrib?.points ?? 0;
      const completed = status === "completed";
      const canClaim =
        completed &&
        myPoints >= template.minContribution &&
        !(contrib?.rewardClaimed ?? false);

      return {
        factionId: template.factionId,
        campaignId: template.id,
        name: template.name,
        description: template.description,
        target: template.target,
        progress,
        status,
        progressPercent: Math.min(100, Math.round((progress / template.target) * 100)),
        myPoints,
        minContribution: template.minContribution,
        rewardReputation: template.rewardReputation,
        rewardEclats: template.rewardEclats,
        canClaim,
        rewardClaimed: contrib?.rewardClaimed ?? false,
      };
    });

    return {
      weekKey,
      pledgedFactionId: profile?.pledgedFactionId ?? null,
      campaigns,
    };
  },
});

export const claimFactionCampaignReward = mutation({
  args: {
    characterId: v.id("characters"),
    factionId: factionIdValidator,
  },
  returns: v.object({
    reputation: v.number(),
    eclats: v.number(),
  }),
  handler: async (ctx, args) => {
    const weekKey = getWeekKey();
    const template = getCampaignTemplate(args.factionId);

    const campaign = await ctx.db
      .query("factionCampaigns")
      .withIndex("by_week_and_faction", (q) =>
        q.eq("weekKey", weekKey).eq("factionId", args.factionId)
      )
      .unique();
    if (!campaign || campaign.status !== "completed") {
      throw new Error("Campagne non terminée");
    }

    const contribution = await ctx.db
      .query("factionCampaignContributions")
      .withIndex("by_week_faction_character", (q) =>
        q.eq("weekKey", weekKey).eq("factionId", args.factionId).eq("characterId", args.characterId)
      )
      .unique();
    if (!contribution || contribution.points < template.minContribution) {
      throw new Error("Contribution insuffisante");
    }
    if (contribution.rewardClaimed) {
      throw new Error("Récompense déjà réclamée");
    }

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("factionCampaignContributions", contribution._id, {
      rewardClaimed: true,
      updatedAt: Date.now(),
    });

    await addFactionReputation(ctx, args.characterId, args.factionId, template.rewardReputation);
    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + template.rewardEclats,
    });

    return {
      reputation: template.rewardReputation,
      eclats: template.rewardEclats,
    };
  },
});

export const initFactionCampaigns = mutation({
  args: { characterId: v.id("characters") },
  returns: v.null(),
  handler: async (ctx, _args) => {
    await ensureFactionCampaigns(ctx);
    return null;
  },
});

const leaderboardEntryValidator = v.object({
  rank: v.number(),
  characterName: v.string(),
  classId: v.string(),
  points: v.number(),
  isMe: v.boolean(),
});

export const getCampaignLeaderboard = query({
  args: {
    characterId: v.id("characters"),
    factionId: factionIdValidator,
    limit: v.optional(v.number()),
  },
  returns: v.object({
    weekKey: v.string(),
    entries: v.array(leaderboardEntryValidator),
    myRank: v.union(v.number(), v.null()),
    myPoints: v.number(),
  }),
  handler: async (ctx, args) => {
    const weekKey = getWeekKey();
    const limit = args.limit ?? 10;

    const contributions = await ctx.db
      .query("factionCampaignContributions")
      .withIndex("by_week_and_faction", (q) =>
        q.eq("weekKey", weekKey).eq("factionId", args.factionId)
      )
      .collect();

    const sorted = contributions
      .filter((c) => c.points > 0)
      .sort((a, b) => b.points - a.points);

    const myContrib = sorted.find((c) => c.characterId === args.characterId);
    const myPoints = myContrib?.points ?? 0;
    const myRank = myContrib
      ? sorted.findIndex((c) => c.characterId === args.characterId) + 1
      : null;

    const top = sorted.slice(0, limit);
    const entries = await Promise.all(
      top.map(async (contrib, index) => {
        const character = await ctx.db.get("characters", contrib.characterId);
        return {
          rank: index + 1,
          characterName: character?.name ?? "Éveilleur",
          classId: character?.classId ?? "luminaire",
          points: contrib.points,
          isMe: contrib.characterId === args.characterId,
        };
      })
    );

    return { weekKey, entries, myRank, myPoints };
  },
});

const territoryStatusValidator = v.union(
  v.literal("fortified"),
  v.literal("stable"),
  v.literal("contested")
);

export const getFactionTerritory = query({
  args: {
    zoneId: v.string(),
    characterId: v.optional(v.id("characters")),
  },
  returns: v.object({
    zoneId: v.string(),
    homeFaction: factionIdValidator,
    status: territoryStatusValidator,
    dominantFaction: factionIdValidator,
    xpBonusPercent: v.number(),
    label: v.string(),
    xpMultiplier: v.number(),
  }),
  handler: async (ctx, args) => {
    const weekKey = getWeekKey();
    const rows = await ctx.db
      .query("factionCampaigns")
      .withIndex("by_week", (q) => q.eq("weekKey", weekKey))
      .collect();

    const { campaignRowsToInput, getZoneTerritory, getTerritoryXpMultiplier } = await import(
      "./lib/factionTerritories"
    );
    const input = campaignRowsToInput(
      rows.map((r) => ({
        factionId: r.factionId,
        progress: r.progress,
        target: r.target,
        status: r.status,
      }))
    );

    let pledgedFactionId = null as import("./lib/factions").FactionId | null;
    if (args.characterId) {
      const profile = await ctx.db
        .query("factionProfiles")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId!))
        .unique();
      pledgedFactionId = profile?.pledgedFactionId ?? null;
    }

    const territory = getZoneTerritory(args.zoneId, input);
    const xpMultiplier = getTerritoryXpMultiplier(args.zoneId, input, pledgedFactionId);

    return { ...territory, xpMultiplier };
  },
});
