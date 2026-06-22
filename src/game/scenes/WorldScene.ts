import Phaser from "phaser";
import { useGameStore } from "../../store/gameStore";
import { ZONES, type ZoneId } from "../../data/universe";
import { getNpcsForZone } from "../../data/quests";
import { getRandomEncounter } from "../../data/monsters";
import {
  createCombatEntity,
  entityFromMonster,
  initCombatState,
} from "../combat/CombatEngine";
import { CLASSES } from "../../data/classes";
import { heroTextureKey, zoneTileKey } from "../assets/SpriteFactory";

const TILE_W = 64;
const TILE_H = 32;

export class WorldScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private playerBaseY = 0;
  private npcSprites: Phaser.GameObjects.Container[] = [];
  private mapContainer!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchTarget: { x: number; y: number } | null = null;
  private encounterCooldown = 0;

  constructor() {
    super({ key: "WorldScene" });
  }

  create() {
    const { player } = useGameStore.getState();
    if (!player) return;

    const zone = ZONES[player.zone];
    this.cameras.main.setBackgroundColor(0x0a0e1a);

    this.mapContainer = this.add.container(0, 0);
    this.drawIsometricMap(player.zone, zone.mapWidth, zone.mapHeight);

    const heroKey = heroTextureKey(player.classId);
    this.playerShadow = this.add.image(0, 0, "shadow").setAlpha(0.35);
    this.playerSprite = this.add.sprite(0, 0, heroKey);
    this.playerSprite.setOrigin(0.5, 1);
    this.updatePlayerPosition(player.position.x, player.position.y);

    this.spawnNpcs(player.zone);
    this.setupCamera();
    this.setupInput();
  }

  private drawIsometricMap(zoneId: ZoneId, width: number, height: number) {
    this.mapContainer.removeAll(true);
    const tileKey = zoneTileKey(zoneId);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const iso = this.gridToIso(x, y);
        const isPath = (x + y) % 3 !== 0;
        const isBorder =
          x === 0 || y === 0 || x === width - 1 || y === height - 1;

        const tile = this.add.image(iso.x, iso.y, tileKey);
        tile.setDisplaySize(TILE_W, TILE_H);
        if (!isPath) tile.setTint(0x888888);
        if (isBorder) tile.setTint(0x664422);
        tile.setAlpha(isBorder ? 0.85 : 1);
        this.mapContainer.add(tile);
      }
    }

    const zoneData = ZONES[zoneId];
    const center = this.gridToIso(
      Math.floor(zoneData.mapWidth / 2),
      Math.floor(zoneData.mapHeight / 2),
    );
    const glow = this.add.circle(center.x, center.y - 16, 40, 0xf4d03f, 0.08);
    this.mapContainer.add(glow);
  }

  private gridToIso(gridX: number, gridY: number) {
    return {
      x: (gridX - gridY) * (TILE_W / 2) + 400,
      y: (gridX + gridY) * (TILE_H / 2) + 100,
    };
  }

  private isoToGrid(isoX: number, isoY: number) {
    const adjX = isoX - 400;
    const adjY = isoY - 100;
    const gridX = Math.round((adjX / (TILE_W / 2) + adjY / (TILE_H / 2)) / 2);
    const gridY = Math.round((adjY / (TILE_H / 2) - adjX / (TILE_W / 2)) / 2);
    return { x: gridX, y: gridY };
  }

  private updatePlayerPosition(gridX: number, gridY: number) {
    const iso = this.gridToIso(gridX, gridY);
    this.playerBaseY = iso.y - 8;
    this.playerShadow.setPosition(iso.x, iso.y + 2);
    this.playerSprite.setPosition(iso.x, this.playerBaseY);
    this.cameras.main.centerOn(iso.x, iso.y);
  }

  private spawnNpcs(zoneId: ZoneId) {
    this.npcSprites.forEach((s) => s.destroy());
    this.npcSprites = [];

    const npcs = getNpcsForZone(zoneId);
    for (const npc of npcs) {
      const iso = this.gridToIso(npc.x, npc.y);
      const container = this.add.container(iso.x, iso.y - 20);

      const marker = this.add.sprite(0, -4, "npc_marker");
      marker.setOrigin(0.5, 1);

      const icon = this.add
        .text(0, -18, npc.icon, { fontSize: "14px" })
        .setOrigin(0.5);

      const name = this.add
        .text(0, 8, npc.name, {
          fontSize: "9px",
          color: "#f4d03f",
          fontFamily: "Nunito",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      container.add([marker, icon, name]);
      container.setSize(36, 36);
      container.setInteractive({ useHandCursor: true });
      container.on("pointerdown", () => {
        useGameStore.getState().setSelectedNpc(npc.id);
      });

      this.tweens.add({
        targets: marker,
        y: -7,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.npcSprites.push(container);
    }
  }

  private setupCamera() {
    this.cameras.main.setZoom(
      Math.min(this.scale.width / 800, this.scale.height / 600),
    );
  }

  private setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      this.touchTarget = this.isoToGrid(worldX, worldY);
    });
  }

  update(time: number, delta: number) {
    const store = useGameStore.getState();
    const { player } = store;
    if (!player) return;

    this.playerSprite.y =
      this.playerBaseY + Math.sin(time / 400) * 2;

    let moved = false;
    let newX = player.position.x;
    let newY = player.position.y;

    if (this.cursors?.left.isDown) {
      newX--;
      moved = true;
    } else if (this.cursors?.right.isDown) {
      newX++;
      moved = true;
    } else if (this.cursors?.up.isDown) {
      newY--;
      moved = true;
    } else if (this.cursors?.down.isDown) {
      newY++;
      moved = true;
    }

    if (this.touchTarget) {
      const dx = this.touchTarget.x - player.position.x;
      const dy = this.touchTarget.y - player.position.y;
      if (Math.abs(dx) + Math.abs(dy) > 0) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          newX += Math.sign(dx);
        } else {
          newY += Math.sign(dy);
        }
        moved = true;
        if (newX === this.touchTarget.x && newY === this.touchTarget.y) {
          this.touchTarget = null;
        }
      } else {
        this.touchTarget = null;
      }
    }

    const zone = ZONES[player.zone];
    if (moved) {
      newX = Phaser.Math.Clamp(newX, 0, zone.mapWidth - 1);
      newY = Phaser.Math.Clamp(newY, 0, zone.mapHeight - 1);

      if (newX === zone.mapWidth - 1) {
        const nextZone = zone.connections[0];
        if (nextZone) {
          const next = ZONES[nextZone];
          store.changeZone(nextZone, 2, Math.floor(next.mapHeight / 2));
          this.scene.restart();
          return;
        }
      }
      if (newX === 0) {
        const prevZone = zone.connections.find((z) =>
          ZONES[z]?.connections.includes(player.zone),
        );
        if (prevZone) {
          const prev = ZONES[prevZone];
          store.changeZone(
            prevZone,
            prev.mapWidth - 2,
            Math.floor(prev.mapHeight / 2),
          );
          this.scene.restart();
          return;
        }
      }

      store.movePlayer(newX, newY);
      this.updatePlayerPosition(newX, newY);
    }

    this.encounterCooldown -= delta;
    if (moved && this.encounterCooldown <= 0 && Math.random() < 0.08) {
      this.encounterCooldown = 5000;
      this.triggerEncounter();
    }
  }

  private triggerEncounter() {
    const store = useGameStore.getState();
    const { player } = store;
    if (!player) return;

    const monsters = getRandomEncounter(player.zone, player.level);
    store.addNotification("Un groupe de monstres apparaît !", "warning");

    const playerEntity = createCombatEntity(
      "player_0",
      player.name,
      "player",
      { ...player.stats },
      { x: 2, y: 5 },
      player.spells,
      CLASSES[player.classId].name[0] ?? "H",
      0x3498db,
      { classId: player.classId },
    );

    const enemies = monsters.map((m, i) =>
      entityFromMonster(m, `enemy_${i}`, { x: 10 + i, y: 3 + i * 2 }),
    );

    const combat = initCombatState([playerEntity], enemies);
    store.startCombat(combat);
    this.scene.start("CombatScene");
  }
}
