import { MAX_CHARACTER_LEVEL } from "./constants";

export interface EndgameGoal {
  id: string;
  label: string;
  icon: string;
  check: (ctx: ProgressContext) => boolean;
}

export interface ProgressContext {
  level: number;
  zoneId: string;
  pvpWins: number;
  guildId?: string;
  achievementsUnlocked: number;
  achievementsTotal: number;
  pledgedFaction: boolean;
}

export const ENDGAME_GOALS: EndgameGoal[] = [
  {
    id: "level_30",
    label: "Atteindre le niveau 30",
    icon: "⭐",
    check: (c) => c.level >= 30,
  },
  {
    id: "level_60",
    label: "Atteindre le niveau 60",
    icon: "👑",
    check: (c) => c.level >= 60,
  },
  {
    id: "level_100",
    label: "Atteindre le niveau 100",
    icon: "💠",
    check: (c) => c.level >= 100,
  },
  {
    id: "level_150",
    label: "Atteindre le niveau 150",
    icon: "🔮",
    check: (c) => c.level >= 150,
  },
  {
    id: "level_max",
    label: `Atteindre le niveau ${MAX_CHARACTER_LEVEL} (max)`,
    icon: "💎",
    check: (c) => c.level >= MAX_CHARACTER_LEVEL,
  },
  {
    id: "citadelle",
    label: "Explorer la Citadelle Stellaire",
    icon: "🏰",
    check: (c) => c.zoneId === "citadelle_stellaire",
  },
  {
    id: "archipel",
    label: "Explorer les Profondeurs des Néréides",
    icon: "🧜",
    check: (c) => c.zoneId === "profondeurs_nereides",
  },
  {
    id: "pvp_10",
    label: "10 victoires en Arène",
    icon: "⚔️",
    check: (c) => c.pvpWins >= 10,
  },
  {
    id: "guild",
    label: "Rejoindre une guilde",
    icon: "🏛️",
    check: (c) => !!c.guildId,
  },
  {
    id: "faction",
    label: "Prêter allégeance à une faction",
    icon: "✨",
    check: (c) => c.pledgedFaction,
  },
  {
    id: "achievements_half",
    label: "Débloquer la moitié des succès",
    icon: "🏅",
    check: (c) => c.achievementsTotal > 0 && c.achievementsUnlocked >= c.achievementsTotal / 2,
  },
];

export function getEndgameProgress(ctx: ProgressContext) {
  const completed = ENDGAME_GOALS.filter((g) => g.check(ctx));
  return {
    goals: ENDGAME_GOALS.map((g) => ({ ...g, done: g.check(ctx) })),
    completedCount: completed.length,
    total: ENDGAME_GOALS.length,
    percent: Math.round((completed.length / ENDGAME_GOALS.length) * 100),
  };
}
