import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { AchievementsUI } from "./AchievementsUI";

export default function CloudAchievements() {
  const characterId = useGameStore((s) => s.characterId)!;
  const list = useQuery(api.achievements.listAchievements, { characterId: characterId as Id<"characters"> });
  return <AchievementsUI achievements={list ?? []} loading={list === undefined} />;
}
