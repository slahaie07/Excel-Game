import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useGameStore } from "../stores/gameStore";
import { getSpellById, getSpellsForClass, getMonsterById } from "../game/data";

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
}

interface CombatState {
  entities: CombatEntity[];
  currentEntityId: string;
  turn: number;
  status: string;
  gridWidth: number;
  gridHeight: number;
}

class CombatScene extends Phaser.Scene {
  private entities: CombatEntity[] = [];
  private currentEntityId = "";
  private cellSize = 40;
  private sprites = new Map<string, Phaser.GameObjects.Text>();
  private highlights: Phaser.GameObjects.Rectangle[] = [];
  private onCellClick?: (x: number, y: number) => void;

  constructor() {
    super({ key: "CombatScene" });
  }

  init(data: {
    entities: CombatEntity[];
    currentEntityId: string;
    onCellClick: (x: number, y: number) => void;
  }) {
    this.entities = data.entities;
    this.currentEntityId = data.currentEntityId;
    this.onCellClick = data.onCellClick;
  }

  create() {
    this.cellSize = Math.min(this.scale.width, this.scale.height) / 14;

    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 8; y++) {
        const isEven = (x + y) % 2 === 0;
        const tile = this.add.rectangle(
          x * this.cellSize + this.cellSize / 2 + 10,
          y * this.cellSize + this.cellSize / 2 + 10,
          this.cellSize - 2,
          this.cellSize - 2,
          isEven ? 0x1a3a2a : 0x2a4a3a
        );
        tile.setStrokeStyle(1, 0x3a5a4a);
        tile.setInteractive();
        tile.on("pointerdown", () => this.onCellClick?.(x, y));
        tile.on("pointerover", () => tile.setFillStyle(0x4a6a5a));
        tile.on("pointerout", () => tile.setFillStyle(isEven ? 0x1a3a2a : 0x2a4a3a));
      }
    }

    this.renderEntities();
  }

  updateEntities(entities: CombatEntity[], currentEntityId: string) {
    this.entities = entities;
    this.currentEntityId = currentEntityId;
    this.renderEntities();
  }

  private renderEntities() {
    this.sprites.forEach((s) => s.destroy());
    this.sprites.clear();
    this.highlights.forEach((h) => h.destroy());
    this.highlights = [];

    this.entities.forEach((entity) => {
      if (!entity.isAlive) return;

      const icon = entity.isPlayer ? "🧙" : "👾";
      const sprite = this.add.text(
        entity.x * this.cellSize + this.cellSize / 2 + 10,
        entity.y * this.cellSize + this.cellSize / 2 + 10,
        icon,
        { fontSize: entity.isPlayer ? "24px" : "20px" }
      ).setOrigin(0.5);

      if (entity.entityId === this.currentEntityId) {
        const highlight = this.add.rectangle(
          entity.x * this.cellSize + this.cellSize / 2 + 10,
          entity.y * this.cellSize + this.cellSize / 2 + 10,
          this.cellSize,
          this.cellSize,
          0xffff00,
          0.2
        );
        this.highlights.push(highlight);
      }

      const hpBar = this.add.rectangle(
        entity.x * this.cellSize + this.cellSize / 2 + 10,
        entity.y * this.cellSize + 5,
        (entity.hp / entity.maxHp) * (this.cellSize - 4),
        4,
        entity.team === "player" ? 0x00ff00 : 0xff0000
      );
      this.highlights.push(hpBar);

      this.sprites.set(entity.entityId, sprite);
    });
  }
}

function initCombat(monsterIds: string[], playerName = "Éveilleur"): CombatState {
  const playerEntity: CombatEntity = {
    entityId: "player",
    name: playerName,
    isPlayer: true,
    hp: 100,
    maxHp: 100,
    ap: 6,
    maxAp: 6,
    mp: 3,
    maxMp: 3,
    x: 2,
    y: 4,
    team: "player",
    isAlive: true,
  };

  const enemies = monsterIds.map((id, i) => {
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

export default function CombatScreen() {
  const combatId = useGameStore((s) => s.combatId)!;
  const classId = useGameStore((s) => s.classId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const characterId = useGameStore((s) => s.characterId)!;
  const setCombat = useGameStore((s) => s.setCombat);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<CombatScene | null>(null);

  const combatData = JSON.parse(localStorage.getItem(`aetheris-combat-${combatId}`) ?? "{}");
  const [combat, setCombatState] = useState<CombatState>(() =>
    initCombat(combatData.monsterIds ?? ["graine_ombre"], characterName)
  );
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Le combat commence !"]);
  const [result, setResult] = useState<"victory" | "defeat" | null>(null);

  const player = combat.entities.find((e) => e.isPlayer)!;
  const spells = getSpellsForClass(classId);
  const isPlayerTurn = combat.currentEntityId === "player" && combat.status === "active";

  const handleCellClick = useCallback((x: number, y: number) => {
    if (!isPlayerTurn) return;

    if (selectedSpell) {
      const spell = getSpellById(selectedSpell);
      if (!spell || player.ap < spell.apCost) return;

      const target = combat.entities.find((e) => e.x === x && e.y === y && e.isAlive);
      const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
      if (distance < spell.minRange || distance > spell.maxRange) return;

      const newEntities = combat.entities.map((e) => {
        if (e.entityId === "player") return { ...e, ap: e.ap - spell.apCost };
        if (target && e.entityId === target.entityId && e.team === "enemy") {
          const dmg = Math.floor(Math.random() * 10) + 8;
          const newHp = Math.max(0, e.hp - dmg);
          setLog((prev) => [...prev, `${spell.name} inflige ${dmg} dégâts à ${e.name} !`]);
          return { ...e, hp: newHp, isAlive: newHp > 0 };
        }
        return e;
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
      return;
    }

    setCombatState({ ...combat, entities });
  };

  const awardRewards = () => {
    const charKey = `aetheris-char-${characterId}`;
    const data = JSON.parse(localStorage.getItem(charKey) ?? "{}");
    const xpGain = 50;
    data.xp = (data.xp ?? 0) + xpGain;
    data.eclats = (data.eclats ?? 0) + 25;
    if (data.xp >= data.xpToNext) {
      data.level = (data.level ?? 1) + 1;
      data.xp -= data.xpToNext;
      data.xpToNext = data.level * 100;
      data.maxHp = 100 + data.level * 10;
      data.hp = data.maxHp;
    }
    localStorage.setItem(charKey, JSON.stringify(data));
  };

  const endTurn = () => {
    const enemies = combat.entities.filter((e) => e.team === "enemy" && e.isAlive);
    if (enemies.length === 0) return;

    let newEntities = combat.entities.map((e) =>
      e.entityId === "player" ? { ...e, ap: e.maxAp, mp: e.maxMp } : e
    );

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
      height: 350,
      backgroundColor: "#0d2818",
      scene: CombatScene,
    };

    phaserRef.current = new Phaser.Game(config);
    phaserRef.current.scene.start("CombatScene", {
      entities: combat.entities,
      currentEntityId: combat.currentEntityId,
      onCellClick: handleCellClick,
    });

    sceneRef.current = phaserRef.current.scene.getScene("CombatScene") as CombatScene;

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateEntities(combat.entities, combat.currentEntityId);
  }, [combat.entities, combat.currentEntityId]);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center justify-between p-3 bg-aether-900/80">
        <span className="font-display font-bold text-aether-200">Combat — Tour {combat.turn}</span>
        <button onClick={() => setCombat(null)} className="text-aether-400 text-sm">Fuir</button>
      </div>

      <div ref={gameRef} className="flex-shrink-0" style={{ height: 350 }} />

      {/* Player status */}
      <div className="px-4 py-2 flex gap-4 text-sm">
        <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
        <span className="text-orange-400">⚡ {player.ap}/{player.maxAp} PA</span>
        <span className="text-blue-400">👟 {player.mp}/{player.maxMp} PM</span>
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
            {result === "victory" && (
              <p className="text-aether-300 text-sm mb-4">+50 XP • +25 ✦ Éclats</p>
            )}
            <button onClick={() => setCombat(null)} className="btn-primary w-full">
              Retour au monde
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
