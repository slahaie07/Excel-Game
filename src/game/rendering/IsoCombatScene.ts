import Phaser from "phaser";
import {
  gridToIso, isoDepth, drawIsoTile, drawIsoShadow,
  ZONE_THEMES, type ZoneTileTheme,
} from "./isometric";

export interface CombatEntityVisual {
  entityId: string;
  name: string;
  gridX: number;
  gridY: number;
  icon: string;
  hp: number;
  maxHp: number;
  team: "player" | "enemy";
  isAlive: boolean;
  isCurrent: boolean;
}

export class IsoCombatScene extends Phaser.Scene {
  private entities: CombatEntityVisual[] = [];
  private onCellClick?: (x: number, y: number) => void;
  private tileW = 48;
  private tileH = 24;
  private offsetX = 0;
  private offsetY = 30;
  private gridW = 12;
  private gridH = 8;
  private theme!: ZoneTileTheme;
  private tileGraphics!: Phaser.GameObjects.Graphics;
  private highlightGfx!: Phaser.GameObjects.Graphics;
  private entitySprites: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "IsoCombatScene" });
  }

  init(data: {
    entities: CombatEntityVisual[];
    currentEntityId: string;
    onCellClick: (x: number, y: number) => void;
    combatType?: string;
  }) {
    this.entities = data.entities;
    this.onCellClick = data.onCellClick;
    const typeTheme =
      data.combatType === "dungeon" ? "dungeon"
      : data.combatType === "pvp" ? "arene_pvp"
      : data.combatType === "event" ? "event"
      : "combat";
    this.theme = ZONE_THEMES[typeTheme] ?? ZONE_THEMES.combat!;
  }

  create() {
    const { width } = this.scale;
    this.offsetX = width / 2 - (this.gridW * this.tileW) / 4;
    this.tileGraphics = this.add.graphics();
    this.highlightGfx = this.add.graphics();

    this.drawGrid();
    this.renderEntities();
  }

  private drawGrid() {
    this.tileGraphics.clear();
    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const isEven = (x + y) % 2 === 0;
        const pos = gridToIso(x, y, this.tileW, this.tileH, this.offsetX, this.offsetY);
        const color = isEven ? this.theme.even : this.theme.odd;
        drawIsoTile(this.tileGraphics, pos.x, pos.y, this.tileW, this.tileH, color, this.theme.stroke);

        const hitArea = this.add.zone(pos.x, pos.y, this.tileW, this.tileH / 2);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on("pointerdown", () => this.onCellClick?.(x, y));
        hitArea.on("pointerover", () => {
          this.highlightGfx.clear();
          drawIsoTile(this.highlightGfx, pos.x, pos.y, this.tileW, this.tileH, this.theme.highlight, this.theme.accent, 0.4);
        });
        hitArea.on("pointerout", () => this.highlightGfx.clear());
      }
    }
  }

  updateEntities(entities: CombatEntityVisual[], _currentEntityId: string) {
    this.entities = entities;
    this.renderEntities();
  }

  playSpellEffect(fromX: number, fromY: number, toX: number, toY: number, color: number) {
    const from = gridToIso(fromX, fromY, this.tileW, this.tileH, this.offsetX, this.offsetY);
    const to = gridToIso(toX, toY, this.tileW, this.tileH, this.offsetX, this.offsetY);

    const particle = this.add.circle(from.x, from.y - 8, 6, color, 0.9);
    this.tweens.add({
      targets: particle,
      x: to.x,
      y: to.y - 8,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      ease: "Power2",
      onComplete: () => {
        particle.destroy();
        const burst = this.add.circle(to.x, to.y - 8, 4, color, 0.8);
        this.tweens.add({
          targets: burst,
          scale: 3,
          alpha: 0,
          duration: 300,
          onComplete: () => burst.destroy(),
        });
      },
    });
  }

  private renderEntities() {
    this.entitySprites.forEach((s) => s.destroy());
    this.entitySprites = [];

    const alive = this.entities.filter((e) => e.isAlive);
    alive.sort((a, b) => isoDepth(a.gridX, a.gridY) - isoDepth(b.gridX, b.gridY));

    alive.forEach((entity) => {
      const pos = gridToIso(entity.gridX, entity.gridY, this.tileW, this.tileH, this.offsetX, this.offsetY);
      const depth = isoDepth(entity.gridX, entity.gridY);

      const shadowGfx = this.add.graphics();
      drawIsoShadow(shadowGfx, pos.x, pos.y, 10);
      shadowGfx.setDepth(depth);
      this.entitySprites.push(shadowGfx);

      if (entity.isCurrent) {
        const ring = this.add.circle(pos.x, pos.y, this.tileW / 2 - 4, this.theme.accent, 0.15);
        ring.setDepth(depth);
        this.tweens.add({ targets: ring, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
        this.entitySprites.push(ring);
      }

      const sprite = this.add.text(pos.x, pos.y - 10, entity.icon, {
        fontSize: entity.team === "player" ? "26px" : "20px",
      }).setOrigin(0.5).setDepth(depth + 0.1);
      this.entitySprites.push(sprite);

      const hpPct = entity.hp / entity.maxHp;
      const barW = 32;
      const barBg = this.add.rectangle(pos.x, pos.y - 28, barW, 4, 0x333333).setDepth(depth + 0.2);
      const barFill = this.add.rectangle(
        pos.x - (barW * (1 - hpPct)) / 2,
        pos.y - 28,
        barW * hpPct,
        4,
        entity.team === "player" ? 0x00cc66 : 0xcc3333
      ).setOrigin(0, 0.5).setDepth(depth + 0.3);
      this.entitySprites.push(barBg, barFill);

      const nameLabel = this.add.text(pos.x, pos.y - 36, entity.name, {
        fontSize: "9px",
        color: "#ffffff",
        fontFamily: "Nunito, sans-serif",
      }).setOrigin(0.5).setDepth(depth + 0.4);
      this.entitySprites.push(nameLabel);
    });
  }
}
