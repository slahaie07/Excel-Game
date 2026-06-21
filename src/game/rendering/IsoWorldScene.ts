import Phaser from "phaser";
import {
  gridToIso, isoDepth, drawIsoTile, drawIsoShadow,
  getClassIcon, getMonsterIcon, ZONE_THEMES, type ZoneTileTheme,
} from "./isometric";
import { getMonsterById } from "../data/monsters";
import { getRegionForZone } from "../data/worldMap";
import { addEntityVisual, preloadEntitySprites } from "./spriteLoader";

export interface IsoEntity {
  id: string;
  gridX: number;
  gridY: number;
  icon: string;
  classId?: string;
  monsterId?: string;
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
  reducedMotion?: boolean;
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
    preloadEntitySprites(this);
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
    if (!this.config.reducedMotion) {
      this.createAmbientParticles();
    }
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
        monsterId: entity.monsterId,
        displaySize,
        depth,
        fontSize: entity.isPlayer ? "28px" : "22px",
        animate: true,
      });

      if (entity.isPlayer) {
        this.tweens.killTweensOf(sprite);
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
    const zoneId = this.config.zoneId;
    const regionId = getRegionForZone(zoneId)?.id;

    type ParticlePreset = {
      tint: number;
      speed: { min: number; max: number };
      angle: { min: number; max: number };
      scale: { start: number; end: number };
      alpha: { start: number; end: number };
      lifespan: number;
      frequency: number;
      yMaxRatio?: number;
    };

    let preset: ParticlePreset;

    switch (regionId) {
      case "givre":
        preset = {
          tint: 0xe8f4ff,
          speed: { min: 4, max: 14 },
          angle: { min: 250, max: 290 },
          scale: { start: 0.35, end: 0 },
          alpha: { start: 0.75, end: 0 },
          lifespan: 5500,
          frequency: 180,
        };
        break;
      case "marais":
        preset = {
          tint: 0x7cfc00,
          speed: { min: 3, max: 10 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 0.1 },
          alpha: { start: 0.35, end: 0 },
          lifespan: 4500,
          frequency: 550,
        };
        break;
      case "cendres":
        preset = {
          tint: 0xff6347,
          speed: { min: 18, max: 35 },
          angle: { min: 250, max: 290 },
          scale: { start: 0.3, end: 0 },
          alpha: { start: 0.85, end: 0 },
          lifespan: 2500,
          frequency: 280,
        };
        break;
      case "stellaire":
        preset = {
          tint: 0xdda0dd,
          speed: { min: 2, max: 12 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.25, end: 0 },
          alpha: { start: 0.7, end: 0 },
          lifespan: 5000,
          frequency: 420,
        };
        break;
      case "archipel":
        preset = {
          tint: 0x87ceeb,
          speed: { min: 8, max: 22 },
          angle: { min: 255, max: 285 },
          scale: { start: 0.3, end: 0 },
          alpha: { start: 0.55, end: 0 },
          lifespan: 3500,
          frequency: 320,
        };
        break;
      default: {
        const isPvPZone = zoneId === "arene_pvp";
        const isLumina = zoneId === "foret_lumina" || zoneId === "vallee_eveils" || zoneId === "citadelle_stellaire";
        const isUmbra = zoneId === "desert_umbra";
        preset = {
          tint: accent,
          speed: { min: isUmbra ? 8 : 5, max: isLumina ? 25 : 20 },
          angle: { min: isUmbra ? 180 : 200, max: isUmbra ? 220 : 340 },
          scale: { start: (isPvPZone ? 3 : isUmbra ? 1 : 2) * 0.2, end: 0 },
          alpha: { start: isPvPZone ? 0.8 : 0.6, end: 0 },
          lifespan: isLumina ? 4000 : 3000,
          frequency: isPvPZone ? 250 : isLumina ? 350 : isUmbra ? 500 : 400,
        };
      }
    }

    const gfx = this.add.graphics();
    gfx.fillStyle(preset.tint, 1);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture("particle", 8, 8);

    this.add.particles(0, 0, "particle", {
      x: { min: 0, max: this.scale.width },
      y: { min: 0, max: this.scale.height * (preset.yMaxRatio ?? 0.6) },
      speed: preset.speed,
      angle: preset.angle,
      scale: preset.scale,
      alpha: preset.alpha,
      lifespan: preset.lifespan,
      frequency: preset.frequency,
      tint: preset.tint,
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
    monsterId: id,
    gridX: 3 + (i % 4) * 2,
    gridY: 2 + Math.floor(i / 4) * 2,
    icon: getMonsterById(id)?.icon ?? getMonsterIcon(id),
  }));
}

export { getClassIcon, getMonsterIcon };
