export interface RaidDefinition {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  levelRequired: number;
  phases: number;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  phaseMonsters: string[][];
  rewards: {
    xp: number;
    eclats: number;
    items?: { itemId: string; quantity: number; chance: number }[];
  };
}

export const RAIDS: RaidDefinition[] = [
  {
    id: "sanctuaire_draconique",
    name: "Sanctuaire Draconique",
    description: "Raid épique pour 4 à 8 Éveilleurs. Le dragon d'Aether attend dans les profondeurs.",
    zoneId: "citadelle_stellaire",
    levelRequired: 45,
    phases: 6,
    icon: "🐉",
    minPlayers: 4,
    maxPlayers: 8,
    phaseMonsters: [
      ["golem_stellaire", "golem_stellaire", "golem_stellaire"],
      ["golem_stellaire", "golem_stellaire", "golem_stellaire", "golem_stellaire"],
      ["gardien_ruines", "golem_stellaire", "golem_stellaire"],
      ["golem_stellaire", "golem_stellaire", "gardien_ruines", "gardien_ruines"],
      ["golem_stellaire", "golem_stellaire", "golem_stellaire", "gardien_ruines", "gardien_ruines"],
      ["dragon_aether"],
    ],
    rewards: { xp: 15000, eclats: 8000, items: [{ itemId: "ecaille_draconique", chance: 0.25, quantity: 1 }] },
  },
  {
    id: "couronne_ombres",
    name: "Couronne des Ombres",
    description: "Le raid endgame ultime. 6 à 8 joueurs niveau 55+.",
    zoneId: "citadelle_stellaire",
    levelRequired: 55,
    phases: 8,
    icon: "👑",
    minPlayers: 6,
    maxPlayers: 8,
    phaseMonsters: [
      ["treant_corrompu", "treant_corrompu", "fee_brume"],
      ["treant_corrompu", "fee_brume", "fee_brume", "fee_brume"],
      ["gardien_ruines", "gardien_ruines", "golem_stellaire"],
      ["golem_stellaire", "golem_stellaire", "golem_stellaire", "gardien_ruines"],
      ["gardien_ruines", "gardien_ruines", "gardien_ruines", "golem_stellaire"],
      ["dragon_aether", "golem_stellaire"],
      ["dragon_aether", "gardien_ruines", "gardien_ruines"],
      ["dragon_aether", "dragon_aether"],
    ],
    rewards: { xp: 25000, eclats: 12000, items: [{ itemId: "couronne_aether", chance: 0.15, quantity: 1 }] },
  },
];

export function getRaidById(id: string): RaidDefinition | undefined {
  return RAIDS.find((r) => r.id === id);
}

export function getPhaseMonsters(raid: RaidDefinition, phaseIndex: number): string[] {
  return raid.phaseMonsters[phaseIndex] ?? [raid.phaseMonsters[raid.phaseMonsters.length - 1]![0]!];
}
