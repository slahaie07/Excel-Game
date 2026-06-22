import { beforeEach, describe, it, expect, vi } from "vitest";
import { buyMount, equipMount, getPlayerCombatStats } from "./mountEngine";
import { saveCharacter } from "./characterStorage";

const storage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
  });
});

const baseChar = {
  name: "Test",
  classId: "pyromancien",
  level: 20,
  xp: 0,
  xpToNext: 100,
  hp: 100,
  maxHp: 100,
  eclats: 5000,
  zoneId: "vallee",
  spells: [],
  inventory: [],
  equipment: {},
  activeQuests: [],
  completedQuests: [],
  stats: { vitality: 10, wisdom: 10, strength: 10, intelligence: 10, agility: 10, chance: 10 },
  ownedMounts: [] as string[],
};

describe("mountEngine", () => {
  it("rejects purchase when éclats are insufficient", () => {
    saveCharacter("c1", { ...baseChar, eclats: 10 });
    const result = buyMount("c1", "mount_poney");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("Éclats");
  });

  it("buys and equips a mount", () => {
    saveCharacter("c1", baseChar);
    const buy = buyMount("c1", "mount_poney");
    expect(buy.success).toBe(true);

    const equip = equipMount("c1", "mount_poney");
    expect(equip.success).toBe(true);
    if (equip.success) expect(equip.character.mountId).toBe("mount_poney");
  });

  it("applies mount PM bonus to combat stats", () => {
    saveCharacter("c1", { ...baseChar, ownedMounts: ["mount_poney"], mountId: "mount_poney" });
    const stats = getPlayerCombatStats("c1");
    expect(stats).not.toBeNull();
    expect(stats!.maxMp).toBeGreaterThan(3);
  });
});
