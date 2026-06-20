export type FactionId = "lumina" | "umbra" | "neutre";

export interface FactionRank {
  id: string;
  label: string;
  minReputation: number;
  icon: string;
}

export const FACTION_RANKS: FactionRank[] = [
  { id: "stranger", label: "Étranger", minReputation: 0, icon: "👤" },
  { id: "known", label: "Connu", minReputation: 100, icon: "🤝" },
  { id: "ally", label: "Allié", minReputation: 300, icon: "⚔️" },
  { id: "champion", label: "Champion", minReputation: 600, icon: "🏅" },
  { id: "exalted", label: "Exalté", minReputation: 1000, icon: "👑" },
];

export const ZONE_FACTION_MAP: Record<string, FactionId> = {
  vallee_eveils: "lumina",
  foret_lumina: "lumina",
  citadelle_stellaire: "lumina",
  desert_umbra: "umbra",
  arene_pvp: "umbra",
  port_nebula: "neutre",
};

export function getFactionRank(reputation: number): FactionRank {
  let rank = FACTION_RANKS[0]!;
  for (const r of FACTION_RANKS) {
    if (reputation >= r.minReputation) rank = r;
  }
  return rank;
}

export function getNextFactionRank(reputation: number): FactionRank | null {
  const current = getFactionRank(reputation);
  const idx = FACTION_RANKS.findIndex((r) => r.id === current.id);
  return idx < FACTION_RANKS.length - 1 ? FACTION_RANKS[idx + 1]! : null;
}
