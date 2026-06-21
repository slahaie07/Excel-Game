import { describe, it, expect } from "vitest";
import { CLASSES } from "./classes";
import { SPELLS } from "./spells";
import { getUnlockedSpellIds, getStartingSpellIds, migrateLegacyClass } from "./classProgression";
import { TALENTS, getAvailableTalents } from "./talents";

const STAT_KEYS = ["vitality", "wisdom", "strength", "intelligence", "agility", "chance"] as const;

describe("15 classes balance (Dofus Touch)", () => {
  it("has exactly 15 classes in 5 archetypes × 3", () => {
    expect(CLASSES).toHaveLength(15);
    const archetypes = new Set(CLASSES.map((c) => c.archetype));
    expect(archetypes.size).toBe(5);
    for (const archetype of archetypes) {
      expect(CLASSES.filter((c) => c.archetype === archetype)).toHaveLength(3);
    }
  });

  it("each class has 60 stat points", () => {
    for (const cls of CLASSES) {
      const total = STAT_KEYS.reduce((sum, key) => sum + cls.baseStats[key], 0);
      expect(total).toBe(60);
    }
  });

  it("each class has exactly 5 spells", () => {
    for (const cls of CLASSES) {
      const classSpells = SPELLS.filter((s) => s.classId === cls.id);
      expect(classSpells).toHaveLength(5);
    }
  });

  it("basic spells deal 9-15 damage or heal 15-25 at 3 AP", () => {
    const basics = SPELLS.filter((s) => s.levelRequired === 1 && s.apCost === 3);
    for (const spell of basics) {
      const damage = spell.effects.find((e) => e.type === "damage");
      const heal = spell.effects.find((e) => e.type === "heal");
      if (damage && damage.type === "damage") {
        expect(damage.min).toBeGreaterThanOrEqual(9);
        expect(damage.max).toBeLessThanOrEqual(15);
      }
      if (heal && heal.type === "heal") {
        expect(heal.min).toBe(15);
        expect(heal.max).toBe(25);
      }
    }
  });
});

describe("class progression", () => {
  it("starts with only level-1 spells", () => {
    const pyroStart = getStartingSpellIds("pyromancien");
    expect(pyroStart).toEqual(["flamme_cristalline"]);

    const gardienStart = getStartingSpellIds("gardien");
    expect(gardienStart).toContain("mur_cristal");
    expect(gardienStart).toContain("provocation");
    expect(gardienStart).not.toContain("fracas_tellurique");
  });

  it("unlocks all spells by level 18", () => {
    for (const cls of CLASSES) {
      const unlocked = getUnlockedSpellIds(cls.id, 18);
      expect(unlocked).toHaveLength(5);
    }
  });

  it("migrates chronomancien to cryomancien", () => {
    const result = migrateLegacyClass("chronomancien", [
      "ralentissement",
      "acceleration",
      "paradoxe_temporel",
    ]);
    expect(result.classId).toBe("cryomancien");
    expect(result.spells).toContain("prison_glace");
  });
});

describe("talents", () => {
  it("offers 2 tier-1 choices per archetype at level 10", () => {
    const available = getAvailableTalents("healer", 10, []);
    expect(available.filter((t) => t.tier === 1)).toHaveLength(2);
  });

  it("has 4 talents per archetype", () => {
    for (const archetype of ["healer", "magic", "shield", "burst", "ranged"] as const) {
      expect(TALENTS.filter((t) => t.archetype === archetype)).toHaveLength(4);
    }
  });
});
