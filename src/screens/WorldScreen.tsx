import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { useGameStore } from "../stores/gameStore";
import { ZONES, getZoneById, getMonstersByZone, CLASSES } from "../game/data";
import { getActiveEvent } from "../game/data/events";
import { useOnlinePresence, getOnlinePlayersInZone } from "../lib/useOnlinePresence";
import { IsoWorldScene, createMonsterEntities, getClassIcon } from "../game/rendering/IsoWorldScene";
import { loadCharacter } from "../lib/characterStorage";

export default function WorldScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const zoneId = useGameStore((s) => s.zoneId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);

  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const [charData] = useState(() => loadCharacter(characterId));
  const [showMenu, setShowMenu] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  useOnlinePresence();
  const onlinePlayers = getOnlinePlayersInZone(zoneId).filter((p) => p.name !== characterName);
  const activeEvent = getActiveEvent();

  const zone = getZoneById(zoneId)!;
  const classData = CLASSES.find((c) => c.id === classId);
  const zoneMonsters = getMonstersByZone(zoneId).filter((m) => !m.isBoss);

  const eventMonsters = activeEvent?.exclusiveMonsters ?? [];
  const allMonsterIds = [
    ...eventMonsters.slice(0, 1),
    ...zoneMonsters.slice(0, 3).map((m) => m.id),
  ].slice(0, 4);

  const handleEncounter = useCallback((monsterId: string) => {
    const combatId = `combat_${Date.now()}`;
    const isEventMonster = eventMonsters.includes(monsterId);
    localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
      type: isEventMonster ? "event" : "world",
      monsterIds: [monsterId],
      zoneId,
      characterId,
      eventId: isEventMonster ? activeEvent?.id : undefined,
      xpMultiplier: isEventMonster ? activeEvent?.bonuses.xpMultiplier : 1,
      eclatsMultiplier: isEventMonster ? activeEvent?.bonuses.eclatsMultiplier : 1,
    }));
    setCombat(combatId);
  }, [characterId, zoneId, setCombat, eventMonsters, activeEvent]);

  useEffect(() => {
    if (!gameRef.current) return;

    if (phaserRef.current) {
      phaserRef.current.destroy(true);
      phaserRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: gameRef.current.clientWidth,
      height: 420,
      backgroundColor: "#0d0618",
      scene: IsoWorldScene,
      scale: { mode: Phaser.Scale.RESIZE },
    };

    phaserRef.current = new Phaser.Game(config);

    phaserRef.current.scene.start("IsoWorldScene", {
      gridW: 10,
      gridH: 8,
      zoneId,
      playerIcon: getClassIcon(classId),
      entities: createMonsterEntities(allMonsterIds),
      onMove: () => {},
      onEncounter: handleEncounter,
    });

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, [zoneId, classId, allMonsterIds.join(","), handleEncounter]);

  const navItems = [
    { id: "inventory", icon: "🎒", label: "Sac" },
    { id: "quests", icon: "📜", label: "Quêtes" },
    { id: "dungeons", icon: "🏚️", label: "Donjons" },
    { id: "pvp", icon: "⚔️", label: "Arène" },
    { id: "pets", icon: "✨", label: "Pets" },
    { id: "haven", icon: "🏠", label: "Havre" },
    { id: "events", icon: activeEvent?.icon ?? "🎉", label: "Évent" },
    { id: "guild", icon: "🏰", label: "Guilde" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center justify-between p-3 bg-aether-900/80 border-b border-aether-700/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{classData?.icon}</span>
          <div>
            <p className="font-bold text-white text-sm">{characterName}</p>
            <p className="text-aether-400 text-xs">Niv. {charData?.level ?? 1} • {zone.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-red-400">❤️ {charData?.hp ?? 100}/{charData?.maxHp ?? 100}</span>
          <span className="text-crystal-gold">✦ {charData?.eclats ?? 0}</span>
          <button onClick={() => setShowMenu(!showMenu)} className="text-aether-400 text-xl">☰</button>
        </div>
      </div>

      {activeEvent && (
        <button
          onClick={() => setScreen("events")}
          className="mx-3 mt-2 card py-2 px-3 flex items-center gap-2 active:scale-[0.98]"
          style={{ borderColor: activeEvent.color + "80" }}
        >
          <span className="text-xl">{activeEvent.icon}</span>
          <div className="flex-1 text-left">
            <p className="text-white text-xs font-bold">{activeEvent.name}</p>
            <p className="text-aether-500 text-[10px]">x{activeEvent.bonuses.xpMultiplier} XP • x{activeEvent.bonuses.eclatsMultiplier} Éclats</p>
          </div>
          <span className="text-aether-400 text-xs">→</span>
        </button>
      )}

      <div className="h-1 bg-aether-900">
        <div
          className="h-full bg-gradient-to-r from-aether-600 to-crystal-cyan transition-all"
          style={{ width: `${((charData?.xp ?? 0) / (charData?.xpToNext ?? 100)) * 100}%` }}
        />
      </div>

      <div ref={gameRef} className="flex-1 min-h-[280px]" />

      <div className="px-4 py-1 text-center">
        <button onClick={() => setShowPlayers(!showPlayers)} className="text-aether-400 text-xs underline">
          👥 {onlinePlayers.length} joueur{onlinePlayers.length !== 1 ? "s" : ""} en ligne
        </button>
        {showPlayers && onlinePlayers.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {onlinePlayers.map((p) => {
              const cls = CLASSES.find((c) => c.id === p.classId);
              return (
                <p key={p.name} className="text-aether-500 text-xs">{cls?.icon} {p.name} (Niv. {p.level})</p>
              );
            })}
          </div>
        )}
      </div>

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
        <div className="flex gap-2 mt-1">
          <button onClick={() => setScreen("professions")} className="flex-1 text-aether-500 text-[10px] py-1 hover:text-aether-400">⚒️ Métiers</button>
          <button onClick={() => setScreen("marketplace")} className="flex-1 text-aether-500 text-[10px] py-1 hover:text-aether-400">🏪 Marché</button>
        </div>
      </div>

      {showMenu && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowMenu(false)}>
          <div className="w-full game-panel p-4 rounded-t-3xl max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg mb-4">Voyager</h3>
            <div className="space-y-2">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => { useGameStore.getState().setZone(z.id); setShowMenu(false); }}
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
