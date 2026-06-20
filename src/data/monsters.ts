/** Monstres, familiers et créatures */

export type MonsterFamily =
  | "bête"
  | "humanoïde"
  | "élémentaire"
  | "mort-vivant"
  | "démon"
  | "dragon";

export interface Monster {
  id: string;
  name: string;
  family: MonsterFamily;
  level: number;
  hp: number;
  pa: number;
  pm: number;
  force: number;
  intelligence: number;
  agilite: number;
  initiative: number;
  dommages: number;
  resistance: number;
  xpReward: number;
  kamasReward: [number, number];
  lootTable: string[];
  spells: string[];
  zones: string[];
  icon: string;
  color: number;
}

export const MONSTERS: Record<string, Monster> = {
  slime_lumineux: {
    id: "slime_lumineux", name: "Slime Lumineux", family: "bête", level: 1,
    hp: 30, pa: 4, pm: 2, force: 5, intelligence: 3, agilite: 5, initiative: 50,
    dommages: 3, resistance: 2, xpReward: 15, kamasReward: [2, 8],
    lootTable: ["gelée_lumineuse", "fragment_ether"],
    spells: [], zones: ["lumineth_village"], icon: "💧", color: 0xf4d03f,
  },
  rat_des_champs: {
    id: "rat_des_champs", name: "Rat des Champs", family: "bête", level: 3,
    hp: 45, pa: 5, pm: 3, force: 8, intelligence: 2, agilite: 12, initiative: 80,
    dommages: 6, resistance: 3, xpReward: 25, kamasReward: [5, 15],
    lootTable: ["queue_rat", "fourrure"],
    spells: [], zones: ["lumineth_village", "whispering_forest"], icon: "🐀", color: 0x8b4513,
  },
  gobelin_maraudeur: {
    id: "gobelin_maraudeur", name: "Gobelin Maraudeur", family: "humanoïde", level: 8,
    hp: 80, pa: 5, pm: 3, force: 15, intelligence: 8, agilite: 14, initiative: 100,
    dommages: 12, resistance: 8, xpReward: 60, kamasReward: [15, 40],
    lootTable: ["dague_rouillée", "bourse_gobelin", "oreille_gobelin"],
    spells: ["coup_sournois"], zones: ["whispering_forest"], icon: "👺", color: 0x27ae60,
  },
  loup_des_bois: {
    id: "loup_des_bois", name: "Loup des Bois", family: "bête", level: 12,
    hp: 110, pa: 6, pm: 4, force: 20, intelligence: 5, agilite: 22, initiative: 130,
    dommages: 18, resistance: 10, xpReward: 90, kamasReward: [20, 50],
    lootTable: ["fourrure_loup", "croc", "viande"],
    spells: ["charge"], zones: ["whispering_forest"], icon: "🐺", color: 0x566573,
  },
  araignee_venimeuse: {
    id: "araignee_venimeuse", name: "Araignée Venimeuse", family: "bête", level: 18,
    hp: 140, pa: 5, pm: 3, force: 18, intelligence: 12, agilite: 20, initiative: 120,
    dommages: 15, resistance: 12, xpReward: 130, kamasReward: [30, 70],
    lootTable: ["soie_araignee", "venin", "oeil_araignee"],
    spells: ["fleche_empoisonnee"], zones: ["whispering_forest", "crystal_caves"], icon: "🕷️", color: 0x1a1a2e,
  },
  golem_de_cristal: {
    id: "golem_de_cristal", name: "Golem de Cristal", family: "élémentaire", level: 25,
    hp: 250, pa: 4, pm: 2, force: 30, intelligence: 15, agilite: 5, initiative: 60,
    dommages: 25, resistance: 30, xpReward: 200, kamasReward: [50, 120],
    lootTable: ["cristal_brut", "fragment_golem", "pierre_precieuse"],
    spells: ["muraille"], zones: ["crystal_caves"], icon: "💎", color: 0x85c1e9,
  },
  spectre_mineur: {
    id: "spectre_mineur", name: "Spectre Mineur", family: "mort-vivant", level: 30,
    hp: 120, pa: 6, pm: 4, force: 10, intelligence: 35, agilite: 18, initiative: 140,
    dommages: 20, resistance: 15, xpReward: 250, kamasReward: [40, 100],
    lootTable: ["essence_spectrale", "tissu_maudit"],
    spells: ["eclair_arcane", "invisibilite"], zones: ["crystal_caves", "ember_ruins"], icon: "👻", color: 0x9b59b6,
  },
  salamandre: {
    id: "salamandre", name: "Salamandre", family: "élémentaire", level: 35,
    hp: 180, pa: 6, pm: 3, force: 22, intelligence: 30, agilite: 15, initiative: 110,
    dommages: 28, resistance: 20, xpReward: 320, kamasReward: [60, 150],
    lootTable: ["ecaille_feu", "coeur_salamandre"],
    spells: ["boule_feu"], zones: ["ember_ruins"], icon: "🦎", color: 0xe74c3c,
  },
  chevalier_corrompu: {
    id: "chevalier_corrompu", name: "Chevalier Corrompu", family: "mort-vivant", level: 45,
    hp: 350, pa: 6, pm: 3, force: 40, intelligence: 10, agilite: 12, initiative: 90,
    dommages: 35, resistance: 35, xpReward: 500, kamasReward: [100, 250],
    lootTable: ["armure_corrompue", "epee_maudite", "parchemin_sombre"],
    spells: ["coup_bouclier", "provocation"], zones: ["ember_ruins", "sky_temple"], icon: "⚔️", color: 0x2c3e50,
  },
  gardien_celeste: {
    id: "gardien_celeste", name: "Gardien Céleste", family: "élémentaire", level: 55,
    hp: 400, pa: 6, pm: 3, force: 35, intelligence: 40, agilite: 20, initiative: 120,
    dommages: 30, resistance: 40, xpReward: 700, kamasReward: [150, 350],
    lootTable: ["plume_celeste", "relique_aurélia"],
    spells: ["barriere_sacree", "eclair_arcane"], zones: ["sky_temple"], icon: "🪽", color: 0xf1c40f,
  },
  echo_de_l_abime: {
    id: "echo_de_l_abime", name: "Écho de l'Abîme", family: "démon", level: 70,
    hp: 500, pa: 7, pm: 4, force: 45, intelligence: 50, agilite: 30, initiative: 160,
    dommages: 45, resistance: 45, xpReward: 1200, kamasReward: [300, 600],
    lootTable: ["fragment_faille", "essence_echo", "artefact_legendaire"],
    spells: ["meteore", "execution", "tempete"], zones: ["abyss_gate"], icon: "👁️", color: 0x6c3483,
  },
  dragonnet_ether: {
    id: "dragonnet_ether", name: "Dragonnet d'Éther", family: "dragon", level: 80,
    hp: 800, pa: 7, pm: 4, force: 55, intelligence: 55, agilite: 25, initiative: 140,
    dommages: 55, resistance: 50, xpReward: 2500, kamasReward: [500, 1000],
    lootTable: ["ecaille_dragon", "oeuf_dragon", "coeur_ether"],
    spells: ["boule_feu", "tempete_glace", "meteore"], zones: ["abyss_gate"], icon: "🐉", color: 0x8e44ad,
  },
};

export function getMonstersForZone(zoneId: string): Monster[] {
  return Object.values(MONSTERS).filter((m) => m.zones.includes(zoneId));
}

export function getRandomEncounter(zoneId: string, playerLevel: number): Monster[] {
  const candidates = getMonstersForZone(zoneId).filter(
    (m) => m.level <= playerLevel + 5 && m.level >= playerLevel - 3,
  );
  if (candidates.length === 0) {
    const fallback = MONSTERS.slime_lumineux;
    return fallback ? [fallback] : [];
  }
  const count = Math.min(3, Math.max(1, Math.floor(Math.random() * 2) + 1));
  const group: Monster[] = [];
  for (let i = 0; i < count; i++) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) group.push({ ...pick });
  }
  return group;
}
