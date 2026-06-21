export interface DungeonDefinition {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  levelRequired: number;
  rooms: number;
  bossId: string;
  icon: string;
  roomMonsters: string[][];
  rewards: {
    xp: number;
    eclats: number;
    items?: { itemId: string; quantity: number; chance: number }[];
  };
  groupSize: { min: number; max: number };
}

export const DUNGEONS: DungeonDefinition[] = [
  {
    id: "ruines_corrompues",
    name: "Ruines Corrompues",
    description: "Anciennes ruines infestées par les Ombres. Idéal pour un groupe de 2-4.",
    zoneId: "vallee_eveils",
    levelRequired: 8,
    rooms: 5,
    bossId: "gardien_ruines",
    icon: "🏚️",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [
      ["graine_ombre", "graine_ombre"],
      ["wisp_sauvage", "graine_ombre"],
      ["loup_cristal"],
      ["wisp_sauvage", "loup_cristal"],
      ["gardien_ruines"],
    ],
    rewards: { xp: 300, eclats: 150, items: [{ itemId: "cristal_eveil", chance: 0.3, quantity: 1 }] },
  },
  {
    id: "sanctuaire_lumina",
    name: "Sanctuaire de Lumina",
    description: "Sanctuaire sacré corrompu. Requiert niveau 15+.",
    zoneId: "foret_lumina",
    levelRequired: 15,
    rooms: 8,
    bossId: "champion_lumina",
    icon: "⛪",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [
      ["treant_corrompu"],
      ["treant_corrompu", "fee_brume"],
      ["fee_brume", "fee_brume"],
      ["treant_corrompu", "treant_corrompu"],
      ["fee_brume", "treant_corrompu"],
      ["fee_brume", "fee_brume", "treant_corrompu"],
      ["treant_corrompu", "fee_brume"],
      ["champion_lumina"],
    ],
    rewards: { xp: 800, eclats: 400, items: [{ itemId: "armure_lumina", chance: 0.1, quantity: 1 }] },
  },
  {
    id: "pyramide_ombres",
    name: "Pyramide des Ombres",
    description: "Labyrinthe mortel du désert d'Umbra.",
    zoneId: "desert_umbra",
    levelRequired: 30,
    rooms: 10,
    bossId: "sphinx_ombres",
    icon: "🔺",
    groupSize: { min: 3, max: 4 },
    roomMonsters: Array(9).fill(["scorpion_ether", "scorpion_ether"]).concat([["sphinx_ombres"]]),
    rewards: { xp: 2000, eclats: 1000, items: [{ itemId: "cristal_pur", chance: 0.5, quantity: 2 }] },
  },
  {
    id: "nexus_aether",
    name: "Nexus d'Aether",
    description: "Cœur de la Citadelle Stellaire. Le défi ultime.",
    zoneId: "citadelle_stellaire",
    levelRequired: 50,
    rooms: 15,
    bossId: "dragon_aether",
    icon: "🌀",
    groupSize: { min: 4, max: 4 },
    roomMonsters: Array(14).fill(["golem_stellaire", "golem_stellaire"]).concat([["dragon_aether"]]),
    rewards: { xp: 10000, eclats: 5000, items: [{ itemId: "couronne_aether", chance: 0.05, quantity: 1 }] },
  },
  {
    id: "tour_infinie",
    name: "Tour Infinie",
    description: "Étages sans fin. Plus vous montez, plus c'est difficile.",
    zoneId: "citadelle_stellaire",
    levelRequired: 40,
    rooms: 999,
    bossId: "random",
    icon: "🗼",
    groupSize: { min: 1, max: 1 },
    roomMonsters: [["golem_stellaire"]],
    rewards: { xp: 100, eclats: 50 },
  },
  {
    id: "temple_oublie",
    name: "Temple Oublié",
    description: "Sanctuaire englouti sous la forêt de Lumina.",
    zoneId: "foret_lumina",
    levelRequired: 14,
    rooms: 6,
    bossId: "gardien_temple",
    icon: "🏛️",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [
      ["treant_corrompu"],
      ["fee_brume", "treant_corrompu"],
      ["fee_brume", "fee_brume"],
      ["treant_corrompu", "treant_corrompu"],
      ["fee_brume", "treant_corrompu"],
      ["gardien_temple"],
    ],
    rewards: { xp: 500, eclats: 250, items: [{ itemId: "relique_temple", chance: 0.4, quantity: 1 }] },
  },
  {
    id: "labyrinthe_sable",
    name: "Labyrinthe de Sable",
    description: "Dédale mortel sous les dunes d'Umbra.",
    zoneId: "desert_umbra",
    levelRequired: 28,
    rooms: 8,
    bossId: "scorpion_royal",
    icon: "🏜️",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [
      ["scorpion_ether", "scorpion_ether"],
      ["scorpion_ether"],
      ["scorpion_ether", "scorpion_ether"],
      ["scorpion_ether", "scorpion_ether", "scorpion_ether"],
      ["scorpion_ether", "scorpion_ether"],
      ["scorpion_ether"],
      ["scorpion_royal"],
    ],
    rewards: { xp: 1200, eclats: 600, items: [{ itemId: "carapace_royale", chance: 0.2, quantity: 1 }] },
  },
  {
    id: "epave_brume",
    name: "Épave de Brume",
    description: "Navire fantôme échoué sur les côtes.",
    zoneId: "cotes_brume",
    levelRequired: 12,
    rooms: 5,
    bossId: "capitaine_epave",
    icon: "🚢",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [
      ["meduse_brume", "crabe_ether"],
      ["meduse_brume", "meduse_brume"],
      ["crabe_ether", "crabe_ether"],
      ["meduse_brume", "crabe_ether"],
      ["capitaine_epave"],
    ],
    rewards: { xp: 400, eclats: 200, items: [{ itemId: "carte_tresor", chance: 0.35, quantity: 1 }] },
  },
  {
    id: "grotte_maree",
    name: "Grotte de Marée",
    description: "Cavernes inondées aux marées changeantes.",
    zoneId: "grottes_maree",
    levelRequired: 18,
    rooms: 7,
    bossId: "crab_golem",
    icon: "🦀",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [
      ["sanglier_marin"],
      ["crab_golem", "lampe_abyssale"],
      ["lampe_abyssale", "lampe_abyssale"],
      ["sanglier_marin", "crab_golem"],
      ["crab_golem", "crab_golem"],
      ["lampe_abyssale", "sanglier_marin"],
      ["crab_golem"],
    ],
    rewards: { xp: 650, eclats: 320, items: [{ itemId: "nacre_stellaire", chance: 0.4, quantity: 2 }] },
  },
  {
    id: "forteresse_tempete",
    name: "Forteresse de la Tempête",
    description: "Citadelle aérienne battue par les vents.",
    zoneId: "ile_tempete",
    levelRequired: 35,
    rooms: 9,
    bossId: "seigneur_tempete",
    icon: "⛈️",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [
      ["elemental_tempete"],
      ["elemental_tempete", "harpy_stellaire"],
      ["harpy_stellaire", "harpy_stellaire"],
      ["elemental_tempete", "elemental_tempete"],
      ["harpy_stellaire", "elemental_tempete"],
      ["elemental_tempete", "harpy_stellaire", "harpy_stellaire"],
      ["harpy_stellaire"],
      ["elemental_tempete", "elemental_tempete"],
      ["seigneur_tempete"],
    ],
    rewards: { xp: 1800, eclats: 900, items: [{ itemId: "cape_tempete", chance: 0.1, quantity: 1 }] },
  },
  {
    id: "temple_nereides",
    name: "Temple des Néréides",
    description: "Sanctuaire englouti des anciens marins.",
    zoneId: "sanctuaire_marins",
    levelRequired: 45,
    rooms: 10,
    bossId: "reine_nereides",
    icon: "🐚",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [
      ["pretre_corail"],
      ["pretre_corail", "gardien_marin"],
      ["gardien_marin", "gardien_marin"],
      ["pretre_corail", "pretre_corail"],
      ["gardien_marin", "pretre_corail"],
      ["gardien_marin", "gardien_marin", "pretre_corail"],
      ["pretre_corail", "gardien_marin"],
      ["gardien_marin"],
      ["pretre_corail", "pretre_corail"],
      ["reine_nereides"],
    ],
    rewards: { xp: 2500, eclats: 1200, items: [{ itemId: "trident_nereide", chance: 0.08, quantity: 1 }] },
  },
  {
    id: "antre_leviathan",
    name: "Antre du Léviathan",
    description: "Abîme final de l'Archipel de Brume.",
    zoneId: "profondeurs_nereides",
    levelRequired: 70,
    rooms: 12,
    bossId: "leviathan_brume",
    icon: "🐋",
    groupSize: { min: 4, max: 4 },
    roomMonsters: [
      ["nereide_guerriere"],
      ["nereide_guerriere", "nereide_guerriere"],
      ["nereide_guerriere", "pieuvre_ombre"],
      ["nereide_guerriere", "nereide_guerriere", "pieuvre_ombre"],
      ["nereide_guerriere", "nereide_guerriere"],
      ["pieuvre_ombre", "pieuvre_ombre"],
      ["nereide_guerriere", "nereide_guerriere"],
      ["nereide_guerriere", "nereide_guerriere", "nereide_guerriere"],
      ["nereide_guerriere", "pieuvre_ombre"],
      ["nereide_guerriere", "nereide_guerriere"],
      ["leviathan_brume"],
    ],
    rewards: { xp: 12000, eclats: 6000, items: [{ itemId: "couronne_marine", chance: 0.05, quantity: 1 }] },
  },
];

export function getDungeonById(id: string): DungeonDefinition | undefined {
  return DUNGEONS.find((d) => d.id === id);
}

export function getDungeonsForZone(zoneId: string): DungeonDefinition[] {
  return DUNGEONS.filter((d) => d.zoneId === zoneId);
}

export function getRoomMonsters(dungeon: DungeonDefinition, roomIndex: number): string[] {
  if (dungeon.id === "tour_infinie") {
    const floor = roomIndex + 1;
    if (floor % 10 === 0) return ["golem_stellaire", "golem_stellaire"];
    if (floor % 5 === 0) return ["golem_stellaire"];
    return ["graine_ombre", "wisp_sauvage"];
  }
  return dungeon.roomMonsters[roomIndex] ?? [dungeon.bossId];
}
