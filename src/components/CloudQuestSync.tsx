import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import { registerCloudQuestMutations } from "../lib/cloudQuestProgress";

interface CloudQuestSyncProps {
  characterId: string;
}

/** Registers Convex quest mutations for cloud character sync. */
export function CloudQuestSync({ characterId }: CloudQuestSyncProps) {
  const startQuest = useMutation(api.quests.startQuest);
  const updateQuestProgress = useMutation(api.quests.updateQuestProgress);
  const syncQuestState = useMutation(api.quests.syncQuestState);

  useEffect(() => {
    if (!isConvexEnabled() || !isCloudCharacter(characterId)) return;

    registerCloudQuestMutations({
      startQuest,
      updateQuestProgress,
      syncQuestState,
    });
  }, [characterId, startQuest, updateQuestProgress, syncQuestState]);

  return null;
}
