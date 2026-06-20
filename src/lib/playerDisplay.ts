import { getCosmeticById } from "../game/data";

export interface FrameStyle {
  borderClass: string;
  glowClass: string;
  icon: string;
  name: string;
}

const FRAME_STYLES: Record<string, Omit<FrameStyle, "icon" | "name">> = {
  frame_gold: { borderClass: "border-2 border-crystal-gold", glowClass: "shadow-[0_0_8px_rgba(255,215,0,0.5)]" },
  frame_silver: { borderClass: "border-2 border-gray-300", glowClass: "shadow-[0_0_6px_rgba(192,192,192,0.4)]" },
  frame_lumina: { borderClass: "border-2 border-crystal-cyan", glowClass: "shadow-[0_0_8px_rgba(0,229,255,0.45)]" },
  frame_umbra: { borderClass: "border-2 border-purple-900", glowClass: "shadow-[0_0_8px_rgba(75,0,130,0.55)]" },
  frame_neutre: { borderClass: "border-2 border-blue-400", glowClass: "shadow-[0_0_6px_rgba(96,165,250,0.4)]" },
};

export function getEquippedTitleLabel(titleId: string | null | undefined): {
  icon: string;
  name: string;
} | null {
  if (!titleId) return null;
  const cosmetic = getCosmeticById(titleId);
  if (!cosmetic || cosmetic.type !== "title") return null;
  return { icon: cosmetic.icon, name: cosmetic.name };
}

export function getEquippedFrameStyle(frameId: string | null | undefined): FrameStyle | null {
  if (!frameId) return null;
  const cosmetic = getCosmeticById(frameId);
  if (!cosmetic || cosmetic.type !== "frame") return null;
  const style = FRAME_STYLES[frameId] ?? {
    borderClass: "border-2 border-aether-500",
    glowClass: "shadow-[0_0_4px_rgba(139,61,255,0.3)]",
  };
  return { ...style, icon: cosmetic.icon, name: cosmetic.name };
}

export function formatPlayerName(
  name: string,
  titleId?: string | null
): { displayName: string; titleName: string | null; titleIcon: string | null } {
  const title = getEquippedTitleLabel(titleId);
  return {
    displayName: name,
    titleName: title?.name ?? null,
    titleIcon: title?.icon ?? null,
  };
}
