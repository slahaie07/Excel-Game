import { describe, expect, it } from "vitest";
import {
  getZoneBackground,
  getCombatBackground,
  getClassPortrait,
  CLASS_PORTRAITS,
  ZONE_BACKGROUNDS,
} from "./assets";
import { getCampaignRankCosmeticIds } from "./factionCampaignRewards";

describe("game assets", () => {
  it("maps all zones to background art", () => {
    expect(Object.keys(ZONE_BACKGROUNDS)).toHaveLength(6);
    expect(getZoneBackground("port_nebula")).toContain("port-nebula");
    expect(getZoneBackground("citadelle_stellaire")).toBeDefined();
  });

  it("maps all classes to portraits", () => {
    expect(Object.keys(CLASS_PORTRAITS)).toHaveLength(10);
    expect(getClassPortrait("invocateur")).toContain("invocateur");
  });

  it("maps combat types to battle art", () => {
    expect(getCombatBackground("pvp")).toContain("/assets/combat/");
  });
});

describe("campaign rank rewards", () => {
  it("grants title and frame for rank 1", () => {
    expect(getCampaignRankCosmeticIds(1)).toEqual([
      "title_campaign_hero",
      "frame_campaign_gold",
    ]);
  });

  it("grants frame only for ranks 2 and 3", () => {
    expect(getCampaignRankCosmeticIds(2)).toEqual(["frame_campaign_silver"]);
    expect(getCampaignRankCosmeticIds(3)).toEqual(["frame_campaign_bronze"]);
  });
});
