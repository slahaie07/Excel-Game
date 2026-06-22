import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  applyLiveAction,
  buildLivePlayerEntity,
  type PvpLiveAction,
} from "./lib/combatLogic";

const characterStatsValidator = v.object({
  vitality: v.number(),
  wisdom: v.number(),
  strength: v.number(),
  intelligence: v.number(),
  agility: v.number(),
  chance: v.number(),
});

const pvpActionValidator = v.union(
  v.object({
    type: v.literal("move"),
    targetX: v.number(),
    targetY: v.number(),
  }),
  v.object({
    type: v.literal("cast"),
    spellId: v.string(),
    targetX: v.number(),
    targetY: v.number(),
  }),
  v.object({
    type: v.literal("endTurn"),
  })
);

const liveMatchStatusValidator = v.union(
  v.literal("active"),
  v.literal("victory_a"),
  v.literal("victory_b"),
  v.literal("abandoned")
);

const liveEntityValidator = v.object({
  entityId: v.string(),
  name: v.string(),
  isPlayer: v.boolean(),
  classId: v.optional(v.string()),
  monsterId: v.optional(v.string()),
  playerKey: v.optional(v.string()),
  hp: v.number(),
  maxHp: v.number(),
  ap: v.number(),
  maxAp: v.number(),
  mp: v.number(),
  maxMp: v.number(),
  x: v.number(),
  y: v.number(),
  team: v.union(v.literal("player"), v.literal("enemy")),
  ownerCharacterId: v.optional(v.id("characters")),
  buffs: v.array(v.object({
    stat: v.string(),
    value: v.number(),
    duration: v.number(),
  })),
  isAlive: v.boolean(),
});

const liveMatchReturnValidator = v.union(
  v.object({
    _id: v.id("pvpLiveMatches"),
    playerAKey: v.string(),
    playerBKey: v.string(),
    playerAName: v.string(),
    playerBName: v.string(),
    playerAClassId: v.string(),
    playerBClassId: v.string(),
    status: liveMatchStatusValidator,
    turn: v.number(),
    currentPlayerKey: v.string(),
    entities: v.array(liveEntityValidator),
    gridWidth: v.number(),
    gridHeight: v.number(),
    obstacles: v.array(v.object({ x: v.number(), y: v.number() })),
    combatLog: v.array(v.string()),
    winnerPlayerKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  v.null()
);

async function findQueueEntry(ctx: MutationCtx | QueryCtx, playerKey: string) {
  return await ctx.db
    .query("pvpLiveQueue")
    .withIndex("by_player_key", (q) => q.eq("playerKey", playerKey))
    .unique();
}

export const joinLiveQueue = mutation({
  args: {
    playerKey: v.string(),
    playerName: v.string(),
    classId: v.string(),
    level: v.number(),
    rating: v.number(),
    characterStats: characterStatsValidator,
    spells: v.array(v.string()),
  },
  returns: v.union(v.id("pvpLiveMatches"), v.null()),
  handler: async (ctx, args) => {
    const existing = await findQueueEntry(ctx, args.playerKey);
    if (existing) await ctx.db.delete("pvpLiveQueue", existing._id);

    const waiting = await ctx.db
      .query("pvpLiveQueue")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .order("asc")
      .take(10);

    const opponent = waiting.find((e) => e.playerKey !== args.playerKey);

    if (!opponent) {
      await ctx.db.insert("pvpLiveQueue", {
        playerKey: args.playerKey,
        playerName: args.playerName,
        classId: args.classId,
        level: args.level,
        rating: args.rating,
        characterStats: args.characterStats,
        spells: args.spells,
        joinedAt: Date.now(),
        status: "waiting",
      });
      return null;
    }

    await ctx.db.delete("pvpLiveQueue", opponent._id);

    const playerA = opponent;
    const playerB = args;

    const entityA = buildLivePlayerEntity({
      playerKey: playerA.playerKey,
      name: playerA.playerName,
      classId: playerA.classId,
      level: playerA.level,
      stats: playerA.characterStats,
      team: "player",
      x: 2,
      y: 4,
    });

    const entityB = buildLivePlayerEntity({
      playerKey: playerB.playerKey,
      name: playerB.playerName,
      classId: playerB.classId,
      level: playerB.level,
      stats: playerB.characterStats,
      team: "enemy",
      x: 9,
      y: 4,
    });

    const now = Date.now();
    const matchId = await ctx.db.insert("pvpLiveMatches", {
      playerAKey: playerA.playerKey,
      playerBKey: playerB.playerKey,
      playerAName: playerA.playerName,
      playerBName: playerB.playerName,
      playerAClassId: playerA.classId,
      playerBClassId: playerB.classId,
      status: "active",
      turn: 1,
      currentPlayerKey: playerA.playerKey,
      entities: [entityA, entityB],
      gridWidth: 12,
      gridHeight: 8,
      obstacles: [{ x: 5, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 3 }],
      combatLog: [`Duel : ${playerA.playerName} vs ${playerB.playerName}`],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("pvpLiveQueue", {
      playerKey: playerB.playerKey,
      playerName: playerB.playerName,
      classId: playerB.classId,
      level: playerB.level,
      rating: playerB.rating,
      characterStats: playerB.characterStats,
      spells: playerB.spells,
      joinedAt: now,
      status: "matched",
      matchId,
    });

    return matchId;
  },
});

export const leaveLiveQueue = mutation({
  args: { playerKey: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await findQueueEntry(ctx, args.playerKey);
    if (entry) await ctx.db.delete("pvpLiveQueue", entry._id);
    return null;
  },
});

export const getLiveQueueStatus = query({
  args: { playerKey: v.string() },
  returns: v.object({
    inQueue: v.boolean(),
    status: v.union(v.literal("idle"), v.literal("waiting"), v.literal("matched")),
    matchId: v.union(v.id("pvpLiveMatches"), v.null()),
    playersWaiting: v.number(),
  }),
  handler: async (ctx, args) => {
    const entry = await findQueueEntry(ctx, args.playerKey);
    const waiting = await ctx.db
      .query("pvpLiveQueue")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    return {
      inQueue: !!entry,
      status: entry?.status === "matched"
        ? ("matched" as const)
        : entry?.status === "waiting"
          ? ("waiting" as const)
          : ("idle" as const),
      matchId: entry?.matchId ?? null,
      playersWaiting: waiting.length,
    };
  },
});

export const getLiveMatch = query({
  args: { matchId: v.id("pvpLiveMatches") },
  returns: liveMatchReturnValidator,
  handler: async (ctx, args) => {
    return await ctx.db.get("pvpLiveMatches", args.matchId);
  },
});

export const getActiveLiveMatch = query({
  args: { playerKey: v.string() },
  returns: liveMatchReturnValidator,
  handler: async (ctx, args) => {
    const asA = await ctx.db
      .query("pvpLiveMatches")
      .withIndex("by_player_a", (q) => q.eq("playerAKey", args.playerKey))
      .order("desc")
      .take(5);
    const asB = await ctx.db
      .query("pvpLiveMatches")
      .withIndex("by_player_b", (q) => q.eq("playerBKey", args.playerKey))
      .order("desc")
      .take(5);

    const active = [...asA, ...asB].find((m) => m.status === "active");
    return active ?? null;
  },
});

export const submitPvpAction = mutation({
  args: {
    matchId: v.id("pvpLiveMatches"),
    playerKey: v.string(),
    action: pvpActionValidator,
  },
  returns: v.object({
    status: liveMatchStatusValidator,
    combatLog: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const match = await ctx.db.get("pvpLiveMatches", args.matchId);
    if (!match) throw new Error("Match introuvable");
    if (match.status !== "active") throw new Error("Combat terminé");

    const isParticipant =
      match.playerAKey === args.playerKey || match.playerBKey === args.playerKey;
    if (!isParticipant) throw new Error("Non participant");

    const result = applyLiveAction(
      {
        entities: match.entities,
        turn: match.turn,
        currentPlayerKey: match.currentPlayerKey,
      },
      args.playerKey,
      args.action as PvpLiveAction
    );

    const now = Date.now();
    const newLog = [...match.combatLog, ...result.combatLog].slice(-30);

    if (result.status) {
      const winnerKey =
        result.status === "victory_a" ? match.playerAKey : match.playerBKey;
      await ctx.db.patch("pvpLiveMatches", args.matchId, {
        entities: result.entities,
        turn: result.turn,
        currentPlayerKey: result.currentPlayerKey,
        status: result.status,
        winnerPlayerKey: winnerKey,
        combatLog: newLog,
        updatedAt: now,
      });

      const queueEntries = await ctx.db
        .query("pvpLiveQueue")
        .withIndex("by_player_key", (q) => q.eq("playerKey", args.playerKey))
        .unique();
      if (queueEntries) await ctx.db.delete("pvpLiveQueue", queueEntries._id);

      const opponentKey =
        match.playerAKey === args.playerKey ? match.playerBKey : match.playerAKey;
      const opponentQueue = await findQueueEntry(ctx, opponentKey);
      if (opponentQueue) await ctx.db.delete("pvpLiveQueue", opponentQueue._id);

      return { status: result.status, combatLog: result.combatLog };
    }

    await ctx.db.patch("pvpLiveMatches", args.matchId, {
      entities: result.entities,
      turn: result.turn,
      currentPlayerKey: result.currentPlayerKey,
      combatLog: newLog,
      updatedAt: now,
    });

    return { status: "active" as const, combatLog: result.combatLog };
  },
});

export const abandonLiveMatch = mutation({
  args: {
    matchId: v.id("pvpLiveMatches"),
    playerKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const match = await ctx.db.get("pvpLiveMatches", args.matchId);
    if (!match || match.status !== "active") return null;

    const isA = match.playerAKey === args.playerKey;
    const isB = match.playerBKey === args.playerKey;
    if (!isA && !isB) throw new Error("Non participant");

    const winnerKey = isA ? match.playerBKey : match.playerAKey;
    const abandonerName = isA ? match.playerAName : match.playerBName;
    await ctx.db.patch("pvpLiveMatches", args.matchId, {
      status: "abandoned",
      winnerPlayerKey: winnerKey,
      combatLog: [...match.combatLog, `${abandonerName} a abandonné`],
      updatedAt: Date.now(),
    });

    const entry = await findQueueEntry(ctx, args.playerKey);
    if (entry) await ctx.db.delete("pvpLiveQueue", entry._id);
    return null;
  },
});
