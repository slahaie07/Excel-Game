/** Talents serveur — validation sélection */

export interface ServerTalent {
  id: string;
  archetype: string;
  tier: 1 | 2;
  levelRequired: number;
}

export const SERVER_TALENTS: ServerTalent[] = [
  { id: "serenite_sacree", archetype: "healer", tier: 1, levelRequired: 10 },
  { id: "murmure_renovateur", archetype: "healer", tier: 1, levelRequired: 10 },
  { id: "grace_lumineuse", archetype: "healer", tier: 2, levelRequired: 20 },
  { id: "vitalite_ether", archetype: "healer", tier: 2, levelRequired: 20 },
  { id: "flux_arcanique", archetype: "magic", tier: 1, levelRequired: 10 },
  { id: "maitrise_elements", archetype: "magic", tier: 1, levelRequired: 10 },
  { id: "surcharge_ether", archetype: "magic", tier: 2, levelRequired: 20 },
  { id: "barriere_mystique", archetype: "magic", tier: 2, levelRequired: 20 },
  { id: "peau_roche", archetype: "shield", tier: 1, levelRequired: 10 },
  { id: "fortification", archetype: "shield", tier: 1, levelRequired: 10 },
  { id: "provocateur", archetype: "shield", tier: 2, levelRequired: 20 },
  { id: "rempart_vivant", archetype: "shield", tier: 2, levelRequired: 20 },
  { id: "fureur_controlee", archetype: "burst", tier: 1, levelRequired: 10 },
  { id: "lame_brutale", archetype: "burst", tier: 1, levelRequired: 10 },
  { id: "assaut_eclair", archetype: "burst", tier: 2, levelRequired: 20 },
  { id: "coup_fatal", archetype: "burst", tier: 2, levelRequired: 20 },
  { id: "oeil_aigle", archetype: "ranged", tier: 1, levelRequired: 10 },
  { id: "tir_perforant", archetype: "ranged", tier: 1, levelRequired: 10 },
  { id: "precision_stellaire", archetype: "ranged", tier: 2, levelRequired: 20 },
  { id: "esprit_guide", archetype: "ranged", tier: 2, levelRequired: 20 },
];

const CLASS_ARCHETYPE: Record<string, string> = {
  alchimiste: "healer", luminaire: "healer", druide: "healer",
  pyromancien: "magic", cryomancien: "magic", fulgurancien: "magic",
  gardien: "shield", bastion: "shield", paladin: "shield",
  berserker: "burst", eclaireur: "burst", faucheur: "burst",
  archer: "ranged", invocateur: "ranged", artilleur: "ranged",
};

export function getArchetypeForClass(classId: string): string | undefined {
  return CLASS_ARCHETYPE[classId];
}

export function canSelectTalent(
  classId: string,
  level: number,
  owned: string[],
  talentId: string,
  spellPoints: number
): string | null {
  if (spellPoints < 1) return "Point de talent insuffisant";
  const archetype = getArchetypeForClass(classId);
  const talent = SERVER_TALENTS.find((t) => t.id === talentId);
  if (!archetype || !talent) return "Talent invalide";
  if (talent.archetype !== archetype) return "Talent incompatible avec votre archétype";
  if (level < talent.levelRequired) return `Niveau ${talent.levelRequired} requis`;
  if (owned.includes(talentId)) return "Talent déjà acquis";
  if (owned.some((id) => {
    const t = SERVER_TALENTS.find((x) => x.id === id);
    return t?.tier === talent.tier && t.archetype === archetype;
  })) return "Un talent de ce palier est déjà acquis";
  return null;
}
