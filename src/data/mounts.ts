export interface MountStatBonuses {
  vitality?: number;
  wisdom?: number;
  strength?: number;
  intelligence?: number;
  agility?: number;
  chance?: number;
  mp?: number;
}

export interface MountDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  kamasCost: number;
  statBonuses: MountStatBonuses;
}

export const MOUNTS: MountDefinition[] = [
  {
    id: "mount_poney",
    name: "Poney des Plaines",
    description: "Monture docile idéale pour les débutants.",
    icon: "🐴",
    levelRequired: 5,
    kamasCost: 500,
    statBonuses: { agility: 2, mp: 1 },
  },
  {
    id: "mount_loup",
    name: "Loup des Brumes",
    description: "Compagnon rapide des traqueurs d'Étheris.",
    icon: "🐺",
    levelRequired: 15,
    kamasCost: 2500,
    statBonuses: { agility: 5, strength: 3 },
  },
  {
    id: "mount_ours",
    name: "Ours de Cristal",
    description: "Monture robuste renforçant la vitalité.",
    icon: "🐻",
    levelRequired: 25,
    kamasCost: 6000,
    statBonuses: { vitality: 8, wisdom: 2 },
  },
  {
    id: "mount_phenix",
    name: "Phénix Cendré",
    description: "Oiseau flamboyant augmentant l'intelligence.",
    icon: "🔥",
    levelRequired: 35,
    kamasCost: 12000,
    statBonuses: { intelligence: 10, chance: 4 },
  },
  {
    id: "mount_dragon",
    name: "Dragonnet d'Aether",
    description: "Monture légendaire aux bonus équilibrés.",
    icon: "🐉",
    levelRequired: 45,
    kamasCost: 25000,
    statBonuses: { strength: 6, intelligence: 6, agility: 6, mp: 2 },
  },
  {
    id: "mount_licorne",
    name: "Licorne Stellaire",
    description: "Créature mythique des héros d'Étheris.",
    icon: "🦄",
    levelRequired: 55,
    kamasCost: 50000,
    statBonuses: { vitality: 12, wisdom: 8, chance: 8, mp: 3 },
  },
];

export function getMountById(id: string): MountDefinition | undefined {
  return MOUNTS.find((m) => m.id === id);
}
