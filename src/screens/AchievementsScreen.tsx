import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import CloudAchievements from "./CloudAchievements";
import LocalAchievements from "./LocalAchievements";

export default function AchievementsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudAchievements />;
  return <LocalAchievements />;
}

export function unlockLocalAchievement(characterId: string, achievementId: string) {
  const key = `aetheris-achievements-${characterId}`;
  const list: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (!list.includes(achievementId)) {
    localStorage.setItem(key, JSON.stringify([...list, achievementId]));
  }
}
