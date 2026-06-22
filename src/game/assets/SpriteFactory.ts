/** Génération procédurale de sprites pixel art pour Étheris */

import Phaser from "phaser";
import type { ClassId } from "../../data/classes";
import type { ZoneId } from "../../data/universe";

type Pixel = number | null;

function drawPixels(
  gfx: Phaser.GameObjects.Graphics,
  pixels: Pixel[][],
  scale: number,
): void {
  for (let y = 0; y < pixels.length; y++) {
    const row = pixels[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      const color = row[x];
      if (color == null) continue;
      gfx.fillStyle(color, 1);
      gfx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function bakeTexture(
  scene: Phaser.Scene,
  key: string,
  pixels: Pixel[][],
  scale = 2,
): void {
  const w = (pixels[0]?.length ?? 0) * scale;
  const h = pixels.length * scale;
  const gfx = scene.add.graphics({});
  drawPixels(gfx, pixels, scale);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

/** Héros — silhouette chibi 12x16 */
const HERO_BASE: Record<string, Pixel[][]> = {
  gardien: [
    [null,null,null,0x5d6d7e,0x5d6d7e,0x5d6d7e,0x5d6d7e,null,null,null,null,null],
    [null,null,0x5d6d7e,0x85929e,0x85929e,0x85929e,0x85929e,0x5d6d7e,null,null,null,null],
    [null,null,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,null,null,null,null],
    [null,0x5d6d7e,0x85929e,0xf5cba7,0x2c3e50,0xf5cba7,0x2c3e50,0xf5cba7,0x85929e,0x5d6d7e,null,null],
    [null,0x5d6d7e,0x85929e,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0x85929e,0x5d6d7e,null,null],
    [null,null,0x5d6d7e,0x5d6d7e,0x85929e,0x85929e,0x85929e,0x5d6d7e,0x5d6d7e,null,null,null],
    [null,null,0xaeb6bf,0xaeb6bf,0x85929e,0x85929e,0x85929e,0xaeb6bf,0xaeb6bf,null,null,null],
    [null,0x4a5568,0x4a5568,0x85929e,0x85929e,0x85929e,0x85929e,0x85929e,0x4a5568,0x4a5568,null,null],
    [null,0x4a5568,0x4a5568,0x85929e,0x85929e,0x85929e,0x85929e,0x85929e,0x4a5568,0x4a5568,null,null],
    [null,null,0x2c3e50,0x2c3e50,0x4a5568,0x4a5568,0x4a5568,0x2c3e50,0x2c3e50,null,null,null],
    [null,null,0x2c3e50,0x2c3e50,null,null,0x2c3e50,0x2c3e50,null,null,null,null],
    [null,null,0x1a252f,0x1a252f,null,null,0x1a252f,0x1a252f,null,null,null,null],
  ],
  arcaniste: [
    [null,null,null,0x8e44ad,0x8e44ad,0x8e44ad,null,null,null,null,null,null],
    [null,null,0x8e44ad,0xbb8fce,0xbb8fce,0xbb8fce,0x8e44ad,null,null,null,null,null],
    [null,null,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,null,null,null,null],
    [null,0x8e44ad,0xf4d03f,0xf5cba7,0x2c3e50,0xf5cba7,0x2c3e50,0xf5cba7,0xf4d03f,0x8e44ad,null,null],
    [null,0x6c3483,0x8e44ad,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0x8e44ad,0x6c3483,null,null,null],
    [null,null,0x8e44ad,0xbb8fce,0x8e44ad,0x8e44ad,0xbb8fce,0x8e44ad,null,null,null,null],
    [null,null,0x6c3483,0x8e44ad,0xf4d03f,0xf4d03f,0x8e44ad,0x6c3483,null,null,null,null],
    [null,0x4a235a,0x8e44ad,0x8e44ad,0xbb8fce,0xbb8fce,0x8e44ad,0x8e44ad,0x4a235a,null,null,null],
    [null,null,0x8e44ad,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0x8e44ad,null,null,null,null],
    [null,null,0x6c3483,0x6c3483,0x8e44ad,0x8e44ad,0x6c3483,0x6c3483,null,null,null,null],
    [null,null,0x4a235a,0x4a235a,null,null,0x4a235a,0x4a235a,null,null,null,null],
    [null,null,0x2c1810,0x2c1810,null,null,0x2c1810,0x2c1810,null,null,null,null],
  ],
  rodeur: [
    [null,null,null,0x27ae60,0x27ae60,0x27ae60,null,null,null,null,null,null],
    [null,null,0x1e8449,0x27ae60,0x52be80,0x27ae60,0x1e8449,null,null,null,null,null],
    [null,null,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,null,null,null,null],
    [null,0x1e8449,0xf5cba7,0xf5cba7,0x2c3e50,0xf5cba7,0x2c3e50,0xf5cba7,0x1e8449,null,null,null],
    [null,0x27ae60,0x52be80,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0x52be80,0x27ae60,null,null,null],
    [null,null,0x27ae60,0x52be80,0x27ae60,0x27ae60,0x52be80,0x27ae60,null,null,null,null],
    [null,null,0x1e8449,0x27ae60,0x52be80,0x52be80,0x27ae60,0x1e8449,null,null,null,null],
    [null,0x784212,0x784212,0x27ae60,0x52be80,0x52be80,0x27ae60,0x784212,0x784212,null,null,null],
    [null,null,0x27ae60,0x27ae60,0x784212,0x784212,0x27ae60,0x27ae60,null,null,null,null],
    [null,null,0x1e8449,0x1e8449,0x27ae60,0x27ae60,0x1e8449,0x1e8449,null,null,null,null],
    [null,null,0x145a32,0x145a32,null,null,0x145a32,0x145a32,null,null,null,null],
    [null,null,0x0b3d22,0x0b3d22,null,null,0x0b3d22,0x0b3d22,null,null,null,null],
  ],
  mystique: [
    [null,null,null,0xf1c40f,0xf1c40f,0xf1c40f,null,null,null,null,null,null],
    [null,null,0xf39c12,0xf4d03f,0xf9e79f,0xf4d03f,0xf39c12,null,null,null,null,null],
    [null,null,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,null,null,null,null],
    [null,0xf39c12,0xf5cba7,0xf5cba7,0x2c3e50,0xf5cba7,0x2c3e50,0xf5cba7,0xf39c12,null,null,null],
    [null,0xf1c40f,0xf9e79f,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf9e79f,0xf1c40f,null,null,null],
    [null,null,0xf1c40f,0xf9e79f,0xf1c40f,0xf1c40f,0xf9e79f,0xf1c40f,null,null,null,null],
    [null,null,0xf39c12,0xf1c40f,0xffffff,0xffffff,0xf1c40f,0xf39c12,null,null,null,null],
    [null,0xd4ac0d,0xf1c40f,0xf9e79f,0xf9e79f,0xf9e79f,0xf9e79f,0xf1c40f,0xd4ac0d,null,null,null],
    [null,null,0xf1c40f,0xf1c40f,0xf9e79f,0xf9e79f,0xf1c40f,0xf1c40f,null,null,null,null],
    [null,null,0xd4ac0d,0xd4ac0d,0xf1c40f,0xf1c40f,0xd4ac0d,0xd4ac0d,null,null,null,null],
    [null,null,0xb7950b,0xb7950b,null,null,0xb7950b,0xb7950b,null,null,null,null],
    [null,null,0x7d6608,0x7d6608,null,null,0x7d6608,0x7d6608,null,null,null,null],
  ],
};

function tintHero(base: ClassId): Pixel[][] {
  if (HERO_BASE[base]) return HERO_BASE[base];
  const palette: Record<ClassId, number> = {
    gardien: 0x5d6d7e,
    arcaniste: 0x8e44ad,
    rodeur: 0x27ae60,
    mystique: 0xf1c40f,
    forgeur: 0xc0392b,
    ombrelame: 0x2c3e50,
    invocateur: 0x16a085,
    alchimiste: 0xe67e22,
  };
  const c = palette[base];
  const dark = (c & 0xfefefe) >> 1;
  const light = c | 0x303030;
  return [
    [null,null,null,c,c,c,null,null,null,null,null,null],
    [null,null,dark,light,light,light,dark,null,null,null,null,null],
    [null,null,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,null,null,null,null],
    [null,dark,0xf5cba7,0xf5cba7,0x2c3e50,0xf5cba7,0x2c3e50,0xf5cba7,dark,null,null,null],
    [null,c,light,0xf5cba7,0xf5cba7,0xf5cba7,0xf5cba7,light,c,null,null,null],
    [null,null,c,light,c,c,light,c,null,null,null,null],
    [null,null,dark,c,light,light,c,dark,null,null,null,null],
    [null,dark,dark,c,light,light,c,dark,dark,null,null,null],
    [null,null,c,c,light,light,c,c,null,null,null,null],
    [null,null,dark,dark,c,c,dark,dark,null,null,null,null],
    [null,null,dark,dark,null,null,dark,dark,null,null,null,null],
    [null,null,0x111111,0x111111,null,null,0x111111,0x111111,null,null,null,null],
  ];
}

const MOB_SPRITES: Record<string, Pixel[][]> = {
  slime: [
    [null,null,null,0x2ecc71,0x2ecc71,0x2ecc71,null,null,null,null],
    [null,null,0x27ae60,0x58d68d,0x58d68d,0x58d68d,0x27ae60,null,null,null],
    [null,0x27ae60,0x58d68d,0x58d68d,0xffffff,0x58d68d,0x58d68d,0x27ae60,null,null],
    [null,0x1e8449,0x58d68d,0x58d68d,0x58d68d,0x58d68d,0x58d68d,0x1e8449,null,null],
    [null,null,0x27ae60,0x58d68d,0x58d68d,0x58d68d,0x27ae60,null,null,null],
    [null,null,null,0x1e8449,0x1e8449,0x1e8449,null,null,null,null],
  ],
  wolf: [
    [null,null,0x566573,0x566573,0x566573,null,null,null,null],
    [null,0x566573,0x85929e,0x85929e,0x85929e,0x566573,null,null,null],
    [null,0x566573,0x85929e,0xff6b6b,0x85929e,0x85929e,0x566573,null,null,null],
    [0x566573,0x85929e,0x85929e,0x85929e,0x85929e,0x85929e,0x85929e,0x566573,null,null],
    [null,0x566573,0x85929e,0x85929e,0x85929e,0x566573,0x566573,null,null,null],
    [null,null,0x34495e,0x566573,0x566573,0x34495e,null,null,null,null],
  ],
  golem: [
    [null,null,0x85c1e9,0x85c1e9,0x85c1e9,null,null,null,null],
    [null,0x5dade2,0xaed6f1,0xffffff,0xaed6f1,0x5dade2,null,null,null],
    [0x3498db,0x85c1e9,0xaed6f1,0x5dade2,0xaed6f1,0x85c1e9,0x3498db,null,null,null],
    [0x3498db,0x85c1e9,0x85c1e9,0x85c1e9,0x85c1e9,0x85c1e9,0x3498db,null,null,null],
    [null,0x2980b9,0x3498db,0x3498db,0x3498db,0x2980b9,null,null,null,null],
    [null,null,0x1f618d,0x2980b9,0x2980b9,0x1f618d,null,null,null,null],
  ],
  goblin: [
    [null,null,0x27ae60,0x27ae60,0x27ae60,null,null,null,null],
    [null,0x1e8449,0x52be80,0xff6b6b,0x52be80,0x1e8449,null,null,null],
    [null,0x27ae60,0x52be80,0x52be80,0x52be80,0x27ae60,null,null,null],
    [null,0x784212,0x27ae60,0x27ae60,0x27ae60,0x784212,null,null,null],
    [null,null,0x1e8449,0x1e8449,0x1e8449,null,null,null,null],
    [null,null,0x145a32,0x145a32,0x145a32,null,null,null,null],
  ],
  spectre: [
    [null,null,0x9b59b6,0x9b59b6,0x9b59b6,null,null,null,null],
    [null,0x8e44ad,0xbb8fce,0xffffff,0xbb8fce,0x8e44ad,null,null,null],
    [null,0x9b59b6,0xbb8fce,0xbb8fce,0xbb8fce,0x9b59b6,null,null,null],
    [null,0x8e44ad,0x9b59b6,0x9b59b6,0x9b59b6,0x8e44ad,null,null,null],
    [null,null,0x9b59b6,0xbb8fce,0x9b59b6,null,null,null,null],
    [null,null,null,0x8e44ad,0x8e44ad,null,null,null,null],
  ],
  rat: [
    [null,null,0x8b4513,0x8b4513,null,null,null,null,null],
    [null,0x6e3b12,0xa0522d,0xff6b6b,0xa0522d,0x6e3b12,null,null,null],
    [null,0x8b4513,0xa0522d,0xa0522d,0xa0522d,0x8b4513,null,null,null],
    [null,null,0x6e3b12,0x8b4513,0x6e3b12,null,null,null,null],
    [null,null,0x4a2c0f,0x4a2c0f,0x4a2c0f,null,null,null,null],
  ],
  dragon: [
    [null,null,0x8e44ad,0x8e44ad,0x8e44ad,0x8e44ad,null,null,null],
    [null,0x6c3483,0xbb8fce,0xff6b6b,0xbb8fce,0x6c3483,null,null,null],
    [0x8e44ad,0xbb8fce,0xbb8fce,0xbb8fce,0xbb8fce,0xbb8fce,0x8e44ad,null,null],
    [null,0x8e44ad,0xbb8fce,0x6c3483,0xbb8fce,0x8e44ad,null,null,null],
    [null,null,0x6c3483,0x8e44ad,0x8e44ad,0x6c3483,null,null,null],
    [null,null,0x4a235a,0x6c3483,0x6c3483,0x4a235a,null,null,null],
  ],
};

const MONSTER_TO_SPRITE: Record<string, string> = {
  slime_lumineux: "slime",
  rat_des_champs: "rat",
  gobelin_maraudeur: "goblin",
  loup_des_bois: "wolf",
  araignee_venimeuse: "goblin",
  golem_de_cristal: "golem",
  spectre_mineur: "spectre",
  salamandre: "dragon",
  chevalier_corrompu: "golem",
  gardien_celeste: "spectre",
  echo_de_l_abime: "spectre",
  dragonnet_ether: "dragon",
};

const ZONE_TILES: Record<ZoneId, { grass: number; accent: number; edge: number }> = {
  lumineth_village: { grass: 0x2d5a3d, accent: 0x3d7a52, edge: 0x5d4e37 },
  whispering_forest: { grass: 0x1a4028, accent: 0x245a35, edge: 0x3d2817 },
  crystal_caves: { grass: 0x1a2a3a, accent: 0x2a4a6a, edge: 0x4a6a8a },
  ember_ruins: { grass: 0x3a2018, accent: 0x5a3020, edge: 0x2a1510 },
  sky_temple: { grass: 0x2a3a5a, accent: 0x4a5a8a, edge: 0x6a7aaa },
  abyss_gate: { grass: 0x1a1030, accent: 0x3a2060, edge: 0x2a1540 },
};

export function heroTextureKey(classId: ClassId): string {
  return `hero_${classId}`;
}

export function monsterTextureKey(monsterId: string): string {
  return MONSTER_TO_SPRITE[monsterId] ?? "slime";
}

export function zoneTileKey(zoneId: ZoneId): string {
  return `tile_${zoneId}`;
}

export function generateAllSprites(scene: Phaser.Scene): void {
  const classes: ClassId[] = [
    "gardien", "arcaniste", "rodeur", "mystique",
    "forgeur", "ombrelame", "invocateur", "alchimiste",
  ];

  for (const cls of classes) {
    bakeTexture(scene, heroTextureKey(cls), tintHero(cls), 2);
  }

  for (const [key, pixels] of Object.entries(MOB_SPRITES)) {
    bakeTexture(scene, key, pixels, 2);
  }

  for (const [zoneId, colors] of Object.entries(ZONE_TILES)) {
    bakeIsoTile(scene, `tile_${zoneId}`, colors.grass, colors.accent);
  }

  bakeIsoTile(scene, "tile_dungeon", 0x2a1a3a, 0x4a2a6a);
  bakeIsoTile(scene, "tile_obstacle", 0x4a3728, 0x6a5748);
  bakeTexture(scene, "shadow", [
    [null,0x000000,0x000000,0x000000,0x000000,null],
    [0x000000,0x000000,0x000000,0x000000,0x000000,0x000000],
    [null,0x000000,0x000000,0x000000,0x000000,null],
  ], 2);

  bakeTexture(scene, "npc_marker", [
    [null,null,0xf4d03f,0xf4d03f,0xf4d03f,null,null],
    [null,0xf39c12,0xf4d03f,0xffffff,0xf4d03f,0xf39c12,null],
    [0xf39c12,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf39c12],
    [null,0xf39c12,0xf4d03f,0xf4d03f,0xf4d03f,0xf39c12,null],
    [null,null,0xd4ac0d,0xd4ac0d,0xd4ac0d,null,null],
  ], 2);

  bakeTexture(scene, "select_ring", [
    [0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f],
    [0xf4d03f,null,null,null,null,null,null,0xf4d03f],
    [0xf4d03f,null,null,null,null,null,null,0xf4d03f],
    [0xf4d03f,null,null,null,null,null,null,0xf4d03f],
    [0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f,0xf4d03f],
  ], 2);
}

function bakeIsoTile(
  scene: Phaser.Scene,
  key: string,
  base: number,
  highlight: number,
): void {
  const w = 32;
  const h = 16;
  const gfx = scene.add.graphics({});
  gfx.fillStyle(base, 1);
  gfx.beginPath();
  gfx.moveTo(w / 2, 0);
  gfx.lineTo(w, h / 2);
  gfx.lineTo(w / 2, h);
  gfx.lineTo(0, h / 2);
  gfx.closePath();
  gfx.fillPath();
  gfx.fillStyle(highlight, 0.4);
  gfx.beginPath();
  gfx.moveTo(w / 2, 0);
  gfx.lineTo(w / 2, h / 2);
  gfx.lineTo(0, h / 2);
  gfx.closePath();
  gfx.fillPath();
  gfx.lineStyle(1, 0x000000, 0.2);
  gfx.strokePath();
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

export function getEntitySpriteKey(
  team: "player" | "enemy",
  classId?: string,
  monsterId?: string,
): string {
  if (team === "player" && classId) {
    return heroTextureKey(classId as ClassId);
  }
  if (monsterId) {
    return monsterTextureKey(monsterId);
  }
  return "slime";
}
