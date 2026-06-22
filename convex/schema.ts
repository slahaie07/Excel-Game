import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  characters: defineTable({
    userId: v.id("users"),
    name: v.string(),
    classId: v.string(),
    level: v.number(),
    xp: v.number(),
    kamas: v.number(),
    stats: v.object({
      hp: v.number(),
      maxHp: v.number(),
      pa: v.number(),
      maxPa: v.number(),
      pm: v.number(),
      maxPm: v.number(),
      force: v.number(),
      intelligence: v.number(),
      agilite: v.number(),
      chance: v.number(),
      sagesse: v.number(),
      initiative: v.number(),
      dommages: v.number(),
      resistance: v.number(),
    }),
    zone: v.string(),
    positionX: v.number(),
    positionY: v.number(),
    inventory: v.array(
      v.object({
        itemId: v.string(),
        quantity: v.number(),
        slot: v.number(),
      }),
    ),
    equipment: v.object({
      weapon: v.optional(v.string()),
      helmet: v.optional(v.string()),
      armor: v.optional(v.string()),
      boots: v.optional(v.string()),
      amulet: v.optional(v.string()),
      ring: v.optional(v.string()),
      shield: v.optional(v.string()),
    }),
    spells: v.array(v.string()),
    questProgress: v.any(),
    professions: v.any(),
    petId: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    achievements: v.array(v.string()),
    lastPlayedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"]),

  guilds: defineTable({
    name: v.string(),
    leaderId: v.id("characters"),
    description: v.optional(v.string()),
    emblem: v.optional(v.string()),
    level: v.number(),
    xp: v.number(),
    kamas: v.number(),
    memberCount: v.number(),
    maxMembers: v.number(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  guildMembers: defineTable({
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    role: v.union(
      v.literal("leader"),
      v.literal("officer"),
      v.literal("member"),
      v.literal("recruit"),
    ),
    joinedAt: v.number(),
  })
    .index("by_guild", ["guildId"])
    .index("by_character", ["characterId"])
    .index("by_guild_and_character", ["guildId", "characterId"]),

  chatMessages: defineTable({
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("trade"),
      v.literal("private"),
    ),
    senderId: v.optional(v.id("characters")),
    senderName: v.string(),
    message: v.string(),
    zone: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    recipientId: v.optional(v.id("characters")),
    timestamp: v.number(),
  })
    .index("by_channel", ["channel", "timestamp"])
    .index("by_guild", ["guildId", "timestamp"]),

  trades: defineTable({
    sellerId: v.id("characters"),
    itemId: v.string(),
    quantity: v.number(),
    price: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("sold"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_seller", ["sellerId"]),

  pets: defineTable({
    ownerId: v.id("characters"),
    name: v.string(),
    type: v.string(),
    level: v.number(),
    xp: v.number(),
    stats: v.object({
      force: v.number(),
      hp: v.number(),
    }),
    icon: v.string(),
  }).index("by_owner", ["ownerId"]),

  dungeonRuns: defineTable({
    dungeonId: v.string(),
    partyIds: v.array(v.id("characters")),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    floor: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  pvpMatches: defineTable({
    player1Id: v.id("characters"),
    player2Id: v.id("characters"),
    winnerId: v.optional(v.id("characters")),
    status: v.union(
      v.literal("waiting"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    rating: v.optional(v.number()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_player1", ["player1Id"])
    .index("by_player2", ["player2Id"]),

  pvpRankings: defineTable({
    playerKey: v.string(),
    playerName: v.string(),
    classId: v.string(),
    rating: v.number(),
    wins: v.number(),
    losses: v.number(),
    updatedAt: v.number(),
  })
    .index("by_rating", ["rating"])
    .index("by_player_key", ["playerKey"]),
});
