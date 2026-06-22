import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

export const isNativePlatform = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initMobileShell(): Promise<void> {
  if (!isNativePlatform) return;

  document.documentElement.classList.add("native-app", `platform-${platform}`);

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#0a0e1a" });
    }
  } catch {
    // StatusBar unavailable on some webviews
  }

  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {
    // Keyboard plugin optional
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Splash may already be hidden
  }

  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      void App.minimizeApp();
    }
  });
}
