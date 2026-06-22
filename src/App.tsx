import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { useGameStore } from "./store/gameStore";
import { createPhaserGame } from "./game/GameEngine";
import { SplashScreen } from "./ui/screens/SplashScreen";
import { CharacterCreate } from "./ui/screens/CharacterCreate";
import { HUD } from "./ui/components/HUD";
import { InventoryPanel } from "./ui/panels/InventoryPanel";
import { QuestPanel } from "./ui/panels/QuestPanel";
import { SocialPanel } from "./ui/panels/SocialPanel";
import { CraftPanel } from "./ui/panels/CraftPanel";
import { ShopPanel } from "./ui/panels/ShopPanel";
import { GuildPanel } from "./ui/panels/GuildPanel";
import { NpcDialog } from "./ui/components/NpcDialog";
import { NotificationToast } from "./ui/components/NotificationToast";
import { SettingsPanel } from "./ui/panels/SettingsPanel";
import { CharacterSelect } from "./ui/screens/CharacterSelect";
import { DungeonPanel } from "./ui/panels/DungeonPanel";
import { useAutoSave } from "./hooks/useAutoSave";

export function App() {
  const screen = useGameStore((s) => s.screen);
  const player = useGameStore((s) => s.player);
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoSave();

  useEffect(() => {
    if (
      (screen === "world" || screen === "combat" || screen === "dungeon") &&
      player &&
      containerRef.current &&
      !gameRef.current
    ) {
      gameRef.current = createPhaserGame("game-canvas");
    }

    if (screen === "combat" && gameRef.current) {
      const game = gameRef.current;
      if (!game.scene.isActive("CombatScene")) {
        game.scene.pause("WorldScene");
        game.scene.start("CombatScene");
      }
    }

    return () => {
      if (screen === "splash" || screen === "character_create") {
        gameRef.current?.destroy(true);
        gameRef.current = null;
      }
    };
  }, [screen, player]);

  return (
    <div className="app">
      {screen === "splash" && <SplashScreen />}
      {screen === "character_select" && <CharacterSelect />}
      {screen === "character_create" && <CharacterCreate />}
      {(screen === "world" || screen === "combat") && player && (
        <>
          <div id="game-canvas" ref={containerRef} className="game-canvas" />
          <NpcDialog />
        </>
      )}
      {(screen === "world" || screen === "combat" || screen === "dungeon") && player && (
        <HUD />
      )}
      {screen === "inventory" && <InventoryPanel />}
      {screen === "quests" && <QuestPanel />}
      {screen === "social" && <SocialPanel />}
      {screen === "craft" && <CraftPanel />}
      {screen === "shop" && <ShopPanel />}
      {screen === "guild" && <GuildPanel />}
      {screen === "settings" && <SettingsPanel />}
      {screen === "dungeon" && <DungeonPanel />}
      <NotificationToast />
    </div>
  );
}
