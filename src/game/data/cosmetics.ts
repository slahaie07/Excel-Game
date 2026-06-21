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
  {
    id: "title_lumina_champion",
    name: "Champion de Lumina",
    type: "title",
    icon: "✨",
    description: "Titre accordé aux Champions de l'Ordre de Lumina.",
  },
  {
    id: "title_lumina_exalted",
    name: "Exalté de Lumina",
    type: "title",
    icon: "👑",
    description: "Plus haute distinction de l'Ordre de Lumina.",
  },
  {
    id: "frame_lumina",
    name: "Cadre Lumina",
    type: "frame",
    icon: "🌟",
    description: "Cadre stellaire de l'Ordre de Lumina.",
  },
  {
    id: "title_umbra_champion",
    name: "Champion d'Umbra",
    type: "title",
    icon: "🌑",
    description: "Titre des Champions du Conclave d'Umbra.",
  },
  {
    id: "title_umbra_exalted",
    name: "Exalté d'Umbra",
    type: "title",
    icon: "👑",
    description: "Plus haute distinction du Conclave d'Umbra.",
  },
  {
    id: "frame_umbra",
    name: "Cadre Umbra",
    type: "frame",
    icon: "🖤",
    description: "Cadre des ombres du Conclave.",
  },
  {
    id: "title_neutre_champion",
    name: "Champion des Marchands",
    type: "title",
    icon: "⚖️",
    description: "Titre des Champions des Marchands Libres.",
  },
  {
    id: "title_neutre_exalted",
    name: "Exalté des Marchands",
    type: "title",
    icon: "👑",
    description: "Plus haute distinction des Marchands Libres.",
  },
  {
    id: "frame_neutre",
    name: "Cadre Nébula",
    type: "frame",
    icon: "💠",
    description: "Cadre du Port de Nébula.",
  },
  {
    id: "title_campaign_hero",
    name: "Héros de Campagne",
    type: "title",
    icon: "🏆",
    description: "1er contributeur de la campagne faction hebdomadaire.",
  },
  {
    id: "frame_campaign_gold",
    name: "Cadre Campagne Or",
    type: "frame",
    icon: "🥇",
    description: "Récompense du 1er contributeur de campagne.",
  },
  {
    id: "frame_campaign_silver",
    name: "Cadre Campagne Argent",
    type: "frame",
    icon: "🥈",
    description: "Récompense du 2e contributeur de campagne.",
  },
  {
    id: "frame_campaign_bronze",
    name: "Cadre Campagne Bronze",
    type: "frame",
    icon: "🥉",
    description: "Récompense du 3e contributeur de campagne.",
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
