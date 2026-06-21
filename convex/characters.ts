import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUnlockedSpellIds, mergeUnlockedSpells, migrateLegacyClass } from "./lib/classProgression";
import { canSelectTalent } from "./lib/talents";

const BASE_STATS: Record<string, Record<string, number>> = {
  alchimiste: { vitality: 12, wisdom: 16, strength: 4, intelligence: 12, agility: 8, chance: 8 },
  luminaire: { vitality: 10, wisdom: 18, strength: 4, intelligence: 14, agility: 8, chance: 6 },
  pyromancien: { vitality: 10, wisdom: 12, strength: 4, intelligence: 16, agility: 10, chance: 8 },
  cryomancien: { vitality: 10, wisdom: 12, strength: 4, intelligence: 16, agility: 12, chance: 6 },
  gardien: { vitality: 18, wisdom: 6, strength: 14, intelligence: 4, agility: 6, chance: 12 },
  bastion: { vitality: 18, wisdom: 6, strength: 16, intelligence: 4, agility: 4, chance: 12 },
  berserker: { vitality: 14, wisdom: 4, strength: 18, intelligence: 4, agility: 10, chance: 10 },
  eclaireur: { vitality: 10, wisdom: 8, strength: 12, intelligence: 6, agility: 16, chance: 8 },
  archer: { vitality: 10, wisdom: 8, strength: 10, intelligence: 8, agility: 16, chance: 8 },
  invocateur: { vitality: 10, wisdom: 14, strength: 4, intelligence: 14, agility: 8, chance: 10 },
};

function calculateMaxHp(stats: Record<string, number>, level: number): number {
  return 50 + (stats.vitality ?? 8) * 5 + level * 10;
}

function calculateMaxAp(level: number): number {
  return 6 + Math.floor(level / 10);
}

function calculateMaxMp(stats: Record<string, number>, level: number): number {
  return 3 + Math.floor((stats.agility ?? 6) / 5) + Math.floor(level / 15);
}

export const createCharacter = mutation({
  args: {
    accountId: v.id("accounts"),
    name: v.string(),
    classId: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("characters")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existing) {
      throw new Error("Ce nom de personnage est déjà pris");
    }

    const accountChars = await ctx.db
      .query("characters")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();

    if (accountChars.length >= 5) {
      throw new Error("Maximum 5 personnages par compte");
    }

    const stats = BASE_STATS[args.classId];
    if (!stats) {
      throw new Error("Classe invalide");
    }

    const spells = getUnlockedSpellIds(args.classId, 1);
    const maxHp = calculateMaxHp(stats, 1);
    const now = Date.now();

    return await ctx.db.insert("characters", {
      accountId: args.accountId,
      name: args.name,
      classId: args.classId,
      level: 1,
      xp: 0,
      xpToNext: 100,
      stats: {
        vitality: stats.vitality ?? 8,
        wisdom: stats.wisdom ?? 8,
        strength: stats.strength ?? 8,
        intelligence: stats.intelligence ?? 8,
        agility: stats.agility ?? 8,
        chance: stats.chance ?? 8,
      },
      statPoints: 0,
      spellPoints: 0,
      hp: maxHp,
      maxHp,
      ap: calculateMaxAp(1),
      maxAp: calculateMaxAp(1),
      mp: calculateMaxMp(stats, 1),
      maxMp: calculateMaxMp(stats, 1),
      eclats: 100,
      zoneId: "vallee_eveils",
      x: 5,
      y: 5,
      spells,
      talents: [],
      equipment: {},
      inventory: [
        { itemId: "pain_eveil", quantity: 10 },
        { itemId: "potion_vie", quantity: 3 },
      ],
      activeQuests: [],
      completedQuests: [],
      professions: [],
      pvpRating: 1000,
      pvpWins: 0,
      pvpLosses: 0,
      playTime: 0,
      createdAt: now,
      lastPlayedAt: now,
    });
  },
});

export const getCharactersByAccount = query({
  args: { accountId: v.id("accounts") },
  returns: v.array(
    v.object({
      _id: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      level: v.number(),
      zoneId: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const chars = await ctx.db
      .query("characters")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();

    return chars.map((c) => ({
      _id: c._id,
      name: c.name,
      classId: c.classId,
      level: c.level,
      zoneId: c.zoneId,
    }));
  },
});

export const getCharacter = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("characters", args.characterId);
  },
});

export const moveCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    zoneId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("characters", args.characterId, {
      zoneId: args.zoneId,
      x: args.x,
      y: args.y,
      lastPlayedAt: Date.now(),
    });
    return null;
  },
});

export const addXp = mutation({
  args: {
    characterId: v.id("characters"),
    xp: v.number(),
  },
  returns: v.object({
    leveledUp: v.boolean(),
    newLevel: v.number(),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    let newXp = character.xp + args.xp;
    let newLevel = character.level;
    let leveledUp = false;

    while (newXp >= character.xpToNext && newLevel < 60) {
      newXp -= character.xpToNext;
      newLevel++;
      leveledUp = true;
    }

    const xpToNext = newLevel * 100 + (newLevel - 1) * 50;
    const maxHp = calculateMaxHp(character.stats, newLevel);
    const syncedSpells = mergeUnlockedSpells(character.classId, newLevel, character.spells);

    await ctx.db.patch("characters", args.characterId, {
      xp: newXp,
      level: newLevel,
      xpToNext,
      maxHp,
      hp: leveledUp ? maxHp : character.hp,
      maxAp: calculateMaxAp(newLevel),
      maxMp: calculateMaxMp(character.stats, newLevel),
      statPoints: leveledUp ? character.statPoints + 5 : character.statPoints,
      spellPoints: leveledUp ? character.spellPoints + 1 : character.spellPoints,
      spells: syncedSpells,
    });

    return { leveledUp, newLevel };
  },
});

export const syncCharacterProgression = mutation({
  args: { characterId: v.id("characters") },
  returns: v.object({
    migrated: v.boolean(),
    spellsAdded: v.number(),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const migrated = migrateLegacyClass(character.classId, character.spells);
    const syncedSpells = mergeUnlockedSpells(
      migrated.classId,
      character.level,
      migrated.spells
    );
    const spellsAdded = syncedSpells.length - character.spells.length;
    const didMigrate = migrated.classId !== character.classId;
    const needsTalentsInit = character.talents === undefined;
    const needsSpellSync =
      didMigrate ||
      spellsAdded > 0 ||
      syncedSpells.some((id) => !character.spells.includes(id));

    if (!needsSpellSync && !needsTalentsInit && !didMigrate) {
      return { migrated: false, spellsAdded: 0 };
    }

    const patch: Record<string, unknown> = {
      spells: syncedSpells,
    };
    if (didMigrate) {
      patch.classId = migrated.classId;
      const stats = BASE_STATS[migrated.classId];
      if (stats) patch.stats = stats;
    }
    if (character.talents === undefined) {
      patch.talents = [];
    }

    await ctx.db.patch("characters", args.characterId, patch);
    return { migrated: didMigrate, spellsAdded: Math.max(0, spellsAdded) };
  },
});

export const selectTalent = mutation({
  args: {
    characterId: v.id("characters"),
    talentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const owned = character.talents ?? [];
    const error = canSelectTalent(
      character.classId,
      character.level,
      owned,
      args.talentId,
      character.spellPoints
    );
    if (error) throw new Error(error);

    await ctx.db.patch("characters", args.characterId, {
      talents: [...owned, args.talentId],
      spellPoints: character.spellPoints - 1,
      lastPlayedAt: Date.now(),
    });
    return null;
  },
});
