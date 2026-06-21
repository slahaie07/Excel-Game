import { describe, it, expect } from "vitest";
import {
  computeTalentModifiers,
  applyCombatStartTalents,
  scaleHealAmount,
  computeSpellDamage,
  getEffectiveMaxRange,
} from "./talentModifiers";

describe("talentModifiers", () => {
  it("aggregates heal bonus from serenite_sacree", () => {
    const mods = computeTalentModifiers(["serenite_sacree"]);
    expect(mods.healBonusPct).toBe(12);
    expect(scaleHealAmount(20, mods)).toBe(22);
  });

  it("applies max hp and bonus mp at combat start", () => {
    const result = applyCombatStartTalents(100, 100, 3, ["peau_roche", "assaut_eclair"]);
    expect(result.maxHp).toBe(108);
    expect(result.hp).toBe(108);
    expect(result.maxMp).toBe(4);
  });

  it("boosts magic damage for fire spells", () => {
    const mods = computeTalentModifiers(["flux_arcanique", "lame_brutale"]);
    const dmg = computeSpellDamage(
      10,
      mods,
      computeTalentModifiers([]),
      { element: "fire", minRange: 1, maxRange: 6, area: 0 }
    );
    expect(dmg).toBeGreaterThan(10);
  });

  it("reduces incoming damage with defense passive", () => {
    const targetMods = computeTalentModifiers(["rempart_vivant"]);
    const dmg = computeSpellDamage(
      20,
      computeTalentModifiers([]),
      targetMods,
      { minRange: 1, maxRange: 1, area: 0 }
    );
    expect(dmg).toBe(19);
  });

  it("extends max range with oeil_aigle", () => {
    const mods = computeTalentModifiers(["oeil_aigle"]);
    expect(getEffectiveMaxRange(8, mods)).toBe(9);
  });
});
