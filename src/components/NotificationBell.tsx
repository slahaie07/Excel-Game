import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter, isConvexEnabled } from "../lib/convexUtils";

function requestBrowserNotification(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}

export function NotificationBell() {
  const characterId = useGameStore((s) => s.characterId);
  const setScreen = useGameStore((s) => s.setScreen);
  const [open, setOpen] = useState(false);

  const unread = useQuery(
    api.notifications.getUnreadCount,
    characterId && isCloudCharacter(characterId)
      ? { characterId: characterId as Id<"characters"> }
      : "skip"
  );
  const notifications = useQuery(
    api.notifications.listNotifications,
    characterId && isCloudCharacter(characterId) && open
      ? { characterId: characterId as Id<"characters">, limit: 15 }
      : "skip"
  );

  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);

  useEffect(() => {
    if (!characterId || !isConvexEnabled() || !isCloudCharacter(characterId)) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [characterId]);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const latest = notifications.find((n) => !n.read);
    if (latest) {
      requestBrowserNotification(latest.title, latest.body);
    }
  }, [notifications]);

  if (!characterId || !isCloudCharacter(characterId)) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl p-1"
        aria-label="Notifications"
      >
        🔔
        {(unread ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unread! > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-y-auto bg-aether-900 border border-aether-700 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-aether-700/40">
            <p className="text-white text-sm font-bold">Notifications</p>
            {(unread ?? 0) > 0 && (
              <button
                onClick={() => void markAllRead({ characterId: characterId as Id<"characters"> })}
                className="text-aether-400 text-xs"
              >
                Tout lire
              </button>
            )}
          </div>
          {(notifications ?? []).length === 0 ? (
            <p className="text-aether-500 text-sm p-4 text-center">Aucune notification</p>
          ) : (
            (notifications ?? []).map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  void markRead({
                    characterId: characterId as Id<"characters">,
                    notificationId: n._id,
                  });
                  if (n.screen) setScreen(n.screen as Parameters<typeof setScreen>[0]);
                  setOpen(false);
                }}
                className={`w-full text-left p-3 border-b border-aether-800/50 hover:bg-aether-800/30 ${!n.read ? "bg-aether-800/20" : ""}`}
              >
                <p className="text-white text-xs font-semibold">{n.title}</p>
                <p className="text-aether-400 text-[10px] mt-0.5">{n.body}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
