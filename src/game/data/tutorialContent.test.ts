import { describe, expect, it } from "vitest";
import {
  TUTORIAL_QUESTS,
  TUTORIAL_ZONE,
  TUTORIAL_ZONE_ID,
  TUTORIAL_COMPLETE_QUEST_ID,
} from "./tutorialContent";
import { ZONES } from "./zones";
import { getQuestsForZone } from "./quests";
import { getMonstersByZone } from "./monsters";
import { getDungeonsForZone } from "./dungeons";
import { canTravelBetween } from "./worldMap";

describe("tutorial zone", () => {
  it("registers jardin_initiation in world data", () => {
    const zone = ZONES.find((z) => z.id === TUTORIAL_ZONE_ID);
    expect(zone).toBeDefined();
    expect(zone!.name).toBe(TUTORIAL_ZONE.name);
    expect(canTravelBetween(TUTORIAL_ZONE_ID, "vallee_eveils")).toBe(true);
  });

  it("has tutorial quests chain ending with depart", () => {
    expect(TUTORIAL_QUESTS.length).toBe(6);
    const last = TUTORIAL_QUESTS.find((q) => q.id === TUTORIAL_COMPLETE_QUEST_ID);
    expect(last?.giverNpcId).toBe("gardien_passage");
    expect(getQuestsForZone(TUTORIAL_ZONE_ID).length).toBeGreaterThanOrEqual(6);
  });

  it("has monsters and demo dungeon", () => {
    expect(getMonstersByZone(TUTORIAL_ZONE_ID).length).toBeGreaterThanOrEqual(3);
    expect(getDungeonsForZone(TUTORIAL_ZONE_ID).some((d) => d.id === "alcove_demo")).toBe(true);
  });
});
