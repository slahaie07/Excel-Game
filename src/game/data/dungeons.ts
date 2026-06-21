import { EXPANSION_DUNGEONS_V30 } from "./expansionV30";

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

  // v2.4 — 18 donjons additionnels (30 au total)
  {
    id: "caverne_cristaux", name: "Caverne de Cristaux", description: "Grottes scintillantes infestées de graines d'ombre.",
    zoneId: "vallee_eveils", levelRequired: 6, rooms: 4, bossId: "gardien_caverne", icon: "💎",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [["graine_ombre", "graine_ombre"], ["wisp_sauvage", "graine_ombre"], ["loup_cristal"], ["gardien_caverne"]],
    rewards: { xp: 200, eclats: 100, items: [{ itemId: "cristal_caverne", chance: 0.35, quantity: 1 }] },
  },
  {
    id: "mine_abandonnee", name: "Mine Abandonnée", description: "Galerie effondrée hantée par les esprits des mineurs.",
    zoneId: "vallee_eveils", levelRequired: 9, rooms: 5, bossId: "contremaitre_ombre", icon: "⛏️",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [["graine_ombre", "loup_cristal"], ["wisp_sauvage", "wisp_sauvage"], ["loup_cristal", "graine_ombre"], ["gardien_ruines"], ["contremaitre_ombre"]],
    rewards: { xp: 280, eclats: 140, items: [{ itemId: "minerai_ombre", chance: 0.3, quantity: 1 }] },
  },
  {
    id: "sanctuaire_wisp", name: "Sanctuaire des Wisps", description: "Clairière sacrée gardée par un esprit ancien.",
    zoneId: "foret_lumina", levelRequired: 11, rooms: 5, bossId: "wisp_ancien", icon: "✨",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [["fee_brume"], ["fee_brume", "treant_corrompu"], ["wisp_sauvage", "fee_brume"], ["treant_corrompu"], ["wisp_ancien"]],
    rewards: { xp: 320, eclats: 160, items: [{ itemId: "essence_wisp", chance: 0.4, quantity: 1 }] },
  },
  {
    id: "bosquet_maudit", name: "Bosquet Maudit", description: "Forêt corrompue au cœur de Lumina.",
    zoneId: "foret_lumina", levelRequired: 13, rooms: 6, bossId: "treant_maudit", icon: "🌲",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["treant_corrompu"], ["treant_corrompu", "fee_brume"], ["fee_brume", "fee_brume"], ["treant_corrompu", "treant_corrompu"], ["fee_brume", "treant_corrompu"], ["treant_maudit"]],
    rewards: { xp: 380, eclats: 190, items: [{ itemId: "coeur_treant", chance: 0.25, quantity: 1 }] },
  },
  {
    id: "clairiere_fees", name: "Clairière des Fées", description: "Royaume féerique tombé sous l'Ombre.",
    zoneId: "foret_lumina", levelRequired: 17, rooms: 7, bossId: "reine_brume", icon: "🧚",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["fee_brume", "fee_brume"], ["treant_corrompu", "fee_brume"], ["fee_brume"], ["fee_brume", "fee_brume", "treant_corrompu"], ["treant_corrompu", "fee_brume"], ["fee_brume", "fee_brume"], ["reine_brume"]],
    rewards: { xp: 450, eclats: 225, items: [{ itemId: "couronne_brume", chance: 0.12, quantity: 1 }] },
  },
  {
    id: "crypte_phare", name: "Crypte du Phare", description: "Sous-sols du phare brumeux.",
    zoneId: "cotes_brume", levelRequired: 13, rooms: 5, bossId: "gardien_phare", icon: "🗼",
    groupSize: { min: 1, max: 4 },
    roomMonsters: [["meduse_brume", "crabe_ether"], ["meduse_brume"], ["crabe_ether", "crabe_ether"], ["meduse_brume", "crabe_ether"], ["gardien_phare"]],
    rewards: { xp: 340, eclats: 170, items: [{ itemId: "lentille_phare", chance: 0.3, quantity: 1 }] },
  },
  {
    id: "entrepot_spectres", name: "Entrepôt des Spectres", description: "Dock hanté du port de Nébula.",
    zoneId: "port_nebula", levelRequired: 18, rooms: 6, bossId: "spectre_corsaire", icon: "👻",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["wisp_sauvage", "wisp_sauvage"], ["graine_ombre", "wisp_sauvage"], ["loup_cristal"], ["wisp_sauvage", "graine_ombre"], ["loup_cristal", "wisp_sauvage"], ["spectre_corsaire"]],
    rewards: { xp: 420, eclats: 210, items: [{ itemId: "sabre_corsaire", chance: 0.15, quantity: 1 }] },
  },
  {
    id: "bassin_maree", name: "Bassin de Marée", description: "Cuvette géante aux marées imprévisibles.",
    zoneId: "grottes_maree", levelRequired: 20, rooms: 6, bossId: "matriarche_maree", icon: "🌊",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["sanglier_marin"], ["crab_golem", "lampe_abyssale"], ["lampe_abyssale"], ["sanglier_marin", "crab_golem"], ["crab_golem", "crab_golem"], ["matriarche_maree"]],
    rewards: { xp: 480, eclats: 240, items: [{ itemId: "nacre_matriarche", chance: 0.25, quantity: 1 }] },
  },
  {
    id: "nid_kraken", name: "Nid du Kraken", description: "Antre du kraken juvénile.",
    zoneId: "recif_abyssal", levelRequired: 26, rooms: 7, bossId: "kraken_jeune", icon: "🦑",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["requin_ether"], ["pieuvre_ombre", "requin_ether"], ["requin_ether", "requin_ether"], ["pieuvre_ombre"], ["pieuvre_ombre", "requin_ether"], ["requin_ether", "pieuvre_ombre"], ["kraken_jeune"]],
    rewards: { xp: 620, eclats: 310, items: [{ itemId: "tentacule_kraken", chance: 0.3, quantity: 1 }] },
  },
  {
    id: "oasis_mirage", name: "Oasis du Mirage", description: "Illusion mortelle au cœur du désert.",
    zoneId: "desert_umbra", levelRequired: 28, rooms: 8, bossId: "mirage_sable", icon: "🏜️",
    groupSize: { min: 2, max: 4 },
    roomMonsters: [["scorpion_ether", "scorpion_ether"], ["scorpion_ether"], ["scorpion_ether", "scorpion_ether"], ["scorpion_ether", "scorpion_ether", "scorpion_ether"], ["scorpion_ether"], ["scorpion_ether", "scorpion_ether"], ["mirage_sable"]],
    rewards: { xp: 700, eclats: 350, items: [{ itemId: "relique_mirage", chance: 0.1, quantity: 1 }] },
  },
  {
    id: "fosse_requins", name: "Fosse aux Requins", description: "Carnage sous les eaux du récif.",
    zoneId: "recif_abyssal", levelRequired: 30, rooms: 7, bossId: "alpha_requin", icon: "🦈",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [["requin_ether", "requin_ether"], ["requin_ether"], ["pieuvre_ombre", "requin_ether"], ["requin_ether", "requin_ether"], ["pieuvre_ombre", "pieuvre_ombre"], ["requin_ether", "pieuvre_ombre"], ["alpha_requin"]],
    rewards: { xp: 750, eclats: 375, items: [{ itemId: "dent_alpha", chance: 0.22, quantity: 1 }] },
  },
  {
    id: "catacombes_umbra", name: "Catacombes d'Umbra", description: "Sépulcres nécromantiques sous les dunes.",
    zoneId: "desert_umbra", levelRequired: 32, rooms: 9, bossId: "lich_catacombes", icon: "💀",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [["scorpion_ether"], ["scorpion_ether", "scorpion_ether"], ["event_ombre_majeur"], ["scorpion_ether", "scorpion_ether"], ["event_ombre_majeur", "scorpion_ether"], ["scorpion_ether"], ["event_ombre_majeur"], ["scorpion_ether", "scorpion_ether"], ["lich_catacombes"]],
    rewards: { xp: 820, eclats: 410, items: [{ itemId: "phylactere_umbra", chance: 0.08, quantity: 1 }] },
  },
  {
    id: "pic_vent", name: "Pic du Vent", description: "Sommet battu par la tempête éternelle.",
    zoneId: "ile_tempete", levelRequired: 36, rooms: 8, bossId: "colosse_tempete", icon: "⛰️",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [["elemental_tempete"], ["harpy_stellaire", "elemental_tempete"], ["elemental_tempete", "elemental_tempete"], ["harpy_stellaire"], ["harpy_stellaire", "elemental_tempete"], ["elemental_tempete", "harpy_stellaire"], ["harpy_stellaire", "harpy_stellaire"], ["colosse_tempete"]],
    rewards: { xp: 920, eclats: 460, items: [{ itemId: "noyau_tempete", chance: 0.2, quantity: 1 }] },
  },
  {
    id: "cite_fractale", name: "Cité Fractale", description: "Ruines dimensionnelles de la citadelle.",
    zoneId: "citadelle_stellaire", levelRequired: 42, rooms: 9, bossId: "disciple_fractal", icon: "🔷",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [["golem_stellaire"], ["golem_stellaire", "golem_stellaire"], ["event_cristal_ancien"], ["golem_stellaire", "golem_stellaire"], ["golem_stellaire"], ["event_cristal_ancien", "golem_stellaire"], ["golem_stellaire", "golem_stellaire"], ["golem_stellaire"], ["disciple_fractal"]],
    rewards: { xp: 1100, eclats: 550, items: [{ itemId: "fragment_fractal", chance: 0.35, quantity: 1 }] },
  },
  {
    id: "crypte_oracles", name: "Crypte des Oracles", description: "Chambres prophétiques du sanctuaire.",
    zoneId: "sanctuaire_marins", levelRequired: 44, rooms: 9, bossId: "prophete_marin", icon: "📜",
    groupSize: { min: 3, max: 4 },
    roomMonsters: [["pretre_corail"], ["gardien_marin", "pretre_corail"], ["pretre_corail", "pretre_corail"], ["gardien_marin"], ["gardien_marin", "pretre_corail"], ["pretre_corail"], ["gardien_marin", "gardien_marin"], ["pretre_corail", "gardien_marin"], ["prophete_marin"]],
    rewards: { xp: 1150, eclats: 575, items: [{ itemId: "parchemin_prophetie", chance: 0.12, quantity: 1 }] },
  },
  {
    id: "observatoire_stellaire", name: "Observatoire Stellaire", description: "Tour d'astronomie corrompue par le vide.",
    zoneId: "citadelle_stellaire", levelRequired: 46, rooms: 10, bossId: "astronome_void", icon: "🔭",
    groupSize: { min: 3, max: 4 },
    roomMonsters: Array(9).fill(["golem_stellaire", "golem_stellaire"]).concat([["astronome_void"]]),
    rewards: { xp: 1250, eclats: 625, items: [{ itemId: "lentille_void", chance: 0.18, quantity: 1 }] },
  },
  {
    id: "forge_eternelle", name: "Forge Éternelle", description: "Atelier magique gardé par un golem forgeard.",
    zoneId: "citadelle_stellaire", levelRequired: 52, rooms: 10, bossId: "golem_forgeard", icon: "🔨",
    groupSize: { min: 4, max: 4 },
    roomMonsters: Array(9).fill(["golem_stellaire"]).concat([["golem_forgeard"]]),
    rewards: { xp: 1600, eclats: 800, items: [{ itemId: "lame_forge_eternelle", chance: 0.06, quantity: 1 }] },
  },
  {
    id: "faille_abyssale", name: "Faille Abyssale", description: "Brèche dimensionnelle dans les profondeurs.",
    zoneId: "profondeurs_nereides", levelRequired: 62, rooms: 11, bossId: "gardien_faille", icon: "🌀",
    groupSize: { min: 4, max: 4 },
    roomMonsters: [
      ["nereide_guerriere"], ["nereide_guerriere", "pieuvre_ombre"], ["nereide_guerriere", "nereide_guerriere"],
      ["pieuvre_ombre", "pieuvre_ombre"], ["nereide_guerriere", "nereide_guerriere"], ["nereide_guerriere", "pieuvre_ombre"],
      ["nereide_guerriere", "nereide_guerriere", "nereide_guerriere"], ["pieuvre_ombre"], ["nereide_guerriere", "nereide_guerriere"],
      ["nereide_guerriere", "pieuvre_ombre", "nereide_guerriere"], ["gardien_faille"],
    ],
    rewards: { xp: 4000, eclats: 2000, items: [{ itemId: "fragment_faille", chance: 0.1, quantity: 1 }] },
  },
  ...EXPANSION_DUNGEONS_V30,
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
