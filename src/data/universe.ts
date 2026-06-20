/** Univers Étheris — Lore et métadonnées du monde */

export const UNIVERSE = {
  name: "Étheris",
  subtitle: "Chroniques d'Étheris",
  tagline: "Le monde brisé attend ses héros",
  lore: `Il y a mille cycles, le Continent d'Étheris était uni sous la Couronne d'Aurélia.
La Grande Faille a fendu le ciel et libéré les Échos — entités élémentaires corrompues.
Cinq cités-refuges subsistent, reliées par des routes dangereuses.
Les Aventuriers de l'Étherium, guilde des héros, parcourent ces terres pour restaurer l'équilibre.`,
  factions: [
    { id: "lumineth", name: "Lumineth", element: "Lumière", color: "#f4d03f" },
    { id: "umbra", name: "Umbra", element: "Ombre", color: "#6c3483" },
    { id: "pyros", name: "Pyros", element: "Feu", color: "#e74c3c" },
    { id: "aqua", name: "Aqua", element: "Eau", color: "#3498db" },
    { id: "terra", name: "Terra", element: "Terre", color: "#27ae60" },
  ],
  startingZone: "lumineth_village",
} as const;

export type FactionId = (typeof UNIVERSE.factions)[number]["id"];
export type ZoneId =
  | "lumineth_village"
  | "whispering_forest"
  | "crystal_caves"
  | "ember_ruins"
  | "sky_temple"
  | "abyss_gate";

export interface Zone {
  id: ZoneId;
  name: string;
  description: string;
  levelRange: [number, number];
  faction?: FactionId;
  connections: ZoneId[];
  mapWidth: number;
  mapHeight: number;
}

export const ZONES: Record<ZoneId, Zone> = {
  lumineth_village: {
    id: "lumineth_village",
    name: "Village de Lumineth",
    description: "Cité-refuge baignée de lumière dorée. Point de départ des aventuriers.",
    levelRange: [1, 10],
    faction: "lumineth",
    connections: ["whispering_forest"],
    mapWidth: 20,
    mapHeight: 15,
  },
  whispering_forest: {
    id: "whispering_forest",
    name: "Forêt des Murmures",
    description: "Bois anciens peuplés de créatures et de secrets oubliés.",
    levelRange: [5, 20],
    connections: ["lumineth_village", "crystal_caves"],
    mapWidth: 25,
    mapHeight: 20,
  },
  crystal_caves: {
    id: "crystal_caves",
    name: "Grottes de Cristal",
    description: "Cavités scintillantes infestées de golems et de spectres.",
    levelRange: [15, 35],
    faction: "aqua",
    connections: ["whispering_forest", "ember_ruins"],
    mapWidth: 22,
    mapHeight: 18,
  },
  ember_ruins: {
    id: "ember_ruins",
    name: "Ruines Ardentes",
    description: "Vestiges d'une cité engloutie par les flammes de la Faille.",
    levelRange: [25, 45],
    faction: "pyros",
    connections: ["crystal_caves", "sky_temple"],
    mapWidth: 24,
    mapHeight: 22,
  },
  sky_temple: {
    id: "sky_temple",
    name: "Temple Céleste",
    description: "Sanctuaire flottant gardé par les derniers moines d'Aurélia.",
    levelRange: [40, 60],
    faction: "lumineth",
    connections: ["ember_ruins", "abyss_gate"],
    mapWidth: 18,
    mapHeight: 18,
  },
  abyss_gate: {
    id: "abyss_gate",
    name: "Porte de l'Abîme",
    description: "Faille dimensionnelle. Seuls les héros légendaires osent s'y aventurer.",
    levelRange: [55, 80],
    faction: "umbra",
    connections: ["sky_temple"],
    mapWidth: 16,
    mapHeight: 16,
  },
};
