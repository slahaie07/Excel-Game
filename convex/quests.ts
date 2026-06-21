import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const startQuest = mutation({
  args: {
    characterId: v.id("characters"),
    questId: v.string(),
    objectives: v.array(v.object({
      type: v.string(),
      targetId: v.string(),
      current: v.number(),
      required: v.number(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    if (character.completedQuests.includes(args.questId)) {
      throw new Error("Quête déjà complétée");
    }

    const alreadyActive = character.activeQuests.some((q) => q.questId === args.questId);
    if (alreadyActive) throw new Error("Quête déjà active");

    const activeQuests = [
      ...character.activeQuests,
      {
        questId: args.questId,
        status: "active" as const,
        objectives: args.objectives,
        startedAt: Date.now(),
      },
    ];

    await ctx.db.patch("characters", args.characterId, { activeQuests });
    return null;
  },
});

export const updateQuestProgress = mutation({
  args: {
    characterId: v.id("characters"),
    questId: v.string(),
    objectiveIndex: v.number(),
    increment: v.number(),
  },
  returns: v.object({ completed: v.boolean() }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const activeQuests = character.activeQuests.map((quest) => {
      if (quest.questId !== args.questId) return quest;

      const objectives = quest.objectives.map((obj, i) => {
        if (i !== args.objectiveIndex) return obj;
        return { ...obj, current: Math.min(obj.required, obj.current + args.increment) };
      });

      const allComplete = objectives.every((o) => o.current >= o.required);
      return {
        ...quest,
        objectives,
        status: allComplete ? ("completed" as const) : quest.status,
        completedAt: allComplete ? Date.now() : quest.completedAt,
      };
    });

    const completedQuest = activeQuests.find(
      (q) => q.questId === args.questId && q.status === "completed"
    );

    let completedQuests = character.completedQuests;
    let finalActiveQuests = activeQuests;

    if (completedQuest) {
      completedQuests = [...completedQuests, args.questId];
      finalActiveQuests = activeQuests.filter((q) => q.questId !== args.questId);
    }

    await ctx.db.patch("characters", args.characterId, {
      activeQuests: finalActiveQuests,
      completedQuests,
    });

    return { completed: !!completedQuest };
  },
});

export const getActiveQuests = query({
  args: { characterId: v.id("characters") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) return [];
    return character.activeQuests;
  },
});

const questObjectiveInput = v.object({
  type: v.string(),
  targetId: v.string(),
  current: v.number(),
  required: v.number(),
});

const activeQuestInput = v.object({
  questId: v.string(),
  status: v.string(),
  objectives: v.array(questObjectiveInput),
});

/** Sync quest state from client after local progression (cloud characters). */
export const syncQuestState = mutation({
  args: {
    characterId: v.id("characters"),
    activeQuests: v.array(activeQuestInput),
    completedQuests: v.array(v.string()),
    eclats: v.optional(v.number()),
    xp: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const patch: Record<string, unknown> = {
      activeQuests: args.activeQuests.map((q) => ({
        questId: q.questId,
        status: "active" as const,
        objectives: q.objectives,
        startedAt: Date.now(),
      })),
      completedQuests: args.completedQuests,
    };

    if (args.eclats !== undefined) {
      patch.eclats = args.eclats;
    }

    if (args.xp !== undefined) {
      let newXp = character.xp + args.xp;
      let newLevel = character.level;
      while (newXp >= character.xpToNext && newLevel < 200) {
        newXp -= character.xpToNext;
        newLevel++;
      }
      patch.xp = newXp;
      patch.level = newLevel;
      patch.xpToNext = newLevel * 100 + (newLevel - 1) * 50;
    }

    await ctx.db.patch("characters", args.characterId, patch);
    return null;
  },
});
