const PREFS_KEY = "aetheris-user-prefs";

/** cloud = Terreval en ligne (Convex) ; sanctuary = progression locale */
export type PlayMode = "cloud" | "sanctuary";

export interface UserPreferences {
  reducedMotion: boolean;
  lastSeenVersion: string;
  guideCompleted: boolean;
  playMode: PlayMode;
  lastUsername: string;
}

const DEFAULTS: UserPreferences = {
  reducedMotion: false,
  lastSeenVersion: "0",
  guideCompleted: false,
  playMode: "cloud",
  lastUsername: "",
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

export const APP_VERSION = "5.0.0";
export const VERSION_LABEL = "Terreval Finale";
