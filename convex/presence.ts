import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
  args: {
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    level: v.number(),
    zoneId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const data = {
      characterId: args.characterId,
      characterName: args.characterName,
      classId: args.classId,
      level: args.level,
      zoneId: args.zoneId,
      lastSeenAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch("presence", existing._id, data);
    } else {
      await ctx.db.insert("presence", data);
    }
    return null;
  },
});

export const getPlayersInZone = query({
  args: { zoneId: v.string() },
  returns: v.array(v.object({
    characterName: v.string(),
    classId: v.string(),
    level: v.number(),
  })),
  handler: async (ctx, args) => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const players = await ctx.db
      .query("presence")
      .withIndex("by_zone", (q) => q.eq("zoneId", args.zoneId))
      .order("desc")
      .take(30);

    return players
      .filter((p) => p.lastSeenAt > fiveMinAgo)
      .map((p) => ({
        characterName: p.characterName,
        classId: p.classId,
        level: p.level,
      }));
  },
});

export const equipPet = mutation({
  args: {
    characterId: v.id("characters"),
    petId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("characters", args.characterId, { petId: args.petId });
    return null;
  },
});

export const unequipPet = mutation({
  args: { characterId: v.id("characters") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("characters", args.characterId, { petId: undefined });
    return null;
  },
});
