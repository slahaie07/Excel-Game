/**
 * Saisons d'événements — Chroniques d'Étheris
 * Fenêtre glissante de 30 jours à partir d'une époque fixe.
 */

export const SEASON_EPOCH_MS = Date.UTC(2025, 0, 1);
export const SEASON_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export type SeasonObjectiveType = "kill" | "dungeon" | "pvp_win";

export interface SeasonQuestObjective {
  type: SeasonObjectiveType;
  targetId?: string;
  count: number;
  description: string;
}

export interface SeasonQuest {
  id: string;
  name: string;
  description: string;
  objectives: SeasonQuestObjective[];
  rewards: {
    seasonCurrency: number;
    passXp: number;
    xp?: number;
    eclats?: number;
  };
}

export interface SeasonPassTier {
  tier: number;
  passXpRequired: number;
  label: string;
  reward: {
    seasonCurrency?: number;
    eclats?: number;
    itemId?: string;
    itemQuantity?: number;
  };
}

export interface SeasonShopItem {
  id: string;
  name: string;
  description: string;
  itemId: string;
  cost: number;
  stock: number;
  icon: string;
}

export interface GameSeason {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  startsAt: number;
  endsAt: number;
  currencyName: string;
  currencyIcon: string;
  quests: SeasonQuest[];
  passTiers: SeasonPassTier[];
  shopItems: SeasonShopItem[];
  /** Récompenses d'activité hors quêtes */
  activityRewards: {
    kill: { seasonCurrency: number; passXp: number };
    dungeon: { seasonCurrency: number; passXp: number };
    pvpWin: { seasonCurrency: number; passXp: number };
  };
}

const ECLIPSE_ETHER_SEASON: Omit<GameSeason, "startsAt" | "endsAt" | "id"> = {
  name: "Éclipse d'Éther",
  description:
    "L'étoile morte projette son ombre sur les six zones d'Étheris. Accumulez des éclats saisonniers, relevez les défis et débloquez le pass gratuit.",
  icon: "🌑",
  color: "#c9a227",
  currencyName: "éclats",
  currencyIcon: "✨",
  quests: [
    {
      id: "season_chasse_ombres",
      name: "Chasse aux Ombres",
      description: "Éliminez des créatures corrompues par l'éclipse dans les zones du monde.",
      objectives: [
        {
          type: "kill",
          targetId: "any",
          count: 25,
          description: "Éliminer 25 monstres",
        },
      ],
      rewards: { seasonCurrency: 120, passXp: 150, xp: 400, eclats: 80 },
    },
    {
      id: "season_explorateur_donjon",
      name: "Explorateur des Profondeurs",
      description: "Terminez un donjon complet pendant la saison.",
      objectives: [
        {
          type: "dungeon",
          count: 1,
          description: "Terminer 1 donjon",
        },
      ],
      rewards: { seasonCurrency: 200, passXp: 250, xp: 600, eclats: 150 },
    },
    {
      id: "season_gloire_arene",
      name: "Gloire de l'Arène",
      description: "Remportez des victoires en PvP pour prouver votre valeur.",
      objectives: [
        {
          type: "pvp_win",
          count: 3,
          description: "Gagner 3 combats PvP",
        },
      ],
      rewards: { seasonCurrency: 180, passXp: 200, xp: 500, eclats: 120 },
    },
  ],
  passTiers: [
    {
      tier: 1,
      passXpRequired: 100,
      label: "50 éclats saisonniers",
      reward: { seasonCurrency: 50 },
    },
    {
      tier: 2,
      passXpRequired: 250,
      label: "100 ✦ Éclats",
      reward: { eclats: 100 },
    },
    {
      tier: 3,
      passXpRequired: 450,
      label: "80 éclats saisonniers",
      reward: { seasonCurrency: 80 },
    },
    {
      tier: 4,
      passXpRequired: 700,
      label: "Fragment d'éclipse",
      reward: { itemId: "fragment_eclipse", itemQuantity: 2 },
    },
    {
      tier: 5,
      passXpRequired: 1000,
      label: "200 ✦ + couronne d'éclipse",
      reward: { eclats: 200, itemId: "couronne_eclipse", itemQuantity: 1 },
    },
  ],
  shopItems: [
    {
      id: "shop_fragment_eclipse",
      name: "Fragment d'Éclipse",
      description: "Matériau rare de la saison.",
      itemId: "fragment_eclipse",
      cost: 40,
      stock: 99,
      icon: "🌘",
    },
    {
      id: "shop_amulette_solaire",
      name: "Amulette Solaire",
      description: "Bijou légendaire de l'éclipse.",
      itemId: "amulette_solaire",
      cost: 350,
      stock: 1,
      icon: "☀️",
    },
    {
      id: "shop_couronne_eclipse",
      name: "Couronne d'Éclipse",
      description: "Cosmétique exclusif de la saison.",
      itemId: "couronne_eclipse",
      cost: 500,
      stock: 1,
      icon: "👑",
    },
    {
      id: "shop_potion_ether",
      name: "Potion d'Éther Renforcée",
      description: "Restaure la vitalité en combat.",
      itemId: "potion_ether",
      cost: 25,
      stock: 20,
      icon: "🧪",
    },
  ],
  activityRewards: {
    kill: { seasonCurrency: 2, passXp: 8 },
    dungeon: { seasonCurrency: 25, passXp: 50 },
    pvpWin: { seasonCurrency: 15, passXp: 40 },
  },
};

export function getSeasonWindow(now = Date.now()): { index: number; startsAt: number; endsAt: number } {
  const elapsed = Math.max(0, now - SEASON_EPOCH_MS);
  const index = Math.floor(elapsed / SEASON_DURATION_MS);
  const startsAt = SEASON_EPOCH_MS + index * SEASON_DURATION_MS;
  const endsAt = startsAt + SEASON_DURATION_MS;
  return { index, startsAt, endsAt };
}

export function getCurrentSeason(now = Date.now()): GameSeason {
  const { index, startsAt, endsAt } = getSeasonWindow(now);
  return {
    ...ECLIPSE_ETHER_SEASON,
    id: `eclipse_ether_${index}`,
    startsAt,
    endsAt,
  };
}

export function getSeasonById(seasonId: string): GameSeason | null {
  const current = getCurrentSeason();
  if (current.id === seasonId) return current;
  const match = /^eclipse_ether_(\d+)$/.exec(seasonId);
  if (!match) return null;
  const index = Number(match[1]);
  const startsAt = SEASON_EPOCH_MS + index * SEASON_DURATION_MS;
  const endsAt = startsAt + SEASON_DURATION_MS;
  return {
    ...ECLIPSE_ETHER_SEASON,
    id: seasonId,
    startsAt,
    endsAt,
  };
}

export function getSeasonTimeRemaining(now = Date.now()): string {
  const season = getCurrentSeason(now);
  const diff = Math.max(0, season.endsAt - now);
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getMaxPassXp(season: GameSeason): number {
  return season.passTiers[season.passTiers.length - 1]?.passXpRequired ?? 0;
}
