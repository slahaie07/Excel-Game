import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  FACTION_RANKS,
  ZONE_FACTION_MAP,
  getFactionRank,
  getNextFactionRank,
} from "./lib/factions";

const factionIdValidator = v.union(
  v.literal("lumina"),
  v.literal("umbra"),
  v.literal("neutre")
);

const FACTION_META: Record<string, { name: string; icon: string; description: string }> = {
  lumina: { name: "Ordre de Lumina", icon: "✨", description: "Gardiens des Cristaux purs" },
  umbra: { name: "Conclave d'Umbra", icon: "🌑", description: "Maîtres des Cristaux corrompus" },
  neutre: { name: "Marchands Libres", icon: "⚖️", description: "Commerçants indépendants" },
};

export async function addFactionReputation(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  factionId: "lumina" | "umbra" | "neutre",
  amount: number
) {
  if (amount <= 0) return;

  const existing = await ctx.db
    .query("factionReputations")
    .withIndex("by_character_and_faction", (q) =>
      q.eq("characterId", characterId).eq("factionId", factionId)
    )
    .unique();

  const newRep = (existing?.reputation ?? 0) + amount;
  const rank = getFactionRank(newRep).id;

  if (existing) {
    await ctx.db.patch("factionReputations", existing._id, {
      reputation: newRep,
      rank,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("factionReputations", {
      characterId,
      factionId,
      reputation: newRep,
      rank,
      updatedAt: Date.now(),
    });
  }
}

export async function addZoneFactionReputation(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  zoneId: string,
  amount: number
) {
  const factionId = ZONE_FACTION_MAP[zoneId];
  if (!factionId) return;
  await addFactionReputation(ctx, characterId, factionId, amount);
}

export const getMyFactions = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    pledgedFactionId: v.union(factionIdValidator, v.null()),
    factions: v.array(v.object({
      factionId: factionIdValidator,
      name: v.string(),
      icon: v.string(),
      description: v.string(),
      reputation: v.number(),
      rank: v.string(),
      rankLabel: v.string(),
      rankIcon: v.string(),
      nextRankLabel: v.union(v.string(), v.null()),
      pointsToNext: v.union(v.number(), v.null()),
      progressPercent: v.number(),
      isPledged: v.boolean(),
    })),
  }),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("factionProfiles")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    const reps = await ctx.db
      .query("factionReputations")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    const repMap = new Map(reps.map((r) => [r.factionId, r]));

    const factions = (["lumina", "umbra", "neutre"] as const).map((factionId) => {
      const meta = FACTION_META[factionId]!;
      const rep = repMap.get(factionId)?.reputation ?? 0;
      const rank = getFactionRank(rep);
      const next = getNextFactionRank(rep);
      const pointsToNext = next ? next.minReputation - rep : null;
      const progressPercent = next
        ? Math.min(100, Math.round(((rep - rank.minReputation) / (next.minReputation - rank.minReputation)) * 100))
        : 100;

      return {
        factionId,
        name: meta.name,
        icon: meta.icon,
        description: meta.description,
        reputation: rep,
        rank: rank.id,
        rankLabel: rank.label,
        rankIcon: rank.icon,
        nextRankLabel: next?.label ?? null,
        pointsToNext,
        progressPercent,
        isPledged: profile?.pledgedFactionId === factionId,
      };
    });

    return {
      pledgedFactionId: profile?.pledgedFactionId ?? null,
      factions,
    };
  },
});

export const pledgeFaction = mutation({
  args: {
    characterId: v.id("characters"),
    factionId: factionIdValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("factionProfiles")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (existing) {
      await ctx.db.patch("factionProfiles", existing._id, {
        pledgedFactionId: args.factionId,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("factionProfiles", {
        characterId: args.characterId,
        pledgedFactionId: args.factionId,
        updatedAt: Date.now(),
      });
    }

    await addFactionReputation(ctx, args.characterId, args.factionId, 25);
    return null;
  },
});

export const getFactionRanks = query({
  args: {},
  returns: v.array(v.object({
    id: v.string(),
    label: v.string(),
    minReputation: v.number(),
    icon: v.string(),
  })),
  handler: async () => FACTION_RANKS,
});
