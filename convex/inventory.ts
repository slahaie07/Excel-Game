import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addItem = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const inventory = [...character.inventory];
    const existing = inventory.find((i) => i.itemId === args.itemId);

    if (existing) {
      existing.quantity += args.quantity;
    } else {
      inventory.push({ itemId: args.itemId, quantity: args.quantity });
    }

    await ctx.db.patch("characters", args.characterId, { inventory });
    return null;
  },
});

export const removeItem = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const inventory = character.inventory.map((item) => {
      if (item.itemId === args.itemId) {
        const newQty = item.quantity - args.quantity;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    await ctx.db.patch("characters", args.characterId, { inventory });
    return null;
  },
});

export const equipItem = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
    slot: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const hasItem = character.inventory.some(
      (i) => i.itemId === args.itemId && i.quantity > 0
    );
    if (!hasItem) throw new Error("Objet non possédé");

    const equipment = { ...character.equipment };
    const slot = args.slot as keyof typeof equipment;
    equipment[slot] = args.itemId;

    await ctx.db.patch("characters", args.characterId, { equipment });
    return null;
  },
});

export const useConsumable = mutation({
  args: {
    characterId: v.id("characters"),
    itemId: v.string(),
  },
  returns: v.object({ healed: v.number() }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    const item = character.inventory.find((i) => i.itemId === args.itemId);
    if (!item || item.quantity < 1) throw new Error("Objet non possédé");

    let healed = 0;
    if (args.itemId === "potion_vie") healed = 50;
    else if (args.itemId === "pain_eveil") healed = 20;

    const newHp = Math.min(character.maxHp, character.hp + healed);
    const inventory = character.inventory.map((i) =>
      i.itemId === args.itemId ? { ...i, quantity: i.quantity - 1 } : i
    ).filter((i) => i.quantity > 0);

    await ctx.db.patch("characters", args.characterId, {
      hp: newHp,
      inventory,
    });

    return { healed: newHp - character.hp };
  },
});

export const getInventory = query({
  args: { characterId: v.id("characters") },
  returns: v.object({
    inventory: v.array(v.object({
      itemId: v.string(),
      quantity: v.number(),
    })),
    equipment: v.any(),
    eclats: v.number(),
  }),
  handler: async (ctx, args) => {
    const character = await ctx.db.get("characters", args.characterId);
    if (!character) throw new Error("Personnage introuvable");

    return {
      inventory: character.inventory,
      equipment: character.equipment,
      eclats: character.eclats,
    };
  },
});
