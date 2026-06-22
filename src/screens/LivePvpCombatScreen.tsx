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
import { trackSeasonPvpWin } from "../lib/seasonEngine";
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
  const liveMatchId = useGameStore((s) => s.liveMatchId) as Id<"pvpLiveMatches"> | null;
  const livePlayerKey = useGameStore((s) => s.livePlayerKey);
  const classId = useGameStore((s) => s.classId)!;
  const characterId = useGameStore((s) => s.characterId)!;
  const endLivePvpCombat = useGameStore((s) => s.endLivePvpCombat);

  const matchDoc = useQuery(
    api.pvpLive.getLiveMatch,
    liveMatchId ? { matchId: liveMatchId } : "skip"
  );
  const submitAction = useMutation(api.pvpLive.submitPvpAction);
  const abandonMatch = useMutation(api.pvpLive.abandonLiveMatch);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<IsoCombatScene | null>(null);
  const seasonTracked = useRef(false);

  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Duel joueur en ligne — synchronisation..."]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmFlee, setConfirmFlee] = useState(false);

  const rawEntities: LiveEntity[] = matchDoc?.entities ?? [];
  const mappedEntities = livePlayerKey
    ? mapLiveEntitiesForPlayer(rawEntities, livePlayerKey, classId)
    : [];
  const myEntity = mappedEntities.find((e) => e.playerKey === livePlayerKey);
  const playerEntityId = myEntity?.entityId ?? "";
  const spells = getSpellsForClass(classId);
  const isMyTurn =
    matchDoc?.status === "active" &&
    !!livePlayerKey &&
    matchDoc.currentPlayerKey === livePlayerKey;
  const isPlayerTurn = isMyTurn && !!myEntity?.isAlive;
  const player = myEntity;

  const result =
    matchDoc?.status === "victory_a" ||
    matchDoc?.status === "victory_b" ||
    matchDoc?.status === "abandoned"
      ? (() => {
          if (!livePlayerKey) return null;
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
    (ents: LiveEntity[], currentKey: string): CombatEntityVisual[] => {
      if (!livePlayerKey) return [];
      return mapLiveEntitiesForPlayer(ents, livePlayerKey, classId).map((e) => ({
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
      }));
    },
    [classId, livePlayerKey]
  );

  const runAction = useCallback(
    async (action: PvpLiveAction) => {
      if (!liveMatchId || !livePlayerKey || !isPlayerTurn || submitting) return false;
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
        return true;
      } catch (e) {
        setLog((p) => [...p, e instanceof Error ? e.message : "Erreur"]);
        return false;
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
        const ok = await runAction({
          type: "cast",
          spellId: selectedSpell,
          targetX: x,
          targetY: y,
        });
        if (ok) {
          sceneRef.current?.playSpellEffect(
            player.x,
            player.y,
            x,
            y,
            spell.apCost > 3 ? 0xff6600 : 0x44aaff
          );
        }
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
      if (!seasonTracked.current) {
        seasonTracked.current = true;
        trackSeasonPvpWin(characterId);
      }
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
    sceneRef.current = phaserRef.current.scene.getScene("IsoCombatScene") as IsoCombatScene;

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !matchDoc) return;
    sceneRef.current.updateEntities(
      toVisual(matchDoc.entities, matchDoc.currentPlayerKey),
      playerEntityId
    );
    if (!sceneRef.current.scene.isActive()) {
      phaserRef.current?.scene.start("IsoCombatScene", {
        entities: toVisual(matchDoc.entities, matchDoc.currentPlayerKey),
        currentEntityId: playerEntityId,
        onCellClick: handleCellClick,
        combatType: "pvp",
      });
    }
  }, [matchDoc, toVisual, playerEntityId, handleCellClick]);

  const handleFlee = async () => {
    if (!liveMatchId || !livePlayerKey) return;
    if (!confirmFlee) {
      setConfirmFlee(true);
      return;
    }
    try {
      await abandonMatch({ matchId: liveMatchId, playerKey: livePlayerKey });
    } catch (e) {
      setLog((p) => [...p, e instanceof Error ? e.message : "Abandon impossible"]);
      setConfirmFlee(false);
      return;
    }
    endLivePvpCombat();
  };

  if (!liveMatchId || !livePlayerKey) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950 items-center justify-center p-8">
        <p className="text-aether-400 mb-4">Session de duel invalide.</p>
        <button onClick={() => endLivePvpCombat()} className="btn-primary">
          Retour à l&apos;arène
        </button>
      </div>
    );
  }

  if (matchDoc === undefined) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950 items-center justify-center p-8" role="status">
        <p className="text-aether-300 text-lg mb-2">Chargement du duel...</p>
        <p className="text-aether-500 text-sm">Connexion au serveur Convex</p>
      </div>
    );
  }

  if (matchDoc === null) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950 items-center justify-center p-8">
        <p className="text-red-400 mb-2">Match introuvable ou expiré.</p>
        <button onClick={() => endLivePvpCombat()} className="btn-primary">
          Retour à l&apos;arène
        </button>
      </div>
    );
  }

  const opponentName =
    livePlayerKey === matchDoc.playerAKey ? matchDoc.playerBName : matchDoc.playerAName;

  return (
    <div className="flex-1 flex flex-col bg-aether-950 relative">
      <div className="flex items-center justify-between p-3 bg-aether-900/80">
        <span className="font-display font-bold text-aether-200 text-sm sm:text-base">
          ⚔️ Duel vs {opponentName} — Tour {matchDoc.turn}
        </span>
        <button
          onClick={() => void handleFlee()}
          className={`text-sm px-3 py-2 rounded-lg min-h-[44px] ${
            confirmFlee ? "bg-red-700 text-white" : "text-aether-400"
          }`}
          aria-label={confirmFlee ? "Confirmer l'abandon" : "Abandonner le duel"}
        >
          {confirmFlee ? "Confirmer ?" : "Abandonner"}
        </button>
      </div>

      {!isMyTurn && matchDoc.status === "active" && (
        <p className="text-center text-aether-400 text-xs py-2 bg-aether-900/50" role="status">
          Tour de l&apos;adversaire...
        </p>
      )}

      <div ref={gameRef} className="flex-shrink-0" style={{ height: 380 }} aria-label="Grille de combat" />

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
                aria-label={`Sort ${spell.name}, ${spell.apCost} PA`}
                className={`flex-shrink-0 card p-2 text-center min-w-[80px] min-h-[72px] ${
                  selectedSpell === spell.id
                    ? "border-aether-500 ring-2 ring-aether-500/30"
                    : ""
                } ${!player || player.ap < spell.apCost ? "opacity-40" : ""}`}
              >
                <span className="text-xl">{spell.icon}</span>
                <p className="text-xs text-aether-300 mt-1">{spell.name}</p>
                <p className="text-[10px] text-orange-400">{spell.apCost} PA</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => void runAction({ type: "endTurn" })}
            disabled={submitting}
            className="btn-secondary w-full mt-2 min-h-[44px] disabled:opacity-60"
          >
            Fin du tour
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2" aria-live="polite">
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
            <button onClick={() => endLivePvpCombat()} className="btn-primary w-full min-h-[44px]">
              Retour à l&apos;arène
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
