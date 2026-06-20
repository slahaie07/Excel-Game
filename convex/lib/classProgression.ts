/** Miroir serveur — déblocage sorts et migration legacy */

const SPELL_LEVELS: Record<string, number> = {
  soin_rune: 1, potion_regen: 3, barriere_alchimique: 6,
  lumiere_sacree: 1, benediction: 3, aura_protectrice: 6,
  flamme_cristalline: 1, bouclier_flamme: 3, explosion_ether: 6,
  eclat_glace: 1, prison_glace: 3, blizzard_ether: 6,
  mur_cristal: 1, provocation: 1, fracas_tellurique: 4,
  egide_fer: 1, defi_bastion: 1, charge_bouclier: 4,
  coup_tellurique: 1, rage_cristal: 4, entaille_sismique: 7,
  coup_brume: 1, piege_ether: 3, invisibilite: 5,
  fleche_lune: 1, marque_cible: 3, pluie_fleches: 6,
  invocation_wisp: 1, lien_ether: 4, tempete_esprits: 8,
};

const CLASS_SPELL_IDS: Record<string, string[]> = {
  alchimiste: ["soin_rune", "potion_regen", "barriere_alchimique"],
  luminaire: ["lumiere_sacree", "benediction", "aura_protectrice"],
  pyromancien: ["flamme_cristalline", "bouclier_flamme", "explosion_ether"],
  cryomancien: ["eclat_glace", "prison_glace", "blizzard_ether"],
  gardien: ["mur_cristal", "provocation", "fracas_tellurique"],
  bastion: ["egide_fer", "defi_bastion", "charge_bouclier"],
  berserker: ["coup_tellurique", "rage_cristal", "entaille_sismique"],
  eclaireur: ["coup_brume", "piege_ether", "invisibilite"],
  archer: ["fleche_lune", "marque_cible", "pluie_fleches"],
  invocateur: ["invocation_wisp", "lien_ether", "tempete_esprits"],
};

const LEGACY_MIGRATIONS: Record<string, { classId: string; spellMap: Record<string, string> }> = {
  chronomancien: {
    classId: "cryomancien",
    spellMap: {
      ralentissement: "prison_glace",
      acceleration: "benediction",
      paradoxe_temporel: "blizzard_ether",
    },
  },
};

export function getUnlockedSpellIds(classId: string, level: number): string[] {
  const ids = CLASS_SPELL_IDS[classId] ?? [];
  return ids.filter((id) => (SPELL_LEVELS[id] ?? 1) <= level);
}

export function mergeUnlockedSpells(
  classId: string,
  level: number,
  currentSpells: string[]
): string[] {
  const unlocked = getUnlockedSpellIds(classId, level);
  return [...new Set([...currentSpells, ...unlocked])];
}

export function migrateLegacyClass(
  classId: string,
  spells: string[]
): { classId: string; spells: string[] } {
  const migration = LEGACY_MIGRATIONS[classId];
  if (!migration) return { classId, spells };

  const mapped = spells.map((id) => migration.spellMap[id] ?? id);
  const valid = new Set(CLASS_SPELL_IDS[migration.classId] ?? []);
  return {
    classId: migration.classId,
    spells: [...new Set(mapped.filter((id) => valid.has(id)))],
  };
}
