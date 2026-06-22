/** Donjons instanciés — salles, boss et récompenses */

export type DungeonId = "dungeon_crystal" | "dungeon_whisper";

export interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  monsters: { id: string; count: number; scale?: number }[];
  isBoss?: boolean;
}

export interface Dungeon {
  id: DungeonId;
  name: string;
  description: string;
  zone: string;
  levelRequired: number;
  rooms: DungeonRoom[];
  completionRewards: {
    xp: number;
    kamas: number;
    items: { itemId: string; quantity: number; chance?: number }[];
  };
  icon: string;
}

export const DUNGEONS: Record<DungeonId, Dungeon> = {
  dungeon_crystal: {
    id: "dungeon_crystal",
    name: "Donjon des Cristaux",
    description:
      "Au coeur des Grottes de Cristal, un labyrinthe scintillant gardé par des spectres et un golem ancestral.",
    zone: "crystal_caves",
    levelRequired: 20,
    icon: "💎",
    rooms: [
      {
        id: "crystal_entry",
        name: "Antichambre Scintillante",
        description: "Des cristaux lumineux éclairent un couloir infesté de vermine.",
        monsters: [
          { id: "rat_des_champs", count: 2 },
          { id: "araignee_venimeuse", count: 1 },
        ],
      },
      {
        id: "crystal_hall",
        name: "Galerie des Échos",
        description: "Des murmures résonnent entre les stalactites. Des spectres rôdent.",
        monsters: [
          { id: "spectre_mineur", count: 2, scale: 1.1 },
        ],
      },
      {
        id: "crystal_boss",
        name: "Sanctuaire du Golem",
        description: "Un golem de cristal massif protège le coeur du donjon.",
        monsters: [
          { id: "golem_de_cristal", count: 1, scale: 1.5 },
        ],
        isBoss: true,
      },
    ],
    completionRewards: {
      xp: 1200,
      kamas: 600,
      items: [
        { itemId: "cristal_brut", quantity: 5 },
        { itemId: "amulette_vitalite", quantity: 1, chance: 0.6 },
        { itemId: "fragment_ether", quantity: 3, chance: 0.8 },
      ],
    },
  },
  dungeon_whisper: {
    id: "dungeon_whisper",
    name: "Tanière des Gobelins",
    description: "Un repaire souterrain caché dans la Forêt des Murmures.",
    zone: "whispering_forest",
    levelRequired: 8,
    icon: "🌲",
    rooms: [
      {
        id: "goblin_entry",
        name: "Entrée de la Tanière",
        description: "Des torches fumeuses marquent le passage des maraudeurs.",
        monsters: [{ id: "gobelin_maraudeur", count: 3 }],
      },
      {
        id: "goblin_boss",
        name: "Salle du Chef",
        description: "Le chef gobelin et ses gardes vous attendent.",
        monsters: [
          { id: "gobelin_maraudeur", count: 2, scale: 1.2 },
          { id: "loup_des_bois", count: 1 },
        ],
        isBoss: true,
      },
    ],
    completionRewards: {
      xp: 400,
      kamas: 200,
      items: [
        { itemId: "fourrure_loup", quantity: 3 },
        { itemId: "arc_sylvestre", quantity: 1, chance: 0.3 },
      ],
    },
  },
};

export function getDungeonForZone(zoneId: string): Dungeon[] {
  return Object.values(DUNGEONS).filter((d) => d.zone === zoneId);
}
