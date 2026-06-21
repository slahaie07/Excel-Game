import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import { useToastStore } from "../stores/toastStore";
import CloudAchievements from "./CloudAchievements";
import LocalAchievements from "./LocalAchievements";

export const LOCAL_ACHIEVEMENTS = [
  { achievementId: "first_victory", name: "Première Victoire", description: "Gagner un combat", icon: "⚔️", unlocked: false },
  { achievementId: "level_10", name: "Éveilleur Confirmé", description: "Niveau 10", icon: "⭐", unlocked: false },
  { achievementId: "dungeon_clear", name: "Explorateur", description: "Terminer un donjon", icon: "🏚️", unlocked: false },
  { achievementId: "guild_member", name: "Fraternité", description: "Rejoindre une guilde", icon: "🏰", unlocked: false },
  { achievementId: "event_participant", name: "Fêtard", description: "Événement saisonnier", icon: "🎉", unlocked: false },
];

export default function AchievementsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  if (isConvexEnabled() && isCloudCharacter(characterId)) return <CloudAchievements />;
  return <LocalAchievements />;
}

export function unlockLocalAchievement(characterId: string, achievementId: string): boolean {
  const key = `aetheris-achievements-${characterId}`;
  const list: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (list.includes(achievementId)) return false;

  localStorage.setItem(key, JSON.stringify([...list, achievementId]));
  const meta = LOCAL_ACHIEVEMENTS.find((a) => a.achievementId === achievementId);
  if (meta) {
    useToastStore.getState().showAchievement(meta.name, meta.icon);
  }
  return true;
}
