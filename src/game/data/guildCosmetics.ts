export interface GuildCosmeticDefinition {
  id: string;
  name: string;
  type: "emblem" | "banner";
  icon: string;
  cost: number;
  description: string;
}

export const GUILD_EMBLEMS: GuildCosmeticDefinition[] = [
  { id: "emblem_dragon", name: "Dragon d'Aether", type: "emblem", icon: "🐉", cost: 1000, description: "Emblème draconique pour votre guilde." },
  { id: "emblem_crown", name: "Couronne Stellaire", type: "emblem", icon: "👑", cost: 1500, description: "Symbole de domination." },
  { id: "emblem_flame", name: "Flamme Éternelle", type: "emblem", icon: "🔥", cost: 1200, description: "Les flammes d'Aether brûlent pour vous." },
  { id: "emblem_war_champion", name: "Champion de Guerre", type: "emblem", icon: "⚔️", cost: 0, description: "Récompense campagne de guerre #1." },
];

export const GUILD_BANNERS: GuildCosmeticDefinition[] = [
  { id: "banner_purple", name: "Bannière Violette", type: "banner", icon: "🟣", cost: 800, description: "Bannière du hall de guilde." },
  { id: "banner_gold", name: "Bannière Dorée", type: "banner", icon: "🟡", cost: 1200, description: "Éclat stellaire pour votre hall." },
  { id: "banner_war_champion", name: "Bannière Victorieuse", type: "banner", icon: "🏅", cost: 0, description: "Récompense campagne de guerre #1." },
];

export const ALL_GUILD_COSMETICS = [...GUILD_EMBLEMS, ...GUILD_BANNERS];

export function getGuildCosmeticById(id: string): GuildCosmeticDefinition | undefined {
  return ALL_GUILD_COSMETICS.find((c) => c.id === id);
}
