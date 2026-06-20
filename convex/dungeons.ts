import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const startDungeonRun = mutation({
  args: {
    dungeonId: v.string(),
    leaderId: v.id("characters"),
    leaderName: v.string(),
    classId: v.string(),
    level: v.number(),
    totalRooms: v.number(),
  },
  returns: v.id("dungeonRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("dungeonRuns", {
      dungeonId: args.dungeonId,
      leaderId: args.leaderId,
      members: [{
        characterId: args.leaderId,
        name: args.leaderName,
        classId: args.classId,
        level: args.level,
      }],
      currentRoom: 0,
      totalRooms: args.totalRooms,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const advanceRoom = mutation({
  args: { runId: v.id("dungeonRuns") },
  returns: v.object({ currentRoom: v.number(), isBoss: v.boolean(), isComplete: v.boolean() }),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("dungeonRuns", args.runId);
    if (!run) throw new Error("Run introuvable");

    const nextRoom = run.currentRoom + 1;
    const isComplete = nextRoom >= run.totalRooms;

    await ctx.db.patch("dungeonRuns", args.runId, {
      currentRoom: nextRoom,
      status: isComplete ? "completed" : "active",
    });

    return {
      currentRoom: nextRoom,
      isBoss: nextRoom === run.totalRooms,
      isComplete,
    };
  },
});

export const joinDungeonRun = mutation({
  args: {
    runId: v.id("dungeonRuns"),
    characterId: v.id("characters"),
    name: v.string(),
    classId: v.string(),
    level: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("dungeonRuns", args.runId);
    if (!run || run.status !== "waiting") throw new Error("Run non disponible");
    if (run.members.length >= 4) throw new Error("Groupe complet");

    await ctx.db.patch("dungeonRuns", args.runId, {
      members: [...run.members, {
        characterId: args.characterId,
        name: args.name,
        classId: args.classId,
        level: args.level,
      }],
    });
    return null;
  },
});

export const getDungeonRun = query({
  args: { runId: v.id("dungeonRuns") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("dungeonRuns", args.runId);
  },
});

export const listActiveRuns = query({
  args: { dungeonId: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("dungeonRuns")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .take(20);

    if (args.dungeonId) {
      return runs.filter((r) => r.dungeonId === args.dungeonId);
    }
    return runs;
  },
});
