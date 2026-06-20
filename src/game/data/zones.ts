/**
 * Zones du monde de Terreval
 */

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
    dungeons: ["ruines_corrompues"],
    resources: ["herbe_eveil", "minerai_cuivre"],
    isPvP: false,
    icon: "🏔️",
  },
  {
    id: "port_nebula",
    name: "Port de Nébula",
    description: "Hub commercial animé. Marché, guilde, banque et téléporteurs.",
    levelRange: [1, 60],
    x: 3, y: 8,
    connections: ["vallee_eveils", "foret_lumina", "arene_pvp"],
    npcs: ["banquier", "chef_guilde", "teleporteur", "marchand_general"],
    monsters: [],
    dungeons: [],
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
    dungeons: ["sanctuaire_lumina", "temple_oublie"],
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
    dungeons: ["pyramide_ombres", "labyrinthe_sable"],
    resources: ["sable_ether", "cactus_ombre"],
    isPvP: true,
    icon: "🏜️",
  },
  {
    id: "citadelle_stellaire",
    name: "Citadelle Stellaire",
    description: "Ancienne forteresse flottante. Terre des boss et du contenu endgame.",
    levelRange: [40, 60],
    x: 8, y: 2,
    connections: ["desert_umbra"],
    npcs: ["archimage_stellaire", "forgeron_maitre"],
    monsters: ["golem_stellaire"],
    dungeons: ["nexus_aether", "tour_infinie"],
    resources: ["cristal_pur", "ether_condense"],
    isPvP: true,
    icon: "🏰",
  },
  {
    id: "arene_pvp",
    name: "Arène des Éveilleurs",
    description: "Combattez d'autres joueurs en 1v1, 2v2 ou 3v3.",
    levelRange: [10, 60],
    x: 3, y: 6,
    connections: ["port_nebula"],
    npcs: ["maitre_arene"],
    monsters: [],
    dungeons: [],
    resources: [],
    isPvP: true,
    icon: "⚔️",
  },
];

export function getZoneById(id: string): ZoneDefinition | undefined {
  return ZONES.find((z) => z.id === id);
}
