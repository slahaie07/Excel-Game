import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getSpellById, getSpellsForClass } from "../game/data";
import { IsoCombatScene, type CombatEntityVisual } from "../game/rendering/IsoCombatScene";
import { getMonsterIcon, getClassIcon } from "../game/rendering/isometric";
import { formatBuffs } from "../game/combat/effects";
import { advanceDungeonRoom, createNextRoomCombat } from "./DungeonsScreen";

interface CloudEntity {
  entityId: string;
  name: string;
  isPlayer: boolean;
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
  const moveEntityMut = useMutation(api.combat.moveEntity);
  const castSpellMut = useMutation(api.combat.castSpell);
  const endTurnMut = useMutation(api.combat.endTurn);
  const fleeMut = useMutation(api.combat.fleeCombat);
  const applyRewards = useMutation(api.combat.applyVictoryRewards);
  const completePvp = useMutation(api.pvp.completeMatch);

  const combatData = JSON.parse(localStorage.getItem(`aetheris-combat-${combatId}`) ?? "{}");
  const combatType = combatData.type ?? "world";

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<IsoCombatScene | null>(null);

  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Combat cloud synchronisé !"]);
  const [dungeonComplete, setDungeonComplete] = useState(false);
  const [dungeonRewards, setDungeonRewards] = useState<{ xp: number; eclats: number } | null>(null);

  const entities: CloudEntity[] = combatDoc?.entities ?? [];
  const player = entities.find((e) => e.isPlayer);
  const playerEntityId = player?.entityId ?? "";
  const spells = getSpellsForClass(classId);
  const isPlayerTurn = combatDoc?.currentEntityId === playerEntityId && combatDoc?.status === "active";
  const result = combatDoc?.status === "victory" ? "victory" as const
    : combatDoc?.status === "defeat" ? "defeat" as const : null;

  const toVisual = useCallback((ents: CloudEntity[], currentId: string): CombatEntityVisual[] =>
    ents.map((e) => ({
      entityId: e.entityId,
      name: e.name,
      gridX: e.x,
      gridY: e.y,
      icon: e.isPlayer ? getClassIcon(classId) : getMonsterIcon(e.monsterId ?? "graine_ombre"),
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
        if (res.damage) setLog((p) => [...p, `${spell.name} : ${res.damage} dégâts`]);
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
        setLog((p) => [...p, `Déplacement (${distance} PM)`]);
      }
    } catch (e) {
      setLog((p) => [...p, e instanceof Error ? e.message : "Erreur"]);
    }
  }, [isPlayerTurn, player, combatDoc, selectedSpell, castSpellMut, moveEntityMut, convexCombatId, playerEntityId]);

  const endTurn = async () => {
    if (!playerEntityId) return;
    try {
      await endTurnMut({ combatId: convexCombatId, entityId: playerEntityId });
      setLog((p) => [...p, "Fin du tour"]);
    } catch (e) {
      setLog((p) => [...p, e instanceof Error ? e.message : "Erreur"]);
    }
  };

  useEffect(() => {
    if (combatDoc?.status === "victory") {
      void applyRewards({ combatId: convexCombatId, characterId });
      if (combatType === "dungeon") {
        const { complete, rewards } = advanceDungeonRoom(characterId);
        if (complete) {
          setDungeonComplete(true);
          setDungeonRewards(rewards ?? null);
        }
      }
      if (combatType === "pvp" && combatData.convexMatchId && combatData.pvpOpponent?.characterId) {
        const isTeamA = combatData.isTeamA ?? true;
        void completePvp({
          matchId: combatData.convexMatchId as Id<"pvpMatches">,
          winnerTeam: isTeamA ? "A" : "B",
          winnerCharacterId: characterId,
          loserCharacterId: combatData.pvpOpponent.characterId as Id<"characters">,
        });
      }
    }
    if (combatDoc?.status === "defeat" && combatType === "pvp" && combatData.convexMatchId && combatData.pvpOpponent?.characterId) {
      const isTeamA = combatData.isTeamA ?? true;
      void completePvp({
        matchId: combatData.convexMatchId as Id<"pvpMatches">,
        winnerTeam: isTeamA ? "B" : "A",
        winnerCharacterId: combatData.pvpOpponent.characterId as Id<"characters">,
        loserCharacterId: characterId,
      });
    }
  }, [combatDoc?.status, combatType, combatData, convexCombatId, characterId, applyRewards, completePvp]);

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
  }, [entities, combatDoc?.currentEntityId, combatDoc, toVisual]);

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
          ☁️ Combat — Tour {combatDoc.turn}
        </span>
        <button
          onClick={() => void fleeMut({ combatId: convexCombatId, characterId }).then(() => setCombat(null))}
          className="text-aether-400 text-sm"
        >
          Fuir
        </button>
      </div>

      <div ref={gameRef} className="flex-shrink-0" style={{ height: 380 }} />

      {player && (
        <div className="px-4 py-2 flex flex-wrap gap-4 text-sm">
          <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
          <span className="text-orange-400">⚡ {player.ap}/{player.maxAp} PA</span>
          <span className="text-blue-400">👟 {player.mp}/{player.maxMp} PM</span>
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
                <p className="text-[9px] text-orange-400">{spell.apCost} PA</p>
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
            {result === "victory" && combatDoc.rewards && (
              <p className="text-aether-300 text-sm mb-4">
                +{combatDoc.rewards.xp} XP • +{combatDoc.rewards.eclats} ✦
              </p>
            )}
            {result === "victory" && dungeonComplete && dungeonRewards && (
              <p className="text-aether-300 text-sm mb-4">
                Donjon terminé ! +{dungeonRewards.xp} XP • +{dungeonRewards.eclats} ✦
              </p>
            )}
            {result === "victory" && combatType === "dungeon" && !dungeonComplete ? (
              <button
                onClick={() => {
                  const nextId = createNextRoomCombat(characterId);
                  if (nextId) setCombat(nextId);
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
