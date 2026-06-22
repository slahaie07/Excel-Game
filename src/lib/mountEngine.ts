import { getMountById, type MountStatBonuses } from "../data/mounts";
import { loadCharacter, saveCharacter, type CharacterData } from "./characterStorage";

export type MountResult = { success: true; character: CharacterData } | { success: false; error: string };

function ensureOwnedMounts(char: CharacterData): string[] {
  return char.ownedMounts ?? [];
}

export function buyMount(characterId: string, mountId: string): MountResult {
  const char = loadCharacter(characterId);
  if (!char) return { success: false, error: "Personnage introuvable" };

  const mount = getMountById(mountId);
  if (!mount) return { success: false, error: "Monture introuvable" };

  const owned = ensureOwnedMounts(char);
  if (owned.includes(mountId)) {
    return { success: false, error: "Monture déjà possédée" };
  }

  if (char.level < mount.levelRequired) {
    return { success: false, error: `Niveau ${mount.levelRequired} requis` };
  }

  if (char.eclats < mount.kamasCost) {
    return { success: false, error: "Kamas insuffisants" };
  }

  const updated: CharacterData = {
    ...char,
    eclats: char.eclats - mount.kamasCost,
    ownedMounts: [...owned, mountId],
  };
  saveCharacter(characterId, updated);
  return { success: true, character: updated };
}

export function equipMount(characterId: string, mountId: string | null): MountResult {
  const char = loadCharacter(characterId);
  if (!char) return { success: false, error: "Personnage introuvable" };

  if (mountId === null) {
    const updated = { ...char, mountId: undefined };
    saveCharacter(characterId, updated);
    return { success: true, character: updated };
  }

  const mount = getMountById(mountId);
  if (!mount) return { success: false, error: "Monture introuvable" };

  const owned = ensureOwnedMounts(char);
  if (!owned.includes(mountId)) {
    return { success: false, error: "Monture non possédée" };
  }

  if (char.level < mount.levelRequired) {
    return { success: false, error: `Niveau ${mount.levelRequired} requis` };
  }

  const updated = { ...char, mountId };
  saveCharacter(characterId, updated);
  return { success: true, character: applyMountStats(updated) };
}

export function applyMountStats(char: CharacterData): CharacterData {
  const baseStats = { ...char.stats };
  const baseMaxMp = char.maxMp ?? 6;
  const baseMp = char.mp ?? baseMaxMp;

  if (!char.mountId) {
    return {
      ...char,
      stats: baseStats,
      maxMp: baseMaxMp,
      mp: Math.min(baseMp, baseMaxMp),
    };
  }

  const mount = getMountById(char.mountId);
  if (!mount) return char;

  const bonuses = mount.statBonuses;
  const stats = applyStatBonuses(baseStats, bonuses);
  const mpBonus = bonuses.mp ?? 0;
  const maxMp = baseMaxMp + mpBonus;

  return {
    ...char,
    stats,
    maxMp,
    mp: Math.min(baseMp + mpBonus, maxMp),
  };
}

function applyStatBonuses(
  stats: Record<string, number>,
  bonuses: MountStatBonuses
): Record<string, number> {
  const next = { ...stats };
  for (const [key, value] of Object.entries(bonuses)) {
    if (key === "mp" || value === undefined) continue;
    next[key] = (next[key] ?? 0) + value;
  }
  return next;
}

export function getActiveMountBonuses(char: CharacterData): MountStatBonuses | null {
  if (!char.mountId) return null;
  return getMountById(char.mountId)?.statBonuses ?? null;
}
