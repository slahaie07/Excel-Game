import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAccount = mutation({
  args: {
    username: v.string(),
    email: v.optional(v.string()),
  },
  returns: v.id("accounts"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existing) {
      throw new Error("Ce nom d'utilisateur est déjà pris");
    }

    const now = Date.now();
    return await ctx.db.insert("accounts", {
      username: args.username,
      email: args.email,
      createdAt: now,
      lastLoginAt: now,
      stardust: 0,
      isPremium: false,
    });
  },
});

export const getAccount = query({
  args: { accountId: v.id("accounts") },
  returns: v.union(
    v.object({
      _id: v.id("accounts"),
      username: v.string(),
      email: v.optional(v.string()),
      stardust: v.number(),
      isPremium: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const account = await ctx.db.get("accounts", args.accountId);
    if (!account) return null;
    return {
      _id: account._id,
      username: account.username,
      email: account.email,
      stardust: account.stardust,
      isPremium: account.isPremium,
    };
  },
});

export const login = mutation({
  args: { username: v.string() },
  returns: v.union(v.id("accounts"), v.null()),
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!account) return null;

    await ctx.db.patch("accounts", account._id, { lastLoginAt: Date.now() });
    return account._id;
  },
});
