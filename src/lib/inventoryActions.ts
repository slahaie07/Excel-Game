import { getItemById, EQUIPMENT_SLOTS, type EquipmentSlot } from "../game/data";
import type { CharacterData } from "./characterStorage";
import { loadCharacter, saveCharacter, updateCharacter } from "./characterStorage";
import { refreshCollectQuestProgress } from "./questProgress";

function inventoryCount(inventory: CharacterData["inventory"], itemId: string): number {
  return inventory.find((i) => i.itemId === itemId)?.quantity ?? 0;
}

function removeFromInventoryStack(
  inventory: CharacterData["inventory"],
  itemId: string,
  quantity: number
): CharacterData["inventory"] {
  return inventory
    .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i))
    .filter((i) => i.quantity > 0);
}

export function equipItem(characterId: string, itemId: string): boolean {
  const char = loadCharacter(characterId);
  const item = getItemById(itemId);
  if (!char || !item) return false;
  if (!EQUIPMENT_SLOTS.includes(item.type as EquipmentSlot)) return false;
  if (inventoryCount(char.inventory, itemId) < 1) return false;

  const slot = item.type as EquipmentSlot;
  const previous = char.equipment[slot];
  let inventory = removeFromInventoryStack(char.inventory, itemId, 1);
  if (previous) {
    const existing = inventory.find((i) => i.itemId === previous);
    if (existing) existing.quantity += 1;
    else inventory.push({ itemId: previous, quantity: 1 });
  }

  updateCharacter(characterId, {
    inventory,
    equipment: { ...char.equipment, [slot]: itemId },
  });
  return true;
}

export function unequipItem(characterId: string, slot: EquipmentSlot): boolean {
  const char = loadCharacter(characterId);
  if (!char) return false;
  const itemId = char.equipment[slot];
  if (!itemId) return false;

  const inventory = [...char.inventory];
  const existing = inventory.find((i) => i.itemId === itemId);
  if (existing) existing.quantity += 1;
  else inventory.push({ itemId, quantity: 1 });

  const equipment = { ...char.equipment };
  delete equipment[slot];

  updateCharacter(characterId, { inventory, equipment });
  return true;
}

export function useConsumable(characterId: string, itemId: string): string | null {
  const char = loadCharacter(characterId);
  const item = getItemById(itemId);
  if (!char || !item || item.type !== "consumable") return "Objet invalide";
  if (inventoryCount(char.inventory, itemId) < 1) return "Objet manquant";

  let inventory = removeFromInventoryStack(char.inventory, itemId, 1);
  let hp = char.hp;
  let ap = char.ap ?? char.maxAp ?? 6;
  const maxHp = char.maxHp;
  const maxAp = char.maxAp ?? 6;

  if (itemId === "potion_vie" || itemId === "pain_eveil") {
    const heal = itemId === "potion_vie" ? 50 : 20;
    hp = Math.min(maxHp, hp + heal);
  } else if (itemId === "potion_energie" || itemId === "potion_tempete") {
    const flux = itemId === "potion_energie" ? 3 : 5;
    ap = Math.min(maxAp, ap + flux);
  } else if (itemId === "festin_champions") {
    hp = Math.min(maxHp, hp + 200);
    ap = Math.min(maxAp, ap + 2);
  } else {
    hp = Math.min(maxHp, hp + 30);
  }

  saveCharacter(characterId, { ...char, inventory, hp, ap });
  refreshCollectQuestProgress(characterId);
  return null;
}

export function getEquippedStats(characterId: string): Record<string, number> {
  const char = loadCharacter(characterId);
  if (!char) return {};
  const totals: Record<string, number> = {};
  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = char.equipment[slot];
    if (!itemId) continue;
    const item = getItemById(itemId);
    if (!item?.stats) continue;
    for (const [key, val] of Object.entries(item.stats)) {
      totals[key] = (totals[key] ?? 0) + val;
    }
  }
  return totals;
}
