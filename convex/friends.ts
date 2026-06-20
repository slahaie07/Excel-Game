import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendFriendRequest = mutation({
  args: {
    characterId: v.id("characters"),
    friendId: v.id("characters"),
  },
  returns: v.id("friends"),
  handler: async (ctx, args) => {
    if (args.characterId === args.friendId) {
      throw new Error("Impossible de s'ajouter soi-même");
    }

    const existing = await ctx.db
      .query("friends")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    const already = existing.find((f) => f.friendId === args.friendId);
    if (already) throw new Error("Demande déjà envoyée");

    return await ctx.db.insert("friends", {
      characterId: args.characterId,
      friendId: args.friendId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const acceptFriend = mutation({
  args: {
    characterId: v.id("characters"),
    friendId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("friends")
      .withIndex("by_character", (q) => q.eq("characterId", args.friendId))
      .collect();

    const pending = request.find(
      (f) => f.friendId === args.characterId && f.status === "pending"
    );
    if (!pending) throw new Error("Demande introuvable");

    await ctx.db.patch("friends", pending._id, { status: "accepted" });

    await ctx.db.insert("friends", {
      characterId: args.characterId,
      friendId: args.friendId,
      status: "accepted",
      createdAt: Date.now(),
    });
    return null;
  },
});

export const listFriends = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.object({
    friendId: v.id("characters"),
    name: v.string(),
    classId: v.string(),
    level: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    isIncoming: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const outgoing = await ctx.db
      .query("friends")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    const incoming = await ctx.db
      .query("friends")
      .withIndex("by_friend", (q) => q.eq("friendId", args.characterId))
      .collect();

    const results: {
      friendId: typeof args.characterId;
      name: string;
      classId: string;
      level: number;
      status: "pending" | "accepted" | "blocked";
      isIncoming: boolean;
    }[] = [];

    for (const f of outgoing) {
      const char = await ctx.db.get("characters", f.friendId);
      if (char) {
        results.push({
          friendId: f.friendId,
          name: char.name,
          classId: char.classId,
          level: char.level,
          status: f.status,
          isIncoming: false,
        });
      }
    }

    for (const f of incoming.filter((f) => f.status === "pending")) {
      const char = await ctx.db.get("characters", f.characterId);
      if (char) {
        results.push({
          friendId: f.characterId,
          name: char.name,
          classId: char.classId,
          level: char.level,
          status: f.status,
          isIncoming: true,
        });
      }
    }

    return results;
  },
});

export const searchCharacterByName = query({
  args: { name: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      level: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const char = await ctx.db
      .query("characters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (!char) return null;
    return { _id: char._id, name: char.name, classId: char.classId, level: char.level };
  },
});
