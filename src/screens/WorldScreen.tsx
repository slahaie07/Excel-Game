import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useGameStore } from "../stores/gameStore";
import { ZONES, getZoneById, getMonstersByZone, CLASSES } from "../game/data";
import { useOnlinePresence, getOnlinePlayersInZone } from "../lib/useOnlinePresence";

interface CharacterData {
  level: number;
  hp: number;
  maxHp: number;
  eclats: number;
  xp: number;
  xpToNext: number;
}

function loadCharacterData(characterId: string): CharacterData {
  const data = localStorage.getItem(`aetheris-char-${characterId}`);
  if (data) return JSON.parse(data);
  return { level: 1, hp: 100, maxHp: 100, eclats: 100, xp: 0, xpToNext: 100 };
}

class WorldScene extends Phaser.Scene {
  private playerSprite?: Phaser.GameObjects.Text;
  private playerX = 5;
  private playerY = 5;
  private onMove?: (x: number, y: number) => void;
  private onEncounter?: (monsterId: string) => void;
  private monsters: { id: string; x: number; y: number; sprite: Phaser.GameObjects.Text }[] = [];
  private cellSize = 48;

  constructor() {
    super({ key: "WorldScene" });
  }

  init(data: { zoneId: string; classIcon: string; monsters: string[]; onMove: (x: number, y: number) => void; onEncounter: (id: string) => void }) {
    this.onMove = data.onMove;
    this.onEncounter = data.onEncounter;
    this.monsters = data.monsters.map((id, i) => ({
      id,
      x: 3 + (i % 4) * 2,
      y: 2 + Math.floor(i / 4) * 2,
      sprite: null!,
    }));
  }

  create() {
    const { width, height } = this.scale;
    this.cellSize = Math.min(width, height) / 10;

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 8; y++) {
        const isEven = (x + y) % 2 === 0;
        const tile = this.add.rectangle(
          x * this.cellSize + this.cellSize / 2,
          y * this.cellSize + this.cellSize / 2 + 20,
          this.cellSize - 2,
          this.cellSize - 2,
          isEven ? 0x2d1b4e : 0x3d2b5e
        );
        tile.setInteractive();
        tile.on("pointerdown", () => this.movePlayer(x, y));
      }
    }

    this.monsters.forEach((m) => {
      m.sprite = this.add.text(
        m.x * this.cellSize + this.cellSize / 2,
        m.y * this.cellSize + this.cellSize / 2 + 20,
        "👾",
        { fontSize: "24px" }
      ).setOrigin(0.5);
    });

    this.playerSprite = this.add.text(
      this.playerX * this.cellSize + this.cellSize / 2,
      this.playerY * this.cellSize + this.cellSize / 2 + 20,
      "🧙",
      { fontSize: "28px" }
    ).setOrigin(0.5);
  }

  movePlayer(x: number, y: number) {
    const dist = Math.abs(x - this.playerX) + Math.abs(y - this.playerY);
    if (dist !== 1) return;

    this.playerX = x;
    this.playerY = y;
    this.playerSprite?.setPosition(
      x * this.cellSize + this.cellSize / 2,
      y * this.cellSize + this.cellSize / 2 + 20
    );
    this.onMove?.(x, y);

    const encounter = this.monsters.find((m) => m.x === x && m.y === y);
    if (encounter) {
      this.onEncounter?.(encounter.id);
    }
  }
}

export default function WorldScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const [charData] = useState(() => loadCharacterData(characterId));
  const [showMenu, setShowMenu] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  useOnlinePresence();
  const onlinePlayers = getOnlinePlayersInZone(zoneId).filter((p) => p.name !== characterName);

  const zone = getZoneById(zoneId)!;
  const classData = CLASSES.find((c) => c.id === classId);
  const zoneMonsters = getMonstersByZone(zoneId).filter((m) => !m.isBoss);

  const handleEncounter = useCallback((monsterId: string) => {
    const combatId = `combat_${Date.now()}`;
    localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
      monsterIds: [monsterId],
      zoneId,
      characterId,
    }));
    setCombat(combatId);
  }, [characterId, zoneId, setCombat]);

  useEffect(() => {
    if (!gameRef.current || phaserRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: gameRef.current.clientWidth,
      height: 400,
      backgroundColor: "#1a0f2e",
      scene: WorldScene,
      scale: { mode: Phaser.Scale.RESIZE },
    };

    phaserRef.current = new Phaser.Game(config);

    phaserRef.current.scene.start("WorldScene", {
      zoneId,
      classIcon: classData?.icon ?? "🧙",
      monsters: zoneMonsters.slice(0, 4).map((m) => m.id),
      onMove: () => {},
      onEncounter: handleEncounter,
    });

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, [zoneId, classData, zoneMonsters, handleEncounter]);

  const navItems = [
    { id: "inventory", icon: "🎒", label: "Sac" },
    { id: "quests", icon: "📜", label: "Quêtes" },
    { id: "dungeons", icon: "🏚️", label: "Donjons" },
    { id: "pvp", icon: "⚔️", label: "Arène" },
    { id: "pets", icon: "✨", label: "Pets" },
    { id: "haven", icon: "🏠", label: "Havre" },
    { id: "guild", icon: "🏰", label: "Guilde" },
    { id: "marketplace", icon: "🏪", label: "Marché" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      {/* HUD */}
      <div className="flex items-center justify-between p-3 bg-aether-900/80 border-b border-aether-700/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{classData?.icon}</span>
          <div>
            <p className="font-bold text-white text-sm">{characterName}</p>
            <p className="text-aether-400 text-xs">Niv. {charData.level} • {zone.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-red-400">❤️ {charData.hp}/{charData.maxHp}</span>
          <span className="text-crystal-gold">✦ {charData.eclats}</span>
          <button onClick={() => setShowMenu(!showMenu)} className="text-aether-400 text-xl">☰</button>
        </div>
      </div>

      {/* XP Bar */}
      <div className="h-1 bg-aether-900">
        <div
          className="h-full bg-gradient-to-r from-aether-600 to-crystal-cyan transition-all"
          style={{ width: `${(charData.xp / charData.xpToNext) * 100}%` }}
        />
      </div>

      {/* Game Canvas */}
      <div ref={gameRef} className="flex-1 min-h-[300px]" />

      {/* Zone info */}
      <div className="px-4 py-2 text-center">
        <p className="text-aether-400 text-xs">{zone.description}</p>
        <p className="text-aether-500 text-xs mt-1">
          Niveau {zone.levelRange[0]}-{zone.levelRange[1]}
          {zone.isPvP && " • ⚔️ Zone PvP"}
        </p>
        <button
          onClick={() => setShowPlayers(!showPlayers)}
          className="text-aether-400 text-xs mt-1 underline"
        >
          👥 {onlinePlayers.length} joueur{onlinePlayers.length !== 1 ? "s" : ""} en ligne
        </button>
        {showPlayers && onlinePlayers.length > 0 && (
          <div className="mt-2 space-y-1">
            {onlinePlayers.map((p) => {
              const cls = CLASSES.find((c) => c.id === p.classId);
              return (
                <p key={p.name} className="text-aether-500 text-xs">
                  {cls?.icon} {p.name} (Niv. {p.level})
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="game-panel p-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-aether-800/50 active:scale-95"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-aether-400 text-[9px]">{item.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setScreen("professions")}
          className="w-full mt-1 text-aether-500 text-[10px] py-1 hover:text-aether-400"
        >
          ⚒️ Métiers
        </button>
      </div>

      {/* Zone travel */}
      {showMenu && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowMenu(false)}>
          <div className="w-full game-panel p-4 rounded-t-3xl max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg mb-4">Voyager</h3>
            <div className="space-y-2">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => {
                    useGameStore.getState().setZone(z.id);
                    setShowMenu(false);
                  }}
                  className={`card w-full flex items-center gap-3 ${z.id === zoneId ? "border-aether-500" : ""}`}
                >
                  <span className="text-2xl">{z.icon}</span>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{z.name}</p>
                    <p className="text-aether-500 text-xs">Niv. {z.levelRange[0]}-{z.levelRange[1]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
