import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const furnitureItem = v.object({
  itemId: v.string(),
  x: v.number(),
  y: v.number(),
});

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

    const newLevel = haven.level + 1;
    await ctx.db.patch("havens", haven._id, { level: newLevel, updatedAt: Date.now() });
    return { newLevel };
  },
});
