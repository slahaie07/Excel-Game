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
  completedQuests?: string[];
}

const REGION_MASTER_QUEST_IDS = [
  "maitre_region_givre",
  "maitre_region_marais",
  "maitre_region_cendres",
  "maitre_region_stellaire",
] as const;

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
  {
    id: "explore_glaise_nord",
    label: "Explorer la Glaise du Nord",
    icon: "❄️",
    check: (c) => c.zoneId === "glaise_nord",
  },
  {
    id: "explore_chambre_magma",
    label: "Explorer la Chambre du Magma",
    icon: "🌋",
    check: (c) => c.zoneId === "chambre_magma",
  },
  {
    id: "explore_observatoire_lune",
    label: "Explorer l'Observatoire de la Lune",
    icon: "🌙",
    check: (c) => c.zoneId === "observatoire_lune",
  },
  {
    id: "cartographe_complete",
    label: "Terminer la quête Cartographe de Terreval",
    icon: "🗺️",
    check: (c) => (c.completedQuests ?? []).includes("cartographe_terreval"),
  },
  {
    id: "maitre_4_regions",
    label: "Maîtriser les 4 régions de Terreval",
    icon: "🏆",
    check: (c) => {
      const completed = c.completedQuests ?? [];
      return REGION_MASTER_QUEST_IDS.every((id) => completed.includes(id));
    },
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
