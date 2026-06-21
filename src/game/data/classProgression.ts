/**
 * Progression de classe — déblocage de sorts par niveau
 */

import { SPELLS } from "./spells";
import { getClassById } from "./classes";

export function getUnlockedSpellIds(classId: string, level: number): string[] {
  return SPELLS.filter(
    (s) => s.classId === classId && s.levelRequired <= level
  )
    .sort((a, b) => a.levelRequired - b.levelRequired)
    .map((s) => s.id);
}

export function getStartingSpellIds(classId: string): string[] {
  return getUnlockedSpellIds(classId, 1);
}

export function getSpellUnlockSchedule(classId: string): { spellId: string; levelRequired: number }[] {
  return SPELLS.filter((s) => s.classId === classId)
    .sort((a, b) => a.levelRequired - b.levelRequired)
    .map((s) => ({ spellId: s.id, levelRequired: s.levelRequired }));
}

export function mergeUnlockedSpells(
  classId: string,
  level: number,
  currentSpells: string[]
): string[] {
  const unlocked = getUnlockedSpellIds(classId, level);
  return [...new Set([...currentSpells, ...unlocked])];
}

/** Migration Chronomancien → Cryomancien */
export const LEGACY_CLASS_MIGRATIONS: Record<string, { classId: string; spellMap: Record<string, string> }> = {
  chronomancien: {
    classId: "cryomancien",
    spellMap: {
      ralentissement: "prison_glace",
      acceleration: "benediction",
      paradoxe_temporel: "blizzard_ether",
    },
  },
};

export function migrateLegacyClass(classId: string, spells: string[]): { classId: string; spells: string[] } {
  const migration = LEGACY_CLASS_MIGRATIONS[classId];
  if (!migration) return { classId, spells };

  const mappedSpells = spells.map((id) => migration.spellMap[id] ?? id);
  const cls = getClassById(migration.classId);
  if (!cls) return { classId: migration.classId, spells: mappedSpells };

  return {
    classId: migration.classId,
    spells: [...new Set(mappedSpells.filter((id) => SPELLS.some((s) => s.id === id)))],
  };
}
