import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const HALL_LEVELS = [
  { level: 1, gridW: 6, gridH: 4, maxFurniture: 12, upgradeCost: 0 },
  { level: 2, gridW: 8, gridH: 5, maxFurniture: 20, upgradeCost: 2000 },
  { level: 3, gridW: 10, gridH: 6, maxFurniture: 32, upgradeCost: 5000 },
];

const FURNITURE_COSTS: Record<string, number> = {
  lit_cristal: 200,
  tapis_lumina: 50,
  forge_portable: 500,
  plante_ether: 30,
  bibliotheque: 350,
  coffre_tresor: 150,
  fontaine_stellaire: 800,
};

function resolveHallConfig(level: number) {
  return HALL_LEVELS.find((h) => h.level === level) ?? HALL_LEVELS[0]!;
}

export const getGuildHall = query({
  args: { guildId: v.id("guilds") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();
  },
});

export const initGuildHall = mutation({
  args: { guildId: v.id("guilds") },
  returns: v.id("guildHalls"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("guildHalls", {
      guildId: args.guildId,
      level: 1,
      furniture: [],
      visitors: 0,
      updatedAt: Date.now(),
    });
  },
});

export const placeGuildFurniture = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    characterName: v.string(),
    itemId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildId) {
      throw new Error("Pas membre de cette guilde");
    }

    const cost = FURNITURE_COSTS[args.itemId];
    if (cost === undefined) throw new Error("Meuble inconnu");

    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) throw new Error("Guilde introuvable");
    if (guild.treasury < cost) throw new Error("Trésor de guilde insuffisant");

    let hall = await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();

    if (!hall) {
      const id = await ctx.db.insert("guildHalls", {
        guildId: args.guildId,
        level: 1,
        furniture: [],
        visitors: 0,
        updatedAt: Date.now(),
      });
      hall = await ctx.db.get("guildHalls", id);
    }
    if (!hall) throw new Error("Guild hall introuvable");

    const config = resolveHallConfig(hall.level);
    if (hall.furniture.length >= config.maxFurniture) throw new Error("Guild hall plein");

    await ctx.db.patch("guilds", args.guildId, { treasury: guild.treasury - cost });
    await ctx.db.patch("guildHalls", hall._id, {
      furniture: [...hall.furniture, {
        itemId: args.itemId,
        x: args.x,
        y: args.y,
        placedBy: args.characterId,
        placedByName: args.characterName,
      }],
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const removeGuildFurniture = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    index: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildId) {
      throw new Error("Pas membre de cette guilde");
    }

    const hall = await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();
    if (!hall) throw new Error("Guild hall introuvable");

    const item = hall.furniture[args.index];
    if (!item) throw new Error("Meuble introuvable");

    const canRemove =
      item.placedBy === args.characterId ||
      member.role === "leader" ||
      member.role === "officer";
    if (!canRemove) throw new Error("Vous ne pouvez retirer que vos propres meubles");

    await ctx.db.patch("guildHalls", hall._id, {
      furniture: hall.furniture.filter((_, i) => i !== args.index),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const upgradeGuildHall = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
  },
  returns: v.object({ newLevel: v.number() }),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildId) {
      throw new Error("Pas membre de cette guilde");
    }
    if (member.role !== "leader" && member.role !== "officer") {
      throw new Error("Officier ou chef requis");
    }

    const hall = await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();
    if (!hall) throw new Error("Guild hall introuvable");
    if (hall.level >= 3) throw new Error("Niveau maximum");

    const nextConfig = resolveHallConfig(hall.level + 1);
    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) throw new Error("Guilde introuvable");
    if (guild.treasury < nextConfig.upgradeCost) {
      throw new Error("Trésor insuffisant");
    }

    await ctx.db.patch("guilds", args.guildId, {
      treasury: guild.treasury - nextConfig.upgradeCost,
    });
    await ctx.db.patch("guildHalls", hall._id, {
      level: hall.level + 1,
      updatedAt: Date.now(),
    });

    return { newLevel: hall.level + 1 };
  },
});

export const visitGuildHall = mutation({
  args: {
    guildId: v.id("guilds"),
    visitorId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const hall = await ctx.db
      .query("guildHalls")
      .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
      .unique();
    if (!hall) return null;

    await ctx.db.patch("guildHalls", hall._id, {
      visitors: hall.visitors + 1,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getHallConfig = query({
  args: { level: v.number() },
  returns: v.object({
    gridW: v.number(),
    gridH: v.number(),
    maxFurniture: v.number(),
    upgradeCost: v.number(),
  }),
  handler: async (_ctx, args) => {
    const config = resolveHallConfig(args.level);
    return {
      gridW: config.gridW,
      gridH: config.gridH,
      maxFurniture: config.maxFurniture,
      upgradeCost: config.upgradeCost,
    };
  },
});
