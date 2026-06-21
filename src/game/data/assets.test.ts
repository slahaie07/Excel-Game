import { describe, expect, it } from "vitest";
import {
  getZoneBackground,
  getRegionOverlayForZone,
  REGION_OVERLAYS,
  getCombatBackground,
  getClassPortrait,
  getMonsterPortrait,
  getMonsterTextureKey,
  hasMonsterSprite,
  CLASS_PORTRAITS,
  ZONE_BACKGROUNDS,
  MONSTER_SPRITES,
} from "./assets";
import { getCampaignRankCosmeticIds } from "./factionCampaignRewards";

describe("game assets", () => {
  it("maps all zones to background art", () => {
    expect(Object.keys(ZONE_BACKGROUNDS)).toHaveLength(24);
    expect(getZoneBackground("port_nebula")).toContain("port-nebula");
    expect(getZoneBackground("citadelle_stellaire")).toBeDefined();
    expect(getZoneBackground("plateau_givre")).toBeDefined();
    expect(getZoneBackground("iles_stellaires")).toBeDefined();
  });

  it("provides regional overlay tints for v4.0 zones", () => {
    expect(Object.keys(REGION_OVERLAYS)).toHaveLength(6);
    expect(getRegionOverlayForZone("plateau_givre")).toContain("linear-gradient");
    expect(getRegionOverlayForZone("marais_ether")).toContain("linear-gradient");
    expect(getRegionOverlayForZone("vallee_cendres")).toContain("linear-gradient");
    expect(getRegionOverlayForZone("iles_stellaires")).toContain("linear-gradient");
  });

  it("maps all classes to portraits", () => {
    expect(Object.keys(CLASS_PORTRAITS)).toHaveLength(15);
    expect(getClassPortrait("invocateur")).toContain("invocateur");
  });

  it("maps combat types to battle art", () => {
    expect(getCombatBackground("pvp")).toContain("/assets/combat/");
  });

  it("maps monsters to sprite art", () => {
    expect(Object.keys(MONSTER_SPRITES)).toHaveLength(15);
    expect(hasMonsterSprite("dragon_aether")).toBe(true);
    expect(hasMonsterSprite("fee_brume")).toBe(true);
    expect(hasMonsterSprite("event_cristal_ancien")).toBe(true);
    expect(getMonsterPortrait("loup_cristal")).toContain("loup-cristal");
    expect(getMonsterTextureKey("graine_ombre")).toBe("monster_graine_ombre");
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
