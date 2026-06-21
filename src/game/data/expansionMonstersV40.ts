/**
 * v4.0 — Monstres des 12 nouvelles zones
 */

import type { MonsterDefinition } from "./monsters";

interface MobSeed {
  id: string;
  name: string;
  description: string;
  level: number;
  zoneId: string;
  icon: string;
  isBoss?: boolean;
  lootItemId?: string;
}

const MOB_SEEDS: MobSeed[] = [
  // Plateau de Givre
  { id: "yeti_cristal", name: "Yéti de Cristal", description: "Prédateur des hauts plateaux gelés.", level: 58, zoneId: "plateau_givre", icon: "🦍", lootItemId: "fourrure_cristal" },
  { id: "loup_givre", name: "Loup de Givre", description: "Meute aux crocs de glace.", level: 62, zoneId: "plateau_givre", icon: "🐺", lootItemId: "flocon_stellaire" },
  { id: "elemental_glace", name: "Élémentaire de Glace", description: "Esprit du froid stellaire.", level: 68, zoneId: "plateau_givre", icon: "❄️", lootItemId: "cristal_givre" },
  { id: "boss_caverne_givre", name: "Gardien de la Caverne de Givre", description: "Boss — Protecteur des grottes gelées.", level: 72, zoneId: "plateau_givre", icon: "🧊", isBoss: true, lootItemId: "cristal_givre" },
  // Monts Cristallins
  { id: "golem_givre", name: "Golem de Givre", description: "Construct de glace et de cristal.", level: 75, zoneId: "monts_cristallins", icon: "🗿", lootItemId: "fragment_cristal" },
  { id: "harpy_glace", name: "Harpie de Glace", description: "Créature ailée des pics.", level: 80, zoneId: "monts_cristallins", icon: "🦅", lootItemId: "plume_stellaire" },
  { id: "wisp_polar", name: "Wisp Polaire", description: "Esprit stellaire du grand nord.", level: 85, zoneId: "monts_cristallins", icon: "✨", lootItemId: "essence_wisp" },
  { id: "boss_pic_translucide", name: "Gardien du Pic Translucide", description: "Boss — Sentinelle des monts.", level: 92, zoneId: "monts_cristallins", icon: "🏔️", isBoss: true, lootItemId: "minerai_stellaire" },
  // Glaise du Nord
  { id: "mammouth_ether", name: "Mammouth d'Éther", description: "Colosse de la toundra.", level: 95, zoneId: "glaise_nord", icon: "🦣", lootItemId: "essence_boreale" },
  { id: "spectre_givre", name: "Spectre de Givre", description: "Âme perdue dans la glaise.", level: 100, zoneId: "glaise_nord", icon: "👻", lootItemId: "flocon_stellaire" },
  { id: "dragon_givre", name: "Dragon de Givre", description: "Boss — Seigneur de la toundra.", level: 120, zoneId: "glaise_nord", icon: "🐉", isBoss: true, lootItemId: "ecaille_givre" },
  // Marais d'Éther
  { id: "boue_vivante", name: "Boue Vivante", description: "Masse visqueuse du marais.", level: 32, zoneId: "marais_ether", icon: "🟤", lootItemId: "mousse_ether" },
  { id: "grenouille_ether", name: "Grenouille d'Éther", description: "Amphibien luminescent.", level: 36, zoneId: "marais_ether", icon: "🐸", lootItemId: "racine_marais" },
  { id: "will_o_wisp", name: "Feu Follet", description: "Lumière trompeuse des tourbières.", level: 40, zoneId: "marais_ether", icon: "💡", lootItemId: "essence_marais" },
  { id: "boss_tourbiere", name: "Gardien de la Tourbière Maudite", description: "Boss — Esprit du marais.", level: 44, zoneId: "marais_ether", icon: "🌫️", isBoss: true, lootItemId: "mousse_ether" },
  // Cité Flottante
  { id: "golem_rune", name: "Golem Runique", description: "Gardien des ruines suspendues.", level: 48, zoneId: "cite_flottante", icon: "📜", lootItemId: "parchemin_flottant" },
  { id: "sentinelle_flottante", name: "Sentinelle Flottante", description: "Automate des architectes.", level: 52, zoneId: "cite_flottante", icon: "🤖", lootItemId: "pierre_levitation" },
  { id: "wisp_architecte", name: "Wisp Architecte", description: "Esprit des bâtisseurs stellaires.", level: 55, zoneId: "cite_flottante", icon: "✨", lootItemId: "essence_wisp" },
  { id: "boss_nexus_flottant", name: "Gardien du Nexus Flottant", description: "Boss — Cœur de la cité.", level: 58, zoneId: "cite_flottante", icon: "🏛️", isBoss: true, lootItemId: "parchemin_flottant" },
  // Catacombes Humides
  { id: "squelette_marais", name: "Squelette du Marais", description: "Mort-vivant des catacombes.", level: 58, zoneId: "catacombes_humides", icon: "💀", lootItemId: "os_fossile" },
  { id: "necro_marais", name: "Nécromancien du Marais", description: "Cultiste des eaux stagnantes.", level: 64, zoneId: "catacombes_humides", icon: "🧙", lootItemId: "essence_ombre" },
  { id: "esprit_tourbiere", name: "Esprit de Tourbière", description: "Ame des noyés.", level: 68, zoneId: "catacombes_humides", icon: "👻", lootItemId: "essence_marais" },
  { id: "boss_crypte_humide", name: "Gardien de la Crypte Humide", description: "Boss — Liche des catacombes.", level: 72, zoneId: "catacombes_humides", icon: "⚰️", isBoss: true, lootItemId: "phylactere_umbra" },
  // Vallée des Cendres
  { id: "salamandre_cendre", name: "Salamandre de Cendre", description: "Reptile des laves refroidies.", level: 42, zoneId: "vallee_cendres", icon: "🦎", lootItemId: "cendre_stellaire" },
  { id: "golem_lave", name: "Golem de Lave", description: "Rocher animé par le magma.", level: 48, zoneId: "vallee_cendres", icon: "🌋", lootItemId: "obsidienne_ether" },
  { id: "chauve_souris_magma", name: "Chauve-souris de Magma", description: "Essaim des grottes volcaniques.", level: 52, zoneId: "vallee_cendres", icon: "🦇", lootItemId: "cendre_stellaire" },
  { id: "boss_grotte_cendres", name: "Gardien de la Grotte des Cendres", description: "Boss — Colosse de cendre.", level: 55, zoneId: "vallee_cendres", icon: "🔥", isBoss: true, lootItemId: "obsidienne_ether" },
  // Forge Volcanique
  { id: "elemental_magma", name: "Élémentaire de Magma", description: "Flamme vivante de la forge.", level: 62, zoneId: "forge_volcanique", icon: "🔥", lootItemId: "coeur_magma" },
  { id: "golem_fournaise", name: "Golem de Fournaise", description: "Serviteur des forgerons anciens.", level: 68, zoneId: "forge_volcanique", icon: "🗿", lootItemId: "lingot_volcan" },
  { id: "drake_cendre", name: "Drake de Cendre", description: "Dragonnet des volcans.", level: 74, zoneId: "forge_volcanique", icon: "🐲", lootItemId: "ecaille_draconique" },
  { id: "boss_fournaise", name: "Gardien de la Fournaise Ancienne", description: "Boss — Maître de la forge.", level: 78, zoneId: "forge_volcanique", icon: "🔨", isBoss: true, lootItemId: "lingot_volcan" },
  // Chambre du Magma
  { id: "titan_cendre", name: "Titan de Cendre", description: "Boss — Colosse primordial.", level: 95, zoneId: "chambre_magma", icon: "🌋", isBoss: true, lootItemId: "fragment_primordial" },
  { id: "phoenix_ether", name: "Phénix d'Éther", description: "Oiseau de feu stellaire.", level: 88, zoneId: "chambre_magma", icon: "🔥", lootItemId: "larme_phoenix" },
  { id: "colosse_magma", name: "Colosse de Magma", description: "Géant de roche en fusion.", level: 92, zoneId: "chambre_magma", icon: "🗿", lootItemId: "coeur_magma" },
  { id: "boss_trone_magma", name: "Gardien du Trône du Magma", description: "Boss — Avatar du volcan.", level: 110, zoneId: "chambre_magma", icon: "👑", isBoss: true, lootItemId: "fragment_primordial" },
  // Îles Stellaires
  { id: "sprite_stellaire", name: "Sprite Stellaire", description: "Esprit joueur des îlots célestes.", level: 22, zoneId: "iles_stellaires", icon: "✨", lootItemId: "fragment_astral" },
  { id: "golem_astral", name: "Golem Astral", description: "Gardien des ruines célestes.", level: 28, zoneId: "iles_stellaires", icon: "🗿", lootItemId: "poussiere_stellaire" },
  { id: "raie_ciel", name: "Raie du Ciel", description: "Créature planante des îles.", level: 30, zoneId: "iles_stellaires", icon: "🪁", lootItemId: "fragment_astral" },
  { id: "boss_ruines_astrales", name: "Gardien des Ruines Astrales", description: "Boss — Sentinelle des îles.", level: 32, zoneId: "iles_stellaires", icon: "🏛️", isBoss: true, lootItemId: "fragment_astral" },
  // Atoll Nébula
  { id: "meduse_stellaire", name: "Méduse Stellaire", description: "Gelée céleste bioluminescente.", level: 36, zoneId: "atoll_nebula", icon: "🪼", lootItemId: "corail_astral" },
  { id: "crabe_astral", name: "Crabe Astral", description: "Crustacé des eaux célestes.", level: 40, zoneId: "atoll_nebula", icon: "🦀", lootItemId: "perle_stellaire" },
  { id: "anguille_ciel", name: "Anguille du Ciel", description: "Serpent des courants aériens.", level: 44, zoneId: "atoll_nebula", icon: "🐍", lootItemId: "corail_astral" },
  { id: "boss_lagoon", name: "Gardien du Lagoon Stellaire", description: "Boss — Prédateur de l'atoll.", level: 48, zoneId: "atoll_nebula", icon: "🌊", isBoss: true, lootItemId: "perle_stellaire" },
  // Observatoire Lune
  { id: "constellation_vivante", name: "Constellation Vivante", description: "Étoiles animées du dôme.", level: 68, zoneId: "observatoire_lune", icon: "⭐", lootItemId: "essence_constellation" },
  { id: "sentinelle_lunaire", name: "Sentinelle Lunaire", description: "Gardienne de l'observatoire.", level: 75, zoneId: "observatoire_lune", icon: "🌙", lootItemId: "lentille_lunaire" },
  { id: "archimage_astral", name: "Archimage Astral", description: "Dernier savant de la lune.", level: 82, zoneId: "observatoire_lune", icon: "🔮", lootItemId: "essence_constellation" },
  { id: "boss_dome_lunaire", name: "Gardien du Dôme Lunaire", description: "Boss — Oracle des constellations.", level: 95, zoneId: "observatoire_lune", icon: "🔭", isBoss: true, lootItemId: "lentille_lunaire" },
];

function mobStats(level: number, isBoss: boolean) {
  const mult = isBoss ? 4 : 1;
  return {
    hp: Math.round((40 + level * 12) * mult),
    ap: 6 + Math.floor(level / 15) + (isBoss ? 4 : 0),
    mp: 3 + Math.floor(level / 20) + (isBoss ? 2 : 0),
    damage: Math.round((8 + level * 0.7) * (isBoss ? 1.8 : 1)),
    defense: Math.round((4 + level * 0.4) * (isBoss ? 2 : 1)),
  };
}

export const EXPANSION_MONSTERS_V40: MonsterDefinition[] = MOB_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  level: seed.level,
  zoneId: seed.zoneId,
  stats: mobStats(seed.level, !!seed.isBoss),
  spells: seed.isBoss ? ["fracas", "cri_corruption"] : ["morsure"],
  drops: seed.lootItemId ? [{ itemId: seed.lootItemId, chance: seed.isBoss ? 0.25 : 0.35 }] : [],
  xpReward: seed.level * (seed.isBoss ? 50 : 20),
  eclatsReward: { min: seed.level * 2, max: seed.level * 5 },
  icon: seed.icon,
  isBoss: seed.isBoss,
}));
