import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useGameStore } from "../stores/gameStore";
import { getSpellById, getSpellsForClass, getMonsterById } from "../game/data";
import { applyPvpResult } from "./PvPScreen";
import { advanceDungeonRoom, createNextRoomCombat } from "./DungeonsScreen";
import { recordEventKill } from "./EventsScreen";
import { addXp, loadCharacter } from "../lib/characterStorage";
import { applySpellEffects, tickBuffs, formatBuffs, applyCombatStartTalents, getEffectiveMaxRange, computeTalentModifiers } from "../game/combat/effects";
import { IsoCombatScene, type CombatEntityVisual } from "../game/rendering/IsoCombatScene";
import { getMonsterIcon, getClassIcon } from "../game/rendering/isometric";

interface CombatEntity {
  entityId: string;
  name: string;
  isPlayer: boolean;
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
  monsterId?: string;
  buffs: { stat: string; value: number; duration: number }[];
  talentIds?: string[];
}

interface CombatState {
  entities: CombatEntity[];
  currentEntityId: string;
  turn: number;
  status: string;
  gridWidth: number;
  gridHeight: number;
}

function toVisualEntities(entities: CombatEntity[], currentEntityId: string, classId: string): CombatEntityVisual[] {
  return entities.map((e) => ({
    entityId: e.entityId,
    name: e.name,
    gridX: e.x,
    gridY: e.y,
    icon: e.isPlayer ? getClassIcon(classId) : getMonsterIcon(e.monsterId ?? "graine_ombre"),
    hp: e.hp,
    maxHp: e.maxHp,
    team: e.team,
    isAlive: e.isAlive,
    isCurrent: e.entityId === currentEntityId,
  }));
}

function initCombat(
  monsterIds: string[],
  playerName = "Éveilleur",
  pvpOpponent?: { name: string; classId: string; level: number },
  charData?: ReturnType<typeof loadCharacter>
): CombatState {
  const talentIds = charData?.talents ?? [];
  const scaled = applyCombatStartTalents(
    charData?.hp ?? 100,
    charData?.maxHp ?? 100,
    charData?.maxMp ?? 3,
    talentIds
  );
  const playerEntity: CombatEntity = {
    entityId: "player",
    name: playerName,
    isPlayer: true,
    hp: scaled.hp,
    maxHp: scaled.maxHp,
    ap: charData?.maxAp ?? 6,
    maxAp: charData?.maxAp ?? 6,
    mp: scaled.maxMp,
    maxMp: scaled.maxMp,
    x: 2,
    y: 4,
    team: "player",
    isAlive: true,
    buffs: [],
    talentIds,
  };

  const enemies = pvpOpponent
    ? [{
        entityId: "enemy_0",
        name: pvpOpponent.name,
        isPlayer: false,
        hp: 80 + pvpOpponent.level * 8,
        maxHp: 80 + pvpOpponent.level * 8,
        ap: 6,
        maxAp: 6,
        mp: 3,
        maxMp: 3,
        x: 9,
        y: 4,
        team: "enemy" as const,
        isAlive: true,
        buffs: [],
      }]
    : monsterIds.map((id, i) => {
        const monster = getMonsterById(id);
        return {
          entityId: `enemy_${i}`,
          name: monster?.name ?? "Monstre",
          isPlayer: false,
          hp: monster?.stats.hp ?? 50,
          maxHp: monster?.stats.hp ?? 50,
          ap: monster?.stats.ap ?? 4,
          maxAp: monster?.stats.ap ?? 4,
          mp: monster?.stats.mp ?? 3,
          maxMp: monster?.stats.mp ?? 3,
          x: 8 + (i % 3),
          y: 2 + Math.floor(i / 3),
          team: "enemy" as const,
          isAlive: true,
          monsterId: id,
          buffs: [],
        };
      });

  return {
    entities: [playerEntity, ...enemies],
    currentEntityId: "player",
    turn: 1,
    status: "active",
    gridWidth: 12,
    gridHeight: 8,
  };
}

export default function LocalCombatScreen() {
  const combatId = useGameStore((s) => s.combatId)!;
  const classId = useGameStore((s) => s.classId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const characterId = useGameStore((s) => s.characterId)!;
  const setCombat = useGameStore((s) => s.setCombat);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<IsoCombatScene | null>(null);

  const combatData = JSON.parse(localStorage.getItem(`aetheris-combat-${combatId}`) ?? "{}");
  const combatType = combatData.type ?? "world";
  const [combat, setCombatState] = useState<CombatState>(() => {
    const char = loadCharacter(characterId);
    return initCombat(
      combatData.monsterIds ?? ["graine_ombre"],
      characterName,
      combatData.pvpOpponent,
      char
    );
  });
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([
    combatType === "pvp" ? `⚔️ Duel PvP contre ${combatData.pvpOpponent?.name ?? "adversaire"} !` :
    combatType === "dungeon" ? `🏚️ Salle ${(combatData.roomIndex ?? 0) + 1} du donjon` :
    combatType === "event" ? `🎉 Combat d'événement saisonnier !` :
    "Le combat commence !",
  ]);
  const [result, setResult] = useState<"victory" | "defeat" | null>(null);
  const [dungeonComplete, setDungeonComplete] = useState(false);
  const [dungeonRewards, setDungeonRewards] = useState<{ xp: number; eclats: number } | null>(null);

  const player = combat.entities.find((e) => e.isPlayer)!;
  const charData = loadCharacter(characterId);
  const knownSpells = charData?.spells ?? [];
  const spells = getSpellsForClass(classId).filter((s) => knownSpells.includes(s.id));
  const isPlayerTurn = combat.currentEntityId === "player" && combat.status === "active";

  const handleCellClick = useCallback((x: number, y: number) => {
    if (!isPlayerTurn) return;

    if (selectedSpell) {
      const spell = getSpellById(selectedSpell);
      if (!spell || player.ap < spell.apCost) return;

      const target = combat.entities.find((e) => e.x === x && e.y === y && e.isAlive);
      const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
      const casterMods = computeTalentModifiers(player.talentIds ?? []);
      if (distance < spell.minRange || distance > getEffectiveMaxRange(spell.maxRange, casterMods)) return;

      const damageEffect = spell.effects.find((e) => e.type === "damage");
      const caster = { ...player, buffs: player.buffs ?? [] };
      const tgt = target ? { ...target, buffs: target.buffs ?? [] } : undefined;
      const { caster: updatedCaster, target: updatedTarget, log: effectLog } = applySpellEffects(
        caster,
        tgt,
        spell.effects,
        {
          spellMeta: {
            element: damageEffect?.type === "damage" ? damageEffect.element : undefined,
            minRange: spell.minRange,
            maxRange: spell.maxRange,
            area: spell.area,
          },
        }
      );

      effectLog.forEach((msg) => setLog((prev) => [...prev, `${spell.name} : ${msg}`]));
      sceneRef.current?.playSpellEffect(player.x, player.y, x, y, spell.apCost > 3 ? 0xff6600 : 0x44aaff);

      const newEntities = combat.entities.map((ent) => {
        if (ent.entityId === "player") {
          return {
            ...ent,
            ap: ent.ap - spell.apCost,
            hp: updatedCaster.hp,
            buffs: updatedCaster.buffs,
            maxMp: updatedCaster.maxMp,
          };
        }
        if (updatedTarget && ent.entityId === updatedTarget.entityId) {
          return {
            ...ent,
            hp: updatedTarget.hp,
            isAlive: updatedTarget.isAlive,
            buffs: updatedTarget.buffs,
            maxMp: updatedTarget.maxMp,
          };
        }
        return ent;
      });

      setSelectedSpell(null);
      checkEndTurn(newEntities);
    } else {
      const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
      if (distance > player.mp || distance === 0) return;

      const occupied = combat.entities.some((e) => e.isAlive && e.x === x && e.y === y);
      if (occupied) return;

      const newEntities = combat.entities.map((e) =>
        e.entityId === "player"
          ? { ...e, x, y, mp: e.mp - distance }
          : e
      );
      setLog((prev) => [...prev, `Déplacement (${distance} PM)`]);
      setCombatState({ ...combat, entities: newEntities });
    }
  }, [combat, player, selectedSpell, isPlayerTurn]);

  const checkEndTurn = (entities: CombatEntity[]) => {
    const enemiesAlive = entities.filter((e) => e.team === "enemy" && e.isAlive);
    const playerAlive = entities.find((e) => e.isPlayer && e.isAlive);

    if (enemiesAlive.length === 0) {
      setResult("victory");
      setCombatState({ ...combat, entities, status: "victory" });
      setLog((prev) => [...prev, "🎉 Victoire !"]);
      awardRewards();
      return;
    }
    if (!playerAlive) {
      setResult("defeat");
      setCombatState({ ...combat, entities, status: "defeat" });
      setLog((prev) => [...prev, "💀 Défaite..."]);
      if (combatType === "pvp") applyPvpResult(characterId, false, combatData.convexMatchId);
      return;
    }

    setCombatState({ ...combat, entities });
  };

  const awardRewards = () => {
    if (combatType === "pvp") {
      applyPvpResult(characterId, true, combatData.convexMatchId);
      return;
    }
    if (combatType === "dungeon") {
      const { complete, rewards } = advanceDungeonRoom(characterId);
      if (complete) {
        setDungeonComplete(true);
        setDungeonRewards(rewards ?? null);
      }
      addXp(characterId, 30);
      return;
    }
    if (combatType === "event") {
      const xpMult = combatData.xpMultiplier ?? 1;
      const eclatsMult = combatData.eclatsMultiplier ?? 1;
      const monsterId = combatData.monsterIds?.[0] as string | undefined;
      const monster = monsterId ? getMonsterById(monsterId) : null;
      const baseXp = monster?.xpReward ?? 80;
      const baseEclats = monster
        ? Math.floor((monster.eclatsReward.min + monster.eclatsReward.max) / 2)
        : 40;
      const xpGain = Math.floor(baseXp * xpMult);
      const eclatsGain = Math.floor(baseEclats * eclatsMult);
      addXp(characterId, xpGain);
      const charKey = `aetheris-char-${characterId}`;
      const data = JSON.parse(localStorage.getItem(charKey) ?? "{}");
      data.eclats = (data.eclats ?? 0) + eclatsGain;
      localStorage.setItem(charKey, JSON.stringify(data));
      if (monsterId && combatData.eventId) {
        recordEventKill(characterId, monsterId, combatData.eventId);
      }
      return;
    }
    addXp(characterId, 50);
    const charKey = `aetheris-char-${characterId}`;
    const data = JSON.parse(localStorage.getItem(charKey) ?? "{}");
    data.eclats = (data.eclats ?? 0) + 25;
    localStorage.setItem(charKey, JSON.stringify(data));
  };

  const endTurn = () => {
    const enemies = combat.entities.filter((e) => e.team === "enemy" && e.isAlive);
    if (enemies.length === 0) return;

    let newEntities: CombatEntity[] = combat.entities.map((e) => {
      const ticked = tickBuffs({ ...e, buffs: e.buffs ?? [] });
      const merged: CombatEntity = { ...e, hp: ticked.hp, maxMp: ticked.maxMp, buffs: ticked.buffs };
      if (e.entityId === "player") return { ...merged, ap: merged.maxAp, mp: merged.maxMp };
      return merged;
    });

    const enemy = enemies[0]!;
    const dmg = Math.floor(Math.random() * 8) + 5;
    newEntities = newEntities.map((e) => {
      if (e.isPlayer) {
        const newHp = Math.max(0, e.hp - dmg);
        setLog((prev) => [...prev, `${enemy.name} attaque pour ${dmg} dégâts !`]);
        return { ...e, hp: newHp, isAlive: newHp > 0 };
      }
      return e;
    });

    setCombatState({
      ...combat,
      entities: newEntities,
      currentEntityId: "player",
      turn: combat.turn + 1,
    });
  };

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
      entities: toVisualEntities(combat.entities, combat.currentEntityId, classId),
      currentEntityId: combat.currentEntityId,
      onCellClick: handleCellClick,
      combatType,
    });

    sceneRef.current = phaserRef.current.scene.getScene("IsoCombatScene") as IsoCombatScene;

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateEntities(
      toVisualEntities(combat.entities, combat.currentEntityId, classId),
      combat.currentEntityId
    );
  }, [combat.entities, combat.currentEntityId, classId]);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center justify-between p-3 bg-aether-900/80">
        <span className="font-display font-bold text-aether-200">
          {combatType === "pvp" ? "⚔️ Arène" : combatType === "dungeon" ? "🏚️ Donjon" : combatType === "event" ? "🎉 Événement" : "Combat"} — Tour {combat.turn}
        </span>
        <button onClick={() => setCombat(null)} className="text-aether-400 text-sm">Fuir</button>
      </div>

      <div ref={gameRef} className="flex-shrink-0" style={{ height: 380 }} />

      {/* Player status */}
      <div className="px-4 py-2 flex flex-wrap gap-4 text-sm">
        <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
        <span className="text-orange-400">⚡ {player.ap}/{player.maxAp} PA</span>
        <span className="text-blue-400">👟 {player.mp}/{player.maxMp} PM</span>
        {(player.buffs?.length ?? 0) > 0 && (
          <span className="text-purple-400 text-xs">✨ {formatBuffs(player.buffs)}</span>
        )}
      </div>

      {/* Spells */}
      {isPlayerTurn && (
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
          <button onClick={endTurn} className="btn-secondary w-full mt-2">Fin du tour</button>
        </div>
      )}

      {/* Combat log */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {log.slice(-5).map((entry, i) => (
          <p key={i} className="text-aether-400 text-xs mb-1">{entry}</p>
        ))}
      </div>

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card text-center p-8 max-w-xs">
            <div className="text-5xl mb-4">{result === "victory" ? "🎉" : "💀"}</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {result === "victory" ? "Victoire !" : "Défaite"}
            </h2>
            {result === "victory" && !dungeonComplete && combatType === "dungeon" && (
              <p className="text-aether-300 text-sm mb-4">Salle terminée ! +30 XP</p>
            )}
            {result === "victory" && dungeonComplete && dungeonRewards && (
              <p className="text-aether-300 text-sm mb-4">
                Donjon terminé ! +{dungeonRewards.xp} XP • +{dungeonRewards.eclats} ✦
              </p>
            )}
            {result === "victory" && combatType === "pvp" && (
              <p className="text-aether-300 text-sm mb-4">Victoire PvP ! Rating augmenté</p>
            )}
            {result === "victory" && combatType === "world" && (
              <p className="text-aether-300 text-sm mb-4">+50 XP • +25 ✦ Éclats</p>
            )}
            {result === "victory" && combatType === "event" && (
              <p className="text-aether-300 text-sm mb-4">
                Récompenses d'événement ! Bonus XP et Éclats appliqués
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
              {dungeonComplete ? "Retour au monde" : combatType === "dungeon" && result === "victory" ? "Quitter le donjon" : "Retour"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
