import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";

interface CloudAchievementSyncProps {
  characterId: string;
}

export function CloudAchievementSync({ characterId }: CloudAchievementSyncProps) {
  const sync = useMutation(api.achievements.syncAchievements);

  useEffect(() => {
    if (!isConvexEnabled() || !isCloudCharacter(characterId)) return;
    void sync({ characterId: characterId as Id<"characters"> });
  }, [characterId, sync]);

  return null;
}
