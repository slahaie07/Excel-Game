import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const characterStats = v.object({
  vitality: v.number(),
  wisdom: v.number(),
  strength: v.number(),
  intelligence: v.number(),
  agility: v.number(),
  chance: v.number(),
});

const inventoryItem = v.object({
  itemId: v.string(),
  quantity: v.number(),
  slot: v.optional(v.number()),
});

const questProgress = v.object({
  questId: v.string(),
  status: v.union(v.literal("active"), v.literal("completed"), v.literal("failed")),
  objectives: v.array(v.object({
    type: v.string(),
    targetId: v.string(),
    current: v.number(),
    required: v.number(),
  })),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
});

const combatEntity = v.object({
  entityId: v.string(),
  name: v.string(),
  isPlayer: v.boolean(),
  classId: v.optional(v.string()),
  monsterId: v.optional(v.string()),
  hp: v.number(),
  maxHp: v.number(),
  ap: v.number(),
  maxAp: v.number(),
  mp: v.number(),
  maxMp: v.number(),
  x: v.number(),
  y: v.number(),
  team: v.union(v.literal("player"), v.literal("enemy")),
  buffs: v.array(v.object({
    stat: v.string(),
    value: v.number(),
    duration: v.number(),
  })),
  isAlive: v.boolean(),
});

export default defineSchema({
  accounts: defineTable({
    username: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
    stardust: v.number(),
    isPremium: v.boolean(),
  }).index("by_username", ["username"]),

  characters: defineTable({
    accountId: v.id("accounts"),
    name: v.string(),
    classId: v.string(),
    level: v.number(),
    xp: v.number(),
    xpToNext: v.number(),
    stats: characterStats,
    statPoints: v.number(),
    spellPoints: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    ap: v.number(),
    maxAp: v.number(),
    mp: v.number(),
    maxMp: v.number(),
    eclats: v.number(),
    zoneId: v.string(),
    x: v.number(),
    y: v.number(),
    spells: v.array(v.string()),
    equipment: v.object({
      weapon: v.optional(v.string()),
      armor: v.optional(v.string()),
      helmet: v.optional(v.string()),
      boots: v.optional(v.string()),
      amulet: v.optional(v.string()),
      ring: v.optional(v.string()),
    }),
    inventory: v.array(inventoryItem),
    activeQuests: v.array(questProgress),
    completedQuests: v.array(v.string()),
    professions: v.array(v.object({
      professionId: v.string(),
      level: v.number(),
      xp: v.number(),
    })),
    petId: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    pvpRating: v.number(),
    pvpWins: v.number(),
    pvpLosses: v.number(),
    playTime: v.number(),
    createdAt: v.number(),
    lastPlayedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_name", ["name"])
    .index("by_zone", ["zoneId"]),

  combats: defineTable({
    characterId: v.id("characters"),
    zoneId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("victory"),
      v.literal("defeat"),
      v.literal("fled")
    ),
    turn: v.number(),
    currentEntityId: v.string(),
    entities: v.array(combatEntity),
    gridWidth: v.number(),
    gridHeight: v.number(),
    obstacles: v.array(v.object({ x: v.number(), y: v.number() })),
    isPvP: v.boolean(),
    opponentCharacterId: v.optional(v.id("characters")),
    rewards: v.optional(v.object({
      xp: v.number(),
      eclats: v.number(),
      items: v.array(v.object({ itemId: v.string(), quantity: v.number() })),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_status", ["status"]),

  guilds: defineTable({
    name: v.string(),
    tag: v.string(),
    description: v.string(),
    leaderId: v.id("characters"),
    level: v.number(),
    xp: v.number(),
    treasury: v.number(),
    memberCount: v.number(),
    maxMembers: v.number(),
    emblem: v.string(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_tag", ["tag"]),

  guildMembers: defineTable({
    guildId: v.id("guilds"),
    characterId: v.id("characters"),
    role: v.union(v.literal("leader"), v.literal("officer"), v.literal("member")),
    joinedAt: v.number(),
    contribution: v.number(),
  })
    .index("by_guild", ["guildId"])
    .index("by_character", ["characterId"]),

  marketplace: defineTable({
    sellerId: v.id("characters"),
    itemId: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
    listedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_item", ["itemId"])
    .index("by_seller", ["sellerId"]),

  chatMessages: defineTable({
    channel: v.union(
      v.literal("global"),
      v.literal("zone"),
      v.literal("guild"),
      v.literal("private"),
      v.literal("trade")
    ),
    senderId: v.id("characters"),
    senderName: v.string(),
    content: v.string(),
    zoneId: v.optional(v.string()),
    guildId: v.optional(v.id("guilds")),
    recipientId: v.optional(v.id("characters")),
    createdAt: v.number(),
  })
    .index("by_channel", ["channel", "createdAt"])
    .index("by_zone", ["zoneId", "createdAt"])
    .index("by_guild", ["guildId", "createdAt"]),

  friends: defineTable({
    characterId: v.id("characters"),
    friendId: v.id("characters"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    createdAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_friend", ["friendId"]),

  dailyRewards: defineTable({
    characterId: v.id("characters"),
    lastClaimedAt: v.number(),
    streak: v.number(),
  }).index("by_character", ["characterId"]),

  achievements: defineTable({
    characterId: v.id("characters"),
    achievementId: v.string(),
    unlockedAt: v.number(),
  }).index("by_character", ["characterId"]),

  pvpQueue: defineTable({
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    level: v.number(),
    rating: v.number(),
    mode: v.union(v.literal("1v1"), v.literal("2v2"), v.literal("3v3")),
    queuedAt: v.number(),
  })
    .index("by_mode", ["mode", "queuedAt"])
    .index("by_character", ["characterId"]),

  pvpMatches: defineTable({
    mode: v.union(v.literal("1v1"), v.literal("2v2"), v.literal("3v3")),
    teamA: v.array(v.object({
      characterId: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      rating: v.number(),
    })),
    teamB: v.array(v.object({
      characterId: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      rating: v.number(),
    })),
    combatId: v.optional(v.id("combats")),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
    winnerTeam: v.optional(v.union(v.literal("A"), v.literal("B"))),
    ratingChange: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  dungeonRuns: defineTable({
    dungeonId: v.string(),
    leaderId: v.id("characters"),
    members: v.array(v.object({
      characterId: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      level: v.number(),
    })),
    currentRoom: v.number(),
    totalRooms: v.number(),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_leader", ["leaderId"])
    .index("by_status", ["status"]),

  havens: defineTable({
    characterId: v.id("characters"),
    level: v.number(),
    furniture: v.array(v.object({
      itemId: v.string(),
      x: v.number(),
      y: v.number(),
    })),
    visitors: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  presence: defineTable({
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    level: v.number(),
    zoneId: v.string(),
    lastSeenAt: v.number(),
  })
    .index("by_zone", ["zoneId", "lastSeenAt"])
    .index("by_character", ["characterId"]),
});
