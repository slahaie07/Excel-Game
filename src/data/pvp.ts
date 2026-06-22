/** Arène PvP classée — paliers, récompenses et adversaires */

import type { ClassId } from "./classes";

export interface PvpTier {
  id: string;
  name: string;
  icon: string;
  minRating: number;
  maxRating: number;
  winKamas: number;
  winXp: number;
}

export const PVP_TIERS: PvpTier[] = [
  { id: "bronze", name: "Bronze", icon: "🥉", minRating: 0, maxRating: 999, winKamas: 25, winXp: 30 },
  { id: "silver", name: "Argent", icon: "🥈", minRating: 1000, maxRating: 1199, winKamas: 50, winXp: 50 },
  { id: "gold", name: "Or", icon: "🥇", minRating: 1200, maxRating: 1399, winKamas: 80, winXp: 75 },
  { id: "platinum", name: "Platine", icon: "💎", minRating: 1400, maxRating: 1599, winKamas: 120, winXp: 100 },
  { id: "diamond", name: "Diamant", icon: "👑", minRating: 1600, maxRating: 9999, winKamas: 200, winXp: 150 },
];

export const DEFAULT_PVP_RATING = 1000;

export const OPPONENT_NAMES = [
  "Kael", "Lyra", "Thorn", "Mira", "Vex", "Sola", "Draven", "Nyx",
  "Orin", "Zara", "Fenris", "Elara", "Garrick", "Sylva", "Riven", "Asha",
  "Corvus", "Iris", "Bram", "Celeste", "Dusk", "Ember", "Flux", "Gale",
];

export const ALL_CLASS_IDS: ClassId[] = [
  "gardien", "arcaniste", "rodeur", "mystique",
  "forgeur", "ombrelame", "invocateur", "alchimiste",
];

export function getTierForRating(rating: number): PvpTier {
  for (let i = PVP_TIERS.length - 1; i >= 0; i--) {
    const tier = PVP_TIERS[i];
    if (tier && rating >= tier.minRating) return tier;
  }
  return PVP_TIERS[0]!;
}

export function canEnterArena(level: number): string | null {
  if (level < 5) return "Niveau 5 requis pour l'arène classée.";
  return null;
}
