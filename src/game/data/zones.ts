/**
 * Zones du monde de Terreval
 */

import { EXPANSION_DUNGEON_IDS_BY_ZONE } from "./expansionV30";
import { EXPANSION_ZONES_V40, EXPANSION_ZONE_CONNECTION_PATCHES } from "./expansionZonesV40";
import { EXPANSION_DUNGEON_IDS_BY_ZONE_V40 } from "./expansionDungeonsV40";

export interface ZoneDefinition {
  id: string;
  name: string;
  description: string;
  levelRange: [number, number];
  x: number;
  y: number;
  connections: string[];
  npcs: string[];
  monsters: string[];
  dungeons: string[];
  resources: string[];
  isPvP: boolean;
  icon: string;
}

export const ZONES: ZoneDefinition[] = [
  {
    id: "vallee_eveils",
    name: "Vallée des Éveils",
    description: "Point de départ des Éveilleurs. Ruines anciennes baignées de lumière cristalline.",
    levelRange: [1, 10],
    x: 5, y: 8,
    connections: ["foret_lumina", "port_nebula"],
    npcs: ["maitre_eveil", "marchand_debut", "forgeron_vallee"],
    monsters: ["graine_ombre", "wisp_sauvage", "loup_cristal"],
    dungeons: ["ruines_corrompues", "caverne_cristaux", "mine_abandonnee"],
    resources: ["herbe_eveil", "minerai_cuivre"],
    isPvP: false,
    icon: "🏔️",
  },
  {
    id: "port_nebula",
    name: "Port de Nébula",
    description: "Hub commercial animé. Marché, guilde, banque et téléporteurs.",
    levelRange: [1, 200],
    x: 3, y: 8,
    connections: ["vallee_eveils", "foret_lumina", "arene_pvp", "cotes_brume"],
    npcs: ["banquier", "chef_guilde", "teleporteur", "marchand_general"],
    monsters: [],
    dungeons: ["entrepot_spectres"],
    resources: [],
    isPvP: false,
    icon: "⚓",
  },
  {
    id: "foret_lumina",
    name: "Forêt de Lumina",
    description: "Forêt enchantée où l'Ordre de Lumina a établi son sanctuaire.",
    levelRange: [10, 25],
    x: 5, y: 5,
    connections: ["vallee_eveils", "port_nebula", "desert_umbra"],
    npcs: ["pretre_lumina", "alchimiste_foret", "dresseur_compagnons"],
    monsters: ["treant_corrompu", "fee_brume"],
    dungeons: ["sanctuaire_lumina", "temple_oublie", "sanctuaire_wisp", "bosquet_maudit", "clairiere_fees"],
    resources: ["bois_lumina", "fleur_moonlight"],
    isPvP: false,
    icon: "🌲",
  },
  {
    id: "desert_umbra",
    name: "Désert d'Umbra",
    description: "Désert impitoyable où règne le Conclave d'Umbra. Dangers à chaque pas.",
    levelRange: [25, 40],
    x: 8, y: 5,
    connections: ["foret_lumina", "citadelle_stellaire"],
    npcs: ["marchand_umbra", "guide_desert"],
    monsters: ["scorpion_ether"],
    dungeons: ["pyramide_ombres", "labyrinthe_sable", "oasis_mirage", "catacombes_umbra"],
    resources: ["sable_ether", "cactus_ombre"],
    isPvP: true,
    icon: "🏜️",
  },
  {
    id: "citadelle_stellaire",
    name: "Citadelle Stellaire",
    description: "Ancienne forteresse flottante. Terre des boss et du contenu endgame.",
    levelRange: [40, 200],
    x: 8, y: 2,
    connections: ["desert_umbra", "sanctuaire_marins"],
    npcs: ["archimage_stellaire", "forgeron_maitre"],
    monsters: ["golem_stellaire"],
    dungeons: ["nexus_aether", "tour_infinie", "cite_fractale", "observatoire_stellaire", "forge_eternelle"],
    resources: ["cristal_pur", "ether_condense"],
    isPvP: true,
    icon: "🏰",
  },
  {
    id: "arene_pvp",
    name: "Arène des Éveilleurs",
    description: "Combattez d'autres joueurs en 1v1, 2v2 ou 3v3.",
    levelRange: [10, 200],
    x: 3, y: 6,
    connections: ["port_nebula"],
    npcs: ["maitre_arene"],
    monsters: [],
    dungeons: [],
    resources: [],
    isPvP: true,
    icon: "⚔️",
  },
  // Archipel de Brume — région v2.2 (style sous-zones Dofus Touch)
  {
    id: "cotes_brume",
    name: "Côtes de Brume",
    description: "Falaises brumeuses bordant l'océan d'Éther. Première étape vers l'Archipel.",
    levelRange: [12, 22],
    x: 2, y: 7,
    connections: ["port_nebula", "grottes_maree"],
    npcs: ["pecheur_brume", "marchand_marin"],
    monsters: ["meduse_brume", "crabe_ether"],
    dungeons: ["epave_brume", "crypte_phare"],
    resources: ["algue_lumineuse", "coquille_perle"],
    isPvP: false,
    icon: "🌊",
  },
  {
    id: "grottes_maree",
    name: "Grottes de Marée",
    description: "Cavernes inondées où la marée monte et descend au rythme des Cristaux.",
    levelRange: [18, 30],
    x: 1, y: 6,
    connections: ["cotes_brume", "recif_abyssal"],
    npcs: ["explorateur_grotte"],
    monsters: ["crab_golem", "sanglier_marin", "lampe_abyssale"],
    dungeons: ["grotte_maree", "bassin_maree"],
    resources: ["corail_vivant", "nacre_stellaire"],
    isPvP: false,
    icon: "🦀",
  },
  {
    id: "recif_abyssal",
    name: "Récif Abyssal",
    description: "Récif corallien hanté par des prédateurs marins corrompus.",
    levelRange: [25, 38],
    x: 1, y: 4,
    connections: ["grottes_maree", "ile_tempete"],
    npcs: ["plongeur_ether"],
    monsters: ["requin_ether", "pieuvre_ombre"],
    dungeons: ["nid_kraken", "fosse_requins"],
    resources: ["ecaille_requin", "perle_abysse"],
    isPvP: false,
    icon: "🪸",
  },
  {
    id: "ile_tempete",
    name: "Île de la Tempête",
    description: "Île battue par les vents stellaires. Élémentaires et harpies y nichent.",
    levelRange: [32, 48],
    x: 2, y: 3,
    connections: ["recif_abyssal", "sanctuaire_marins"],
    npcs: ["capitaine_tempete"],
    monsters: ["elemental_tempete", "harpy_stellaire"],
    dungeons: ["forteresse_tempete", "pic_vent"],
    resources: ["essence_tempete"],
    isPvP: true,
    icon: "⛈️",
  },
  {
    id: "sanctuaire_marins",
    name: "Sanctuaire des Marins",
    description: "Temple englouti dédié aux anciens navigateurs d'Éther.",
    levelRange: [40, 58],
    x: 1, y: 2,
    connections: ["ile_tempete", "profondeurs_nereides", "citadelle_stellaire"],
    npcs: ["oracles_marins", "forgeron_corail"],
    monsters: ["pretre_corail", "gardien_marin"],
    dungeons: ["temple_nereides", "crypte_oracles"],
    resources: ["cristal_corail"],
    isPvP: false,
    icon: "🐚",
  },
  {
    id: "profondeurs_nereides",
    name: "Profondeurs des Néréides",
    description: "Abîmes où les Néréides gardent les secrets de l'océan stellaire.",
    levelRange: [50, 200],
    x: 3, y: 1,
    connections: ["sanctuaire_marins"],
    npcs: ["nereide_heralde"],
    monsters: ["nereide_guerriere", "leviathan_brume"],
    dungeons: ["antre_leviathan", "faille_abyssale"],
    resources: ["larme_nereide"],
    isPvP: true,
    icon: "🧜",
  },
  // v4.0 — 4 régions continentales (+12 zones)
  ...EXPANSION_ZONES_V40,
];

for (const zone of ZONES) {
  const extra = EXPANSION_DUNGEON_IDS_BY_ZONE[zone.id];
  if (extra?.length) zone.dungeons.push(...extra);
  const extraV40 = EXPANSION_DUNGEON_IDS_BY_ZONE_V40[zone.id];
  if (extraV40?.length) zone.dungeons.push(...extraV40);
}

for (const [zoneId, connections] of Object.entries(EXPANSION_ZONE_CONNECTION_PATCHES)) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) continue;
  for (const conn of connections) {
    if (!zone.connections.includes(conn)) zone.connections.push(conn);
  }
}

export function getZoneById(id: string): ZoneDefinition | undefined {
  return ZONES.find((z) => z.id === id);
}
