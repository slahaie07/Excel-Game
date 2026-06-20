import Phaser from "phaser";
import {
  gridToIso, isoDepth, drawIsoTile, drawIsoShadow,
  getClassIcon, getMonsterIcon, ZONE_THEMES, type ZoneTileTheme,
} from "./isometric";
import { addEntityVisual, preloadClassPortraits } from "./spriteLoader";

export interface IsoEntity {
  id: string;
  gridX: number;
  gridY: number;
  icon: string;
  classId?: string;
  label?: string;
  isPlayer?: boolean;
  onClick?: () => void;
}

export interface IsoWorldConfig {
  gridW: number;
  gridH: number;
  zoneId: string;
  playerIcon: string;
  playerClassId: string;
  entities: IsoEntity[];
  obstacles?: { x: number; y: number }[];
  onMove: (x: number, y: number) => void;
  onEncounter?: (entityId: string) => void;
}

export class IsoWorldScene extends Phaser.Scene {
  private config!: IsoWorldConfig;
  private playerX = 5;
  private playerY = 5;
  private tileW = 56;
  private tileH = 28;
  private offsetX = 0;
  private offsetY = 40;
  private theme!: ZoneTileTheme;
  private tileGraphics!: Phaser.GameObjects.Graphics;
  private entitySprites: Phaser.GameObjects.GameObject[] = [];
  private highlightGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "IsoWorldScene" });
  }

  init(data: IsoWorldConfig) {
    this.config = data;
    this.playerX = 5;
    this.playerY = 5;
  }

  preload() {
    preloadClassPortraits(this);
  }

  create() {
    const { width } = this.scale;
    this.theme = ZONE_THEMES[this.config.zoneId] ?? ZONE_THEMES.vallee_eveils!;
    this.offsetX = width / 2;
    this.offsetY = 50;

    this.tileGraphics = this.add.graphics();
    this.highlightGfx = this.add.graphics();

    this.drawGrid();
    this.renderEntities();
    this.createAmbientParticles();
  }

  private drawGrid() {
    this.tileGraphics.clear();
    const { gridW, gridH, obstacles = [] } = this.config;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const isObstacle = obstacles.some((o) => o.x === x && o.y === y);
        const isEven = (x + y) % 2 === 0;
        const pos = gridToIso(x, y, this.tileW, this.tileH, this.offsetX, this.offsetY);
        const color = isObstacle ? this.theme.obstacle : isEven ? this.theme.even : this.theme.odd;

        drawIsoTile(this.tileGraphics, pos.x, pos.y, this.tileW, this.tileH, color, this.theme.stroke);

        if (!isObstacle) {
          const hitArea = this.add.zone(pos.x, pos.y, this.tileW, this.tileH / 2);
          hitArea.setInteractive({ useHandCursor: true });
          hitArea.on("pointerdown", () => this.handleTileClick(x, y));
          hitArea.on("pointerover", () => {
            this.highlightGfx.clear();
            drawIsoTile(this.highlightGfx, pos.x, pos.y, this.tileW, this.tileH, this.theme.highlight, this.theme.accent, 0.5);
          });
          hitArea.on("pointerout", () => this.highlightGfx.clear());
        }
      }
    }
  }

  private renderEntities() {
    this.entitySprites.forEach((s) => s.destroy());
    this.entitySprites = [];

    const allEntities: IsoEntity[] = [
      {
        id: "player",
        gridX: this.playerX,
        gridY: this.playerY,
        icon: this.config.playerIcon,
        classId: this.config.playerClassId,
        isPlayer: true,
      },
      ...this.config.entities,
    ];

    allEntities.sort((a, b) => isoDepth(a.gridX, a.gridY) - isoDepth(b.gridX, b.gridY));

    const shadowGfx = this.add.graphics();
    allEntities.forEach((entity) => {
      const pos = gridToIso(entity.gridX, entity.gridY, this.tileW, this.tileH, this.offsetX, this.offsetY);
      drawIsoShadow(shadowGfx, pos.x, pos.y, entity.isPlayer ? 14 : 10);

      const depth = isoDepth(entity.gridX, entity.gridY);
      const displaySize = entity.isPlayer ? 52 : 40;
      const sprite = addEntityVisual(this, pos.x, pos.y - 8, {
        icon: entity.icon,
        classId: entity.classId,
        displaySize,
        depth,
        fontSize: entity.isPlayer ? "28px" : "22px",
      });

      if (entity.isPlayer) {
        this.tweens.add({
          targets: sprite,
          y: pos.y - 12,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      this.entitySprites.push(sprite);
    });
  }

  private handleTileClick(x: number, y: number) {
    const dist = Math.abs(x - this.playerX) + Math.abs(y - this.playerY);
    if (dist !== 1) return;

    this.playerX = x;
    this.playerY = y;
    this.config.onMove(x, y);
    this.renderEntities();

    const encounter = this.config.entities.find((e) => e.gridX === x && e.gridY === y);
    if (encounter) {
      this.config.onEncounter?.(encounter.id);
    }
  }

  private createAmbientParticles() {
    const accent = this.theme.accent;

    const gfx = this.add.graphics();
    gfx.fillStyle(accent, 1);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture("particle", 8, 8);

    this.add.particles(0, 0, "particle", {
      x: { min: 0, max: this.scale.width },
      y: { min: 0, max: this.scale.height * 0.6 },
      speed: { min: 5, max: 20 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 3000,
      frequency: 400,
      tint: accent,
      blendMode: "ADD",
    });
  }

  updateConfig(entities: IsoEntity[]) {
    this.config.entities = entities;
    this.renderEntities();
  }
}

export function createMonsterEntities(monsterIds: string[]): IsoEntity[] {
  return monsterIds.map((id, i) => ({
    id,
    gridX: 3 + (i % 4) * 2,
    gridY: 2 + Math.floor(i / 4) * 2,
    icon: getMonsterIcon(id),
  }));
}

export { getClassIcon, getMonsterIcon };
