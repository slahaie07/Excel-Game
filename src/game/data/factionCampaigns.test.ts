import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_POINT_VALUES,
  FACTION_CAMPAIGN_TEMPLATES,
  getCampaignTemplate,
} from "./factionCampaigns";

describe("factionCampaigns", () => {
  it("defines a weekly campaign per faction", () => {
    const factions = new Set(FACTION_CAMPAIGN_TEMPLATES.map((c) => c.factionId));
    expect(factions).toEqual(new Set(["lumina", "umbra", "neutre"]));
  });

  it("uses positive point values for events", () => {
    expect(CAMPAIGN_POINT_VALUES.world_kill).toBeGreaterThan(0);
    expect(CAMPAIGN_POINT_VALUES.pvp_win).toBeGreaterThan(CAMPAIGN_POINT_VALUES.world_kill);
    expect(CAMPAIGN_POINT_VALUES.quest_claim).toBeGreaterThan(CAMPAIGN_POINT_VALUES.shop_purchase);
  });

  it("requires minimum contribution to claim rewards", () => {
    for (const template of FACTION_CAMPAIGN_TEMPLATES) {
      expect(template.minContribution).toBeGreaterThan(0);
      expect(template.target).toBeGreaterThan(template.minContribution);
    }
  });

  it("returns template by faction id", () => {
    const lumina = getCampaignTemplate("lumina");
    expect(lumina.id).toBe("lumina_purify");
  });
});
