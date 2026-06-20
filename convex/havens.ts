import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const FURNITURE_COSTS: Record<string, number> = {
  lit_cristal: 200,
  tapis_lumina: 50,
  forge_portable: 500,
  plante_ether: 30,
  bibliotheque: 350,
  coffre_tresor: 150,
  fontaine_stellaire: 800,
};

const UPGRADE_COSTS = [0, 500, 1500, 4000, 10000];

export const getHaven = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
  },
});

export const createHaven = mutation({
  args: { characterId: v.id("characters") },
  returns: v.id("havens"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("havens", {
      characterId: args.characterId,
      level: 1,
      furniture: [],
      visitors: 0,
      updatedAt: Date.now(),
    });
  },
});

export const buyFurniture = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cost = FURNITURE_COSTS[args.itemId];
    if (cost === undefined) throw new Error("Meuble inconnu");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");
    if (character.eclats < cost) throw new Error("Éclats insuffisants");

    let haven = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (!haven) {
      const id = await ctx.db.insert("havens", {
        characterId: args.characterId,
        level: 1,
        furniture: [],
        visitors: 0,
        updatedAt: Date.now(),
      });
      haven = await ctx.db.get("havens", id);
    }
    if (!haven) throw new Error("Havre introuvable");

    const maxFurniture = haven.level * 4 + 4;
    if (haven.furniture.length >= maxFurniture) throw new Error("Havre plein");

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats - cost,
    });
    await ctx.db.patch("havens", haven._id, {
      furniture: [...haven.furniture, { itemId: args.itemId, x: args.x, y: args.y }],
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const placeFurniture = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const haven = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (!haven) throw new Error("Havre introuvable");

    await ctx.db.patch("havens", haven._id, {
      furniture: [...haven.furniture, { itemId: args.itemId, x: args.x, y: args.y }],
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const removeFurniture = mutation({
  args: {
    characterId: v.id("characters"),
    index: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const haven = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (!haven) throw new Error("Havre introuvable");

    await ctx.db.patch("havens", haven._id, {
      furniture: haven.furniture.filter((_, i) => i !== args.index),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const upgradeHaven = mutation({
  args: { characterId: v.id("characters") },
  returns: v.object({ newLevel: v.number() }),
  handler: async (ctx, args) => {
    const haven = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (!haven) throw new Error("Havre introuvable");
    if (haven.level >= 5) throw new Error("Niveau maximum atteint");

    const cost = UPGRADE_COSTS[haven.level] ?? 10000;
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");
    if (character.eclats < cost) throw new Error("Éclats insuffisants");

    const newLevel = haven.level + 1;
    await ctx.db.patch("characters", args.characterId, { eclats: character.eclats - cost });
    await ctx.db.patch("havens", haven._id, { level: newLevel, updatedAt: Date.now() });
    return { newLevel };
  },
});

export const visitHaven = mutation({
  args: {
    ownerId: v.id("characters"),
    visitorId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.ownerId === args.visitorId) return null;

    const haven = await ctx.db
      .query("havens")
      .withIndex("by_character", (q) => q.eq("characterId", args.ownerId))
      .unique();

    if (!haven) throw new Error("Havre introuvable");

    await ctx.db.patch("havens", haven._id, {
      visitors: haven.visitors + 1,
      updatedAt: Date.now(),
    });
    return null;
  },
});
