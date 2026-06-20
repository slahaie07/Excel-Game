export interface CosmeticDefinition {
  id: string;
  name: string;
  type: "title" | "frame";
  icon: string;
  description: string;
  seasonExclusive?: boolean;
}

export const COSMETICS: CosmeticDefinition[] = [
  {
    id: "title_champion",
    name: "Champion de Saison",
    type: "title",
    icon: "👑",
    description: "Titre réservé au #1 de la saison ranked.",
    seasonExclusive: true,
  },
  {
    id: "title_elite",
    name: "Elite Saison",
    type: "title",
    icon: "⭐",
    description: "Top 3 de la saison ranked.",
    seasonExclusive: true,
  },
  {
    id: "title_veteran",
    name: "Vétéran Saison",
    type: "title",
    icon: "🎖️",
    description: "Top 10 de la saison ranked.",
    seasonExclusive: true,
  },
  {
    id: "frame_gold",
    name: "Cadre Doré",
    type: "frame",
    icon: "🟡",
    description: "Cadre de profil exclusif saison — champion.",
    seasonExclusive: true,
  },
  {
    id: "frame_silver",
    name: "Cadre Argent",
    type: "frame",
    icon: "⚪",
    description: "Cadre de profil exclusif saison — top 3.",
    seasonExclusive: true,
  },
  {
    id: "title_flames_champion",
    name: "Champion des Flammes",
    type: "title",
    icon: "🔥",
    description: "Champion de la saison Flammes d'Aether.",
    seasonExclusive: true,
  },
  {
    id: "title_shadow_champion",
    name: "Souverain des Ombres",
    type: "title",
    icon: "🌑",
    description: "Champion de la saison Couronne des Ombres.",
    seasonExclusive: true,
  },
  {
    id: "title_crystal_champion",
    name: "Héros Cristallin",
    type: "title",
    icon: "💎",
    description: "Champion de la saison Moisson Cristalline.",
    seasonExclusive: true,
  },
  {
    id: "title_storm_champion",
    name: "Maître des Tempêtes",
    type: "title",
    icon: "⚡",
    description: "Champion de la saison Légion des Tempêtes.",
    seasonExclusive: true,
  },
];

export const GUILD_HALL_EMOTES = [
  { id: "wave", label: "👋 Salut !", message: "👋 Salut !" },
  { id: "nice", label: "✨ Beau hall !", message: "✨ Beau hall !" },
  { id: "wow", label: "😮 Impressionnant !", message: "😮 Impressionnant !" },
  { id: "gg", label: "🤝 GG", message: "🤝 GG" },
  { id: "fire", label: "🔥 Stylé !", message: "🔥 Stylé !" },
];

export function getCosmeticById(id: string): CosmeticDefinition | undefined {
  return COSMETICS.find((c) => c.id === id);
}
