import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getBonusCosmeticForRank, getSeasonRewardForRank } from "./lib/seasonRewards";
import { getSeasonTheme } from "./lib/seasonThemes";
import { addHallOfFameEntry } from "./lib/hallOfFame";

type CharacterCosmetics = {
  titles: string[];
  frames: string[];
  equippedTitle?: string;
  equippedFrame?: string;
};

function emptyCosmetics(): CharacterCosmetics {
  return { titles: [], frames: [] };
}

function getCosmetics(character: { cosmetics?: CharacterCosmetics }): CharacterCosmetics {
  return character.cosmetics ?? emptyCosmetics();
}

async function grantCosmetics(
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

export async function finalizeSeasonRewards(
  ctx: MutationCtx,
  seasonId: Id<"pvpSeasons">,
  seasonName: string,
  themeId?: string
) {
  const theme = getSeasonTheme(themeId);
  const ratings = await ctx.db
    .query("seasonRatings")
    .withIndex("by_season", (q) => q.eq("seasonId", seasonId))
    .collect();

  const sorted = ratings.sort((a, b) => b.rating - a.rating);

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]!;
    const rank = i + 1;
    const participated = entry.wins + entry.losses > 0;

    const existing = await ctx.db
      .query("seasonRewardClaims")
      .withIndex("by_season_and_character", (q) =>
        q.eq("seasonId", seasonId).eq("characterId", entry.characterId)
      )
      .unique();

    if (existing) continue;

    const tier = getSeasonRewardForRank(rank, participated);
    const bonusFrame = getBonusCosmeticForRank(rank);
    const cosmeticIds = [tier.cosmeticId, bonusFrame].filter(
      (id): id is string => id !== undefined
    );
    if (rank === 1 && theme?.championCosmeticId) {
      cosmeticIds.push(theme.championCosmeticId);
    }

    await ctx.db.insert("seasonRewardClaims", {
      seasonId,
      seasonName,
      characterId: entry.characterId,
      rank,
      rating: entry.rating,
      eclatsReward: tier.eclats,
      cosmeticIds,
      rewardLabel: tier.label,
    });

    if (rank === 1) {
      await addHallOfFameEntry(ctx, {
        category: "season_champion",
        characterId: entry.characterId,
        displayName: entry.characterName,
        subtitle: `Rating ${entry.rating} • ${entry.wins}V / ${entry.losses}D`,
        value: entry.rating,
        icon: "👑",
        periodLabel: seasonName,
      });
    }
  }
}

export const getPendingSeasonRewards = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.object({
    _id: v.id("seasonRewardClaims"),
    seasonName: v.string(),
    rank: v.number(),
    rating: v.number(),
    eclatsReward: v.number(),
    cosmeticIds: v.array(v.string()),
    rewardLabel: v.string(),
  })),
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("seasonRewardClaims")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    return claims
      .filter((c) => c.claimedAt === undefined)
      .map((c) => ({
        _id: c._id,
        seasonName: c.seasonName,
        rank: c.rank,
        rating: c.rating,
        eclatsReward: c.eclatsReward,
        cosmeticIds: c.cosmeticIds,
        rewardLabel: c.rewardLabel,
      }));
  },
});

export const claimSeasonReward = mutation({
  args: {
    characterId: v.id("characters"),
    claimId: v.id("seasonRewardClaims"),
  },
  returns: v.object({
    eclats: v.number(),
    cosmeticIds: v.array(v.string()),
    seasonName: v.string(),
  }),
  handler: async (ctx, args) => {
    const claim = await ctx.db.get("seasonRewardClaims", args.claimId);
    if (!claim) throw new Error("Récompense introuvable");
    if (claim.characterId !== args.characterId) throw new Error("Non autorisé");
    if (claim.claimedAt !== undefined) throw new Error("Déjà réclamée");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + claim.eclatsReward,
    });
    await grantCosmetics(ctx, args.characterId, claim.cosmeticIds);
    await ctx.db.patch("seasonRewardClaims", args.claimId, {
      claimedAt: Date.now(),
    });

    return {
      eclats: claim.eclatsReward,
      cosmeticIds: claim.cosmeticIds,
      seasonName: claim.seasonName,
    };
  },
});

export const getMyCosmetics = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    titles: v.array(v.string()),
    frames: v.array(v.string()),
    equippedTitle: v.union(v.string(), v.null()),
    equippedFrame: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) {
      return { titles: [], frames: [], equippedTitle: null, equippedFrame: null };
    }

    const cosmetics = getCosmetics(character);
    return {
      titles: cosmetics.titles,
      frames: cosmetics.frames,
      equippedTitle: cosmetics.equippedTitle ?? null,
      equippedFrame: cosmetics.equippedFrame ?? null,
    };
  },
});

export const equipCosmetic = mutation({
  args: {
    characterId: v.id("characters"),
    cosmeticId: v.union(v.string(), v.null()),
    slot: v.union(v.literal("title"), v.literal("frame")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const current = getCosmetics(character);

    if (args.cosmeticId === null) {
      await ctx.db.patch("characters", args.characterId, {
        cosmetics: {
          ...current,
          equippedTitle: args.slot === "title" ? undefined : current.equippedTitle,
          equippedFrame: args.slot === "frame" ? undefined : current.equippedFrame,
        },
      });
      return null;
    }

    if (args.slot === "title") {
      if (!current.titles.includes(args.cosmeticId)) {
        throw new Error("Titre non possédé");
      }
      await ctx.db.patch("characters", args.characterId, {
        cosmetics: { ...current, equippedTitle: args.cosmeticId },
      });
    } else {
      if (!current.frames.includes(args.cosmeticId)) {
        throw new Error("Cadre non possédé");
      }
      await ctx.db.patch("characters", args.characterId, {
        cosmetics: { ...current, equippedFrame: args.cosmeticId },
      });
    }
    return null;
  },
});
