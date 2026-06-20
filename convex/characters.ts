import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getOrCreateUser(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string; name?: string; email?: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Aventurier",
      email: identity.email,
      createdAt: Date.now(),
    });
    user = await ctx.db.get("users", userId);
  }
  return user!;
}

const statsValidator = v.object({
  hp: v.number(),
  maxHp: v.number(),
  pa: v.number(),
  maxPa: v.number(),
  pm: v.number(),
  maxPm: v.number(),
  force: v.number(),
  intelligence: v.number(),
  agilite: v.number(),
  chance: v.number(),
  sagesse: v.number(),
  initiative: v.number(),
  dommages: v.number(),
  resistance: v.number(),
});

export const getMyCharacters = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const createCharacter = mutation({
  args: {
    name: v.string(),
    classId: v.string(),
    stats: statsValidator,
    spells: v.array(v.string()),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

    const existing = await ctx.db
      .query("characters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) throw new Error("Ce nom est déjà pris");

    return await ctx.db.insert("characters", {
      userId: user._id,
      name: args.name,
      classId: args.classId,
      level: 1,
      xp: 0,
      kamas: 100,
      stats: args.stats,
      zone: "lumineth_village",
      positionX: 10,
      positionY: 12,
      inventory: [
        { itemId: "pain_ether", quantity: 10, slot: 0 },
        { itemId: "potion_vie", quantity: 5, slot: 1 },
      ],
      equipment: {},
      spells: args.spells,
      questProgress: {},
      professions: {},
      achievements: [],
      lastPlayedAt: Date.now(),
    });
  },
});

export const saveCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    level: v.number(),
    xp: v.number(),
    kamas: v.number(),
    stats: statsValidator,
    zone: v.string(),
    positionX: v.number(),
    positionY: v.number(),
    inventory: v.array(
      v.object({
        itemId: v.string(),
        quantity: v.number(),
        slot: v.number(),
      }),
    ),
    equipment: v.object({
      weapon: v.optional(v.string()),
      helmet: v.optional(v.string()),
      armor: v.optional(v.string()),
      boots: v.optional(v.string()),
      amulet: v.optional(v.string()),
      ring: v.optional(v.string()),
      shield: v.optional(v.string()),
    }),
    questProgress: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const character = await ctx.db.get("characters", args.characterId);
    if (!character || character.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch("characters", args.characterId, {
      level: args.level,
      xp: args.xp,
      kamas: args.kamas,
      stats: args.stats,
      zone: args.zone,
      positionX: args.positionX,
      positionY: args.positionY,
      inventory: args.inventory,
      equipment: args.equipment,
      questProgress: args.questProgress,
      lastPlayedAt: Date.now(),
    });
    return null;
  },
});

export const sendChatMessage = mutation({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("trade"),
    ),
    message: v.string(),
    senderName: v.string(),
    zone: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    await getOrCreateUser(ctx);
    return await ctx.db.insert("chatMessages", {
      channel: args.channel,
      senderName: args.senderName,
      message: args.message,
      zone: args.zone,
      guildId: args.guildId,
      timestamp: Date.now(),
    });
  },
});

export const getChatMessages = query({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("trade"),
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .order("desc")
      .take(args.limit ?? 50);
    return messages.reverse();
  },
});

export const createGuild = mutation({
  args: {
    name: v.string(),
    characterId: v.id("characters"),
  },
  returns: v.id("guilds"),
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const character = await ctx.db.get("characters", args.characterId);
    if (!character || character.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    if (character.kamas < 1000) throw new Error("Pas assez de Kamas");

    const existing = await ctx.db
      .query("guilds")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) throw new Error("Ce nom de guilde existe déjà");

    await ctx.db.patch("characters", args.characterId, {
      kamas: character.kamas - 1000,
    });

    const guildId = await ctx.db.insert("guilds", {
      name: args.name,
      leaderId: args.characterId,
      level: 1,
      xp: 0,
      kamas: 0,
      memberCount: 1,
      maxMembers: 30,
      createdAt: Date.now(),
    });

    await ctx.db.insert("guildMembers", {
      guildId,
      characterId: args.characterId,
      role: "leader",
      joinedAt: Date.now(),
    });

    await ctx.db.patch("characters", args.characterId, { guildId });
    return guildId;
  },
});

export const listGuilds = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("guilds").take(20);
  },
});
