import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getSpellById } from "./lib/spells";
import { tryUnlockAchievement, syncCharacterAchievements } from "./lib/achievementUnlock";
import { applySpellEffects, tickBuffs } from "./lib/combatEffects";

const MONSTER_DATA: Record<string, { hp: number; ap: number; mp: number; damage: number; name: string }> = {
  graine_ombre: { hp: 30, ap: 4, mp: 3, damage: 5, name: "Graine d'Ombre" },
  wisp_sauvage: { hp: 45, ap: 5, mp: 4, damage: 8, name: "Wisp Sauvage" },
  loup_cristal: { hp: 70, ap: 6, mp: 4, damage: 12, name: "Loup de Cristal" },
  gardien_ruines: { hp: 300, ap: 8, mp: 3, damage: 20, name: "Gardien des Ruines" },
  treant_corrompu: { hp: 120, ap: 5, mp: 2, damage: 15, name: "Tréant Corrompu" },
  fee_brume: { hp: 80, ap: 7, mp: 6, damage: 18, name: "Fée de Brume" },
};

type Entity = {
  entityId: string;
  name: string;
  isPlayer: boolean;
  classId?: string;
  monsterId?: string;
  ownerCharacterId?: Id<"characters">;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  x: number;
  y: number;
  team: "player" | "enemy";
  buffs: { stat: string; value: number; duration: number }[];
  isAlive: boolean;
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function buildPlayerEntity(
  character: {
    _id: Id<"characters">;
    name: string;
    classId: string;
    hp: number;
    maxHp: number;
    maxAp: number;
    maxMp: number;
  },
  x: number,
  y: number
): Entity {
  return {
    entityId: generateId(),
    name: character.name,
    isPlayer: true,
    classId: character.classId,
    ownerCharacterId: character._id,
    hp: character.hp,
    maxHp: character.maxHp,
    ap: character.maxAp,
    maxAp: character.maxAp,
    mp: character.maxMp,
    maxMp: character.maxMp,
    x,
    y,
    team: "player",
    buffs: [],
    isAlive: true,
  };
}

function buildEnemies(monsterIds: string[]): Entity[] {
  return monsterIds.map((monsterId, index) => {
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
}

function resolveCombatStatus(entities: Entity[]): {
  status: "active" | "victory" | "defeat";
  rewards?: { xp: number; eclats: number; items: { itemId: string; quantity: number }[] };
} {
  const enemiesAlive = entities.filter((e) => e.team === "enemy" && e.isAlive);
  const playersAlive = entities.filter((e) => e.team === "player" && e.isAlive);
  if (enemiesAlive.length === 0) {
    return { status: "victory", rewards: { xp: 50, eclats: 25, items: [] } };
  }
  if (playersAlive.length === 0) return { status: "defeat" };
  return { status: "active" };
}

function runEnemyTurn(entities: Entity[]): Entity[] {
  const enemy = entities.find((e) => e.team === "enemy" && e.isAlive);
  const player = entities.find((e) => e.team === "player" && e.isAlive);
  if (!enemy || !player) return entities;

  const dmg = Math.floor(Math.random() * 8) + 5;
  return entities.map((e) => {
    if (e.entityId === player.entityId) {
      const newHp = Math.max(0, e.hp - dmg);
      return { ...e, hp: newHp, isAlive: newHp > 0 };
    }
    return e;
  });
}

async function insertCombat(
  ctx: MutationCtx,
  opts: {
    characterId: Id<"characters">;
    zoneId: string;
    entities: Entity[];
    isPvP: boolean;
    opponentCharacterId?: Id<"characters">;
    dungeonRunId?: Id<"dungeonRuns">;
    raidRunId?: Id<"raidRuns">;
    participantCharacterIds?: Id<"characters">[];
    combatType: "world" | "dungeon" | "pvp" | "event";
    rewards?: { xp: number; eclats: number; items: { itemId: string; quantity: number }[] };
  }
): Promise<Id<"combats">> {
  const now = Date.now();
  return await ctx.db.insert("combats", {
    characterId: opts.characterId,
    zoneId: opts.zoneId,
    status: "active",
    turn: 1,
    currentEntityId: opts.entities[0]!.entityId,
    entities: opts.entities,
    gridWidth: 12,
    gridHeight: 8,
    obstacles: [{ x: 5, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 3 }],
    isPvP: opts.isPvP,
    opponentCharacterId: opts.opponentCharacterId,
    dungeonRunId: opts.dungeonRunId,
    raidRunId: opts.raidRunId,
    participantCharacterIds: opts.participantCharacterIds,
    combatType: opts.combatType,
    rewards: opts.rewards,
    createdAt: now,
    updatedAt: now,
  });
}

export const startCombat = mutation({
  args: {
    characterId: v.id("characters"),
    monsterIds: v.array(v.string()),
    zoneId: v.string(),
    combatType: v.optional(v.union(
      v.literal("world"),
      v.literal("dungeon"),
      v.literal("pvp"),
      v.literal("event")
    )),
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
    if (activeCombat) throw new Error("Combat déjà en cours");

    const player = buildPlayerEntity(character, 2, 4);
    const entities = [player, ...buildEnemies(args.monsterIds)];

    return await insertCombat(ctx, {
      characterId: args.characterId,
      zoneId: args.zoneId,
      entities,
      isPvP: false,
      combatType: args.combatType ?? "world",
    });
  },
});

export const startDungeonCombat = mutation({
  args: {
    runId: v.id("dungeonRuns"),
    monsterIds: v.array(v.string()),
    zoneId: v.string(),
    leaderId: v.id("characters"),
  },
  returns: v.id("combats"),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("dungeonRuns", args.runId);
    if (!run) throw new Error("Run introuvable");

    const existing = await ctx.db
      .query("combats")
      .withIndex("by_dungeon_run", (q) => q.eq("dungeonRunId", args.runId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (existing) return existing._id;

    const players: Entity[] = [];
    for (let i = 0; i < run.members.length; i++) {
      const member = run.members[i]!;
      const char = await ctx.db.get("characters", member.characterId);
      if (!char) continue;
      players.push(buildPlayerEntity(char, 1 + i, 4));
    }
    if (players.length === 0) throw new Error("Aucun joueur");

    const entities = [...players, ...buildEnemies(args.monsterIds)];
    const participantIds = run.members.map((m) => m.characterId);

    return await insertCombat(ctx, {
      characterId: args.leaderId,
      zoneId: args.zoneId,
      entities,
      isPvP: false,
      dungeonRunId: args.runId,
      participantCharacterIds: participantIds,
      combatType: "dungeon",
      rewards: { xp: 30, eclats: 15, items: [] },
    });
  },
});

export const startPvpCombat = mutation({
  args: {
    matchId: v.id("pvpMatches"),
    characterId: v.id("characters"),
  },
  returns: v.id("combats"),
  handler: async (ctx, args) => {
    const match = await ctx.db.get("pvpMatches", args.matchId);
    if (!match) throw new Error("Match introuvable");

    if (match.combatId) {
      const inMatch =
        match.teamA.some((p) => p.characterId === args.characterId) ||
        match.teamB.some((p) => p.characterId === args.characterId);
      if (!inMatch) throw new Error("Non participant");
      return match.combatId;
    }

    const isTeamA = match.teamA.some((p) => p.characterId === args.characterId);
    const myTeam = isTeamA ? match.teamA : match.teamB;
    const enemyTeam = isTeamA ? match.teamB : match.teamA;

    if (!myTeam.some((p) => p.characterId === args.characterId)) {
      throw new Error("Non participant au match");
    }

    const playerEntities = [];
    for (let i = 0; i < myTeam.length; i++) {
      const member = myTeam[i]!;
      const char = await ctx.db.get("characters", member.characterId);
      if (!char) throw new Error("Joueur introuvable");
      playerEntities.push(buildPlayerEntity(char, 1 + i * 2, 3 + (i % 2)));
    }

    const enemyEntities = [];
    for (let i = 0; i < enemyTeam.length; i++) {
      const member = enemyTeam[i]!;
      const char = await ctx.db.get("characters", member.characterId);
      if (!char) throw new Error("Adversaire introuvable");
      const entity = buildPlayerEntity(char, 7 + i * 2, 3 + (i % 2));
      entity.team = "enemy";
      entity.isPlayer = false;
      enemyEntities.push(entity);
    }

    const participantIds = [...match.teamA, ...match.teamB].map((p) => p.characterId);

    const combatId = await insertCombat(ctx, {
      characterId: args.characterId,
      zoneId: "arene_pvp",
      entities: [...playerEntities, ...enemyEntities],
      isPvP: true,
      opponentCharacterId: enemyTeam[0]?.characterId,
      combatType: "pvp",
      participantCharacterIds: participantIds,
    });

    await ctx.db.patch("pvpMatches", args.matchId, {
      status: "active",
      combatId,
    });

    return combatId;
  },
});

export const startRaidCombat = mutation({
  args: {
    runId: v.id("raidRuns"),
    monsterIds: v.array(v.string()),
    zoneId: v.string(),
    leaderId: v.id("characters"),
  },
  returns: v.id("combats"),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("raidRuns", args.runId);
    if (!run) throw new Error("Raid introuvable");

    const existing = await ctx.db
      .query("combats")
      .withIndex("by_raid_run", (q) => q.eq("raidRunId", args.runId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (existing) return existing._id;

    const players: Entity[] = [];
    for (let i = 0; i < run.members.length; i++) {
      const member = run.members[i]!;
      const char = await ctx.db.get("characters", member.characterId);
      if (!char) continue;
      const col = i % 4;
      const row = Math.floor(i / 4);
      players.push(buildPlayerEntity(char, 1 + col, 3 + row));
    }
    if (players.length === 0) throw new Error("Aucun joueur");

    const entities = [...players, ...buildEnemies(args.monsterIds)];
    const participantIds = run.members.map((m) => m.characterId);

    return await insertCombat(ctx, {
      characterId: args.leaderId,
      zoneId: args.zoneId,
      entities,
      isPvP: false,
      raidRunId: args.runId,
      participantCharacterIds: participantIds,
      combatType: "dungeon",
      rewards: { xp: 80, eclats: 40, items: [] },
    });
  },
});

export const getCombatByRaidRun = query({
  args: { runId: v.id("raidRuns") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("combats")
      .withIndex("by_raid_run", (q) => q.eq("raidRunId", args.runId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getCombat = query({
  args: { combatId: v.id("combats") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("combats", args.combatId);
  },
});

export const getCombatByDungeonRun = query({
  args: { runId: v.id("dungeonRuns") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("combats")
      .withIndex("by_dungeon_run", (q) => q.eq("dungeonRunId", args.runId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
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

    const spell = getSpellById(args.spellId);
    if (!spell) throw new Error("Sort inconnu");

    const casterIdx = combat.entities.findIndex((e) => e.entityId === args.entityId);
    const caster = combat.entities[casterIdx];
    if (!caster || !caster.isAlive) throw new Error("Lanceur invalide");
    if (caster.ap < spell.apCost) throw new Error("Pas assez de PA");

    const distance = Math.abs(args.targetX - caster.x) + Math.abs(args.targetY - caster.y);
    if (distance < spell.minRange || distance > spell.maxRange) {
      throw new Error("Hors de portée");
    }

    const targetIdx = combat.entities.findIndex(
      (e) => e.x === args.targetX && e.y === args.targetY && e.isAlive
    );
    const target = targetIdx >= 0 ? combat.entities[targetIdx] : undefined;

    const casterState = {
      entityId: caster.entityId,
      hp: caster.hp,
      maxHp: caster.maxHp,
      ap: caster.ap,
      maxAp: caster.maxAp,
      mp: caster.mp,
      maxMp: caster.maxMp,
      buffs: caster.buffs,
      isAlive: caster.isAlive,
      team: caster.team,
    };
    const targetState = target
      ? {
          entityId: target.entityId,
          hp: target.hp,
          maxHp: target.maxHp,
          ap: target.ap,
          maxAp: target.maxAp,
          mp: target.mp,
          maxMp: target.maxMp,
          buffs: target.buffs,
          isAlive: target.isAlive,
          team: target.team,
        }
      : undefined;

    const result = applySpellEffects(casterState, targetState, spell.effects);
    const killed: string[] = [];

    let updatedEntities = combat.entities.map((e, i) => {
      if (i === casterIdx) {
        return {
          ...e,
          ap: e.ap - spell.apCost,
          hp: result.caster.hp,
          maxMp: result.caster.maxMp,
          buffs: result.caster.buffs,
          isAlive: result.caster.isAlive,
        };
      }
      if (targetIdx >= 0 && i === targetIdx && result.target) {
        if (!result.target.isAlive) killed.push(e.entityId);
        return {
          ...e,
          hp: result.target.hp,
          maxMp: result.target.maxMp,
          buffs: result.target.buffs,
          isAlive: result.target.isAlive,
        };
      }
      return e;
    });

    const resolved = resolveCombatStatus(updatedEntities);
    await ctx.db.patch("combats", args.combatId, {
      entities: updatedEntities,
      status: resolved.status,
      rewards: resolved.rewards ?? combat.rewards,
      updatedAt: Date.now(),
    });

    return { damage: result.damage, heal: result.heal, killed };
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

    let entities = combat.entities.map((e) => {
      const ticked = tickBuffs({
        entityId: e.entityId,
        hp: e.hp,
        maxHp: e.maxHp,
        ap: e.ap,
        maxAp: e.maxAp,
        mp: e.mp,
        maxMp: e.maxMp,
        buffs: e.buffs,
        isAlive: e.isAlive,
        team: e.team,
      });
      return { ...e, hp: ticked.hp, maxMp: ticked.maxMp, buffs: ticked.buffs };
    });

    const aliveEntities = entities.filter((e) => e.isAlive);
    const currentIndex = aliveEntities.findIndex((e) => e.entityId === args.entityId);
    let nextIndex = (currentIndex + 1) % aliveEntities.length;
    let nextEntity = aliveEntities[nextIndex];
    let newTurn = nextIndex === 0 ? combat.turn + 1 : combat.turn;

    if (nextEntity) {
      entities = entities.map((e) =>
        e.entityId === nextEntity!.entityId ? { ...e, ap: e.maxAp, mp: e.maxMp } : e
      );
    }

    // IA ennemie automatique
    if (nextEntity?.team === "enemy") {
      entities = runEnemyTurn(entities);
      const resolved = resolveCombatStatus(entities);
      if (resolved.status !== "active") {
        await ctx.db.patch("combats", args.combatId, {
          entities,
          status: resolved.status,
          rewards: resolved.rewards,
          updatedAt: Date.now(),
        });
        return null;
      }
      const stillAlive = entities.filter((e) => e.isAlive);
      const playerNext = stillAlive.find((e) => e.team === "player");
      if (playerNext) {
        nextEntity = playerNext;
        newTurn = combat.turn + 1;
        entities = entities.map((e) =>
          e.entityId === playerNext.entityId ? { ...e, ap: e.maxAp, mp: e.maxMp } : e
        );
      }
    }

    if (!nextEntity) throw new Error("Aucune entité suivante");

    await ctx.db.patch("combats", args.combatId, {
      entities,
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

    const ids = combat.participantCharacterIds ?? [args.characterId];
    for (const charId of ids) {
      const character = await ctx.db.get("characters", charId);
      if (!character) continue;

      let newXp = character.xp + combat.rewards.xp;
      let newLevel = character.level;
      let xpToNext = character.xpToNext;

      while (newXp >= xpToNext && newLevel < 60) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = newLevel * 100 + (newLevel - 1) * 50;
      }

      await ctx.db.patch("characters", charId, {
        xp: newXp,
        level: newLevel,
        xpToNext,
        eclats: character.eclats + combat.rewards.eclats,
      });

      await tryUnlockAchievement(ctx, charId, "first_victory");
      await syncCharacterAchievements(ctx, charId);
    }
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
