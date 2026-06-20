export interface SeasonTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  ratingBonusPercent: number;
  championCosmeticId: string;
}

export const SEASON_THEMES: SeasonTheme[] = [
  {
    id: "flames",
    name: "Flammes d'Aether",
    icon: "🔥",
    description: "+10% de rating gagné en victoire",
    color: "#f97316",
    ratingBonusPercent: 10,
    championCosmeticId: "title_flames_champion",
  },
  {
    id: "shadows",
    name: "Couronne des Ombres",
    icon: "🌑",
    description: "+10% de rating gagné en victoire",
    color: "#7c3aed",
    ratingBonusPercent: 10,
    championCosmeticId: "title_shadow_champion",
  },
  {
    id: "crystal",
    name: "Moisson Cristalline",
    icon: "💎",
    description: "+10% de rating gagné en victoire",
    color: "#22d3ee",
    ratingBonusPercent: 10,
    championCosmeticId: "title_crystal_champion",
  },
  {
    id: "storm",
    name: "Légion des Tempêtes",
    icon: "⚡",
    description: "+10% de rating gagné en victoire",
    color: "#eab308",
    ratingBonusPercent: 10,
    championCosmeticId: "title_storm_champion",
  },
];

export function getSeasonTheme(themeId: string | undefined): SeasonTheme | undefined {
  return SEASON_THEMES.find((t) => t.id === themeId);
}

export function getThemeForSeasonNumber(seasonNumber: number): SeasonTheme {
  return SEASON_THEMES[(seasonNumber - 1) % SEASON_THEMES.length]!;
}
