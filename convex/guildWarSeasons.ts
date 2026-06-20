import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { addHallOfFameEntry } from "./lib/hallOfFame";

const GUILD_WAR_SEASON_MS = 14 * 24 * 60 * 60 * 1000;
const TREASURY_REWARDS = [5000, 3000, 1500];

async function activateGuildWarSeason(ctx: MutationCtx) {
  const active = await ctx.db
    .query("guildWarSeasons")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .first();

  const now = Date.now();
  if (active && now < active.endsAt) return active;

  if (active) {
    await finalizeGuildWarSeasonInternal(ctx, active._id);
  }

  const all = await ctx.db.query("guildWarSeasons").collect();
  const seasonNumber = all.length + 1;
  const id = await ctx.db.insert("guildWarSeasons", {
    name: `Campagne ${seasonNumber}`,
    seasonNumber,
    status: "active",
    startsAt: now,
    endsAt: now + GUILD_WAR_SEASON_MS,
  });
  return (await ctx.db.get("guildWarSeasons", id))!;
}

async function finalizeGuildWarSeasonInternal(
  ctx: MutationCtx,
  seasonId: Id<"guildWarSeasons">
) {
  await ctx.db.patch("guildWarSeasons", seasonId, { status: "ended" });

  const scores = await ctx.db
    .query("guildWarSeasonScores")
    .withIndex("by_season", (q) => q.eq("seasonId", seasonId))
    .collect();

  const sorted = scores.sort((a, b) => {
    if (b.warWins !== a.warWins) return b.warWins - a.warWins;
    return b.warPoints - a.warPoints;
  });

  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const entry = sorted[i]!;
    const reward = TREASURY_REWARDS[i] ?? 500;
    const guild = await ctx.db.get("guilds", entry.guildId);
    if (guild) {
      await ctx.db.patch("guilds", entry.guildId, {
        treasury: guild.treasury + reward,
      });

      if (i === 0) {
        await addHallOfFameEntry(ctx, {
          category: "guild_war_champion",
          guildId: entry.guildId,
          displayName: entry.guildName,
          subtitle: `${entry.warWins} victoires • ${entry.warPoints} pts`,
          value: entry.warPoints,
          icon: "🏰",
          periodLabel: "Campagne de guerre",
        });

        const current = guild.cosmetics ?? {
          unlockedEmblems: [] as string[],
          unlockedBanners: [] as string[],
        };
        const emblems = new Set(current.unlockedEmblems);
        const banners = new Set(current.unlockedBanners);
        emblems.add("emblem_war_champion");
        banners.add("banner_war_champion");
        await ctx.db.patch("guilds", entry.guildId, {
          cosmetics: {
            unlockedEmblems: [...emblems],
            unlockedBanners: [...banners],
            equippedEmblem: current.equippedEmblem,
            equippedBanner: current.equippedBanner,
          },
        });
      }
    }
  }
}

export async function recordWarSeasonResult(
  ctx: MutationCtx,
  seasonId: Id<"guildWarSeasons"> | undefined,
  winnerGuildId: Id<"guilds">,
  winnerGuildName: string,
  warPoints: number
) {
  const season = seasonId
    ? await ctx.db.get("guildWarSeasons", seasonId)
    : await activateGuildWarSeason(ctx);

  if (!season || season.status !== "active") return;

  const existing = await ctx.db
    .query("guildWarSeasonScores")
    .withIndex("by_season_and_guild", (q) =>
      q.eq("seasonId", season._id).eq("guildId", winnerGuildId)
    )
    .unique();

  const now = Date.now();
  if (existing) {
    await ctx.db.patch("guildWarSeasonScores", existing._id, {
      warWins: existing.warWins + 1,
      warPoints: existing.warPoints + warPoints,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("guildWarSeasonScores", {
      seasonId: season._id,
      guildId: winnerGuildId,
      guildName: winnerGuildName,
      warWins: 1,
      warPoints,
      updatedAt: now,
    });
  }
}

export const ensureActiveGuildWarSeason = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await activateGuildWarSeason(ctx);
    return null;
  },
});

export const initGuildWarSeason = mutation({
  args: {},
  returns: v.id("guildWarSeasons"),
  handler: async (ctx) => {
    const season = await activateGuildWarSeason(ctx);
    return season._id;
  },
});

export const getActiveGuildWarSeason = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("guildWarSeasons"),
      name: v.string(),
      seasonNumber: v.number(),
      endsAt: v.number(),
      daysLeft: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const season = await ctx.db
      .query("guildWarSeasons")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!season) return null;
    const now = Date.now();
    if (now >= season.endsAt) return null;

    return {
      _id: season._id,
      name: season.name,
      seasonNumber: season.seasonNumber,
      endsAt: season.endsAt,
      daysLeft: Math.ceil((season.endsAt - now) / (24 * 60 * 60 * 1000)),
    };
  },
});

export const getGuildWarSeasonLeaderboard = query({
  args: {
    seasonId: v.id("guildWarSeasons"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    guildName: v.string(),
    warWins: v.number(),
    warPoints: v.number(),
  })),
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("guildWarSeasonScores")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    return scores
      .sort((a, b) => {
        if (b.warWins !== a.warWins) return b.warWins - a.warWins;
        return b.warPoints - a.warPoints;
      })
      .slice(0, args.limit ?? 10)
      .map((s) => ({
        guildName: s.guildName,
        warWins: s.warWins,
        warPoints: s.warPoints,
      }));
  },
});

export const getMyGuildWarSeasonScore = query({
  args: {
    seasonId: v.id("guildWarSeasons"),
    guildId: v.id("guilds"),
  },
  returns: v.union(
    v.object({
      warWins: v.number(),
      warPoints: v.number(),
      rank: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mine = await ctx.db
      .query("guildWarSeasonScores")
      .withIndex("by_season_and_guild", (q) =>
        q.eq("seasonId", args.seasonId).eq("guildId", args.guildId)
      )
      .unique();

    if (!mine) return null;

    const all = await ctx.db
      .query("guildWarSeasonScores")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    const sorted = all.sort((a, b) => {
      if (b.warWins !== a.warWins) return b.warWins - a.warWins;
      return b.warPoints - a.warPoints;
    });
    const rank = sorted.findIndex((s) => s.guildId === args.guildId) + 1;

    return { warWins: mine.warWins, warPoints: mine.warPoints, rank };
  },
});
