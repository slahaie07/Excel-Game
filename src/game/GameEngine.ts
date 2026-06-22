import Phaser from "phaser";
import { generateAllSprites } from "./assets/SpriteFactory";
import { WorldScene } from "./scenes/WorldScene";
import { CombatScene } from "./scenes/CombatScene";

export function createPhaserGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 600,
    backgroundColor: "#0a0e1a",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, WorldScene, CombatScene],
    input: {
      activePointers: 2,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
  };

  return new Phaser.Game(config);
}

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    generateAllSprites(this);
  }

  create() {
    this.scene.start("WorldScene");
  }
}
