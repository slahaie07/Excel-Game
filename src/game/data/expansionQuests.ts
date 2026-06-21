/**
 * v3.1 — Expansion quêtes (22 → 100)
 * Donjons expansion, chaîne citadelle/désert, side/daily par zone, endgame
 */

import type { QuestDefinition } from "./quests";
import { EXPANSION_DUNGEONS_V30 } from "./expansionV30";

const ZONE_GIVER: Record<string, string> = {
  vallee_eveils: "maitre_eveil",
  foret_lumina: "pretre_lumina",
  port_nebula: "chef_guilde",
  desert_umbra: "guide_desert",
  citadelle_stellaire: "chef_guilde",
  arene_pvp: "chef_guilde",
  cotes_brume: "pecheur_brume",
  grottes_maree: "explorateur_grotte",
  recif_abyssal: "plongeur_ether",
  ile_tempete: "capitaine_tempete",
  sanctuaire_marins: "oracles_marins",
  profondeurs_nereides: "nereide_heralde",
};

function giverForZone(zoneId: string): string {
  return ZONE_GIVER[zoneId] ?? "chef_guilde";
}

/** 40 quêtes donjon — une par boss expansion v3.0 */
const DUNGEON_EXPANSION_QUESTS: QuestDefinition[] = EXPANSION_DUNGEONS_V30.map((dungeon) => ({
  id: `quete_${dungeon.id}`,
  name: `Gardien — ${dungeon.name}`,
  description: `Affrontez et vainquez le gardien du donjon ${dungeon.name}.`,
  type: "dungeon",
  levelRequired: dungeon.levelRequired,
  zoneId: dungeon.zoneId,
  giverNpcId: giverForZone(dungeon.zoneId),
  objectives: [
    {
      type: "kill",
      targetId: dungeon.bossId,
      count: 1,
      description: `Vaincre le gardien de ${dungeon.name}`,
    },
  ],
  rewards: {
    xp: dungeon.levelRequired * 45,
    eclats: dungeon.levelRequired * 20,
    items: dungeon.rewards.items?.[0]
      ? [{ itemId: dungeon.rewards.items[0].itemId, quantity: 1 }]
      : undefined,
  },
}));

/** Chaîne principale désert + citadelle (manquante avant v3.1) */
const MAIN_CITADEL_CHAIN: QuestDefinition[] = [
  {
    id: "sables_umbra",
    name: "Sables d'Umbra",
    description: "Le guide du désert vous appelle vers les dunes d'ombre.",
    type: "main",
    levelRequired: 18,
    zoneId: "desert_umbra",
    giverNpcId: "guide_desert",
    objectives: [
      { type: "talk", targetId: "guide_desert", count: 1, description: "Rencontrer le guide du désert" },
      { type: "explore", targetId: "desert_umbra", count: 1, description: "Explorer le désert d'Umbra" },
      { type: "kill", targetId: "scorpion_ether", count: 6, description: "Éliminer 6 Scorpions d'Éther" },
    ],
    rewards: { xp: 550, eclats: 220 },
    prerequisiteQuests: ["route_lumina"],
  },
  {
    id: "mirage_pharaon",
    name: "Mirage du Pharaon",
    description: "Un tombeau stellaire apparaît sous les dunes lors des tempêtes.",
    type: "main",
    levelRequired: 25,
    zoneId: "desert_umbra",
    giverNpcId: "guide_desert",
    objectives: [
      { type: "kill", targetId: "boss_tombeau_pharaon", count: 1, description: "Vaincre le Gardien du Tombeau du Pharaon" },
    ],
    rewards: { xp: 800, eclats: 350, items: [{ itemId: "parchemin_ancien", quantity: 1 }] },
    prerequisiteQuests: ["sables_umbra"],
  },
  {
    id: "appel_citadelle",
    name: "L'Appel de la Citadelle",
    description: "L'Ordre convoque les Éveilleurs à la Citadelle Stellaire.",
    type: "main",
    levelRequired: 35,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "talk", targetId: "chef_guilde", count: 1, description: "Recevoir l'invocation de la citadelle" },
      { type: "explore", targetId: "citadelle_stellaire", count: 1, description: "Atteindre la Citadelle Stellaire" },
    ],
    rewards: { xp: 1000, eclats: 450 },
    prerequisiteQuests: ["mirage_pharaon"],
  },
  {
    id: "epreuve_golem",
    name: "Épreuve du Golem",
    description: "Prouvez votre valeur face aux golems stellaires.",
    type: "main",
    levelRequired: 40,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "golem_stellaire", count: 5, description: "Détruire 5 Golems Stellaires" },
      { type: "kill", targetId: "boss_salle_astrale", count: 1, description: "Vaincre le Gardien de la Salle Astrale" },
    ],
    rewards: { xp: 1500, eclats: 600, items: [{ itemId: "noyau_stellaire", quantity: 1 }] },
    prerequisiteQuests: ["appel_citadelle"],
  },
  {
    id: "bibliotheque_interdite",
    name: "Bibliothèque Interdite",
    description: "Les archives du vide recèlent des secrets dangereux.",
    type: "main",
    levelRequired: 50,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_bibliotheque_void", count: 1, description: "Vaincre le Gardien de la Bibliothèque du Vide" },
      { type: "collect", targetId: "lentille_void", count: 1, description: "Récupérer une Lentille du Vide" },
    ],
    rewards: { xp: 2500, eclats: 1000 },
    prerequisiteQuests: ["epreuve_golem"],
  },
  {
    id: "dragon_aether",
    name: "Le Dragon d'Aether",
    description: "Le sanctum du dragon garde la porte du Nexus.",
    type: "main",
    levelRequired: 60,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_sanctum_dragon", count: 1, description: "Vaincre le Gardien du Sanctum du Dragon" },
    ],
    rewards: { xp: 4000, eclats: 1800, items: [{ itemId: "ecaille_dragon", quantity: 1 }] },
    prerequisiteQuests: ["bibliotheque_interdite"],
  },
  {
    id: "couronne_finale",
    name: "Couronne d'Éther",
    description: "Le sanctuaire final attend les champions du niveau 95.",
    type: "main",
    levelRequired: 95,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_couronne_ether", count: 1, description: "Vaincre le Gardien de la Couronne d'Éther" },
    ],
    rewards: { xp: 12000, eclats: 5000, items: [{ itemId: "couronne_aether", quantity: 1 }] },
    prerequisiteQuests: ["dragon_aether", "leviathan_brume_quete"],
  },
];

/** Objectifs endgame niveau 100 / 150 / 200 */
const ENDGAME_MILESTONE_QUESTS: QuestDefinition[] = [
  {
    id: "eveilleur_centurion",
    name: "Éveilleur Centurion",
    description: "Atteignez le niveau 100 — palier des champions.",
    type: "side",
    levelRequired: 90,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "talk", targetId: "chef_guilde", count: 1, description: "Confirmer votre ascension au palier 100" },
    ],
    rewards: { xp: 5000, eclats: 2500 },
    prerequisiteQuests: ["niveau_50"],
  },
  {
    id: "eveilleur_legende",
    name: "Éveilleur Légende",
    description: "Le palier 150 distingue les héros des légendes.",
    type: "side",
    levelRequired: 140,
    zoneId: "profondeurs_nereides",
    giverNpcId: "nereide_heralde",
    objectives: [
      { type: "talk", targetId: "nereide_heralde", count: 1, description: "Recevoir la bénédiction des abysses" },
      { type: "kill", targetId: "boss_nexus_profond", count: 1, description: "Vaincre le Gardien du Nexus Profond" },
    ],
    rewards: { xp: 10000, eclats: 4000 },
    prerequisiteQuests: ["eveilleur_centurion"],
  },
  {
    id: "ascension_200",
    name: "Ascension Ultime",
    description: "Niveau 200 — le sommet de l'Éveil à Terreval.",
    type: "main",
    levelRequired: 190,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "talk", targetId: "chef_guilde", count: 1, description: "Accepter le défi de l'ascension finale" },
      { type: "kill", targetId: "boss_couronne_ether", count: 3, description: "Vaincre 3 fois le Gardien de la Couronne d'Éther" },
    ],
    rewards: { xp: 25000, eclats: 10000, spells: ["armee_esprits"] },
    prerequisiteQuests: ["couronne_finale", "eveilleur_legende"],
  },
];

interface SideSeed {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  levelRequired: number;
  targetId: string;
  count: number;
  targetLabel: string;
  xp: number;
  eclats: number;
  itemId?: string;
}

const SIDE_SEEDS: SideSeed[] = [
  { id: "chasse_loups", name: "Chasse aux Loups", description: "Les loups de cristal rôdent près des ruines.", zoneId: "vallee_eveils", levelRequired: 6, targetId: "loup_cristal", count: 8, targetLabel: "Loups de Cristal", xp: 120, eclats: 60 },
  { id: "wisps_nuit", name: "Wisps de la Nuit", description: "Des wisps agressifs apparaissent au crépuscule.", zoneId: "vallee_eveils", levelRequired: 4, targetId: "wisp_sauvage", count: 12, targetLabel: "Wisps Sauvages", xp: 100, eclats: 50 },
  { id: "fees_brume", name: "Fées de Brume", description: "Purifiez la forêt des fées corrompues.", zoneId: "foret_lumina", levelRequired: 16, targetId: "fee_brume", count: 6, targetLabel: "Fées de Brume", xp: 350, eclats: 140 },
  { id: "treants_purifier", name: "Purification des Tréants", description: "Les tréants corrompus bloquent les sentiers.", zoneId: "foret_lumina", levelRequired: 20, targetId: "treant_corrompu", count: 5, targetLabel: "Tréants Corrompus", xp: 400, eclats: 180 },
  { id: "commerce_port", name: "Contrats du Port", description: "Le chef de guilde a besoin de renforts au port.", zoneId: "port_nebula", levelRequired: 15, targetId: "graine_ombre", count: 10, targetLabel: "Graines d'Ombre", xp: 300, eclats: 130 },
  { id: "arene_entrainement", name: "Entraînement d'Arène", description: "Prouvez-vous dans l'arène avant les champions.", zoneId: "arene_pvp", levelRequired: 30, targetId: "champion_lumina", count: 3, targetLabel: "Champions de Lumina", xp: 700, eclats: 300 },
  { id: "scorpions_dunes", name: "Scorpions des Dunes", description: "Les caravanes demandent une escorte.", zoneId: "desert_umbra", levelRequired: 22, targetId: "scorpion_ether", count: 8, targetLabel: "Scorpions d'Éther", xp: 500, eclats: 200 },
  { id: "relique_mirage", name: "Relique du Mirage", description: "Un mirage révèle une relique enfouie.", zoneId: "desert_umbra", levelRequired: 32, targetId: "boss_temple_sable", count: 1, targetLabel: "Gardien du Temple de Sable", xp: 900, eclats: 380, itemId: "relique_mirage" },
  { id: "meduses_cote", name: "Méduses Côtières", description: "Les méduses de brume bloquent les pêcheurs.", zoneId: "cotes_brume", levelRequired: 14, targetId: "meduse_brume", count: 6, targetLabel: "Méduses de Brume", xp: 280, eclats: 110 },
  { id: "crabes_ether", name: "Crabes d'Éther", description: "Chasse aux crabes d'éther sur la côte.", zoneId: "cotes_brume", levelRequired: 17, targetId: "crabe_ether", count: 8, targetLabel: "Crabes d'Éther", xp: 320, eclats: 130 },
  { id: "sangliers_marin", name: "Sangliers Marins", description: "Des sangliers marins infestent les grottes.", zoneId: "grottes_maree", levelRequired: 20, targetId: "sanglier_marin", count: 5, targetLabel: "Sangliers Marins", xp: 380, eclats: 160 },
  { id: "lampe_abyssale", name: "Lampes Abyssales", description: "Collectez des lampes pour éclairer les tunnels.", zoneId: "grottes_maree", levelRequired: 26, targetId: "lampe_abyssale", count: 4, targetLabel: "Lampes Abyssales", xp: 450, eclats: 190 },
  { id: "harpyes_tempete", name: "Harpies de Tempête", description: "Les harpies stellaires assiègent l'île.", zoneId: "ile_tempete", levelRequired: 36, targetId: "harpy_stellaire", count: 5, targetLabel: "Harpies Stellaires", xp: 750, eclats: 320 },
  { id: "elementaux_orage", name: "Élémentaux d'Orage", description: "Maîtrisez les élémentaux de tempête.", zoneId: "ile_tempete", levelRequired: 38, targetId: "elemental_tempete", count: 6, targetLabel: "Élémentaux de Tempête", xp: 800, eclats: 340 },
  { id: "pretres_corail", name: "Prêtres de Corail", description: "Les prêtres corrompus profanent le sanctuaire.", zoneId: "sanctuaire_marins", levelRequired: 44, targetId: "pretre_corail", count: 4, targetLabel: "Prêtres de Corail", xp: 900, eclats: 380 },
  { id: "gardiens_marin", name: "Gardiens Marins", description: "Les gardiens marins testent les visiteurs.", zoneId: "sanctuaire_marins", levelRequired: 50, targetId: "gardien_marin", count: 5, targetLabel: "Gardiens Marins", xp: 1100, eclats: 450 },
  { id: "nereides_guerre", name: "Guerrières Néréides", description: "Affrontez les guerrières des profondeurs.", zoneId: "profondeurs_nereides", levelRequired: 58, targetId: "nereide_guerriere", count: 6, targetLabel: "Guerrières Néréides", xp: 1400, eclats: 580 },
  { id: "cite_engoutie_quete", name: "Explorateur Englouti", description: "Cartographiez la cité engloutie.", zoneId: "profondeurs_nereides", levelRequired: 72, targetId: "boss_cite_engoutie", count: 1, targetLabel: "Gardien de la Cité Engloutie", xp: 3000, eclats: 1200 },
];

const SIDE_EXPANSION_QUESTS: QuestDefinition[] = SIDE_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  type: "side",
  levelRequired: seed.levelRequired,
  zoneId: seed.zoneId,
  giverNpcId: giverForZone(seed.zoneId),
  objectives: [
    {
      type: "kill",
      targetId: seed.targetId,
      count: seed.count,
      description: `Éliminer ${seed.count} ${seed.targetLabel}`,
    },
  ],
  rewards: {
    xp: seed.xp,
    eclats: seed.eclats,
    items: seed.itemId ? [{ itemId: seed.itemId, quantity: 1 }] : undefined,
  },
}));

/** Quêtes craft / collecte par zone */
const CRAFT_QUESTS: QuestDefinition[] = [
  {
    id: "potion_masse",
    name: "Potions en Masse",
    description: "L'alchimiste a besoin d'herbes pour approvisionner la guilde.",
    type: "side",
    levelRequired: 10,
    zoneId: "foret_lumina",
    giverNpcId: "marchand_debut",
    objectives: [
      { type: "collect", targetId: "herbe_eveil", count: 20, description: "Collecter 20 Herbes d'Éveil" },
      { type: "craft", targetId: "potion_vie", count: 5, description: "Fabriquer 5 Potions de Vie" },
    ],
    rewards: { xp: 350, eclats: 150, items: [{ itemId: "potion_vie", quantity: 10 }] },
  },
  {
    id: "minerai_stellaire",
    name: "Minerai Stellaire",
    description: "Le forgeron de la citadelle réclame du minerai rare.",
    type: "side",
    levelRequired: 45,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "collect", targetId: "minerai_stellaire", count: 10, description: "Miner 10 Minerais Stellaires" },
    ],
    rewards: { xp: 800, eclats: 400 },
    prerequisiteQuests: ["appel_citadelle"],
  },
  {
    id: "bois_lumina",
    name: "Bois de Lumina",
    description: "Le bûcheron cherche du bois enchanté pour ses outils.",
    type: "side",
    levelRequired: 12,
    zoneId: "foret_lumina",
    giverNpcId: "pretre_lumina",
    objectives: [
      { type: "collect", targetId: "bois_lumina", count: 15, description: "Récolter 15 Bois de Lumina" },
    ],
    rewards: { xp: 250, eclats: 100 },
  },
  {
    id: "perles_nacre",
    name: "Perles de Nacre",
    description: "Le forgeron corail transforme la nacre en bijoux.",
    type: "side",
    levelRequired: 28,
    zoneId: "grottes_maree",
    giverNpcId: "forgeron_corail",
    objectives: [
      { type: "collect", targetId: "nacre_matriarche", count: 3, description: "Apporter 3 Nacres de Matriarche" },
    ],
    rewards: { xp: 500, eclats: 220, items: [{ itemId: "anneau_tempete", quantity: 1 }] },
    prerequisiteQuests: ["grottes_inondees"],
  },
  {
    id: "livrable_port",
    name: "Livraison au Port",
    description: "Livrez des fournitures au marchand marin.",
    type: "side",
    levelRequired: 20,
    zoneId: "port_nebula",
    giverNpcId: "marchand_marin",
    objectives: [
      { type: "deliver", targetId: "marchand_marin", count: 1, description: "Livrer le colis au marchand marin" },
      { type: "collect", targetId: "algue_lumineuse", count: 10, description: "Apporter 10 Algues Lumineuses" },
    ],
    rewards: { xp: 400, eclats: 180 },
    prerequisiteQuests: ["appel_ocean"],
  },
];

/** Quêtes journalières par zone */
const DAILY_ZONES: { zoneId: string; name: string }[] = [
  { zoneId: "vallee_eveils", name: "Chasse Vallée" },
  { zoneId: "foret_lumina", name: "Chasse Forêt" },
  { zoneId: "desert_umbra", name: "Chasse Désert" },
  { zoneId: "cotes_brume", name: "Chasse Côtes" },
  { zoneId: "grottes_maree", name: "Chasse Grottes" },
  { zoneId: "recif_abyssal", name: "Chasse Récif" },
  { zoneId: "ile_tempete", name: "Chasse Tempête" },
  { zoneId: "citadelle_stellaire", name: "Chasse Citadelle" },
  { zoneId: "sanctuaire_marins", name: "Chasse Sanctuaire" },
  { zoneId: "profondeurs_nereides", name: "Chasse Abysses" },
];

const DAILY_EXPANSION_QUESTS: QuestDefinition[] = DAILY_ZONES.map(({ zoneId, name }, index) => ({
  id: `daily_${zoneId}`,
  name,
  description: "Éliminez des monstres de la zone pour des récompenses bonus.",
  type: "daily",
  levelRequired: 5 + index * 8,
  zoneId,
  giverNpcId: giverForZone(zoneId),
  objectives: [
    {
      type: "kill",
      targetId: "any",
      count: 6 + (index % 3) * 2,
      description: `Éliminer ${6 + (index % 3) * 2} monstres`,
    },
  ],
  rewards: {
    xp: 200 + index * 80,
    eclats: 80 + index * 35,
  },
}));

/** Quêtes guilde */
const GUILD_QUESTS: QuestDefinition[] = [
  {
    id: "guilde_premiers_refus",
    name: "Premiers Refus",
    description: "La guilde teste votre loyauté avec une mission simple.",
    type: "guild",
    levelRequired: 15,
    zoneId: "port_nebula",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "any", count: 15, description: "Éliminer 15 monstres pour la guilde" },
    ],
    rewards: { xp: 500, eclats: 250 },
  },
  {
    id: "guilde_donjon_groupe",
    name: "Raid de Guilde",
    description: "Vainquez un boss de donjon en groupe pour la guilde.",
    type: "guild",
    levelRequired: 40,
    zoneId: "citadelle_stellaire",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_prison_ether", count: 1, description: "Vaincre le Gardien de la Prison d'Éther" },
    ],
    rewards: { xp: 2000, eclats: 800 },
    prerequisiteQuests: ["guilde_premiers_refus"],
  },
  {
    id: "guilde_champion",
    name: "Champion de Guilde",
    description: "Affrontez les champions de l'arène au nom de votre guilde.",
    type: "guild",
    levelRequired: 55,
    zoneId: "arene_pvp",
    giverNpcId: "chef_guilde",
    objectives: [
      { type: "kill", targetId: "boss_fosse_champions", count: 1, description: "Vaincre le Gardien de la Fosse des Champions" },
    ],
    rewards: { xp: 3500, eclats: 1500, items: [{ itemId: "coeur_nexus", quantity: 1 }] },
    prerequisiteQuests: ["guilde_donjon_groupe"],
  },
];

export const EXPANSION_QUESTS_V31: QuestDefinition[] = [
  ...DUNGEON_EXPANSION_QUESTS,
  ...MAIN_CITADEL_CHAIN,
  ...ENDGAME_MILESTONE_QUESTS,
  ...SIDE_EXPANSION_QUESTS,
  ...CRAFT_QUESTS,
  ...DAILY_EXPANSION_QUESTS,
  ...GUILD_QUESTS,
];
