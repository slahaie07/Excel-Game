import { describe, expect, it } from "vitest";
import {
  getZoneTerritory,
  getTerritoryXpMultiplier,
  getAllZoneTerritories,
  type CampaignProgressInput,
} from "./factionTerritories";

const balancedCampaigns: CampaignProgressInput[] = [
  { factionId: "lumina", progressPercent: 40, status: "active" },
  { factionId: "umbra", progressPercent: 40, status: "active" },
  { factionId: "neutre", progressPercent: 20, status: "active" },
];

describe("factionTerritories", () => {
  it("marks lumina home zones as fortified when lumina leads by 15+", () => {
    const campaigns: CampaignProgressInput[] = [
      { factionId: "lumina", progressPercent: 60, status: "active" },
      { factionId: "umbra", progressPercent: 30, status: "active" },
      { factionId: "neutre", progressPercent: 10, status: "active" },
    ];
    const territory = getZoneTerritory("foret_lumina", campaigns);
    expect(territory.status).toBe("fortified");
    expect(territory.xpBonusPercent).toBe(15);
    expect(territory.homeFaction).toBe("lumina");
  });

  it("marks lumina home zones as contested when umbra leads by 15+", () => {
    const campaigns: CampaignProgressInput[] = [
      { factionId: "lumina", progressPercent: 20, status: "active" },
      { factionId: "umbra", progressPercent: 50, status: "active" },
      { factionId: "neutre", progressPercent: 10, status: "active" },
    ];
    const territory = getZoneTerritory("foret_lumina", campaigns);
    expect(territory.status).toBe("contested");
    expect(territory.xpBonusPercent).toBe(0);
  });

  it("fortifies port nebula when neutre campaign leads", () => {
    const campaigns: CampaignProgressInput[] = [
      { factionId: "lumina", progressPercent: 30, status: "active" },
      { factionId: "umbra", progressPercent: 25, status: "active" },
      { factionId: "neutre", progressPercent: 45, status: "active" },
    ];
    const territory = getZoneTerritory("port_nebula", campaigns);
    expect(territory.status).toBe("fortified");
    expect(territory.xpBonusPercent).toBe(10);
  });

  it("returns stable status when campaigns are balanced", () => {
    const territory = getZoneTerritory("desert_umbra", balancedCampaigns);
    expect(territory.status).toBe("stable");
  });

  it("applies xp multiplier only for pledged faction in fortified zones", () => {
    const campaigns: CampaignProgressInput[] = [
      { factionId: "lumina", progressPercent: 70, status: "active" },
      { factionId: "umbra", progressPercent: 30, status: "active" },
      { factionId: "neutre", progressPercent: 10, status: "active" },
    ];
    expect(getTerritoryXpMultiplier("foret_lumina", campaigns, "lumina")).toBe(1.15);
    expect(getTerritoryXpMultiplier("foret_lumina", campaigns, "umbra")).toBe(1);
    expect(getTerritoryXpMultiplier("foret_lumina", campaigns, null)).toBe(1);
  });

  it("lists territories for all zones", () => {
    const zones = ["vallee_eveils", "port_nebula", "foret_lumina"];
    const territories = getAllZoneTerritories(zones, balancedCampaigns);
    expect(territories).toHaveLength(3);
    expect(territories.every((t) => t.label.length > 0)).toBe(true);
  });
});
