import { useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getActiveEvent } from "../game/data/events";

interface CloudEncounterStarterProps {
  characterId: Id<"characters">;
  zoneId: string;
  onReady: (starter: (monsterId: string) => Promise<void>) => void;
}

/** Registers cloud combat start callback for WorldScreen encounters. */
export function CloudEncounterStarter({ characterId, zoneId, onReady }: CloudEncounterStarterProps) {
  const setCombat = useGameStore((s) => s.setCombat);
  const startCombat = useMutation(api.combat.startCombat);
  const activeEvent = getActiveEvent();

  const starter = useCallback(async (monsterId: string) => {
    const isEventMonster = activeEvent?.exclusiveMonsters.includes(monsterId);
    const combatId = await startCombat({
      characterId,
      monsterIds: [monsterId],
      zoneId,
    });
    const localId = `cloud_${combatId}`;
    localStorage.setItem(`aetheris-combat-${localId}`, JSON.stringify({
      type: isEventMonster ? "event" : "world",
      monsterIds: [monsterId],
      zoneId,
      characterId,
      convexCombatId: combatId,
      eventId: isEventMonster ? activeEvent?.id : undefined,
      xpMultiplier: isEventMonster ? activeEvent?.bonuses.xpMultiplier : 1,
      eclatsMultiplier: isEventMonster ? activeEvent?.bonuses.eclatsMultiplier : 1,
    }));
    setCombat(localId, { convexCombatId: combatId });
  }, [characterId, zoneId, startCombat, setCombat, activeEvent]);

  useEffect(() => {
    onReady(starter);
  }, [onReady, starter]);

  return null;
}
