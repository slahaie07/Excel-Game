import { create } from "zustand";

interface ToastState {
  levelUp: number | null;
  achievement: { name: string; icon: string } | null;
  showLevelUp: (level: number) => void;
  showAchievement: (name: string, icon: string) => void;
  dismissLevelUp: () => void;
  dismissAchievement: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  levelUp: null,
  achievement: null,
  showLevelUp: (level) => set({ levelUp: level }),
  showAchievement: (name, icon) => set({ achievement: { name, icon } }),
  dismissLevelUp: () => set({ levelUp: null }),
  dismissAchievement: () => set({ achievement: null }),
}));
