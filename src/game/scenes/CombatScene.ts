import Phaser from "phaser";
import { useGameStore } from "../../store/gameStore";
import {
  type CombatState,
  getCurrentEntity,
  getReachableCells,
  getSpellTargets,
  moveEntity,
  castSpell,
  endTurn,
  getCombatRewards,
  manhattanDistance,
} from "../combat/CombatEngine";
import { SPELLS } from "../../data/spells";
import { getEntitySpriteKey } from "../assets/SpriteFactory";

const TILE_W = 48;
const TILE_H = 24;

export class CombatScene extends Phaser.Scene {
  private combatState!: CombatState;
  private gridContainer!: Phaser.GameObjects.Container;
  private entitySprites = new Map<string, Phaser.GameObjects.Container>();
  private highlightGraphics!: Phaser.GameObjects.Graphics;
  private mode: "move" | "spell" | "idle" = "idle";
  private offsetX = 200;
  private offsetY = 80;
  private tileKey = "tile_dungeon";

  constructor() {
    super({ key: "CombatScene" });
  }

  init() {
    const { combat } = useGameStore.getState();
    if (combat) {
      this.combatState = { ...combat };
    }
  }

  create() {
    const { dungeonRun, combatSource } = useGameStore.getState();
    const title =
      combatSource === "dungeon" && dungeonRun
        ? `🏰 Donjon — Salle ${dungeonRun.roomIndex + 1}`
        : "⚔️ Combat Tactique";

    this.tileKey =
      combatSource === "dungeon" ? "tile_dungeon" : "tile_whispering_forest";

    this.cameras.main.setBackgroundColor(
      combatSource === "dungeon" ? 0x1a0a2e : 0x0d1117,
    );

    this.add
      .text(400, 15, title, {
        fontSize: "18px",
        color: "#f4d03f",
        fontFamily: "Cinzel",
      })
      .setOrigin(0.5);

    this.gridContainer = this.add.container(0, 0);
    this.highlightGraphics = this.add.graphics();
    this.drawGrid();
    this.drawEntities();
    this.setupUI();
    this.setupInput();
  }

  private gridToIso(gx: number, gy: number) {
    return {
      x: (gx - gy) * (TILE_W / 2) + this.offsetX + 300,
      y: (gx + gy) * (TILE_H / 2) + this.offsetY + 50,
    };
  }

  private drawGrid() {
    this.gridContainer.removeAll(true);

    for (let y = 0; y < this.combatState.gridHeight; y++) {
      for (let x = 0; x < this.combatState.gridWidth; x++) {
        const iso = this.gridToIso(x, y);
        const isObstacle = this.combatState.obstacles.some(
          (o) => o.x === x && o.y === y,
        );
        const key = isObstacle ? "tile_obstacle" : this.tileKey;
        const tile = this.add.image(iso.x, iso.y, key);
        tile.setDisplaySize(TILE_W, TILE_H);
        if (!isObstacle && (x + y) % 2 === 1) {
          tile.setTint(0xbbbbbb);
        }
        this.gridContainer.add(tile);
      }
    }
  }

  private drawIsoTile(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
  ) {
    g.fillStyle(color, 0.35);
    g.beginPath();
    g.moveTo(x, y - TILE_H / 2);
    g.lineTo(x + TILE_W / 2, y);
    g.lineTo(x, y + TILE_H / 2);
    g.lineTo(x - TILE_W / 2, y);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, color, 0.6);
    g.strokePath();
  }

  private drawEntities() {
    this.entitySprites.forEach((s) => s.destroy());
    this.entitySprites.clear();

    for (const entity of this.combatState.entities) {
      if (!entity.isAlive) continue;
      const iso = this.gridToIso(entity.position.x, entity.position.y);
      const container = this.add.container(iso.x, iso.y);

      const isCurrent = entity.id === this.combatState.currentEntityId;
      const spriteKey = getEntitySpriteKey(
        entity.team,
        entity.classId,
        entity.monsterId,
      );

      if (isCurrent) {
        const ring = this.add.sprite(0, 2, "select_ring");
        ring.setDisplaySize(28, 14);
        ring.setAlpha(0.8);
        container.add(ring);
        this.tweens.add({
          targets: ring,
          alpha: 0.3,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }

      const shadow = this.add.image(0, 2, "shadow");
      shadow.setAlpha(0.3);
      shadow.setDisplaySize(20, 8);
      container.add(shadow);

      const sprite = this.add.sprite(0, 0, spriteKey);
      sprite.setOrigin(0.5, 1);
      if (entity.team === "enemy") {
        sprite.setFlipX(entity.position.x > 7);
      }
      container.add(sprite);

      const hpBar = this.add.graphics();
      const hpRatio = entity.stats.hp / entity.stats.maxHp;
      hpBar.fillStyle(0x333333);
      hpBar.fillRect(-14, -28, 28, 4);
      hpBar.fillStyle(
        hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf39c12 : 0xe74c3c,
      );
      hpBar.fillRect(-14, -28, 28 * hpRatio, 4);
      container.add(hpBar);

      const nameLabel = this.add
        .text(0, -32, entity.name, {
          fontSize: "8px",
          color: "#ffffff",
          fontFamily: "Nunito",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);
      container.add(nameLabel);

      this.entitySprites.set(entity.id, container);
    }
  }

  private setupUI() {
    const current = getCurrentEntity(this.combatState);
    if (!current) return;

    const info = this.add.text(20, 40, "", {
      fontSize: "12px",
      color: "#ecf0f1",
      fontFamily: "Nunito",
      lineSpacing: 4,
    });

    const updateInfo = () => {
      const cur = getCurrentEntity(this.combatState);
      if (!cur) return;
      info.setText(
        `Tour ${this.combatState.turn}\n${cur.name}\n❤️ ${cur.stats.hp}/${cur.stats.maxHp}\n⚡ PA: ${cur.stats.pa}/${cur.stats.maxPa}\n👟 PM: ${cur.stats.pm}/${cur.stats.maxPm}`,
      );
    };
    updateInfo();

    this.createButton(650, 500, "👟 Bouger", () => {
      this.mode = "move";
      this.showMoveRange();
    });

    this.createButton(750, 500, "⏭️ Fin Tour", () => {
      this.combatState = endTurn(this.combatState);
      this.syncState();
      this.mode = "idle";
      this.highlightGraphics.clear();
      this.drawEntities();

      if (this.combatState.phase !== "combat") {
        this.endCombat();
        return;
      }

      const cur = getCurrentEntity(this.combatState);
      if (cur?.team === "enemy") {
        this.time.delayedCall(800, () => this.aiTurn());
      }
      updateInfo();
    });

    if (current.team === "player") {
      let spellY = 500;
      for (const spellId of current.spells.slice(0, 4)) {
        const spell = SPELLS[spellId];
        if (!spell) continue;
        this.createButton(650, spellY, `${spell.icon} ${spell.name}`, () => {
          this.mode = "spell";
          this.combatState = { ...this.combatState, selectedSpell: spellId };
          this.showSpellRange(spellId);
        });
        spellY -= 35;
      }
    }

    if (current.team === "enemy") {
      this.time.delayedCall(1000, () => this.aiTurn());
    }
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontSize: "11px",
        color: "#ffffff",
        backgroundColor: "#2c3e50",
        padding: { x: 8, y: 4 },
        fontFamily: "Nunito",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onClick)
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#34495e" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#2c3e50" }));
    return btn;
  }

  private showMoveRange() {
    const current = getCurrentEntity(this.combatState);
    if (!current) return;
    const cells = getReachableCells(this.combatState, current);
    const g = this.highlightGraphics;
    g.clear();
    for (const cell of cells) {
      const iso = this.gridToIso(cell.x, cell.y);
      this.drawIsoTile(g, iso.x, iso.y, 0x3498db);
    }
  }

  private showSpellRange(spellId: string) {
    const current = getCurrentEntity(this.combatState);
    const spell = SPELLS[spellId];
    if (!current || !spell) return;
    const cells = getSpellTargets(this.combatState, current, spell);
    const g = this.highlightGraphics;
    g.clear();
    for (const cell of cells) {
      const iso = this.gridToIso(cell.x, cell.y);
      this.drawIsoTile(g, iso.x, iso.y, 0xe74c3c);
    }
  }

  private setupInput() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const adjX = pointer.x - this.offsetX - 300;
      const adjY = pointer.y - this.offsetY - 50;
      const gx = Math.round(
        (adjX / (TILE_W / 2) + adjY / (TILE_H / 2)) / 2,
      );
      const gy = Math.round(
        (adjY / (TILE_H / 2) - adjX / (TILE_W / 2)) / 2,
      );

      const current = getCurrentEntity(this.combatState);
      if (!current || current.team !== "player") return;

      if (this.mode === "move") {
        this.combatState = moveEntity(this.combatState, current.id, {
          x: gx,
          y: gy,
        });
        this.syncState();
        this.mode = "idle";
        this.highlightGraphics.clear();
        this.drawEntities();
      } else if (this.mode === "spell" && this.combatState.selectedSpell) {
        this.combatState = castSpell(
          this.combatState,
          current.id,
          this.combatState.selectedSpell,
          { x: gx, y: gy },
        );
        this.syncState();
        this.mode = "idle";
        this.highlightGraphics.clear();
        this.drawEntities();

        if (this.combatState.phase !== "combat") {
          this.endCombat();
        }
      }
    });
  }

  private aiTurn() {
    const current = getCurrentEntity(this.combatState);
    if (
      !current ||
      current.team !== "enemy" ||
      this.combatState.phase !== "combat"
    )
      return;

    const players = this.combatState.entities.filter(
      (e) => e.team === "player" && e.isAlive,
    );
    const target = players[0];
    if (!target) return;

    const dist = manhattanDistance(current.position, target.position);
    if (dist > 1) {
      const dx = Math.sign(target.position.x - current.position.x);
      const dy = Math.sign(target.position.y - current.position.y);
      const newPos = {
        x: current.position.x + dx,
        y: current.position.y + dy,
      };
      this.combatState = moveEntity(this.combatState, current.id, newPos);
    } else if (current.spells.length > 0) {
      const spellId = current.spells[0];
      if (spellId) {
        this.combatState = castSpell(
          this.combatState,
          current.id,
          spellId,
          target.position,
        );
      }
    }

    this.combatState = endTurn(this.combatState);
    this.syncState();
    this.drawEntities();

    if (this.combatState.phase !== "combat") {
      this.endCombat();
    }
  }

  private endCombat() {
    const victory = this.combatState.phase === "victory";
    const rewards = victory ? getCombatRewards(this.combatState) : undefined;
    const wasDungeon = useGameStore.getState().combatSource === "dungeon";
    useGameStore.getState().endCombat(victory, rewards);
    this.scene.stop();
    if (!wasDungeon) {
      this.scene.resume("WorldScene");
    }
  }

  private syncState() {
    useGameStore.setState({ combat: this.combatState });
  }
}
