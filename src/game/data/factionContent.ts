export type FactionId = "lumina" | "umbra" | "neutre";

export type FactionQuestType = "world_kills" | "zone_kills" | "pvp_wins";

export const ZONE_FACTION_MAP: Record<string, FactionId> = {
  vallee_eveils: "lumina",
  foret_lumina: "lumina",
  citadelle_stellaire: "lumina",
  cotes_brume: "neutre",
  grottes_maree: "neutre",
  recif_abyssal: "umbra",
  ile_tempete: "umbra",
  sanctuaire_marins: "lumina",
  profondeurs_nereides: "umbra",
  desert_umbra: "umbra",
  arene_pvp: "umbra",
  port_nebula: "neutre",
  // v4.0
  plateau_givre: "lumina",
  monts_cristallins: "lumina",
  glaise_nord: "neutre",
  marais_ether: "lumina",
  cite_flottante: "neutre",
  catacombes_humides: "umbra",
  vallee_cendres: "umbra",
  forge_volcanique: "umbra",
  chambre_magma: "umbra",
  iles_stellaires: "neutre",
  atoll_nebula: "neutre",
  observatoire_lune: "lumina",
};

export interface FactionQuestTemplate {
  id: string;
  factionId: FactionId;
  label: string;
  description: string;
  type: FactionQuestType;
  target: number;
  rewardReputation: number;
  rewardEclats: number;
  zoneIds?: string[];
}

export interface FactionShopItem {
  id: string;
  factionId: FactionId;
  itemId: string;
  quantity: number;
  label: string;
  requiredRankId: string;
  costEclats: number;
  weeklyLimit: number;
}

export const FACTION_META: Record<FactionId, { name: string; icon: string; description: string }> = {
  lumina: { name: "Ordre de Lumina", icon: "✨", description: "Gardiens des Cristaux purs" },
  umbra: { name: "Conclave d'Umbra", icon: "🌑", description: "Maîtres des Cristaux corrompus" },
  neutre: { name: "Marchands Libres", icon: "⚖️", description: "Commerçants indépendants" },
};

export const FACTION_RANKS = [
  { id: "stranger", label: "Étranger", minReputation: 0, icon: "👤" },
  { id: "known", label: "Connu", minReputation: 100, icon: "🤝" },
  { id: "ally", label: "Allié", minReputation: 300, icon: "⚔️" },
  { id: "champion", label: "Champion", minReputation: 600, icon: "🏅" },
  { id: "exalted", label: "Exalté", minReputation: 1000, icon: "👑" },
] as const;

export const FACTION_QUESTS: FactionQuestTemplate[] = [
  {
    id: "lumina_patrol",
    factionId: "lumina",
    label: "Patrouille lumineuse",
    description: "Vaincre 5 monstres dans les terres de Lumina",
    type: "zone_kills",
    target: 5,
    zoneIds: [
      "vallee_eveils",
      "foret_lumina",
      "citadelle_stellaire",
      "plateau_givre",
      "monts_cristallins",
      "marais_ether",
      "observatoire_lune",
    ],
    rewardReputation: 60,
    rewardEclats: 100,
  },
  {
    id: "lumina_vigil",
    factionId: "lumina",
    label: "Veille stellaire",
    description: "Remporter 8 victoires en exploration",
    type: "world_kills",
    target: 8,
    rewardReputation: 45,
    rewardEclats: 80,
  },
  {
    id: "umbra_hunt",
    factionId: "umbra",
    label: "Chasse dans l'ombre",
    description: "Vaincre 5 monstres dans les terres d'Umbra",
    type: "zone_kills",
    target: 5,
    zoneIds: [
      "desert_umbra",
      "arene_pvp",
      "catacombes_humides",
      "vallee_cendres",
      "forge_volcanique",
      "chambre_magma",
    ],
    rewardReputation: 60,
    rewardEclats: 100,
  },
  {
    id: "umbra_duel",
    factionId: "umbra",
    label: "Duelliste d'Umbra",
    description: "Gagner 2 matchs PvP",
    type: "pvp_wins",
    target: 2,
    rewardReputation: 75,
    rewardEclats: 120,
  },
  {
    id: "neutre_trade",
    factionId: "neutre",
    label: "Convoi du port",
    description: "Vaincre 4 monstres au Port Nébula",
    type: "zone_kills",
    target: 4,
    zoneIds: ["port_nebula"],
    rewardReputation: 50,
    rewardEclats: 90,
  },
  {
    id: "neutre_wanderer",
    factionId: "neutre",
    label: "Voyageur aguerri",
    description: "Remporter 6 victoires en exploration",
    type: "world_kills",
    target: 6,
    rewardReputation: 40,
    rewardEclats: 70,
  },
];

export const FACTION_SHOP_ITEMS: FactionShopItem[] = [
  {
    id: "lumina_potions",
    factionId: "lumina",
    itemId: "potion_vie",
    quantity: 5,
    label: "Pack de potions (×5)",
    requiredRankId: "known",
    costEclats: 40,
    weeklyLimit: 3,
  },
  {
    id: "lumina_dust",
    factionId: "lumina",
    itemId: "poussiere_stellaire",
    quantity: 3,
    label: "Poussière stellaire (×3)",
    requiredRankId: "known",
    costEclats: 55,
    weeklyLimit: 2,
  },
  {
    id: "lumina_staff",
    factionId: "lumina",
    itemId: "baton_ether",
    quantity: 1,
    label: "Bâton d'Éther",
    requiredRankId: "ally",
    costEclats: 180,
    weeklyLimit: 1,
  },
  {
    id: "lumina_armor",
    factionId: "lumina",
    itemId: "armure_lumina",
    quantity: 1,
    label: "Armure de Lumina",
    requiredRankId: "champion",
    costEclats: 750,
    weeklyLimit: 1,
  },
  {
    id: "umbra_fragments",
    factionId: "umbra",
    itemId: "fragment_ombre",
    quantity: 5,
    label: "Fragments d'ombre (×5)",
    requiredRankId: "known",
    costEclats: 45,
    weeklyLimit: 3,
  },
  {
    id: "umbra_cape",
    factionId: "umbra",
    itemId: "cape_umbra",
    quantity: 1,
    label: "Cape d'Umbra",
    requiredRankId: "champion",
    costEclats: 800,
    weeklyLimit: 1,
  },
  {
    id: "umbra_essence",
    factionId: "umbra",
    itemId: "essence_ombre",
    quantity: 2,
    label: "Essence d'ombre (×2)",
    requiredRankId: "ally",
    costEclats: 120,
    weeklyLimit: 2,
  },
  {
    id: "neutre_bread",
    factionId: "neutre",
    itemId: "pain_eveil",
    quantity: 10,
    label: "Rations du port (×10)",
    requiredRankId: "known",
    costEclats: 25,
    weeklyLimit: 3,
  },
  {
    id: "neutre_energy",
    factionId: "neutre",
    itemId: "potion_energie",
    quantity: 3,
    label: "Potions d'énergie (×3)",
    requiredRankId: "ally",
    costEclats: 65,
    weeklyLimit: 2,
  },
  {
    id: "neutre_crystal",
    factionId: "neutre",
    itemId: "cristal_pur",
    quantity: 1,
    label: "Cristal pur",
    requiredRankId: "exalted",
    costEclats: 400,
    weeklyLimit: 1,
  },
];

const RANK_ORDER = ["stranger", "known", "ally", "champion", "exalted"];

export function getFactionRank(reputation: number): (typeof FACTION_RANKS)[number] {
  let rank: (typeof FACTION_RANKS)[number] = FACTION_RANKS[0]!;
  for (const r of FACTION_RANKS) {
    if (reputation >= r.minReputation) rank = r;
  }
  return rank;
}

export function getNextFactionRank(reputation: number): (typeof FACTION_RANKS)[number] | null {
  const current = getFactionRank(reputation);
  const idx = FACTION_RANKS.findIndex((r) => r.id === current.id);
  return idx < FACTION_RANKS.length - 1 ? FACTION_RANKS[idx + 1]! : null;
}

export function meetsRankRequirement(currentRankId: string, requiredRankId: string): boolean {
  return RANK_ORDER.indexOf(currentRankId) >= RANK_ORDER.indexOf(requiredRankId);
}

export function getQuestsForFaction(factionId: FactionId): FactionQuestTemplate[] {
  return FACTION_QUESTS.filter((q) => q.factionId === factionId);
}

export function getShopItemsForFaction(factionId: FactionId): FactionShopItem[] {
  return FACTION_SHOP_ITEMS.filter((s) => s.factionId === factionId);
}

export function getWeekKey(now = Date.now()): string {
  const date = new Date(now);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
