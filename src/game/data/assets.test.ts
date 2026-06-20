import { describe, expect, it } from "vitest";
import {
  getZoneBackground,
  getCombatBackground,
  getClassPortrait,
  ZONE_BACKGROUNDS,
  CLASS_PORTRAITS,
} from "./assets";

describe("game assets", () => {
  it("maps zones to background art", () => {
    expect(getZoneBackground("vallee_eveils")).toBe(ZONE_BACKGROUNDS.vallee_eveils);
    expect(getZoneBackground("unknown_zone")).toBeUndefined();
  });

  it("maps combat types to battle art", () => {
    expect(getCombatBackground("pvp")).toContain("/assets/combat/");
    expect(getCombatBackground()).toContain("/assets/combat/");
  });

  it("maps classes with portraits", () => {
    expect(getClassPortrait("pyromancien")).toBe(CLASS_PORTRAITS.pyromancien);
    expect(getClassPortrait("luminaire")).toBeUndefined();
  });
});
