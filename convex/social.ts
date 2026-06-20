import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createGuild = mutation({
  args: {
    name: v.string(),
    tag: v.string(),
    description: v.string(),
    leaderId: v.id("characters"),
    emblem: v.string(),
  },
  returns: v.id("guilds"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("guilds")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existing) throw new Error("Ce nom de guilde existe déjà");

    const leader = await ctx.db.get("characters", args.leaderId);
    if (!leader) throw new Error("Personnage introuvable");
    if (leader.guildId) throw new Error("Déjà dans une guilde");

    const guildId = await ctx.db.insert("guilds", {
      name: args.name,
      tag: args.tag,
      description: args.description,
      leaderId: args.leaderId,
      level: 1,
      xp: 0,
      treasury: 0,
      memberCount: 1,
      maxMembers: 20,
      emblem: args.emblem,
      createdAt: Date.now(),
    });

    await ctx.db.insert("guildMembers", {
      guildId,
      characterId: args.leaderId,
      role: "leader",
      joinedAt: Date.now(),
      contribution: 0,
    });

    await ctx.db.patch("characters", args.leaderId, { guildId });
    await ctx.db.insert("guildHalls", {
      guildId,
      level: 1,
      furniture: [],
      visitors: 0,
      updatedAt: Date.now(),
    });
    return guildId;
  },
});

export const joinGuild = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) throw new Error("Guilde introuvable");
    if (guild.memberCount >= guild.maxMembers) throw new Error("Guilde pleine");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");
    if (character.guildId) throw new Error("Déjà dans une guilde");

    await ctx.db.insert("guildMembers", {
      guildId: args.guildId,
      characterId: args.characterId,
      role: "member",
      joinedAt: Date.now(),
      contribution: 0,
    });

    await ctx.db.patch("guilds", args.guildId, { memberCount: guild.memberCount + 1 });
    await ctx.db.patch("characters", args.characterId, { guildId: args.guildId });
    return null;
  },
});

export const getGuild = query({
  args: { guildId: v.id("guilds") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("guilds", args.guildId);
  },
});

export const listGuilds = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("guilds"),
    name: v.string(),
    tag: v.string(),
    level: v.number(),
    memberCount: v.number(),
    emblem: v.string(),
  })),
  handler: async (ctx) => {
    const guilds = await ctx.db.query("guilds").take(50);
    return guilds.map((g) => ({
      _id: g._id,
      name: g.name,
      tag: g.tag,
      level: g.level,
      memberCount: g.memberCount,
      emblem: g.emblem,
    }));
  },
});

export const listListing = query({
  args: { itemId: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.itemId) {
      return await ctx.db
        .query("marketplace")
        .withIndex("by_item", (q) => q.eq("itemId", args.itemId!))
        .take(50);
    }
    return await ctx.db.query("marketplace").take(50);
  },
});

export const createListing = mutation({
  args: {
    sellerId: v.id("characters"),
    itemId: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
  },
  returns: v.id("marketplace"),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.sellerId);
    if (!character) throw new Error("Personnage introuvable");

    const item = character.inventory.find((i) => i.itemId === args.itemId);
    if (!item || item.quantity < args.quantity) {
      throw new Error("Quantité insuffisante");
    }

    const now = Date.now();
    const listingId = await ctx.db.insert("marketplace", {
      sellerId: args.sellerId,
      itemId: args.itemId,
      quantity: args.quantity,
      pricePerUnit: args.pricePerUnit,
      listedAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
    });

    const newInventory = character.inventory.map((i) =>
      i.itemId === args.itemId ? { ...i, quantity: i.quantity - args.quantity } : i
    ).filter((i) => i.quantity > 0);

    await ctx.db.patch("characters", args.sellerId, { inventory: newInventory });
    return listingId;
  },
});

export const buyListing = mutation({
  args: {
    listingId: v.id("marketplace"),
    buyerId: v.id("characters"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const listing = await ctx.db.get("marketplace", args.listingId);
    if (!listing) throw new Error("Annonce introuvable");
    if (listing.quantity < args.quantity) throw new Error("Stock insuffisant");

    const buyer = await ctx.db.get("characters", args.buyerId);
    if (!buyer) throw new Error("Acheteur introuvable");

    const totalCost = listing.pricePerUnit * args.quantity;
    if (buyer.eclats < totalCost) throw new Error("Éclats insuffisants");

    const buyerInventory = [...buyer.inventory];
    const existing = buyerInventory.find((i) => i.itemId === listing.itemId);
    if (existing) {
      existing.quantity += args.quantity;
    } else {
      buyerInventory.push({ itemId: listing.itemId, quantity: args.quantity });
    }

    await ctx.db.patch("characters", args.buyerId, {
      eclats: buyer.eclats - totalCost,
      inventory: buyerInventory,
    });

    if (listing.quantity === args.quantity) {
      await ctx.db.delete("marketplace", args.listingId);
    } else {
      await ctx.db.patch("marketplace", args.listingId, {
        quantity: listing.quantity - args.quantity,
      });
    }

    return null;
  },
});

export const sendMessage = mutation({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("private"),
      v.literal("trade")
    ),
    senderId: v.id("characters"),
    senderName: v.string(),
    content: v.string(),
    zoneId: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    recipientId: v.optional(v.id("characters")),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("trade")
    ),
    zoneId: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.channel === "zone" && args.zoneId) {
      return await ctx.db
        .query("chatMessages")
        .withIndex("by_zone", (q) => q.eq("zoneId", args.zoneId))
        .order("desc")
        .take(limit);
    }

    if (args.channel === "guild" && args.guildId) {
      return await ctx.db
        .query("chatMessages")
        .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .order("desc")
      .take(limit);
  },
});

export const claimDailyReward = mutation({
  args: { characterId: v.id("characters") },
  returns: v.object({
    eclats: v.number(),
    streak: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyRewards")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (existing && now - existing.lastClaimedAt < oneDay) {
      throw new Error("Récompense déjà réclamée aujourd'hui");
    }

    const streak = existing && now - existing.lastClaimedAt < oneDay * 2
      ? existing.streak + 1
      : 1;

    const eclats = 50 + streak * 10;

    if (existing) {
      await ctx.db.patch("dailyRewards", existing._id, {
        lastClaimedAt: now,
        streak,
      });
    } else {
      await ctx.db.insert("dailyRewards", {
        characterId: args.characterId,
        lastClaimedAt: now,
        streak,
      });
    }

    const character = await ctx.db.get("characters", args.characterId);
    if (character) {
      await ctx.db.patch("characters", args.characterId, {
        eclats: character.eclats + eclats,
      });
    }

    return { eclats, streak };
  },
});
