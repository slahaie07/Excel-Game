import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";
import {
  initNativePush,
  isNativePushAvailable,
  requestWebNotificationPermission,
} from "../lib/pushNotifications";

interface CloudPushSyncProps {
  characterId: string;
  pushEnabled: boolean;
}

export function CloudPushSync({ characterId, pushEnabled }: CloudPushSyncProps) {
  const registerToken = useMutation(api.notifications.registerPushToken);
  const registerInterest = useMutation(api.notifications.registerPushInterest);

  useEffect(() => {
    if (!isConvexEnabled() || !isCloudCharacter(characterId) || !pushEnabled) return;

    if (isNativePushAvailable()) {
      void initNativePush((token, platform) => {
        void registerToken({
          characterId: characterId as Id<"characters">,
          token,
          platform,
        });
      });
      return;
    }

    void requestWebNotificationPermission().then((granted) => {
      if (granted) {
        void registerInterest({
          characterId: characterId as Id<"characters">,
          enabled: true,
        });
      }
    });
  }, [characterId, pushEnabled, registerToken, registerInterest]);

  return null;
}
