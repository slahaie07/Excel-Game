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
import {
  FACTION_QUESTS,
  FACTION_SHOP_ITEMS,
  getQuestById,
  getShopItemById,
  getWeekKey,
  meetsRankRequirement,
} from "./lib/factionContent";
import { ensureFactionQuests, recordFactionQuestProgress } from "./lib/factionQuests";

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

export { recordFactionQuestProgress };

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

async function addItemToInventory(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  itemId: string,
  quantity: number
) {
  const character = await ctx.db.get("characters", characterId);
  if (!character) throw new Error("Personnage introuvable");

  const inventory = [...character.inventory];
  const existing = inventory.find((i) => i.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.push({ itemId, quantity });
  }
  await ctx.db.patch("characters", characterId, { inventory });
}

const factionSummaryValidator = v.object({
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
});

const questValidator = v.object({
  _id: v.union(v.id("factionQuestProgress"), v.null()),
  questId: v.string(),
  factionId: factionIdValidator,
  label: v.string(),
  description: v.string(),
  target: v.number(),
  progress: v.number(),
  completed: v.boolean(),
  claimed: v.boolean(),
  rewardReputation: v.number(),
  rewardEclats: v.number(),
});

const shopItemValidator = v.object({
  id: v.string(),
  factionId: factionIdValidator,
  itemId: v.string(),
  quantity: v.number(),
  label: v.string(),
  requiredRankId: v.string(),
  requiredRankLabel: v.string(),
  costEclats: v.number(),
  weeklyLimit: v.number(),
  purchasedThisWeek: v.number(),
  canPurchase: v.boolean(),
  locked: v.boolean(),
});

export const getMyFactions = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    pledgedFactionId: v.union(factionIdValidator, v.null()),
    factions: v.array(factionSummaryValidator),
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

export const getFactionHub = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    weekKey: v.string(),
    pledgedFactionId: v.union(factionIdValidator, v.null()),
    eclats: v.number(),
    factions: v.array(factionSummaryValidator),
    quests: v.array(questValidator),
    shopItems: v.array(shopItemValidator),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const weekKey = getWeekKey();
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

    const questRows = await ctx.db
      .query("factionQuestProgress")
      .withIndex("by_character_and_week", (q) =>
        q.eq("characterId", args.characterId).eq("weekKey", weekKey)
      )
      .collect();

    const quests = FACTION_QUESTS.map((template) => {
      const row = questRows.find((q) => q.questId === template.id);
      return {
        _id: row?._id ?? null,
        questId: template.id,
        factionId: template.factionId,
        label: template.label,
        description: template.description,
        target: template.target,
        progress: row?.progress ?? 0,
        completed: row?.completed ?? false,
        claimed: row?.claimed ?? false,
        rewardReputation: template.rewardReputation,
        rewardEclats: template.rewardEclats,
      };
    });

    const purchases = await ctx.db
      .query("factionShopPurchases")
      .withIndex("by_character_week_item", (q) =>
        q.eq("characterId", args.characterId).eq("weekKey", weekKey)
      )
      .collect();
    const purchaseMap = new Map(purchases.map((p) => [p.shopItemId, p.purchaseCount]));

    const shopItems = FACTION_SHOP_ITEMS.map((item) => {
      const faction = factions.find((f) => f.factionId === item.factionId);
      const rank = FACTION_RANKS.find((r) => r.id === item.requiredRankId);
      const purchased = purchaseMap.get(item.id) ?? 0;
      const locked = !faction || !meetsRankRequirement(faction.rank, item.requiredRankId);
      const canPurchase =
        !locked &&
        purchased < item.weeklyLimit &&
        character.eclats >= item.costEclats;

      return {
        id: item.id,
        factionId: item.factionId,
        itemId: item.itemId,
        quantity: item.quantity,
        label: item.label,
        requiredRankId: item.requiredRankId,
        requiredRankLabel: rank?.label ?? item.requiredRankId,
        costEclats: item.costEclats,
        weeklyLimit: item.weeklyLimit,
        purchasedThisWeek: purchased,
        canPurchase,
        locked,
      };
    });

    return {
      weekKey,
      pledgedFactionId: profile?.pledgedFactionId ?? null,
      eclats: character.eclats,
      factions,
      quests,
      shopItems,
    };
  },
});

export const initFactionHub = mutation({
  args: { characterId: v.id("characters") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureFactionQuests(ctx, args.characterId);
    return null;
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
    await ensureFactionQuests(ctx, args.characterId);
    return null;
  },
});

export const claimFactionQuest = mutation({
  args: {
    characterId: v.id("characters"),
    questProgressId: v.id("factionQuestProgress"),
  },
  returns: v.object({
    reputation: v.number(),
    eclats: v.number(),
    bonusReputation: v.number(),
  }),
  handler: async (ctx, args) => {
    const quest = await ctx.db.get("factionQuestProgress", args.questProgressId);
    if (!quest) throw new Error("Quête introuvable");
    if (quest.characterId !== args.characterId) throw new Error("Non autorisé");
    if (!quest.completed) throw new Error("Quête non terminée");
    if (quest.claimed) throw new Error("Déjà réclamée");

    const template = getQuestById(quest.questId);
    if (!template) throw new Error("Modèle de quête introuvable");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const profile = await ctx.db
      .query("factionProfiles")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    let bonusReputation = 0;
    if (profile?.pledgedFactionId === template.factionId) {
      bonusReputation = Math.round(template.rewardReputation * 0.5);
    }

    const totalRep = template.rewardReputation + bonusReputation;

    await ctx.db.patch("factionQuestProgress", args.questProgressId, {
      claimed: true,
      updatedAt: Date.now(),
    });

    await addFactionReputation(ctx, args.characterId, template.factionId, totalRep);
    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats + template.rewardEclats,
    });

    return {
      reputation: totalRep,
      eclats: template.rewardEclats,
      bonusReputation,
    };
  },
});

export const purchaseFactionItem = mutation({
  args: {
    characterId: v.id("characters"),
    shopItemId: v.string(),
  },
  returns: v.object({
    itemId: v.string(),
    quantity: v.number(),
    costEclats: v.number(),
  }),
  handler: async (ctx, args) => {
    const shopItem = getShopItemById(args.shopItemId);
    if (!shopItem) throw new Error("Article introuvable");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const rep = await ctx.db
      .query("factionReputations")
      .withIndex("by_character_and_faction", (q) =>
        q.eq("characterId", args.characterId).eq("factionId", shopItem.factionId)
      )
      .unique();
    const rank = getFactionRank(rep?.reputation ?? 0);

    if (!meetsRankRequirement(rank.id, shopItem.requiredRankId)) {
      throw new Error("Rang de réputation insuffisant");
    }

    if (character.eclats < shopItem.costEclats) {
      throw new Error("Éclats insuffisants");
    }

    const weekKey = getWeekKey();
    const existing = await ctx.db
      .query("factionShopPurchases")
      .withIndex("by_character_week_item", (q) =>
        q.eq("characterId", args.characterId).eq("weekKey", weekKey).eq("shopItemId", args.shopItemId)
      )
      .unique();

    const purchased = existing?.purchaseCount ?? 0;
    if (purchased >= shopItem.weeklyLimit) {
      throw new Error("Limite hebdomadaire atteinte");
    }

    await ctx.db.patch("characters", args.characterId, {
      eclats: character.eclats - shopItem.costEclats,
    });

    await addItemToInventory(ctx, args.characterId, shopItem.itemId, shopItem.quantity);

    if (existing) {
      await ctx.db.patch("factionShopPurchases", existing._id, {
        purchaseCount: purchased + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("factionShopPurchases", {
        characterId: args.characterId,
        weekKey,
        shopItemId: args.shopItemId,
        purchaseCount: 1,
        updatedAt: Date.now(),
      });
    }

    return {
      itemId: shopItem.itemId,
      quantity: shopItem.quantity,
      costEclats: shopItem.costEclats,
    };
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
