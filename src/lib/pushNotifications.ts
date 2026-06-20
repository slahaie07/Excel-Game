import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export type PushPlatform = "ios" | "android" | "web";

let listenersAttached = false;

export function isNativePushAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export async function requestWebNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function initNativePush(
  onToken: (token: string, platform: PushPlatform) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return;

  if (!listenersAttached) {
    listenersAttached = true;

    await PushNotifications.addListener("registration", (event) => {
      const platform = Capacitor.getPlatform();
      if (platform === "ios" || platform === "android") {
        onToken(event.value, platform);
      }
    });

    await PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error:", err);
    });

    await PushNotifications.addListener("pushNotificationReceived", (notification) => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(notification.title ?? "Aetheris", {
          body: notification.body,
        });
      }
    });
  }

  await PushNotifications.register();
}

export function showLocalNotification(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}
