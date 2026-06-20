import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  pvp_legend: { label: "Légendes PvP", icon: "⚔️" },
  season_champion: { label: "Champions de Saison", icon: "👑" },
  tournament_champion: { label: "Vainqueurs Tournoi", icon: "🏆" },
  raid_hero: { label: "Héros de Raid", icon: "🐉" },
  live_legend: { label: "Légendes Live", icon: "🌐" },
  guild_war_champion: { label: "Guildes de Guerre", icon: "🏰" },
};

export const getHallOfFame = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("pvp_legend"),
        v.literal("season_champion"),
        v.literal("tournament_champion"),
        v.literal("raid_hero"),
        v.literal("live_legend"),
        v.literal("guild_war_champion")
      )
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("hallOfFameEntries"),
    category: v.string(),
    categoryLabel: v.string(),
    displayName: v.string(),
    subtitle: v.string(),
    value: v.number(),
    icon: v.string(),
    periodLabel: v.string(),
    achievedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const entries = args.category
      ? await ctx.db
          .query("hallOfFameEntries")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .collect()
      : await ctx.db.query("hallOfFameEntries").collect();

    const sorted = entries
      .sort((a, b) => b.achievedAt - a.achievedAt)
      .slice(0, args.limit ?? (args.category ? 20 : 30));

    return sorted.map((e) => ({
      _id: e._id,
      category: e.category,
      categoryLabel: CATEGORY_LABELS[e.category]?.label ?? e.category,
      displayName: e.displayName,
      subtitle: e.subtitle,
      value: e.value,
      icon: e.icon,
      periodLabel: e.periodLabel,
      achievedAt: e.achievedAt,
    }));
  },
});

export const getHallOfFameCategories = query({
  args: {},
  returns: v.array(v.object({
    category: v.string(),
    label: v.string(),
    icon: v.string(),
    count: v.number(),
  })),
  handler: async (ctx) => {
    const all = await ctx.db.query("hallOfFameEntries").collect();
    const counts = new Map<string, number>();
    for (const e of all) {
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    }

    return Object.entries(CATEGORY_LABELS).map(([category, meta]) => ({
      category,
      label: meta.label,
      icon: meta.icon,
      count: counts.get(category) ?? 0,
    }));
  },
});

export const seedPvpLegends = mutation({
  args: { limit: v.optional(v.number()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const chars = await ctx.db.query("characters").collect();
    const sorted = chars
      .filter((c) => c.pvpWins > 0)
      .sort((a, b) => b.pvpRating - a.pvpRating)
      .slice(0, args.limit ?? 5);

    let added = 0;
    for (const char of sorted) {
      const existing = await ctx.db
        .query("hallOfFameEntries")
        .withIndex("by_category", (q) => q.eq("category", "pvp_legend"))
        .collect();

      if (existing.some((e) => e.characterId === char._id)) continue;

      await ctx.db.insert("hallOfFameEntries", {
        category: "pvp_legend",
        characterId: char._id,
        displayName: char.name,
        subtitle: `Rating ${char.pvpRating} • ${char.pvpWins} victoires`,
        value: char.pvpRating,
        icon: "⚔️",
        achievedAt: Date.now(),
        periodLabel: "Classement global",
      });
      added++;
    }
    return added;
  },
});
