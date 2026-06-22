import { describe, expect, it } from "vitest";
import {
  getZoneBackground,
  getRegionOverlayForZone,
  REGION_OVERLAYS,
  getCombatBackground,
  resolveCombatBackground,
  getClassPortrait,
  getMonsterPortrait,
  getMonsterTextureKey,
  hasMonsterSprite,
  getDungeonBackground,
  getPoiMapArt,
  getRaidBackground,
  getDungeonRoomBackground,
  getTotalMapCount,
  TARGET_MAP_COUNT,
  CLASS_PORTRAITS,
  ZONE_BACKGROUNDS,
  DUNGEON_BACKGROUNDS,
  POI_MAPS,
  RAID_BACKGROUNDS,
  DUNGEON_ROOM_BACKGROUNDS,
  MONSTER_SPRITES,
  NPC_PORTRAITS,
} from "./assets";
import { DUNGEONS } from "./dungeons";
import { MAP_POIS } from "./mapPOIs";
import { RAIDS } from "./raids";
import { getCampaignRankCosmeticIds } from "./factionCampaignRewards";

describe("game assets", () => {
  it("catalogues 350 maps across Terreval", () => {
    expect(getTotalMapCount()).toBe(TARGET_MAP_COUNT);
    expect(Object.keys(ZONE_BACKGROUNDS)).toHaveLength(25);
    expect(Object.keys(DUNGEON_BACKGROUNDS)).toHaveLength(DUNGEONS.length);
    expect(Object.keys(POI_MAPS)).toHaveLength(MAP_POIS.length);
    expect(Object.keys(RAID_BACKGROUNDS)).toHaveLength(RAIDS.length);
    expect(Object.keys(DUNGEON_ROOM_BACKGROUNDS).length).toBeGreaterThanOrEqual(155);
  });

  it("maps all zones to background art", () => {
    expect(getZoneBackground("jardin_initiation")).toBeDefined();
    expect(getZoneBackground("port_nebula")).toContain("port-nebula");
    expect(getZoneBackground("citadelle_stellaire")).toBeDefined();
    expect(getZoneBackground("plateau_givre")).toBeDefined();
    expect(getZoneBackground("iles_stellaires")).toBeDefined();
  });

  it("maps dungeons, POI and raids to map art", () => {
    expect(getDungeonBackground("ruines_corrompues")).toContain("ruines-corrompues");
    expect(getPoiMapArt(MAP_POIS[0]!.id)).toContain("/assets/pois/");
    expect(getRaidBackground("sanctuaire_draconique")).toContain("sanctuaire-draconique");
    expect(getDungeonRoomBackground("ruines_corrompues", 0)).toContain("room-1");
  });

  it("resolves dungeon combat backgrounds from room art", () => {
    const bg = resolveCombatBackground({
      combatType: "dungeon",
      dungeonId: "ruines_corrompues",
      roomIndex: 0,
    });
    expect(bg).toContain("dungeon-ruines-corrompues-room-1");
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
    expect(Object.keys(MONSTER_SPRITES).length).toBeGreaterThanOrEqual(100);
    expect(hasMonsterSprite("dragon_aether")).toBe(true);
    expect(hasMonsterSprite("fee_brume")).toBe(true);
    expect(hasMonsterSprite("etincelle_naissante")).toBe(true);
    expect(hasMonsterSprite("echo_entrainement")).toBe(true);
    expect(getMonsterPortrait("loup_cristal")).toContain("loup-cristal");
    expect(getMonsterTextureKey("graine_ombre")).toBe("monster_graine_ombre");
  });

  it("maps NPCs to portrait art", () => {
    expect(Object.keys(NPC_PORTRAITS).length).toBeGreaterThanOrEqual(40);
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
