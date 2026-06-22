import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getSpellById, getSpellsForClass } from "../game/data";
import { IsoCombatScene, type CombatEntityVisual } from "../game/rendering/IsoCombatScene";
import { getClassIcon } from "../game/rendering/isometric";
import { formatBuffs } from "../game/combat/effects";
import {
  didPlayerWin,
  mapLiveEntitiesForPlayer,
  type PvpLiveAction,
} from "../lib/pvpRealtime";
import { applyLocalPvpResult } from "./LocalPvPScreen";

interface LiveEntity {
  entityId: string;
  name: string;
  playerKey?: string;
  classId?: string;
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

export default function LivePvpCombatScreen() {
  const liveMatchId = useGameStore((s) => s.liveMatchId)! as Id<"pvpLiveMatches">;
  const livePlayerKey = useGameStore((s) => s.livePlayerKey)!;
  const classId = useGameStore((s) => s.classId)!;
  const characterId = useGameStore((s) => s.characterId)!;
  const endLivePvpCombat = useGameStore((s) => s.endLivePvpCombat);

  const matchDoc = useQuery(api.pvpLive.getLiveMatch, { matchId: liveMatchId });
  const submitAction = useMutation(api.pvpLive.submitPvpAction);
  const abandonMatch = useMutation(api.pvpLive.abandonLiveMatch);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<IsoCombatScene | null>(null);

  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Duel joueur en ligne — en attente de sync..."]);
  const [submitting, setSubmitting] = useState(false);

  const rawEntities: LiveEntity[] = matchDoc?.entities ?? [];
  const mappedEntities = mapLiveEntitiesForPlayer(rawEntities, livePlayerKey, classId);
  const myEntity = mappedEntities.find((e) => e.playerKey === livePlayerKey);
  const playerEntityId = myEntity?.entityId ?? "";
  const spells = getSpellsForClass(classId);
  const isMyTurn =
    matchDoc?.status === "active" &&
    matchDoc.currentPlayerKey === livePlayerKey;
  const isPlayerTurn = isMyTurn && !!myEntity?.isAlive;
  const player = myEntity;

  const result =
    matchDoc?.status === "victory_a" || matchDoc?.status === "victory_b" || matchDoc?.status === "abandoned"
      ? (() => {
          const won = didPlayerWin(
            matchDoc.status,
            livePlayerKey,
            matchDoc.playerAKey,
            matchDoc.playerBKey,
            matchDoc.winnerPlayerKey
          );
          return won === true ? ("victory" as const) : won === false ? ("defeat" as const) : null;
        })()
      : null;

  const toVisual = useCallback(
    (ents: LiveEntity[], currentKey: string): CombatEntityVisual[] =>
      mapLiveEntitiesForPlayer(ents, livePlayerKey, classId).map((e) => ({
        entityId: e.entityId,
        name: e.name,
        gridX: e.x,
        gridY: e.y,
        icon: getClassIcon(e.classId ?? classId),
        hp: e.hp,
        maxHp: e.maxHp,
        team: e.team,
        isAlive: e.isAlive,
        isCurrent: e.playerKey === currentKey,
      })),
    [classId, livePlayerKey]
  );

  const runAction = useCallback(
    async (action: PvpLiveAction) => {
      if (!isPlayerTurn || submitting) return;
      setSubmitting(true);
      try {
        const res = await submitAction({
          matchId: liveMatchId,
          playerKey: livePlayerKey,
          action,
        });
        res.combatLog.forEach((entry: string) => {
          setLog((p) => [...p, entry]);
        });
        setSelectedSpell(null);
      } catch (e) {
        setLog((p) => [...p, e instanceof Error ? e.message : "Erreur"]);
      } finally {
        setSubmitting(false);
      }
    },
    [isPlayerTurn, submitting, submitAction, liveMatchId, livePlayerKey]
  );

  const handleCellClick = useCallback(
    async (x: number, y: number) => {
      if (!isPlayerTurn || !player || !matchDoc) return;

      if (selectedSpell) {
        const spell = getSpellById(selectedSpell);
        if (!spell || player.ap < spell.apCost) return;
        await runAction({
          type: "cast",
          spellId: selectedSpell,
          targetX: x,
          targetY: y,
        });
        sceneRef.current?.playSpellEffect(
          player.x,
          player.y,
          x,
          y,
          spell.apCost > 3 ? 0xff6600 : 0x44aaff
        );
      } else {
        const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
        if (distance > player.mp || distance === 0) return;
        await runAction({ type: "move", targetX: x, targetY: y });
      }
    },
    [isPlayerTurn, player, matchDoc, selectedSpell, runAction]
  );

  useEffect(() => {
    if (matchDoc?.combatLog?.length) {
      setLog(matchDoc.combatLog.slice(-8));
    }
  }, [matchDoc?.combatLog]);

  useEffect(() => {
    if (result === "victory") {
      applyLocalPvpResult(characterId, true);
    } else if (result === "defeat") {
      applyLocalPvpResult(characterId, false);
    }
  }, [result, characterId]);

  useEffect(() => {
    if (!gameRef.current) return;

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
      entities: toVisual(rawEntities, matchDoc?.currentPlayerKey ?? livePlayerKey),
      currentEntityId: playerEntityId,
      onCellClick: handleCellClick,
      combatType: "pvp",
    });
    sceneRef.current = phaserRef.current.scene.getScene("IsoCombatScene") as IsoCombatScene;

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!matchDoc) return;
    sceneRef.current?.updateEntities(
      toVisual(matchDoc.entities, matchDoc.currentPlayerKey),
      playerEntityId
    );
  }, [matchDoc, toVisual, playerEntityId]);

  const handleFlee = () => {
    void abandonMatch({ matchId: liveMatchId, playerKey: livePlayerKey });
    endLivePvpCombat();
  };

  const opponentName =
    livePlayerKey === matchDoc?.playerAKey
      ? matchDoc?.playerBName
      : matchDoc?.playerAName;

  return (
    <div className="flex-1 flex flex-col bg-aether-950 relative">
      <div className="flex items-center justify-between p-3 bg-aether-900/80">
        <span className="font-display font-bold text-aether-200">
          ⚔️ Duel en ligne vs {opponentName ?? "..."} — Tour {matchDoc?.turn ?? 1}
        </span>
        <button onClick={handleFlee} className="text-aether-400 text-sm">
          Abandonner
        </button>
      </div>

      {!isMyTurn && matchDoc?.status === "active" && (
        <p className="text-center text-aether-400 text-xs py-1 bg-aether-900/50">
          Tour de l&apos;adversaire...
        </p>
      )}

      <div ref={gameRef} className="flex-shrink-0" style={{ height: 380 }} />

      {player && (
        <div className="px-4 py-2 flex flex-wrap gap-4 text-sm">
          <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
          <span className="text-orange-400">⚡ {player.ap}/{player.maxAp} PA</span>
          <span className="text-blue-400">👟 {player.mp}/{player.maxMp} PM</span>
          {(player.buffs?.length ?? 0) > 0 && (
            <span className="text-purple-400 text-xs">✨ {formatBuffs(player.buffs!)}</span>
          )}
        </div>
      )}

      {isPlayerTurn && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {spells.map((spell) => (
              <button
                key={spell.id}
                onClick={() =>
                  setSelectedSpell(selectedSpell === spell.id ? null : spell.id)
                }
                disabled={!player || player.ap < spell.apCost || submitting}
                className={`flex-shrink-0 card p-2 text-center min-w-[70px] ${
                  selectedSpell === spell.id
                    ? "border-aether-500 ring-2 ring-aether-500/30"
                    : ""
                } ${!player || player.ap < spell.apCost ? "opacity-40" : ""}`}
              >
                <span className="text-xl">{spell.icon}</span>
                <p className="text-[10px] text-aether-300 mt-1">{spell.name}</p>
                <p className="text-[9px] text-orange-400">{spell.apCost} PA</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => void runAction({ type: "endTurn" })}
            disabled={submitting}
            className="btn-secondary w-full mt-2 disabled:opacity-60"
          >
            Fin du tour
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {log.slice(-6).map((entry, i) => (
          <p key={i} className="text-aether-400 text-xs mb-1">
            {entry}
          </p>
        ))}
      </div>

      {result && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card text-center p-8 max-w-xs">
            <div className="text-5xl mb-4">{result === "victory" ? "🎉" : "💀"}</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {result === "victory" ? "Victoire !" : "Défaite"}
            </h2>
            <p className="text-aether-300 text-sm mb-4">
              {result === "victory"
                ? "Vous avez vaincu votre adversaire en ligne !"
                : "Votre adversaire l'a emporté."}
            </p>
            <button onClick={() => endLivePvpCombat()} className="btn-primary w-full">
              Retour à l&apos;arène
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
