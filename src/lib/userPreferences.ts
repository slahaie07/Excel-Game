const PREFS_KEY = "aetheris-user-prefs";

export interface UserPreferences {
  reducedMotion: boolean;
  lastSeenVersion: string;
  guideCompleted: boolean;
}

const DEFAULTS: UserPreferences = {
  reducedMotion: false,
  lastSeenVersion: "0",
  guideCompleted: false,
};

export function loadUserPreferences(): UserPreferences {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveUserPreferences(patch: Partial<UserPreferences>): UserPreferences {
  const next = { ...loadUserPreferences(), ...patch };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

export const APP_VERSION = "3.1.0";
export const VERSION_LABEL = "Chroniques";
