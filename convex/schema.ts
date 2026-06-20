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
  ownerCharacterId: v.optional(v.id("characters")),
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
    cosmetics: v.optional(v.object({
      titles: v.array(v.string()),
      frames: v.array(v.string()),
      equippedTitle: v.optional(v.string()),
      equippedFrame: v.optional(v.string()),
    })),
    pushNotificationsEnabled: v.optional(v.boolean()),
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
    dungeonRunId: v.optional(v.id("dungeonRuns")),
    raidRunId: v.optional(v.id("raidRuns")),
    participantCharacterIds: v.optional(v.array(v.id("characters"))),
    combatType: v.optional(v.union(
      v.literal("world"),
      v.literal("dungeon"),
      v.literal("pvp"),
      v.literal("event")
    )),
    rewards: v.optional(v.object({
      xp: v.number(),
      eclats: v.number(),
      items: v.array(v.object({ itemId: v.string(), quantity: v.number() })),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_status", ["status"])
    .index("by_dungeon_run", ["dungeonRunId"])
    .index("by_raid_run", ["raidRunId"]),

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
    cosmetics: v.optional(v.object({
      unlockedEmblems: v.array(v.string()),
      unlockedBanners: v.array(v.string()),
      equippedEmblem: v.optional(v.string()),
      equippedBanner: v.optional(v.string()),
    })),
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

  raidRuns: defineTable({
    raidId: v.string(),
    leaderId: v.id("characters"),
    members: v.array(v.object({
      characterId: v.id("characters"),
      name: v.string(),
      classId: v.string(),
      level: v.number(),
    })),
    currentPhase: v.number(),
    totalPhases: v.number(),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_leader", ["leaderId"])
    .index("by_status", ["status"])
    .index("by_raid", ["raidId", "status"]),

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

  guildWars: defineTable({
    guildAId: v.id("guilds"),
    guildBId: v.id("guilds"),
    guildAName: v.string(),
    guildBName: v.string(),
    guildAScore: v.number(),
    guildBScore: v.number(),
    status: v.union(v.literal("active"), v.literal("completed")),
    winnerGuildId: v.optional(v.id("guilds")),
    seasonId: v.optional(v.id("guildWarSeasons")),
    startedAt: v.number(),
    endsAt: v.number(),
  }).index("by_status", ["status"]),

  guildWarSeasons: defineTable({
    name: v.string(),
    seasonNumber: v.number(),
    status: v.union(v.literal("active"), v.literal("ended")),
    startsAt: v.number(),
    endsAt: v.number(),
  }).index("by_status", ["status"]),

  guildWarSeasonScores: defineTable({
    seasonId: v.id("guildWarSeasons"),
    guildId: v.id("guilds"),
    guildName: v.string(),
    warWins: v.number(),
    warPoints: v.number(),
    updatedAt: v.number(),
  })
    .index("by_season", ["seasonId"])
    .index("by_season_and_guild", ["seasonId", "guildId"]),

  tradeSessions: defineTable({
    initiatorId: v.id("characters"),
    initiatorName: v.string(),
    partnerId: v.id("characters"),
    partnerName: v.string(),
    initiatorOffer: v.object({
      eclats: v.number(),
      items: v.array(v.object({ itemId: v.string(), quantity: v.number() })),
    }),
    partnerOffer: v.object({
      eclats: v.number(),
      items: v.array(v.object({ itemId: v.string(), quantity: v.number() })),
    }),
    initiatorConfirmed: v.boolean(),
    partnerConfirmed: v.boolean(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_initiator", ["initiatorId", "status"])
    .index("by_partner", ["partnerId", "status"]),

  worldBoss: defineTable({
    bossId: v.string(),
    name: v.string(),
    maxHp: v.number(),
    currentHp: v.number(),
    zoneId: v.string(),
    status: v.union(v.literal("active"), v.literal("defeated")),
    respawnAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_boss", ["bossId"]),

  worldBossHits: defineTable({
    bossId: v.string(),
    characterId: v.id("characters"),
    characterName: v.string(),
    damage: v.number(),
    createdAt: v.number(),
  }).index("by_boss", ["bossId", "createdAt"]),

  pvpSeasons: defineTable({
    name: v.string(),
    seasonNumber: v.number(),
    status: v.union(v.literal("active"), v.literal("ended")),
    startsAt: v.number(),
    endsAt: v.number(),
    themeId: v.optional(v.string()),
    themeName: v.optional(v.string()),
    themeIcon: v.optional(v.string()),
    themeDescription: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    ratingBonusPercent: v.optional(v.number()),
  }).index("by_status", ["status"]),

  seasonRatings: defineTable({
    seasonId: v.id("pvpSeasons"),
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    rating: v.number(),
    wins: v.number(),
    losses: v.number(),
    updatedAt: v.number(),
  })
    .index("by_season_and_character", ["seasonId", "characterId"])
    .index("by_season", ["seasonId"]),

  guildHalls: defineTable({
    guildId: v.id("guilds"),
    level: v.number(),
    furniture: v.array(v.object({
      itemId: v.string(),
      x: v.number(),
      y: v.number(),
      placedBy: v.id("characters"),
      placedByName: v.string(),
    })),
    visitors: v.number(),
    updatedAt: v.number(),
  }).index("by_guild", ["guildId"]),

  seasonRewardClaims: defineTable({
    seasonId: v.id("pvpSeasons"),
    seasonName: v.string(),
    characterId: v.id("characters"),
    rank: v.number(),
    rating: v.number(),
    eclatsReward: v.number(),
    cosmeticIds: v.array(v.string()),
    rewardLabel: v.string(),
    claimedAt: v.optional(v.number()),
  })
    .index("by_character", ["characterId"])
    .index("by_season_and_character", ["seasonId", "characterId"]),

  guildHallVisits: defineTable({
    guildId: v.id("guilds"),
    visitorId: v.id("characters"),
    visitorName: v.string(),
    message: v.string(),
    visitedAt: v.number(),
  }).index("by_guild", ["guildId", "visitedAt"]),

  liveEvents: defineTable({
    eventId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("boss_rush"), v.literal("kill_race"), v.literal("harvest")),
    status: v.union(v.literal("scheduled"), v.literal("active"), v.literal("ended")),
    startsAt: v.number(),
    endsAt: v.number(),
    globalTarget: v.number(),
    globalProgress: v.number(),
    rewardEclats: v.number(),
    rewardXp: v.number(),
  }).index("by_status", ["status"]),

  liveEventContributions: defineTable({
    liveEventId: v.id("liveEvents"),
    characterId: v.id("characters"),
    characterName: v.string(),
    contribution: v.number(),
    rewardClaimed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_event_and_character", ["liveEventId", "characterId"])
    .index("by_event", ["liveEventId"]),

  notifications: defineTable({
    characterId: v.id("characters"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    screen: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_character", ["characterId", "createdAt"]),

  pushTokens: defineTable({
    characterId: v.id("characters"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_token", ["token"]),

  pvpTournaments: defineTable({
    name: v.string(),
    weekNumber: v.number(),
    status: v.union(v.literal("active"), v.literal("ended")),
    startsAt: v.number(),
    endsAt: v.number(),
  }).index("by_status", ["status"]),

  pvpTournamentEntries: defineTable({
    tournamentId: v.id("pvpTournaments"),
    characterId: v.id("characters"),
    characterName: v.string(),
    classId: v.string(),
    wins: v.number(),
    losses: v.number(),
    points: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_tournament_and_character", ["tournamentId", "characterId"]),

  pvpTournamentRewards: defineTable({
    tournamentId: v.id("pvpTournaments"),
    characterId: v.id("characters"),
    rank: v.number(),
    eclatsReward: v.number(),
    claimedAt: v.optional(v.number()),
  })
    .index("by_character", ["characterId"])
    .index("by_tournament_and_character", ["tournamentId", "characterId"]),

  hallOfFameEntries: defineTable({
    category: v.union(
      v.literal("pvp_legend"),
      v.literal("season_champion"),
      v.literal("tournament_champion"),
      v.literal("raid_hero"),
      v.literal("live_legend"),
      v.literal("guild_war_champion")
    ),
    characterId: v.optional(v.id("characters")),
    guildId: v.optional(v.id("guilds")),
    displayName: v.string(),
    subtitle: v.string(),
    value: v.number(),
    icon: v.string(),
    achievedAt: v.number(),
    periodLabel: v.string(),
  }).index("by_category", ["category", "achievedAt"]),

  pvpLeagueEntries: defineTable({
    characterId: v.id("characters"),
    tier: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("platinum"),
      v.literal("diamond")
    ),
    leaguePoints: v.number(),
    wins: v.number(),
    losses: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_tier", ["tier", "leaguePoints"]),

  mentorships: defineTable({
    mentorId: v.id("characters"),
    menteeId: v.id("characters"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
    mentorPoints: v.number(),
    menteeProgress: v.number(),
    startedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_mentee", ["menteeId"]),

  worldInvasions: defineTable({
    invasionId: v.string(),
    name: v.string(),
    description: v.string(),
    zoneId: v.string(),
    status: v.union(v.literal("active"), v.literal("ended")),
    startsAt: v.number(),
    endsAt: v.number(),
    threatLevel: v.number(),
    globalTarget: v.number(),
    globalProgress: v.number(),
    rewardEclats: v.number(),
  }).index("by_status", ["status"]),

  worldInvasionContributions: defineTable({
    invasionId: v.id("worldInvasions"),
    characterId: v.id("characters"),
    characterName: v.string(),
    kills: v.number(),
    rewardClaimed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_invasion_and_character", ["invasionId", "characterId"])
    .index("by_invasion", ["invasionId"]),
});
