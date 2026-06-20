/**
 * Monstres et créatures d'Aetheris
 */

export interface MonsterDefinition {
  id: string;
  name: string;
  description: string;
  level: number;
  zoneId: string;
  stats: { hp: number; ap: number; mp: number; damage: number; defense: number };
  spells: string[];
  drops: { itemId: string; chance: number }[];
  xpReward: number;
  eclatsReward: { min: number; max: number };
  icon: string;
  isBoss?: boolean;
}

export const MONSTERS: MonsterDefinition[] = [
  // Zone: Vallée des Éveils (niveau 1-10)
  { id: "graine_ombre", name: "Graine d'Ombre", description: "Petite créature née des Cristaux corrompus.", level: 1, zoneId: "vallee_eveils", stats: { hp: 30, ap: 4, mp: 3, damage: 5, defense: 2 }, spells: ["morsure"], drops: [{ itemId: "fragment_ombre", chance: 0.4 }], xpReward: 15, eclatsReward: { min: 2, max: 8 }, icon: "🌑" },
  { id: "wisp_sauvage", name: "Wisp Sauvage", description: "Esprit stellaire errant.", level: 3, zoneId: "vallee_eveils", stats: { hp: 45, ap: 5, mp: 4, damage: 8, defense: 3 }, spells: ["eclair_ether"], drops: [{ itemId: "poussiere_stellaire", chance: 0.3 }], xpReward: 25, eclatsReward: { min: 5, max: 12 }, icon: "✨" },
  { id: "loup_cristal", name: "Loup de Cristal", description: "Prédateur aux crocs de cristal.", level: 5, zoneId: "vallee_eveils", stats: { hp: 70, ap: 6, mp: 4, damage: 12, defense: 5 }, spells: ["morsure", "bond"], drops: [{ itemId: "fourrure_cristal", chance: 0.35 }], xpReward: 40, eclatsReward: { min: 8, max: 18 }, icon: "🐺" },
  { id: "gardien_ruines", name: "Gardien des Ruines", description: "Boss — Ancien protecteur corrompu.", level: 10, zoneId: "vallee_eveils", stats: { hp: 300, ap: 8, mp: 3, damage: 20, defense: 15 }, spells: ["fracas", "cri_corruption"], drops: [{ itemId: "cristal_eveil", chance: 1.0 }, { itemId: "arme_ruines", chance: 0.2 }], xpReward: 200, eclatsReward: { min: 50, max: 100 }, icon: "👹", isBoss: true },

  // Zone: Forêt de Lumina (niveau 10-25)
  { id: "treant_corrompu", name: "Tréant Corrompu", description: "Arbre ancien touché par l'Ombre.", level: 12, zoneId: "foret_lumina", stats: { hp: 120, ap: 5, mp: 2, damage: 15, defense: 12 }, spells: ["racines"], drops: [{ itemId: "ecorce_lumina", chance: 0.4 }], xpReward: 60, eclatsReward: { min: 15, max: 30 }, icon: "🌳" },
  { id: "fee_brume", name: "Fée de Brume", description: "Esprit capricieux de la forêt.", level: 15, zoneId: "foret_lumina", stats: { hp: 80, ap: 7, mp: 6, damage: 18, defense: 4 }, spells: ["eclair_brume", "soin_feerique"], drops: [{ itemId: "aile_fee", chance: 0.25 }], xpReward: 80, eclatsReward: { min: 20, max: 40 }, icon: "🧚" },
  { id: "champion_lumina", name: "Champion de Lumina", description: "Boss — Chevalier de l'Ordre tombé.", level: 25, zoneId: "foret_lumina", stats: { hp: 500, ap: 10, mp: 4, damage: 30, defense: 25 }, spells: ["lame_lumineuse", "bouclier_sacré"], drops: [{ itemId: "armure_lumina", chance: 0.15 }, { itemId: "cristal_pur", chance: 0.5 }], xpReward: 500, eclatsReward: { min: 100, max: 200 }, icon: "⚔️", isBoss: true },

  // Zone: Désert d'Umbra (niveau 25-40)
  { id: "scorpion_ether", name: "Scorpion d'Éther", description: "Prédateur du désert stellaire.", level: 28, zoneId: "desert_umbra", stats: { hp: 150, ap: 6, mp: 5, damage: 25, defense: 10 }, spells: ["piqure", "sable"], drops: [{ itemId: "venin_ether", chance: 0.3 }], xpReward: 120, eclatsReward: { min: 30, max: 60 }, icon: "🦂" },
  { id: "sphinx_ombres", name: "Sphinx des Ombres", description: "Boss — Gardien des secrets d'Umbra.", level: 40, zoneId: "desert_umbra", stats: { hp: 800, ap: 12, mp: 5, damage: 40, defense: 30 }, spells: ["énigme_mortelle", "tempete_sable"], drops: [{ itemId: "amulette_umbra", chance: 0.1 }, { itemId: "parchemin_ancien", chance: 0.4 }], xpReward: 1000, eclatsReward: { min: 200, max: 400 }, icon: "🦁", isBoss: true },

  // Zone: Citadelle Stellaire (niveau 40-60)
  { id: "golem_stellaire", name: "Golem Stellaire", description: "Construct magique des anciens.", level: 45, zoneId: "citadelle_stellaire", stats: { hp: 250, ap: 6, mp: 2, damage: 35, defense: 35 }, spells: ["poing_roche", "seisme"], drops: [{ itemId: "noyau_stellaire", chance: 0.2 }], xpReward: 200, eclatsReward: { min: 50, max: 100 }, icon: "🗿" },
  { id: "dragon_aether", name: "Dragon d'Aether", description: "Boss final — Avatar de l'étoile morte.", level: 60, zoneId: "citadelle_stellaire", stats: { hp: 2000, ap: 14, mp: 6, damage: 60, defense: 40 }, spells: ["souffle_stellaire", "apocalypse_ether", "vol_draconique"], drops: [{ itemId: "ecaille_dragon", chance: 0.3 }, { itemId: "couronne_aether", chance: 0.05 }], xpReward: 5000, eclatsReward: { min: 500, max: 1000 }, icon: "🐉", isBoss: true },

  // Événements saisonniers
  { id: "event_gardien_floral", name: "Gardien Floral", description: "Esprit printanier des Cristaux en fleur.", level: 12, zoneId: "foret_lumina", stats: { hp: 100, ap: 6, mp: 4, damage: 14, defense: 8 }, spells: ["pollen_ether"], drops: [{ itemId: "fleur_ether", chance: 0.5 }], xpReward: 80, eclatsReward: { min: 20, max: 40 }, icon: "🌸" },
  { id: "event_esprit_eclipse", name: "Esprit d'Éclipse", description: "Ombre solaire née pendant l'éclipse d'Aether.", level: 25, zoneId: "desert_umbra", stats: { hp: 140, ap: 7, mp: 5, damage: 22, defense: 10 }, spells: ["rayon_eclipse"], drops: [{ itemId: "fragment_eclipse", chance: 0.45 }], xpReward: 120, eclatsReward: { min: 35, max: 70 }, icon: "🌘" },
  { id: "event_ombre_majeur", name: "Ombre Majeure", description: "Soldat d'élite de l'invasion automnale.", level: 35, zoneId: "desert_umbra", stats: { hp: 200, ap: 8, mp: 4, damage: 28, defense: 18 }, spells: ["lame_ombre", "cri_corruption"], drops: [{ itemId: "essence_ombre", chance: 0.4 }], xpReward: 180, eclatsReward: { min: 50, max: 100 }, icon: "👿" },
  { id: "event_cristal_ancien", name: "Gardien de Cristal Ancien", description: "Protecteur millénaire réveillé par la Fête des Cristaux.", level: 45, zoneId: "citadelle_stellaire", stats: { hp: 280, ap: 9, mp: 3, damage: 35, defense: 25 }, spells: ["barriere_cristal", "eclat_givre"], drops: [{ itemId: "flocon_stellaire", chance: 0.5 }], xpReward: 250, eclatsReward: { min: 70, max: 140 }, icon: "💠" },
];

export function getMonstersByZone(zoneId: string): MonsterDefinition[] {
  return MONSTERS.filter((m) => m.zoneId === zoneId);
}

export function getMonsterById(id: string): MonsterDefinition | undefined {
  return MONSTERS.find((m) => m.id === id);
}
