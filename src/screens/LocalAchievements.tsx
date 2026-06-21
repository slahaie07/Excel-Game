import { useGameStore } from "../stores/gameStore";
import { AchievementsUI } from "./AchievementsUI";
import { LOCAL_ACHIEVEMENTS } from "./AchievementsScreen";

export default function LocalAchievements() {
  const characterId = useGameStore((s) => s.characterId)!;
  const unlocked: string[] = JSON.parse(localStorage.getItem(`aetheris-achievements-${characterId}`) ?? "[]");
  const achievements = LOCAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.includes(a.achievementId) }));
  return <AchievementsUI achievements={achievements} />;
}
