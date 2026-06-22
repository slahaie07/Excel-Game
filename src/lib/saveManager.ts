import type { PlayerCharacter } from "../store/gameStore";
import type { QuestStatus } from "../data/quests";
import type { ClassId } from "../data/classes";
import type { ZoneId } from "../data/universe";

const SAVE_KEY = "etheris_characters";
const DEVICE_KEY = "etheris_device_id";

export interface SavedCharacter extends PlayerCharacter {
  savedAt: number;
  deviceId: string;
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function listSavedCharacters(): SavedCharacter[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCharacter[];
    return parsed.filter((c) => c.deviceId === getDeviceId());
  } catch {
    return [];
  }
}

export function saveCharacter(player: PlayerCharacter): void {
  const saved: SavedCharacter = {
    ...player,
    savedAt: Date.now(),
    deviceId: getDeviceId(),
  };
  const all = listAllCharacters();
  const idx = all.findIndex((c) => c.id === player.id);
  if (idx >= 0) {
    all[idx] = saved;
  } else {
    all.push(saved);
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(all));
}

function listAllCharacters(): SavedCharacter[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCharacter[];
  } catch {
    return [];
  }
}

export function deleteSavedCharacter(id: string): void {
  const all = listAllCharacters().filter((c) => c.id !== id);
  localStorage.setItem(SAVE_KEY, JSON.stringify(all));
}

export function savedToPlayer(saved: SavedCharacter): PlayerCharacter {
  return {
    id: saved.id,
    name: saved.name,
    classId: saved.classId as ClassId,
    level: saved.level,
    xp: saved.xp,
    kamas: saved.kamas,
    stats: saved.stats,
    zone: saved.zone as ZoneId,
    position: saved.position,
    inventory: saved.inventory,
    equipment: saved.equipment,
    spells: saved.spells,
    questProgress: saved.questProgress as Record<
      string,
      { status: QuestStatus; objectives: Record<string, number> }
    >,
    professions: saved.professions,
    petId: saved.petId,
    guildId: saved.guildId,
    achievements: saved.achievements,
  };
}
