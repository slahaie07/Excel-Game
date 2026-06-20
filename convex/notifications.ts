import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listNotifications = query({
  args: {
    characterId: v.id("characters"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("notifications"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    screen: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notifications")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .order("desc")
      .take(args.limit ?? 30);

    return notes.map((n) => ({
      _id: n._id,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      screen: n.screen ?? null,
      createdAt: n.createdAt,
    }));
  },
});

export const getUnreadCount = query({
  args: { characterId: v.id("characters") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notifications")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();
    return notes.filter((n) => !n.read).length;
  },
 });

export const markNotificationRead = mutation({
  args: {
    characterId: v.id("characters"),
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = await ctx.db.get("notifications", args.notificationId);
    if (!note || note.characterId !== args.characterId) {
      throw new Error("Notification introuvable");
    }
    await ctx.db.patch("notifications", args.notificationId, { read: true });
    return null;
  },
});

export const markAllNotificationsRead = mutation({
  args: { characterId: v.id("characters") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notifications")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    let count = 0;
    for (const note of notes) {
      if (!note.read) {
        await ctx.db.patch("notifications", note._id, { read: true });
        count++;
      }
    }
    return count;
  },
});

export const registerPushInterest = mutation({
  args: {
    characterId: v.id("characters"),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    await ctx.db.patch("characters", args.characterId, {
      pushNotificationsEnabled: args.enabled,
    });

    if (args.enabled) {
      await ctx.db.insert("notifications", {
        characterId: args.characterId,
        type: "push_enabled",
        title: "Notifications activées",
        body: "Alertes PvP, événements live et guildes activées.",
        read: false,
        createdAt: Date.now(),
      });
    }
    return null;
  },
});
