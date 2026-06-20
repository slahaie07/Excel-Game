export interface SeasonRewardTier {
  eclats: number;
  cosmeticId?: string;
  label: string;
}

export function getSeasonRewardForRank(rank: number, participated: boolean): SeasonRewardTier {
  if (!participated) {
    return { eclats: 0, label: "Non classé" };
  }
  if (rank === 1) {
    return { eclats: 5000, cosmeticId: "title_champion", label: "Champion" };
  }
  if (rank <= 3) {
    return { eclats: 3000, cosmeticId: "title_elite", label: "Elite" };
  }
  if (rank <= 10) {
    return { eclats: 1500, cosmeticId: "title_veteran", label: "Vétéran" };
  }
  if (rank <= 50) {
    return { eclats: 500, label: "Combattant" };
  }
  return { eclats: 100, label: "Participant" };
}

export function getBonusCosmeticForRank(rank: number): string | undefined {
  if (rank === 1) return "frame_gold";
  if (rank <= 3) return "frame_silver";
  return undefined;
}
