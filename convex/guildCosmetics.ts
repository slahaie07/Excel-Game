import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const GUILD_EMBLEM_DEFS: Record<string, { name: string; icon: string; cost: number }> = {
  emblem_dragon: { name: "Dragon d'Aether", icon: "🐉", cost: 1000 },
  emblem_crown: { name: "Couronne Stellaire", icon: "👑", cost: 1500 },
  emblem_flame: { name: "Flamme Éternelle", icon: "🔥", cost: 1200 },
  emblem_war_champion: { name: "Champion de Guerre", icon: "⚔️", cost: 0 },
};

const GUILD_BANNER_DEFS: Record<string, { name: string; icon: string; cost: number }> = {
  banner_purple: { name: "Bannière Violette", icon: "🟣", cost: 800 },
  banner_gold: { name: "Bannière Dorée", icon: "🟡", cost: 1200 },
  banner_war_champion: { name: "Bannière Victorieuse", icon: "🏅", cost: 0 },
};

type GuildCosmetics = {
  unlockedEmblems: string[];
  unlockedBanners: string[];
  equippedEmblem?: string;
  equippedBanner?: string;
};

function emptyGuildCosmetics(): GuildCosmetics {
  return { unlockedEmblems: [], unlockedBanners: [] };
}

function resolveGuildCosmetics(guild: { cosmetics?: GuildCosmetics }): GuildCosmetics {
  return guild.cosmetics ?? emptyGuildCosmetics();
}

async function grantGuildCosmeticsInternal(
  ctx: MutationCtx,
  guildId: Id<"guilds">,
  cosmeticIds: string[]
) {
  const guild = await ctx.db.get("guilds", guildId);
  if (!guild) return;

  const current = resolveGuildCosmetics(guild);
  const emblems = new Set(current.unlockedEmblems);
  const banners = new Set(current.unlockedBanners);

  for (const id of cosmeticIds) {
    if (id.startsWith("emblem_")) emblems.add(id);
    if (id.startsWith("banner_")) banners.add(id);
  }

  await ctx.db.patch("guilds", guildId, {
    cosmetics: {
      unlockedEmblems: [...emblems],
      unlockedBanners: [...banners],
      equippedEmblem: current.equippedEmblem,
      equippedBanner: current.equippedBanner,
    },
  });
}

export const getGuildCosmetics = query({
  args: { guildId: v.id("guilds") },
  returns: v.object({
    unlockedEmblems: v.array(v.string()),
    unlockedBanners: v.array(v.string()),
    equippedEmblem: v.union(v.string(), v.null()),
    equippedBanner: v.union(v.string(), v.null()),
    displayEmblem: v.string(),
    treasury: v.number(),
  }),
  handler: async (ctx, args) => {
    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) {
      return {
        unlockedEmblems: [],
        unlockedBanners: [],
        equippedEmblem: null,
        equippedBanner: null,
        displayEmblem: "🏰",
        treasury: 0,
      };
    }

    const cosmetics = resolveGuildCosmetics(guild);
    const equipped = cosmetics.equippedEmblem
      ? GUILD_EMBLEM_DEFS[cosmetics.equippedEmblem]?.icon
      : undefined;

    return {
      unlockedEmblems: cosmetics.unlockedEmblems,
      unlockedBanners: cosmetics.unlockedBanners,
      equippedEmblem: cosmetics.equippedEmblem ?? null,
      equippedBanner: cosmetics.equippedBanner ?? null,
      displayEmblem: equipped ?? guild.emblem,
      treasury: guild.treasury,
    };
  },
});

export const purchaseGuildCosmetic = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    cosmeticId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) throw new Error("Guilde introuvable");

    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildId) {
      throw new Error("Pas membre de cette guilde");
    }
    if (member.role !== "leader" && member.role !== "officer") {
      throw new Error("Chef ou officier requis");
    }

    const def = GUILD_EMBLEM_DEFS[args.cosmeticId] ?? GUILD_BANNER_DEFS[args.cosmeticId];
    if (!def) throw new Error("Cosmétique introuvable");
    if (def.cost > 0 && guild.treasury < def.cost) {
      throw new Error("Trésor insuffisant");
    }

    const current = resolveGuildCosmetics(guild);
    const isEmblem = args.cosmeticId.startsWith("emblem_");
    const owned = isEmblem
      ? current.unlockedEmblems.includes(args.cosmeticId)
      : current.unlockedBanners.includes(args.cosmeticId);
    if (owned) throw new Error("Déjà possédé");

    if (def.cost > 0) {
      await ctx.db.patch("guilds", args.guildId, {
        treasury: guild.treasury - def.cost,
      });
    }

    await grantGuildCosmeticsInternal(ctx, args.guildId, [args.cosmeticId]);
    return null;
  },
});

export const equipGuildCosmetic = mutation({
  args: {
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    cosmeticId: v.union(v.string(), v.null()),
    slot: v.union(v.literal("emblem"), v.literal("banner")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const guild = await ctx.db.get("guilds", args.guildId);
    if (!guild) throw new Error("Guilde introuvable");

    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member || member.guildId !== args.guildId) {
      throw new Error("Pas membre de cette guilde");
    }
    if (member.role !== "leader" && member.role !== "officer") {
      throw new Error("Chef ou officier requis");
    }

    const current = resolveGuildCosmetics(guild);

    if (args.cosmeticId === null) {
      await ctx.db.patch("guilds", args.guildId, {
        cosmetics: {
          ...current,
          equippedEmblem: args.slot === "emblem" ? undefined : current.equippedEmblem,
          equippedBanner: args.slot === "banner" ? undefined : current.equippedBanner,
        },
      });
      return null;
    }

    if (args.slot === "emblem") {
      if (!current.unlockedEmblems.includes(args.cosmeticId)) {
        throw new Error("Emblème non possédé");
      }
      const icon = GUILD_EMBLEM_DEFS[args.cosmeticId]?.icon ?? guild.emblem;
      await ctx.db.patch("guilds", args.guildId, {
        emblem: icon,
        cosmetics: { ...current, equippedEmblem: args.cosmeticId },
      });
    } else {
      if (!current.unlockedBanners.includes(args.cosmeticId)) {
        throw new Error("Bannière non possédée");
      }
      await ctx.db.patch("guilds", args.guildId, {
        cosmetics: { ...current, equippedBanner: args.cosmeticId },
      });
    }
    return null;
  },
});

export const getMyGuildMembership = query({
  args: { characterId: v.id("characters") },
  returns: v.union(
    v.object({
      guildId: v.id("guilds"),
      role: v.union(v.literal("leader"), v.literal("officer"), v.literal("member")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("guildMembers")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();
    if (!member) return null;
    return { guildId: member.guildId, role: member.role };
  },
});

export const listGuildCosmeticCatalog = query({
  args: {},
  returns: v.object({
    emblems: v.array(v.object({ id: v.string(), name: v.string(), icon: v.string(), cost: v.number() })),
    banners: v.array(v.object({ id: v.string(), name: v.string(), icon: v.string(), cost: v.number() })),
  }),
  handler: async () => ({
    emblems: Object.entries(GUILD_EMBLEM_DEFS).map(([id, d]) => ({ id, ...d })),
    banners: Object.entries(GUILD_BANNER_DEFS).map(([id, d]) => ({ id, ...d })),
  }),
});
