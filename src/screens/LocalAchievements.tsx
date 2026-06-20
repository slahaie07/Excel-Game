import { useGameStore } from "../stores/gameStore";
import { AchievementsUI } from "./AchievementsUI";

const LOCAL_ACHIEVEMENTS = [
  { achievementId: "first_victory", name: "Première Victoire", description: "Gagner un combat", icon: "⚔️", unlocked: false },
  { achievementId: "level_10", name: "Éveilleur Confirmé", description: "Niveau 10", icon: "⭐", unlocked: false },
  { achievementId: "dungeon_clear", name: "Explorateur", description: "Terminer un donjon", icon: "🏚️", unlocked: false },
  { achievementId: "guild_member", name: "Fraternité", description: "Rejoindre une guilde", icon: "🏰", unlocked: false },
  { achievementId: "event_participant", name: "Fêtard", description: "Événement saisonnier", icon: "🎉", unlocked: false },
];

export default function LocalAchievements() {
  const characterId = useGameStore((s) => s.characterId)!;
  const unlocked: string[] = JSON.parse(localStorage.getItem(`aetheris-achievements-${characterId}`) ?? "[]");
  const achievements = LOCAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.includes(a.achievementId) }));
  return <AchievementsUI achievements={achievements} />;
}
