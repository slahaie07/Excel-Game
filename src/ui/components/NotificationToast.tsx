import { useEffect } from "react";
import { useGameStore } from "../../store/gameStore";

export function NotificationToast() {
  const notifications = useGameStore((s) => s.notifications);

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[notifications.length - 1];
    if (!latest) return;
    const t = setTimeout(() => {
      useGameStore.setState((s) => ({
        notifications: s.notifications.filter((n) => n.id !== latest.id),
      }));
    }, 4000);
    return () => clearTimeout(t);
  }, [notifications]);

  if (notifications.length === 0) return null;

  const latest = notifications[notifications.length - 1];
  if (!latest) return null;

  return (
    <div className={`toast toast-${latest.type}`}>
      {latest.message}
    </div>
  );
}
