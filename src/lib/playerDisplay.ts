import { getCosmeticById } from "../game/data";

export function getEquippedTitleLabel(titleId: string | null | undefined): {
  icon: string;
  name: string;
} | null {
  if (!titleId) return null;
  const cosmetic = getCosmeticById(titleId);
  if (!cosmetic || cosmetic.type !== "title") return null;
  return { icon: cosmetic.icon, name: cosmetic.name };
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
