export { UNIVERSE } from "./universe";
export { CLASSES, getClassById, getClassesByArchetype, ARCHETYPE_LABELS, type ClassArchetype } from "./classes";
export {
  getUnlockedSpellIds,
  getStartingSpellIds,
  getSpellUnlockSchedule,
  mergeUnlockedSpells,
  migrateLegacyClass,
} from "./classProgression";
export { TALENTS, getTalentById, getTalentsForArchetype, getAvailableTalents } from "./talents";
export { SPELLS, getSpellById, getSpellsForClass } from "./spells";
export { MONSTERS, getMonstersByZone, getMonsterById } from "./monsters";
export { ZONES, getZoneById } from "./zones";
export {
  MAP_REGIONS,
  getZonesByRegion,
  getRegionColor,
  canTravelBetween,
  getZoneConnections,
  zoneToMapPosition,
  TERRITORY_NODE_COLORS,
} from "./worldMap";
export { MAP_POIS, getPOIsForZone, getPOIById } from "./mapPOIs";
export { NPCS, getNpcById, getNpcsForZone } from "./npcs";
export { ITEMS, EQUIPMENT_SLOTS, getItemById, type EquipmentSlot } from "./items";
export { QUESTS, getQuestById, getQuestsForZone } from "./quests";
export { PROFESSIONS, MAX_PROFESSION_SLOTS, getProfessionById } from "./professions";
export { DUNGEONS, getDungeonById, getDungeonsForZone, getRoomMonsters } from "./dungeons";
export { RAIDS, getRaidById, getPhaseMonsters } from "./raids";
export { PETS, getPetById } from "./pets";
export { FURNITURE, HAVEN_LEVELS, getFurnitureById, getHavenLevel } from "./housing";
export { COSMETICS, GUILD_HALL_EMOTES, getCosmeticById } from "./cosmetics";
export {
  GUILD_EMBLEMS,
  GUILD_BANNERS,
  ALL_GUILD_COSMETICS,
  getGuildCosmeticById,
  type GuildCosmeticDefinition,
} from "./guildCosmetics";
export {
  FACTION_META,
  FACTION_RANKS,
  FACTION_QUESTS,
  FACTION_SHOP_ITEMS,
  getFactionRank,
  getNextFactionRank,
  meetsRankRequirement,
  getWeekKey,
  ZONE_FACTION_MAP,
  type FactionId,
} from "./factionContent";
export {
  FACTION_RANK_COSMETICS,
  getFactionRankCosmeticIds,
  getAllFactionCosmeticIds,
} from "./factionRewards";
export {
  FACTION_CAMPAIGN_TEMPLATES,
  CAMPAIGN_POINT_VALUES,
  getCampaignTemplate,
  type CampaignPointEvent,
} from "./factionCampaigns";
export {
  ZONE_BACKGROUNDS,
  DUNGEON_BACKGROUNDS,
  POI_MAPS,
  RAID_BACKGROUNDS,
  DUNGEON_ROOM_BACKGROUNDS,
  TARGET_MAP_COUNT,
  COMBAT_BACKGROUNDS,
  CLASS_PORTRAITS,
  NPC_PORTRAITS,
  ROSTER_ART,
  MONSTER_SPRITES,
  getTotalMapCount,
  getZoneBackground,
  getDungeonBackground,
  getPoiMapArt,
  getRaidBackground,
  getDungeonRoomBackground,
  resolveCombatBackground,
  getRegionOverlayForZone,
  REGION_OVERLAYS,
  getCombatBackground,
  getClassPortrait,
  getNpcPortrait,
  getMonsterPortrait,
  getMonsterTextureKey,
  hasMonsterSprite,
} from "./assets";
export {
  getZoneTerritory,
  getTerritoryXpMultiplier,
  getAllZoneTerritories,
  type TerritoryStatus,
  type ZoneTerritory,
  type CampaignProgressInput,
} from "./factionTerritories";
export {
  CAMPAIGN_RANK_REWARDS,
  getCampaignRankCosmeticIds,
} from "./factionCampaignRewards";
export {
  SEASONAL_EVENTS,
  getActiveEvent,
  getEventById,
  getEventTimeRemaining,
  type SeasonalEvent,
  type EventQuest,
} from "./events";
