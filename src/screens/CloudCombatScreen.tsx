import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getSpellById, getSpellsForClass } from "../game/data";
import { IsoCombatScene, type CombatEntityVisual } from "../game/rendering/IsoCombatScene";
import { getMonsterIcon, getClassIcon } from "../game/rendering/isometric";
import { getCombatBackground } from "../game/data/assets";
import { VictoryRewardBreakdown } from "../components/VictoryRewardBreakdown";
import { formatBuffs } from "../game/combat/effects";
import { getDungeonById, getRoomMonsters, getRaidById, getPhaseMonsters } from "../game/data";
import { cacheCloudCombat, buildCloudCombatLocalId } from "../lib/cloudCombat";
import { FLUX, ELAN, formatElanMove, mapCombatError } from "../lib/gameTerms";
import { advanceQuestOnKill } from "../lib/questProgress";

interface CloudEntity {
  entityId: string;
  name: string;
  isPlayer: boolean;
  ownerCharacterId?: string;
  classId?: string;
  monsterId?: string;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  x: number;
  y: number;
  team: "player" | "enemy";
  isAlive: boolean;
  buffs?: { stat: string; value: number; duration: number }[];
}

export default function CloudCombatScreen() {
  const combatId = useGameStore((s) => s.combatId)!;
  const convexCombatId = useGameStore((s) => s.convexCombatId)! as Id<"combats">;
  const classId = useGameStore((s) => s.classId)!;
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const setCombat = useGameStore((s) => s.setCombat);

  const combatDoc = useQuery(api.combat.getCombat, { combatId: convexCombatId });
  const charDoc = useQuery(api.characters.getCharacter, { characterId });
  const zoneId = useGameStore((s) => s.zoneId);
  const territoryInfo = useQuery(api.factionCampaigns.getFactionTerritory, {
    zoneId,
    characterId,
  });
  const moveEntityMut = useMutation(api.combat.moveEntity);
  const castSpellMut = useMutation(api.combat.castSpell);
  const endTurnMut = useMutation(api.combat.endTurn);
  const fleeMut = useMutation(api.combat.fleeCombat);
  const applyRewards = useMutation(api.combat.applyVictoryRewards);
  const completePvp = useMutation(api.pvp.completeMatch);
  const advanceRoom = useMutation(api.dungeons.advanceRoom);
  const advancePhase = useMutation(api.raids.advancePhase);
  const startDungeonCombat = useMutation(api.combat.startDungeonCombat);
  const startRaidCombat = useMutation(api.combat.startRaidCombat);

  const combatData = JSON.parse(localStorage.getItem(`aetheris-combat-${combatId}`) ?? "{}");
  const combatType = combatData.type ?? "world";

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<IsoCombatScene | null>(null);
  const prevEntitiesRef = useRef<CloudEntity[]>([]);

  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Combat cloud synchronisé !"]);
  const [dungeonComplete, setDungeonComplete] = useState(false);
  const [dungeonRewards, setDungeonRewards] = useState<{ xp: number; eclats: number } | null>(null);
  const [raidComplete, setRaidComplete] = useState(false);
  const [raidRewards, setRaidRewards] = useState<{ xp: number; eclats: number } | null>(null);

  const entities: CloudEntity[] = combatDoc?.entities ?? [];
  const myEntity = entities.find(
    (e) => e.ownerCharacterId === characterId || (e.isPlayer && !entities.some((x) => x.ownerCharacterId))
  );
  const playerEntityId = myEntity?.entityId ?? "";
  const knownSpellIds = charDoc?.spells ?? [];
  const spells = getSpellsForClass(classId).filter((s) => knownSpellIds.includes(s.id));
  const isPlayerTurn = combatDoc?.currentEntityId === playerEntityId && combatDoc?.status === "active";
  const player = myEntity;
  const coopAllies = entities.filter((e) => e.team === "player" && e.isAlive).length;
  const result = combatDoc?.status === "victory" ? "victory" as const
    : combatDoc?.status === "defeat" ? "defeat" as const : null;

  const toVisual = useCallback((ents: CloudEntity[], currentId: string): CombatEntityVisual[] =>
    ents.map((e) => ({
      entityId: e.entityId,
      name: e.name,
      gridX: e.x,
      gridY: e.y,
      icon: e.team === "player"
        ? getClassIcon(e.classId ?? classId)
        : getMonsterIcon(e.monsterId ?? "graine_ombre"),
      classId: e.team === "player" ? (e.classId ?? classId) : undefined,
      monsterId: e.team === "enemy" ? (e.monsterId ?? "graine_ombre") : undefined,
      hp: e.hp,
      maxHp: e.maxHp,
      team: e.team,
      isAlive: e.isAlive,
      isCurrent: e.entityId === currentId,
    })), [classId]);

  const handleCellClick = useCallback(async (x: number, y: number) => {
    if (!isPlayerTurn || !player || !combatDoc) return;

    try {
      if (selectedSpell) {
        const spell = getSpellById(selectedSpell);
        if (!spell || player.ap < spell.apCost) return;
        const res = await castSpellMut({
          combatId: convexCombatId,
          entityId: playerEntityId,
          spellId: selectedSpell,
          targetX: x,
          targetY: y,
        });
        setSelectedSpell(null);
        sceneRef.current?.playSpellEffect(player.x, player.y, x, y, spell.apCost > 3 ? 0xff6600 : 0x44aaff);
        if (res.damage) {
          sceneRef.current?.playAttackEffect(player.x, player.y, x, y);
          setLog((p) => [...p, `${spell.name} : ${res.damage} dégâts`]);
        }
        if (res.heal) setLog((p) => [...p, `Soin : +${res.heal} PV`]);
      } else {
        const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
        if (distance > player.mp || distance === 0) return;
        await moveEntityMut({
          combatId: convexCombatId,
          entityId: playerEntityId,
          targetX: x,
          targetY: y,
        });
        setLog((p) => [...p, formatElanMove(distance)]);
      }
    } catch (e) {
      setLog((p) => [...p, mapCombatError(e instanceof Error ? e.message : "Erreur")]);
    }
  }, [isPlayerTurn, player, combatDoc, selectedSpell, castSpellMut, moveEntityMut, convexCombatId, playerEntityId]);

  const endTurn = async () => {
    if (!playerEntityId) return;
    try {
      await endTurnMut({ combatId: convexCombatId, entityId: playerEntityId });
      setLog((p) => [...p, "Fin du tour"]);
    } catch (e) {
      setLog((p) => [...p, mapCombatError(e instanceof Error ? e.message : "Erreur")]);
    }
  };

  useEffect(() => {
    if (combatDoc?.status === "victory") {
      const zoneId = useGameStore.getState().zoneId;
      for (const entity of combatDoc.entities) {
        if (entity.team === "enemy" && entity.monsterId) {
          advanceQuestOnKill(characterId, entity.monsterId, zoneId);
        }
      }
      void applyRewards({ combatId: convexCombatId, characterId });
      if (combatType === "dungeon" && combatData.convexRunId) {
        void advanceRoom({ runId: combatData.convexRunId as Id<"dungeonRuns"> }).then((res) => {
          if (res.isComplete) {
            setDungeonComplete(true);
            const dungeon = combatData.dungeonId ? getDungeonById(combatData.dungeonId) : null;
            setDungeonRewards(dungeon?.rewards ?? null);
          }
        });
      }
      if (combatType === "raid" && combatData.convexRaidRunId) {
        void advancePhase({ runId: combatData.convexRaidRunId as Id<"raidRuns"> }).then((res) => {
          if (res.isComplete) {
            setRaidComplete(true);
            const raid = combatData.raidId ? getRaidById(combatData.raidId) : null;
            setRaidRewards(raid?.rewards ?? null);
          }
        });
      }
      if (combatType === "pvp" && combatData.convexMatchId) {
        const isTeamA = combatData.isTeamA ?? true;
        void completePvp({
          matchId: combatData.convexMatchId as Id<"pvpMatches">,
          winnerTeam: isTeamA ? "A" : "B",
        });
      }
    }
    if (combatDoc?.status === "defeat" && combatType === "pvp" && combatData.convexMatchId) {
      const isTeamA = combatData.isTeamA ?? true;
      void completePvp({
        matchId: combatData.convexMatchId as Id<"pvpMatches">,
        winnerTeam: isTeamA ? "B" : "A",
      });
    }
  }, [combatDoc?.status, combatType, combatData, convexCombatId, characterId, applyRewards, completePvp, advanceRoom, advancePhase]);

  useEffect(() => {
    if (!gameRef.current || !combatDoc) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: gameRef.current.clientWidth,
      height: 380,
      backgroundColor: "#0d0618",
      scene: IsoCombatScene,
    };

    phaserRef.current = new Phaser.Game(config);
    phaserRef.current.scene.start("IsoCombatScene", {
      entities: toVisual(entities, combatDoc.currentEntityId),
      currentEntityId: combatDoc.currentEntityId,
      onCellClick: handleCellClick,
      combatType,
    });
    sceneRef.current = phaserRef.current.scene.getScene("IsoCombatScene") as IsoCombatScene;

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, [combatDoc?._id]);

  useEffect(() => {
    if (!combatDoc) return;
    sceneRef.current?.updateEntities(
      toVisual(entities, combatDoc.currentEntityId),
      combatDoc.currentEntityId
    );

    const prev = prevEntitiesRef.current;
    const cur = combatDoc.entities;
    if (prev.length > 0 && cur.length > 0) {
      const prevPlayer = prev.find(
        (e) => e.ownerCharacterId === characterId || (e.isPlayer && e.team === "player")
      );
      const curPlayer = cur.find(
        (e) => e.ownerCharacterId === characterId || (e.isPlayer && e.team === "player")
      );
      if (prevPlayer && curPlayer && curPlayer.hp < prevPlayer.hp) {
        const enemy = prev.find((e) => e.team === "enemy" && e.isAlive);
        if (enemy) {
          sceneRef.current?.playAttackEffect(enemy.x, enemy.y, curPlayer.x, curPlayer.y);
        }
      }
      for (const ent of prev) {
        if (ent.team === "enemy" && ent.isAlive) {
          const now = cur.find((e) => e.entityId === ent.entityId);
          if (now && !now.isAlive) {
            sceneRef.current?.playDeathEffect(ent.x, ent.y);
          }
        }
      }
    }
    prevEntitiesRef.current = cur;
  }, [entities, combatDoc?.currentEntityId, combatDoc, toVisual, characterId]);

  if (!combatDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-aether-950 text-aether-400">
        Synchronisation du combat...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-aether-950 relative">
      <div className="flex items-center justify-between p-3 bg-aether-900/80">
        <span className="font-display font-bold text-aether-200">
          ☁️ Combat{coopAllies > 1 ? ` (${coopAllies} joueurs)` : ""} — Tour {combatDoc.turn}
        </span>
        <button
          onClick={() => void fleeMut({ combatId: convexCombatId, characterId }).then(() => setCombat(null))}
          className="text-aether-400 text-sm"
        >
          Fuir
        </button>
      </div>

      <div className="relative flex-shrink-0" style={{ height: 380 }}>
        <img
          src={getCombatBackground(combatType)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        <div ref={gameRef} className="relative z-10 w-full h-full" />
      </div>

      {player && (
        <div className="px-4 py-2 flex flex-wrap gap-4 text-sm">
          <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
          <span className="text-orange-400">⚡ {player.ap}/{player.maxAp} {FLUX}</span>
          <span className="text-blue-400">👟 {player.mp}/{player.maxMp} {ELAN}</span>
          {player.buffs && player.buffs.length > 0 && (
            <span className="text-purple-400 text-xs">✨ {formatBuffs(player.buffs)}</span>
          )}
        </div>
      )}

      {isPlayerTurn && player && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {spells.map((spell) => (
              <button
                key={spell.id}
                onClick={() => setSelectedSpell(selectedSpell === spell.id ? null : spell.id)}
                disabled={player.ap < spell.apCost}
                className={`flex-shrink-0 card p-2 text-center min-w-[70px] ${
                  selectedSpell === spell.id ? "border-aether-500 ring-2 ring-aether-500/30" : ""
                } ${player.ap < spell.apCost ? "opacity-40" : ""}`}
              >
                <span className="text-xl">{spell.icon}</span>
                <p className="text-[10px] text-aether-300 mt-1">{spell.name}</p>
                <p className="text-[9px] text-orange-400">{spell.apCost} {FLUX}</p>
              </button>
            ))}
          </div>
          <button onClick={() => void endTurn()} className="btn-secondary w-full mt-2">Fin du tour</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {log.slice(-5).map((entry, i) => (
          <p key={i} className="text-aether-400 text-xs mb-1">{entry}</p>
        ))}
      </div>

      {result && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card text-center p-8 max-w-xs">
            <div className="text-5xl mb-4">{result === "victory" ? "🎉" : "💀"}</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {result === "victory" ? "Victoire !" : "Défaite"}
            </h2>
            {result === "victory" && combatDoc.rewards && (combatType === "world" || combatType === "event") && (
              <VictoryRewardBreakdown
                xp={combatDoc.rewards.xp}
                eclats={combatDoc.rewards.eclats}
                territoryMultiplier={territoryInfo?.xpMultiplier ?? 1}
                eventMultiplier={combatType === "event" ? (combatData.xpMultiplier ?? 1) : 1}
                baseXp={
                  territoryInfo && territoryInfo.xpMultiplier > 1
                    ? Math.round(combatDoc.rewards.xp / territoryInfo.xpMultiplier)
                    : combatDoc.rewards.xp
                }
              />
            )}
            {result === "victory" && combatDoc.rewards && combatType !== "world" && combatType !== "event" && (
              <p className="text-aether-300 text-sm mb-4">
                +{combatDoc.rewards.xp} XP • +{combatDoc.rewards.eclats} ✦
              </p>
            )}
            {result === "victory" && dungeonComplete && dungeonRewards && (
              <p className="text-aether-300 text-sm mb-4">
                Donjon terminé ! +{dungeonRewards.xp} XP • +{dungeonRewards.eclats} ✦
              </p>
            )}
            {result === "victory" && raidComplete && raidRewards && (
              <p className="text-aether-300 text-sm mb-4">
                Raid terminé ! +{raidRewards.xp} XP • +{raidRewards.eclats} ✦
              </p>
            )}
            {result === "victory" && combatType === "raid" && !raidComplete ? (
              <button
                onClick={() => {
                  void (async () => {
                    const runId = combatData.convexRaidRunId as Id<"raidRuns"> | undefined;
                    const raidId = combatData.raidId as string | undefined;
                    if (!runId || !raidId) return;
                    const raid = getRaidById(raidId);
                    if (!raid) return;
                    const phaseIndex = (combatData.phaseIndex ?? 0) + 1;
                    const monsters = getPhaseMonsters(raid, phaseIndex);
                    const convexId = await startRaidCombat({
                      runId,
                      monsterIds: monsters,
                      zoneId: raid.zoneId,
                      leaderId: characterId,
                    });
                    const localId = buildCloudCombatLocalId("raid");
                    cacheCloudCombat(localId, convexId, {
                      type: "raid",
                      raidId,
                      phaseIndex,
                      monsterIds: monsters,
                      zoneId: raid.zoneId,
                      characterId,
                      convexRaidRunId: runId,
                    });
                    setCombat(localId, { convexCombatId: convexId });
                  })();
                }}
                className="btn-primary w-full mb-2"
              >
                Phase suivante →
              </button>
            ) : null}
            {result === "victory" && combatType === "dungeon" && !dungeonComplete ? (
              <button
                onClick={() => {
                  void (async () => {
                    const runId = combatData.convexRunId as Id<"dungeonRuns"> | undefined;
                    const dungeonId = combatData.dungeonId as string | undefined;
                    if (!runId || !dungeonId) return;
                    const dungeon = getDungeonById(dungeonId);
                    if (!dungeon) return;
                    const roomIndex = (combatData.roomIndex ?? 0) + 1;
                    const monsters = getRoomMonsters(dungeon, roomIndex);
                    const convexId = await startDungeonCombat({
                      runId,
                      monsterIds: monsters,
                      zoneId: dungeon.zoneId,
                      leaderId: characterId,
                    });
                    const localId = buildCloudCombatLocalId("dungeon");
                    cacheCloudCombat(localId, convexId, {
                      type: "dungeon",
                      dungeonId,
                      roomIndex,
                      monsterIds: monsters,
                      zoneId: dungeon.zoneId,
                      characterId,
                      convexRunId: runId,
                    });
                    setCombat(localId, { convexCombatId: convexId });
                  })();
                }}
                className="btn-primary w-full mb-2"
              >
                Salle suivante →
              </button>
            ) : null}
            <button onClick={() => setCombat(null)} className="btn-primary w-full">
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
