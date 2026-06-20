import { describe, it, expect } from "vitest";
import { applySpellEffects, tickBuffs } from "./effects";

describe("combat effects", () => {
  const baseEntity = {
    entityId: "p1",
    hp: 100,
    maxHp: 100,
    ap: 6,
    maxAp: 6,
    mp: 3,
    maxMp: 3,
    buffs: [],
    isAlive: true,
    team: "player" as const,
  };

  it("applies damage to target", () => {
    const target = { ...baseEntity, entityId: "e1", team: "enemy" as const, hp: 50 };
    const result = applySpellEffects(
      baseEntity,
      target,
      [{ type: "damage", element: "fire", min: 10, max: 10 }]
    );
    expect(result.target?.hp).toBe(40);
    expect(result.damage).toBe(10);
  });

  it("applies heal to caster", () => {
    const wounded = { ...baseEntity, hp: 50 };
    const result = applySpellEffects(
      wounded,
      undefined,
      [{ type: "heal", min: 20, max: 20 }]
    );
    expect(result.caster.hp).toBe(70);
    expect(result.heal).toBe(20);
  });

  it("ticks buff duration", () => {
    const withBuff = {
      ...baseEntity,
      buffs: [{ stat: "damage", value: 30, duration: 2 }],
    };
    const ticked = tickBuffs(withBuff);
    expect(ticked.buffs).toHaveLength(1);
    expect(ticked.buffs[0]?.duration).toBe(1);
  });
});
