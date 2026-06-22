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
  getRaidPhaseBackground,
  getRegionCombatBackground,
  getDungeonRoomBackground,
  getTotalMapCount,
  getExpectedMapCount,
  countFiniteDungeonRooms,
  countRaidPhases,
  MIN_MAP_COUNT,
  CLASS_PORTRAITS,
  ZONE_BACKGROUNDS,
  DUNGEON_BACKGROUNDS,
  POI_MAPS,
  RAID_BACKGROUNDS,
  RAID_PHASE_BACKGROUNDS,
  DUNGEON_ROOM_BACKGROUNDS,
  REGION_COMBAT_BACKGROUNDS,
  MONSTER_SPRITES,
  NPC_PORTRAITS,
} from "./assets";
import { DUNGEONS } from "./dungeons";
import { MAP_POIS } from "./mapPOIs";
import { RAIDS } from "./raids";
import { getCampaignRankCosmeticIds } from "./factionCampaignRewards";

describe("game assets", () => {
  it("catalogues complete Terreval map coverage", () => {
    expect(getTotalMapCount()).toBe(getExpectedMapCount());
    expect(getTotalMapCount()).toBeGreaterThanOrEqual(MIN_MAP_COUNT);
    expect(Object.keys(ZONE_BACKGROUNDS)).toHaveLength(25);
    expect(Object.keys(DUNGEON_BACKGROUNDS)).toHaveLength(DUNGEONS.length);
    expect(Object.keys(POI_MAPS)).toHaveLength(MAP_POIS.length);
    expect(Object.keys(RAID_BACKGROUNDS)).toHaveLength(RAIDS.length);
    expect(Object.keys(DUNGEON_ROOM_BACKGROUNDS)).toHaveLength(countFiniteDungeonRooms());
    expect(Object.keys(RAID_PHASE_BACKGROUNDS)).toHaveLength(countRaidPhases());
    expect(Object.keys(REGION_COMBAT_BACKGROUNDS)).toHaveLength(6);
  });

  it("maps all zones to background art", () => {
    expect(getZoneBackground("jardin_initiation")).toBeDefined();
    expect(getZoneBackground("port_nebula")).toContain("port-nebula");
    expect(getZoneBackground("citadelle_stellaire")).toBeDefined();
    expect(getZoneBackground("plateau_givre")).toBeDefined();
    expect(getZoneBackground("iles_stellaires")).toBeDefined();
  });

  it("maps dungeons, POI, raids and phases to map art", () => {
    expect(getDungeonBackground("ruines_corrompues")).toContain("ruines-corrompues");
    expect(getPoiMapArt(MAP_POIS[0]!.id)).toContain("/assets/pois/");
    expect(getRaidBackground("sanctuaire_draconique")).toContain("sanctuaire-draconique");
    expect(getRaidPhaseBackground("sanctuaire_draconique", 0)).toContain("phase-1");
    expect(getDungeonRoomBackground("ruines_corrompues", 0)).toContain("room-1");
    expect(getRegionCombatBackground("plateau_givre")).toContain("combat-region-givre");
  });

  it("resolves dungeon and raid combat backgrounds", () => {
    expect(
      resolveCombatBackground({
        combatType: "dungeon",
        dungeonId: "ruines_corrompues",
        roomIndex: 0,
      })
    ).toContain("dungeon-ruines-corrompues-room-1");

    expect(
      resolveCombatBackground({
        combatType: "raid",
        raidId: "sanctuaire_draconique",
        phaseIndex: 2,
      })
    ).toContain("sanctuaire-draconique-phase-3");

    expect(
      resolveCombatBackground({
        combatType: "world",
        zoneId: "marais_ether",
      })
    ).toContain("combat-region-marais");
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
