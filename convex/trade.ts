import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const emptyOffer = { eclats: 0, items: [] as { itemId: string; quantity: number }[] };

function mergeInventory(
  inventory: { itemId: string; quantity: number; slot?: number }[],
  items: { itemId: string; quantity: number }[]
) {
  const result = [...inventory];
  for (const item of items) {
    const existing = result.find((i) => i.itemId === item.itemId);
    if (existing) existing.quantity += item.quantity;
    else result.push({ itemId: item.itemId, quantity: item.quantity });
  }
  return result;
}

function removeFromInventory(
  inventory: { itemId: string; quantity: number; slot?: number }[],
  items: { itemId: string; quantity: number }[]
) {
  let result = [...inventory];
  for (const item of items) {
    const existing = result.find((i) => i.itemId === item.itemId);
    if (!existing || existing.quantity < item.quantity) {
      throw new Error(`Quantité insuffisante pour ${item.itemId}`);
    }
    existing.quantity -= item.quantity;
  }
  return result.filter((i) => i.quantity > 0);
}

async function getActiveSessionForCharacter(ctx: MutationCtx, characterId: Id<"characters">) {
  const asInitiator = await ctx.db
    .query("tradeSessions")
    .withIndex("by_initiator", (q) => q.eq("initiatorId", characterId).eq("status", "pending"))
    .first();
  if (asInitiator) return asInitiator;

  return await ctx.db
    .query("tradeSessions")
    .withIndex("by_partner", (q) => q.eq("partnerId", characterId).eq("status", "pending"))
    .first();
}

export const startTrade = mutation({
  args: {
    initiatorId: v.id("characters"),
    partnerId: v.id("characters"),
  },
  returns: v.id("tradeSessions"),
  handler: async (ctx, args) => {
    if (args.initiatorId === args.partnerId) throw new Error("Impossible d'échanger avec soi-même");

    const initiator = await ctx.db.get("characters", args.initiatorId);
    const partner = await ctx.db.get("characters", args.partnerId);
    if (!initiator || !partner) throw new Error("Personnage introuvable");

    const existing = await getActiveSessionForCharacter(ctx, args.initiatorId);
    if (existing) throw new Error("Vous avez déjà un échange en cours");

    const partnerSession = await getActiveSessionForCharacter(ctx, args.partnerId);
    if (partnerSession) throw new Error("Ce joueur a déjà un échange en cours");

    const now = Date.now();
    return await ctx.db.insert("tradeSessions", {
      initiatorId: args.initiatorId,
      initiatorName: initiator.name,
      partnerId: args.partnerId,
      partnerName: partner.name,
      initiatorOffer: emptyOffer,
      partnerOffer: emptyOffer,
      initiatorConfirmed: false,
      partnerConfirmed: false,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTradeOffer = mutation({
  args: {
    sessionId: v.id("tradeSessions"),
    characterId: v.id("characters"),
    eclats: v.number(),
    items: v.array(v.object({ itemId: v.string(), quantity: v.number() })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get("tradeSessions", args.sessionId);
    if (!session || session.status !== "pending") throw new Error("Échange introuvable");

    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    if (args.eclats < 0) throw new Error("Montant invalide");
    if (args.eclats > character.eclats) throw new Error("Éclats insuffisants");

    for (const item of args.items) {
      const inv = character.inventory.find((i) => i.itemId === item.itemId);
      if (!inv || inv.quantity < item.quantity) {
        throw new Error(`Quantité insuffisante pour ${item.itemId}`);
      }
    }

    const offer = { eclats: args.eclats, items: args.items };
    const isInitiator = args.characterId === session.initiatorId;
    const isPartner = args.characterId === session.partnerId;
    if (!isInitiator && !isPartner) throw new Error("Non autorisé");

    await ctx.db.patch("tradeSessions", args.sessionId, {
      initiatorOffer: isInitiator ? offer : session.initiatorOffer,
      partnerOffer: isPartner ? offer : session.partnerOffer,
      initiatorConfirmed: isInitiator ? false : session.initiatorConfirmed,
      partnerConfirmed: isPartner ? false : session.partnerConfirmed,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const confirmTrade = mutation({
  args: {
    sessionId: v.id("tradeSessions"),
    characterId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get("tradeSessions", args.sessionId);
    if (!session || session.status !== "pending") throw new Error("Échange introuvable");

    const isInitiator = args.characterId === session.initiatorId;
    const isPartner = args.characterId === session.partnerId;
    if (!isInitiator && !isPartner) throw new Error("Non autorisé");

    const initiatorConfirmed = isInitiator ? true : session.initiatorConfirmed;
    const partnerConfirmed = isPartner ? true : session.partnerConfirmed;

    if (!initiatorConfirmed || !partnerConfirmed) {
      await ctx.db.patch("tradeSessions", args.sessionId, {
        initiatorConfirmed,
        partnerConfirmed,
        updatedAt: Date.now(),
      });
      return null;
    }

    const initiator = await ctx.db.get("characters", session.initiatorId);
    const partner = await ctx.db.get("characters", session.partnerId);
    if (!initiator || !partner) throw new Error("Personnage introuvable");

    const initiatorInv = removeFromInventory(initiator.inventory, session.initiatorOffer.items);
    const partnerInv = removeFromInventory(partner.inventory, session.partnerOffer.items);

    const newInitiatorInv = mergeInventory(initiatorInv, session.partnerOffer.items);
    const newPartnerInv = mergeInventory(partnerInv, session.initiatorOffer.items);

    if (initiator.eclats < session.initiatorOffer.eclats) throw new Error("Éclats insuffisants (initiateur)");
    if (partner.eclats < session.partnerOffer.eclats) throw new Error("Éclats insuffisants (partenaire)");

    await ctx.db.patch("characters", session.initiatorId, {
      eclats: initiator.eclats - session.initiatorOffer.eclats + session.partnerOffer.eclats,
      inventory: newInitiatorInv,
    });
    await ctx.db.patch("characters", session.partnerId, {
      eclats: partner.eclats - session.partnerOffer.eclats + session.initiatorOffer.eclats,
      inventory: newPartnerInv,
    });

    await ctx.db.patch("tradeSessions", args.sessionId, {
      initiatorConfirmed: true,
      partnerConfirmed: true,
      status: "completed",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const cancelTrade = mutation({
  args: {
    sessionId: v.id("tradeSessions"),
    characterId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get("tradeSessions", args.sessionId);
    if (!session || session.status !== "pending") throw new Error("Échange introuvable");

    if (args.characterId !== session.initiatorId && args.characterId !== session.partnerId) {
      throw new Error("Non autorisé");
    }

    await ctx.db.patch("tradeSessions", args.sessionId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getActiveTrade = query({
  args: { characterId: v.id("characters") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const asInitiator = await ctx.db
      .query("tradeSessions")
      .withIndex("by_initiator", (q) => q.eq("initiatorId", args.characterId).eq("status", "pending"))
      .first();
    if (asInitiator) return asInitiator;

    return await ctx.db
      .query("tradeSessions")
      .withIndex("by_partner", (q) => q.eq("partnerId", args.characterId).eq("status", "pending"))
      .first();
  },
});
