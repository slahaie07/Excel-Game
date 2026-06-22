import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendPublicChat = mutation({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("trade"),
    ),
    senderName: v.string(),
    message: v.string(),
    zone: v.optional(v.string()),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const name = args.senderName.trim().slice(0, 20);
    const message = args.message.trim().slice(0, 200);
    if (!name || !message) throw new Error("Message invalide");

    return await ctx.db.insert("chatMessages", {
      channel: args.channel,
      senderName: name,
      message,
      zone: args.zone,
      timestamp: Date.now(),
    });
  },
});

export const getPublicChat = query({
  args: {
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("trade"),
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("chatMessages"),
      channel: v.union(
        v.literal("global"),
        v.literal("zone"),
        v.literal("guild"),
        v.literal("trade"),
        v.literal("private"),
      ),
      senderName: v.string(),
      message: v.string(),
      zone: v.optional(v.string()),
      timestamp: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .order("desc")
      .take(args.limit ?? 50);

    return messages.reverse().map((m) => ({
      _id: m._id,
      channel: m.channel,
      senderName: m.senderName,
      message: m.message,
      zone: m.zone,
      timestamp: m.timestamp,
    }));
  },
});
