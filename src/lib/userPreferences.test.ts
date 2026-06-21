import { describe, expect, it, beforeEach, vi } from "vitest";
import { loadUserPreferences, saveUserPreferences, APP_VERSION, VERSION_LABEL } from "./userPreferences";

describe("userPreferences", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(storage)) delete storage[key];
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const key of Object.keys(storage)) delete storage[key];
      },
    });
  });

  it("returns defaults when storage is empty", () => {
    const prefs = loadUserPreferences();
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.guideCompleted).toBe(false);
    expect(prefs.lastSeenVersion).toBe("0");
  });

  it("persists partial updates", () => {
    saveUserPreferences({ reducedMotion: true, guideCompleted: true });
    const prefs = loadUserPreferences();
    expect(prefs.reducedMotion).toBe(true);
    expect(prefs.guideCompleted).toBe(true);
    expect(prefs.lastSeenVersion).toBe("0");
  });

  it("exposes version constants", () => {
    expect(APP_VERSION).toBe("5.0.0");
    expect(VERSION_LABEL).toBe("Terreval Finale");
  });
});
