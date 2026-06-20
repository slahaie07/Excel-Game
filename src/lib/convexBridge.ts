import type { CharacterData } from "./characterStorage";
import { saveCharacter } from "./characterStorage";

/** Map a Convex character document to local CharacterData cache. */
export function convexDocToCharacter(doc: Record<string, unknown>): CharacterData {
  const id = doc._id as string;
  return {
    id,
    name: doc.name as string,
    classId: doc.classId as string,
    level: doc.level as number,
    xp: doc.xp as number,
    xpToNext: doc.xpToNext as number,
    hp: doc.hp as number,
    maxHp: doc.maxHp as number,
    ap: doc.ap as number,
    maxAp: doc.maxAp as number,
    mp: doc.mp as number,
    maxMp: doc.maxMp as number,
    eclats: doc.eclats as number,
    zoneId: doc.zoneId as string,
    spells: doc.spells as string[],
    inventory: doc.inventory as CharacterData["inventory"],
    equipment: doc.equipment as CharacterData["equipment"],
    activeQuests: doc.activeQuests as CharacterData["activeQuests"],
    completedQuests: doc.completedQuests as string[],
    stats: doc.stats as Record<string, number>,
    professions: doc.professions as CharacterData["professions"],
    petId: doc.petId as string | undefined,
    guildId: doc.guildId as string | undefined,
    pvpRating: doc.pvpRating as number,
    pvpWins: doc.pvpWins as number,
    pvpLosses: doc.pvpLosses as number,
  };
}

export function cacheConvexCharacter(doc: Record<string, unknown>): CharacterData {
  const data = convexDocToCharacter(doc);
  saveCharacter(data.id!, data);
  return data;
}
