import { getPetById } from "../game/data/pets";
import { loadCharacter } from "./characterStorage";

export interface PetCombatBonuses {
  damagePercent: number;
  healAfterCombat: number;
  defensePercent: number;
  xpPercent: number;
  eclatsPercent: number;
}

export function getPetCombatBonuses(characterId: string): PetCombatBonuses {
  const char = loadCharacter(characterId);
  const empty: PetCombatBonuses = {
    damagePercent: 0,
    healAfterCombat: 0,
    defensePercent: 0,
    xpPercent: 0,
    eclatsPercent: 0,
  };
  if (!char?.petId) return empty;

  const pet = getPetById(char.petId);
  if (!pet) return empty;

  switch (pet.bonusType) {
    case "damage":
      return { ...empty, damagePercent: pet.bonusValue };
    case "heal":
      return { ...empty, healAfterCombat: pet.bonusValue };
    case "defense":
      return { ...empty, defensePercent: pet.bonusValue };
    case "xp":
      return { ...empty, xpPercent: pet.bonusValue };
    case "eclats":
      return { ...empty, eclatsPercent: pet.bonusValue };
    default:
      return empty;
  }
}

export function applyPetXpBonus(baseXp: number, bonusPercent: number): number {
  return Math.floor(baseXp * (1 + bonusPercent / 100));
}

export function applyPetEclatsBonus(baseEclats: number, bonusPercent: number): number {
  return Math.floor(baseEclats * (1 + bonusPercent / 100));
}
