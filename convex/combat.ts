import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MONSTER_DATA: Record<string, { hp: number; ap: number; mp: number; damage: number; name: string }> = {
  graine_ombre: { hp: 30, ap: 4, mp: 3, damage: 5, name: "Graine d'Ombre" },
  wisp_sauvage: { hp: 45, ap: 5, mp: 4, damage: 8, name: "Wisp Sauvage" },
  loup_cristal: { hp: 70, ap: 6, mp: 4, damage: 12, name: "Loup de Cristal" },
  gardien_ruines: { hp: 300, ap: 8, mp: 3, damage: 20, name: "Gardien des Ruines" },
  treant_corrompu: { hp: 120, ap: 5, mp: 2, damage: 15, name: "Tréant Corrompu" },
  fee_brume: { hp: 80, ap: 7, mp: 6, damage: 18, name: "Fée de Brume" },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const startCombat = mutation({
  args: {
    characterId: v.id("characters"),
    monsterIds: v.array(v.string()),
    zoneId: v.string(),
  },
  returns: v.id("combats"),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const activeCombat = await ctx.db
      .query("combats")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeCombat) {
      throw new Error("Combat déjà en cours");
    }

    const playerEntity = {
      entityId: generateId(),
      name: character.name,
      isPlayer: true,
      classId: character.classId,
      hp: character.hp,
      maxHp: character.maxHp,
      ap: character.maxAp,
      maxAp: character.maxAp,
      mp: character.maxMp,
      maxMp: character.maxMp,
      x: 2,
      y: 4,
      team: "player" as const,
      buffs: [],
      isAlive: true,
    };

    const enemyEntities = args.monsterIds.map((monsterId, index) => {
      const monster = MONSTER_DATA[monsterId] ?? { hp: 50, ap: 4, mp: 3, damage: 8, name: "Monstre" };
      return {
        entityId: generateId(),
        name: monster.name,
        isPlayer: false,
        monsterId,
        hp: monster.hp,
        maxHp: monster.hp,
        ap: monster.ap,
        maxAp: monster.ap,
        mp: monster.mp,
        maxMp: monster.mp,
        x: 8 + (index % 3),
        y: 2 + Math.floor(index / 3),
        team: "enemy" as const,
        buffs: [],
        isAlive: true,
      };
    });

    const entities = [playerEntity, ...enemyEntities];
    const now = Date.now();

    return await ctx.db.insert("combats", {
      characterId: args.characterId,
      zoneId: args.zoneId,
      status: "active",
      turn: 1,
      currentEntityId: playerEntity.entityId,
      entities,
      gridWidth: 12,
      gridHeight: 8,
      obstacles: [
        { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 3 },
      ],
      isPvP: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getCombat = query({
  args: { combatId: v.id("combats") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("combats", args.combatId);
  },
});

export const getActiveCombat = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("combats")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const moveEntity = mutation({
  args: {
    combatId: v.id("combats"),
    entityId: v.string(),
    targetX: v.number(),
    targetY: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const combat = await ctx.db.get("combats", args.combatId);
    if (!combat || combat.status !== "active") throw new Error("Combat invalide");
    if (combat.currentEntityId !== args.entityId) throw new Error("Ce n'est pas votre tour");

    const entity = combat.entities.find((e) => e.entityId === args.entityId);
    if (!entity || !entity.isAlive) throw new Error("Entité invalide");

    const distance = Math.abs(args.targetX - entity.x) + Math.abs(args.targetY - entity.y);
    if (distance > entity.mp) throw new Error("Pas assez de PM");

    const occupied = combat.entities.some(
      (e) => e.isAlive && e.x === args.targetX && e.y === args.targetY
    );
    if (occupied) throw new Error("Case occupée");

    const updatedEntities = combat.entities.map((e) =>
      e.entityId === args.entityId
        ? { ...e, x: args.targetX, y: args.targetY, mp: e.mp - distance }
        : e
    );

    await ctx.db.patch("combats", args.combatId, {
      entities: updatedEntities,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const castSpell = mutation({
  args: {
    combatId: v.id("combats"),
    entityId: v.string(),
    spellId: v.string(),
    targetX: v.number(),
    targetY: v.number(),
  },
  returns: v.object({
    damage: v.optional(v.number()),
    heal: v.optional(v.number()),
    killed: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const combat = await ctx.db.get("combats", args.combatId);
    if (!combat || combat.status !== "active") throw new Error("Combat invalide");
    if (combat.currentEntityId !== args.entityId) throw new Error("Ce n'est pas votre tour");

    const caster = combat.entities.find((e) => e.entityId === args.entityId);
    if (!caster || !caster.isAlive) throw new Error("Lanceur invalide");

    const apCost = 3;
    if (caster.ap < apCost) throw new Error("Pas assez de PA");

    const target = combat.entities.find(
      (e) => e.x === args.targetX && e.y === args.targetY && e.isAlive
    );

    let damage: number | undefined;
    let heal: number | undefined;
    const killed: string[] = [];

    const updatedEntities = combat.entities.map((e) => {
      if (e.entityId === args.entityId) {
        return { ...e, ap: e.ap - apCost };
      }
      if (target && e.entityId === target.entityId && e.team !== caster.team) {
        const dmg = Math.floor(Math.random() * 10) + 8;
        damage = dmg;
        const newHp = Math.max(0, e.hp - dmg);
        if (newHp === 0) killed.push(e.entityId);
        return { ...e, hp: newHp, isAlive: newHp > 0 };
      }
      return e;
    });

    const enemiesAlive = updatedEntities.filter((e) => e.team === "enemy" && e.isAlive);
    const playersAlive = updatedEntities.filter((e) => e.team === "player" && e.isAlive);

    let status: "active" | "victory" | "defeat" = combat.status;
    let rewards = combat.rewards;

    if (enemiesAlive.length === 0) {
      status = "victory";
      rewards = { xp: 50, eclats: 25, items: [] };
    } else if (playersAlive.length === 0) {
      status = "defeat";
    }

    await ctx.db.patch("combats", args.combatId, {
      entities: updatedEntities,
      status,
      rewards,
      updatedAt: Date.now(),
    });

    return { damage, heal, killed };
  },
});

export const endTurn = mutation({
  args: {
    combatId: v.id("combats"),
    entityId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const combat = await ctx.db.get("combats", args.combatId);
    if (!combat || combat.status !== "active") throw new Error("Combat invalide");

    const aliveEntities = combat.entities.filter((e) => e.isAlive);
    const currentIndex = aliveEntities.findIndex((e) => e.entityId === args.entityId);
    const nextIndex = (currentIndex + 1) % aliveEntities.length;
    const nextEntity = aliveEntities[nextIndex];

    if (!nextEntity) throw new Error("Aucune entité suivante");

    const newTurn = nextIndex === 0 ? combat.turn + 1 : combat.turn;

    const updatedEntities = combat.entities.map((e) => {
      if (e.entityId === nextEntity.entityId) {
        return { ...e, ap: e.maxAp, mp: e.maxMp };
      }
      return e;
    });

    await ctx.db.patch("combats", args.combatId, {
      entities: updatedEntities,
      currentEntityId: nextEntity.entityId,
      turn: newTurn,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const applyVictoryRewards = mutation({
  args: {
    combatId: v.id("combats"),
    characterId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const combat = await ctx.db.get("combats", args.combatId);
    if (!combat || combat.status !== "victory" || !combat.rewards) return null;

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) return null;

    let newXp = character.xp + combat.rewards.xp;
    let newLevel = character.level;
    let xpToNext = character.xpToNext;

    while (newXp >= xpToNext && newLevel < 60) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = newLevel * 100 + (newLevel - 1) * 50;
    }

    await ctx.db.patch("characters", args.characterId, {
      xp: newXp,
      level: newLevel,
      xpToNext,
      eclats: character.eclats + combat.rewards.eclats,
    });
    return null;
  },
});

export const fleeCombat = mutation({
  args: {
    combatId: v.id("combats"),
    characterId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("combats", args.combatId, {
      status: "fled",
      updatedAt: Date.now(),
    });
    return null;
  },
});
