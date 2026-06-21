/**
 * Jardin de l'Initiation — zone débutant démonstrative
 */

import type { ZoneDefinition } from "./zones";
import type { MonsterDefinition } from "./monsters";
import type { QuestDefinition } from "./quests";
import type { DungeonDefinition } from "./dungeons";

export const TUTORIAL_ZONE_ID = "jardin_initiation";
export const TUTORIAL_COMPLETE_QUEST_ID = "initiation_depart";
export const TUTORIAL_STARTER_QUEST_ID = "initiation_accueil";

export const TUTORIAL_ZONE: ZoneDefinition = {
  id: TUTORIAL_ZONE_ID,
  name: "Jardin de l'Initiation",
  description:
    "Sanctuaire paisible où chaque Éveilleur apprend combat, Flux, Élan, artisanat et exploration avant de partir vers Terreval.",
  levelRange: [1, 5],
  x: 5,
  y: 10,
  connections: ["vallee_eveils"],
  npcs: ["mentor_initiation", "herboriste_jardin", "gardien_passage"],
  monsters: ["etincelle_naissante", "mousse_vivante", "reflet_ether"],
  dungeons: ["alcove_demo"],
  resources: ["herbe_eveil"],
  isPvP: false,
  icon: "🌱",
};

export const TUTORIAL_MONSTERS: MonsterDefinition[] = [
  {
    id: "etincelle_naissante",
    name: "Étincelle Naissante",
    description: "Fragment d'Aether docile — idéal pour un premier combat.",
    level: 1,
    zoneId: TUTORIAL_ZONE_ID,
    stats: { hp: 22, ap: 4, mp: 2, damage: 4, defense: 1 },
    spells: ["morsure"],
    drops: [{ itemId: "poussiere_stellaire", chance: 0.5 }],
    xpReward: 12,
    eclatsReward: { min: 3, max: 8 },
    icon: "💫",
  },
  {
    id: "mousse_vivante",
    name: "Mousse Vivante",
    description: "Végétal animé qui enseigne la gestion des déplacements.",
    level: 2,
    zoneId: TUTORIAL_ZONE_ID,
    stats: { hp: 35, ap: 4, mp: 3, damage: 6, defense: 3 },
    spells: ["racines"],
    drops: [{ itemId: "herbe_eveil", chance: 0.4 }],
    xpReward: 18,
    eclatsReward: { min: 5, max: 10 },
    icon: "🍀",
  },
  {
    id: "reflet_ether",
    name: "Reflet d'Éther",
    description: "Mirage stellaire — un adversaire un peu plus coriace.",
    level: 3,
    zoneId: TUTORIAL_ZONE_ID,
    stats: { hp: 48, ap: 5, mp: 4, damage: 9, defense: 4 },
    spells: ["eclair_ether"],
    drops: [{ itemId: "fragment_ombre", chance: 0.3 }],
    xpReward: 28,
    eclatsReward: { min: 8, max: 14 },
    icon: "🔮",
  },
  {
    id: "echo_entrainement",
    name: "Écho d'Entraînement",
    description: "Boss — Projection magique pour tester vos sorts en donjon.",
    level: 4,
    zoneId: TUTORIAL_ZONE_ID,
    stats: { hp: 90, ap: 6, mp: 4, damage: 12, defense: 6 },
    spells: ["eclair_ether", "fracas"],
    drops: [{ itemId: "cristal_eveil", chance: 0.8 }],
    xpReward: 80,
    eclatsReward: { min: 20, max: 40 },
    icon: "👤",
    isBoss: true,
  },
];

export const TUTORIAL_DUNGEON: DungeonDefinition = {
  id: "alcove_demo",
  name: "Alcôve de Démonstration",
  description:
    "Petit donjon d'entraînement. Affrontez l'Écho d'Entraînement pour valider vos acquis.",
  zoneId: TUTORIAL_ZONE_ID,
  levelRequired: 1,
  rooms: 3,
  bossId: "echo_entrainement",
  icon: "🎓",
  groupSize: { min: 1, max: 2 },
  roomMonsters: [
    ["etincelle_naissante", "etincelle_naissante"],
    ["mousse_vivante"],
    ["echo_entrainement"],
  ],
  rewards: {
    xp: 120,
    eclats: 60,
    items: [{ itemId: "potion_vie", quantity: 5, chance: 1 }],
  },
};

export const TUTORIAL_QUESTS: QuestDefinition[] = [
  {
    id: "initiation_accueil",
    name: "L'Accueil des Cristaux",
    description: "Elena Lumeveil vous attend au cœur du jardin pour commencer votre formation.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "mentor_initiation",
    objectives: [
      {
        type: "talk",
        targetId: "mentor_initiation",
        count: 1,
        description: "Parler à Elena Lumeveil",
      },
    ],
    rewards: { xp: 30, eclats: 20 },
  },
  {
    id: "initiation_combat",
    name: "Premier Affrontement",
    description: "Touchez une créature sur la carte isométrique, puis utilisez Flux et Élan au combat.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "mentor_initiation",
    objectives: [
      {
        type: "kill",
        targetId: "etincelle_naissante",
        count: 2,
        description: "Vaincre 2 Étincelles Naissantes",
      },
    ],
    rewards: {
      xp: 50,
      eclats: 30,
      items: [{ itemId: "epee_apprenti", quantity: 1 }],
    },
    prerequisiteQuests: ["initiation_accueil"],
  },
  {
    id: "initiation_equipement",
    name: "Armer l'Éveilleur",
    description: "Ouvrez l'inventaire (sac) et équipez l'épée d'apprenti reçue.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "mentor_initiation",
    objectives: [
      {
        type: "talk",
        targetId: "mentor_initiation",
        count: 1,
        description: "Confirmer l'équipement auprès d'Elena",
      },
    ],
    rewards: { xp: 40, eclats: 25, items: [{ itemId: "tunique_debutant", quantity: 1 }] },
    prerequisiteQuests: ["initiation_combat"],
  },
  {
    id: "initiation_recolte",
    name: "Herbes du Jardin",
    description: "Théa vous montre la récolte — ramassez des herbes d'éveil dans la zone.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "herboriste_jardin",
    objectives: [
      {
        type: "talk",
        targetId: "herboriste_jardin",
        count: 1,
        description: "Parler à Théa Racineclaire",
      },
      {
        type: "collect",
        targetId: "herbe_eveil",
        count: 3,
        description: "Collecter 3 Herbes d'Éveil",
      },
    ],
    rewards: { xp: 60, eclats: 35, items: [{ itemId: "potion_vie", quantity: 3 }] },
    prerequisiteQuests: ["initiation_equipement"],
  },
  {
    id: "initiation_donjon",
    name: "L'Alcôve de Démonstration",
    description: "Entrez dans le donjon d'entraînement et vainquez l'Écho d'Entraînement.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "mentor_initiation",
    objectives: [
      {
        type: "kill",
        targetId: "echo_entrainement",
        count: 1,
        description: "Vaincre l'Écho d'Entraînement",
      },
    ],
    rewards: { xp: 100, eclats: 50 },
    prerequisiteQuests: ["initiation_recolte"],
  },
  {
    id: "initiation_depart",
    name: "Vers la Vallée",
    description: "Varen ouvre le passage vers la Vallée des Éveils — le vrai Terreval commence.",
    type: "main",
    levelRequired: 1,
    zoneId: TUTORIAL_ZONE_ID,
    giverNpcId: "gardien_passage",
    objectives: [
      {
        type: "talk",
        targetId: "gardien_passage",
        count: 1,
        description: "Obtenir la permission de Varen Porteciel",
      },
      {
        type: "explore",
        targetId: TUTORIAL_ZONE_ID,
        count: 1,
        description: "Explorer tout le Jardin de l'Initiation",
      },
    ],
    rewards: { xp: 150, eclats: 100, items: [{ itemId: "pain_eveil", quantity: 5 }] },
    prerequisiteQuests: ["initiation_donjon"],
  },
];
