export interface CharacterData {
  id?: string;
  name: string;
  classId: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  ap?: number;
  maxAp?: number;
  mp?: number;
  maxMp?: number;
  eclats: number;
  zoneId: string;
  spells: string[];
  inventory: { itemId: string; quantity: number }[];
  equipment: Record<string, string | undefined>;
  activeQuests: unknown[];
  completedQuests: string[];
  stats: Record<string, number>;
  professions?: { professionId: string; level: number; xp: number }[];
  petId?: string;
  guildId?: string;
  pvpRating?: number;
  pvpWins?: number;
  pvpLosses?: number;
  haven?: HavenData;
}

export interface HavenData {
  level: number;
  furniture: { itemId: string; x: number; y: number }[];
  visitors: number;
}

export interface DungeonRun {
  dungeonId: string;
  currentRoom: number;
  totalRooms: number;
  monstersDefeated: number;
  startedAt: number;
  status: "active" | "completed" | "failed";
}

export interface PvpRecord {
  rating: number;
  wins: number;
  losses: number;
  streak: number;
}

const charKey = (id: string) => `aetheris-char-${id}`;
const dungeonKey = (id: string) => `aetheris-dungeon-${id}`;
const pvpKey = (id: string) => `aetheris-pvp-${id}`;

export function loadCharacter(characterId: string): CharacterData | null {
  try {
    const raw = localStorage.getItem(charKey(characterId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCharacter(characterId: string, data: CharacterData): void {
  localStorage.setItem(charKey(characterId), JSON.stringify(data));
}

export function updateCharacter(characterId: string, patch: Partial<CharacterData>): CharacterData | null {
  const current = loadCharacter(characterId);
  if (!current) return null;
  const updated = { ...current, ...patch };
  saveCharacter(characterId, updated);
  return updated;
}

export function addToInventory(
  characterId: string,
  itemId: string,
  quantity: number
): void {
  const char = loadCharacter(characterId);
  if (!char) return;
  const inventory = [...char.inventory];
  const existing = inventory.find((i) => i.itemId === itemId);
  if (existing) existing.quantity += quantity;
  else inventory.push({ itemId, quantity });
  saveCharacter(characterId, { ...char, inventory });
}

export function addXp(characterId: string, xp: number): { leveledUp: boolean; level: number } {
  const char = loadCharacter(characterId);
  if (!char) return { leveledUp: false, level: 1 };

  let newXp = char.xp + xp;
  let level = char.level;
  let leveledUp = false;

  while (newXp >= char.xpToNext && level < 60) {
    newXp -= char.xpToNext;
    level++;
    leveledUp = true;
  }

  const xpToNext = level * 100 + (level - 1) * 50;
  const maxHp = 50 + (char.stats.vitality ?? 10) * 5 + level * 10;

  saveCharacter(characterId, {
    ...char,
    xp: newXp,
    level,
    xpToNext,
    maxHp,
    hp: leveledUp ? maxHp : char.hp,
    statPoints: leveledUp ? ((char as { statPoints?: number }).statPoints ?? 0) + 5 : undefined,
  } as CharacterData);

  return { leveledUp, level };
}

export function loadDungeonRun(characterId: string): DungeonRun | null {
  try {
    const raw = localStorage.getItem(dungeonKey(characterId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDungeonRun(characterId: string, run: DungeonRun | null): void {
  if (run) localStorage.setItem(dungeonKey(characterId), JSON.stringify(run));
  else localStorage.removeItem(dungeonKey(characterId));
}

export function loadPvpRecord(characterId: string): PvpRecord {
  try {
    const raw = localStorage.getItem(pvpKey(characterId));
    return raw ? JSON.parse(raw) : { rating: 1000, wins: 0, losses: 0, streak: 0 };
  } catch {
    return { rating: 1000, wins: 0, losses: 0, streak: 0 };
  }
}

export function savePvpRecord(characterId: string, record: PvpRecord): void {
  localStorage.setItem(pvpKey(characterId), JSON.stringify(record));
}
