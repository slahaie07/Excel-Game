import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const BOSS_ID = "colosse_aether";
const BOSS_NAME = "Colosse d'Aether";
const BOSS_MAX_HP = 500_000;
const BOSS_ZONE = "citadelle_stellaire";
const RESPAWN_MS = 4 * 60 * 60 * 1000;

const bossReturnValidator = v.object({
  bossId: v.string(),
  name: v.string(),
  maxHp: v.number(),
  currentHp: v.number(),
  zoneId: v.string(),
  status: v.union(v.literal("active"), v.literal("defeated")),
  respawnAt: v.optional(v.number()),
  hpPercent: v.number(),
});

function virtualBoss() {
  return {
    bossId: BOSS_ID,
    name: BOSS_NAME,
    maxHp: BOSS_MAX_HP,
    currentHp: BOSS_MAX_HP,
    zoneId: BOSS_ZONE,
    status: "active" as const,
    respawnAt: undefined,
    hpPercent: 100,
  };
}

export const getWorldBoss = query({
  args: {},
  returns: bossReturnValidator,
  handler: async (ctx) => {
    const boss = await ctx.db
      .query("worldBoss")
      .withIndex("by_boss", (q) => q.eq("bossId", BOSS_ID))
      .first();

    if (!boss) return virtualBoss();

    return {
      bossId: boss.bossId,
      name: boss.name,
      maxHp: boss.maxHp,
      currentHp: boss.currentHp,
      zoneId: boss.zoneId,
      status: boss.status,
      respawnAt: boss.respawnAt,
      hpPercent: Math.round((boss.currentHp / boss.maxHp) * 100),
    };
  },
});

export const attackWorldBoss = mutation({
  args: {
    characterId: v.id("characters"),
    damage: v.optional(v.number()),
  },
  returns: v.object({
    damage: v.number(),
    currentHp: v.number(),
    defeated: v.boolean(),
    rewardEclats: v.number(),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const now = Date.now();
    let boss = await ctx.db
      .query("worldBoss")
      .withIndex("by_boss", (q) => q.eq("bossId", BOSS_ID))
      .first();

    if (!boss) {
      const id = await ctx.db.insert("worldBoss", {
        bossId: BOSS_ID,
        name: BOSS_NAME,
        maxHp: BOSS_MAX_HP,
        currentHp: BOSS_MAX_HP,
        zoneId: BOSS_ZONE,
        status: "active",
        updatedAt: now,
      });
      boss = await ctx.db.get("worldBoss", id);
    }

    if (!boss) throw new Error("Boss introuvable");

    if (boss.status === "defeated") {
      if (boss.respawnAt && now < boss.respawnAt) {
        throw new Error("Le boss est vaincu — respawn en cours");
      }
      await ctx.db.patch("worldBoss", boss._id, {
        currentHp: BOSS_MAX_HP,
        status: "active",
        respawnAt: undefined,
        updatedAt: now,
      });
      boss = { ...boss, currentHp: BOSS_MAX_HP, status: "active" as const, respawnAt: undefined };
    }

    const dmg = args.damage ?? Math.floor(Math.random() * 30) + 15 + character.level * 2;
    const newHp = Math.max(0, boss.currentHp - dmg);
    const defeated = newHp === 0;

    await ctx.db.patch("worldBoss", boss._id, {
      currentHp: newHp,
      status: defeated ? "defeated" : "active",
      respawnAt: defeated ? now + RESPAWN_MS : undefined,
      updatedAt: now,
    });

    await ctx.db.insert("worldBossHits", {
      bossId: BOSS_ID,
      characterId: args.characterId,
      characterName: character.name,
      damage: dmg,
      createdAt: now,
    });

    const rewardEclats = defeated ? 500 + character.level * 10 : Math.floor(dmg / 5);
    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + rewardEclats,
    });

    return { damage: dmg, currentHp: newHp, defeated, rewardEclats };
  },
});

export const getBossLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    characterName: v.string(),
    totalDamage: v.number(),
  })),
  handler: async (ctx, args) => {
    const hits = await ctx.db
      .query("worldBossHits")
      .withIndex("by_boss", (q) => q.eq("bossId", BOSS_ID))
      .order("desc")
      .take(200);

    const totals = new Map<string, { name: string; damage: number }>();
    for (const hit of hits) {
      const key = hit.characterId as string;
      const existing = totals.get(key);
      if (existing) existing.damage += hit.damage;
      else totals.set(key, { name: hit.characterName, damage: hit.damage });
    }

    return [...totals.values()]
      .sort((a, b) => b.damage - a.damage)
      .slice(0, args.limit ?? 10)
      .map((e) => ({ characterName: e.name, totalDamage: e.damage }));
  },
});
