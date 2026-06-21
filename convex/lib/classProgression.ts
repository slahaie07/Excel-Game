/** Miroir serveur — déblocage sorts et migration legacy */

const SPELL_LEVELS: Record<string, number> = {
  soin_rune: 1, potion_regen: 3, barriere_alchimique: 6, elixir_force: 10, nova_alchimique: 18,
  lumiere_sacree: 1, benediction: 3, aura_protectrice: 6, sort_bonus_lumina: 10, resurrection: 18,
  soin_nature: 1, epines_vivantes: 3, rugissement_sylvestre: 6, symbiose: 10, tempete_verte: 18,
  flamme_cristalline: 1, bouclier_flamme: 3, explosion_ether: 6, brasier: 10, inferno: 18,
  eclat_glace: 1, prison_glace: 3, blizzard_ether: 6, lance_glace: 10, zero_absolu: 18,
  eclair_stellaire: 1, chaine_foudre: 3, paratonnerre: 6, surcharge: 10, foudre_jugement: 18,
  mur_cristal: 1, provocation: 1, fracas_tellurique: 4, retour_force: 10, forteresse: 18,
  egide_fer: 1, defi_bastion: 1, charge_bouclier: 4, riposte_fer: 10, muraille: 18,
  frappe_sacree: 1, armure_lumiere: 1, jugement_divin: 4, aura_benediction: 10, martyre_stellaire: 18,
  coup_tellurique: 1, rage_cristal: 4, entaille_sismique: 7, furie: 10, seisme_furieux: 18,
  coup_brume: 1, piege_ether: 3, invisibilite: 5, coup_fatal: 10, tempete_brume: 18,
  lame_spectrale: 1, drain_vie: 3, marque_mort: 6, danse_faucheuse: 10, reaper_ultime: 18,
  fleche_lune: 1, marque_cible: 3, pluie_fleches: 6, tir_percant: 10, eclipse_lunaire: 18,
  invocation_wisp: 1, lien_ether: 4, tempete_esprits: 8, pacte_ether: 10, armee_esprits: 18,
  tir_canon: 1, mitraille: 3, obus_ether: 6, barricade: 10, barrage_stellaire: 18,
};

const CLASS_SPELL_IDS: Record<string, string[]> = {
  alchimiste: ["soin_rune", "potion_regen", "barriere_alchimique", "elixir_force", "nova_alchimique"],
  luminaire: ["lumiere_sacree", "benediction", "aura_protectrice", "sort_bonus_lumina", "resurrection"],
  druide: ["soin_nature", "epines_vivantes", "rugissement_sylvestre", "symbiose", "tempete_verte"],
  pyromancien: ["flamme_cristalline", "bouclier_flamme", "explosion_ether", "brasier", "inferno"],
  cryomancien: ["eclat_glace", "prison_glace", "blizzard_ether", "lance_glace", "zero_absolu"],
  fulgurancien: ["eclair_stellaire", "chaine_foudre", "paratonnerre", "surcharge", "foudre_jugement"],
  gardien: ["mur_cristal", "provocation", "fracas_tellurique", "retour_force", "forteresse"],
  bastion: ["egide_fer", "defi_bastion", "charge_bouclier", "riposte_fer", "muraille"],
  paladin: ["frappe_sacree", "armure_lumiere", "jugement_divin", "aura_benediction", "martyre_stellaire"],
  berserker: ["coup_tellurique", "rage_cristal", "entaille_sismique", "furie", "seisme_furieux"],
  eclaireur: ["coup_brume", "piege_ether", "invisibilite", "coup_fatal", "tempete_brume"],
  faucheur: ["lame_spectrale", "drain_vie", "marque_mort", "danse_faucheuse", "reaper_ultime"],
  archer: ["fleche_lune", "marque_cible", "pluie_fleches", "tir_percant", "eclipse_lunaire"],
  invocateur: ["invocation_wisp", "lien_ether", "tempete_esprits", "pacte_ether", "armee_esprits"],
  artilleur: ["tir_canon", "mitraille", "obus_ether", "barricade", "barrage_stellaire"],
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
