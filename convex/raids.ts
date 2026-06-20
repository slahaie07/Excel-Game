import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_RAID_MEMBERS = 8;

export const startRaidRun = mutation({
  args: {
    raidId: v.string(),
    leaderId: v.id("characters"),
    leaderName: v.string(),
    classId: v.string(),
    level: v.number(),
    totalPhases: v.number(),
  },
  returns: v.id("raidRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("raidRuns", {
      raidId: args.raidId,
      leaderId: args.leaderId,
      members: [{
        characterId: args.leaderId,
        name: args.leaderName,
        classId: args.classId,
        level: args.level,
      }],
      currentPhase: 0,
      totalPhases: args.totalPhases,
      status: "waiting",
      createdAt: Date.now(),
    });
  },
});

export const joinRaidRun = mutation({
  args: {
    runId: v.id("raidRuns"),
    characterId: v.id("characters"),
    name: v.string(),
    classId: v.string(),
    level: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("raidRuns", args.runId);
    if (!run || run.status !== "waiting") throw new Error("Raid non disponible");
    if (run.members.length >= MAX_RAID_MEMBERS) throw new Error("Raid complet (8/8)");
    if (run.members.some((m) => m.characterId === args.characterId)) {
      throw new Error("Déjà dans ce raid");
    }

    await ctx.db.patch("raidRuns", args.runId, {
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

export const launchRaid = mutation({
  args: {
    runId: v.id("raidRuns"),
    leaderId: v.id("characters"),
    minPlayers: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("raidRuns", args.runId);
    if (!run) throw new Error("Raid introuvable");
    if (run.leaderId !== args.leaderId) throw new Error("Seul le chef peut lancer le raid");
    if (run.status !== "waiting") throw new Error("Raid déjà lancé");
    if (run.members.length < args.minPlayers) {
      throw new Error(`Minimum ${args.minPlayers} joueurs requis`);
    }

    await ctx.db.patch("raidRuns", args.runId, { status: "active" });
    return null;
  },
});

export const advancePhase = mutation({
  args: { runId: v.id("raidRuns") },
  returns: v.object({ currentPhase: v.number(), isComplete: v.boolean() }),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("raidRuns", args.runId);
    if (!run) throw new Error("Raid introuvable");

    const nextPhase = run.currentPhase + 1;
    const isComplete = nextPhase >= run.totalPhases;

    await ctx.db.patch("raidRuns", args.runId, {
      currentPhase: nextPhase,
      status: isComplete ? "completed" : "active",
    });

    return { currentPhase: nextPhase, isComplete };
  },
});

export const getRaidRun = query({
  args: { runId: v.id("raidRuns") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("raidRuns", args.runId);
  },
});

export const listActiveRaids = query({
  args: { raidId: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const waiting = await ctx.db
      .query("raidRuns")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .take(20);

    const active = await ctx.db
      .query("raidRuns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(20);

    const joinable = active.filter((r) => r.members.length < MAX_RAID_MEMBERS);
    const runs = [...waiting, ...joinable];

    if (args.raidId) return runs.filter((r) => r.raidId === args.raidId);
    return runs;
  },
});
