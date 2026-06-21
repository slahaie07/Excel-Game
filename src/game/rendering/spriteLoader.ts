import Phaser from "phaser";
import {
  CLASS_PORTRAITS,
  MONSTER_SPRITES,
  getClassTextureKey,
  getMonsterTextureKey,
} from "../data/assets";

export function preloadClassPortraits(scene: Phaser.Scene): void {
  for (const [classId, path] of Object.entries(CLASS_PORTRAITS)) {
    const key = getClassTextureKey(classId);
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  }
}

export function preloadMonsterSprites(scene: Phaser.Scene): void {
  for (const [monsterId, path] of Object.entries(MONSTER_SPRITES)) {
    const key = getMonsterTextureKey(monsterId);
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  }
}

export function preloadEntitySprites(scene: Phaser.Scene): void {
  preloadClassPortraits(scene);
  preloadMonsterSprites(scene);
}

export function addIdleMotion(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  baseY: number,
  amplitude = 4
): void {
  scene.tweens.add({
    targets: target,
    y: baseY - amplitude,
    duration: 900 + Math.floor(Math.random() * 500),
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

export function addEntityVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: {
    icon: string;
    classId?: string;
    monsterId?: string;
    displaySize: number;
    depth: number;
    fontSize?: string;
    animate?: boolean;
  }
): Phaser.GameObjects.GameObject {
  const { icon, classId, monsterId, displaySize, depth, fontSize, animate = true } = options;

  if (monsterId && scene.textures.exists(getMonsterTextureKey(monsterId))) {
    const image = scene.add.image(x, y, getMonsterTextureKey(monsterId));
    image.setDisplaySize(displaySize, displaySize);
    image.setOrigin(0.5, 0.9);
    image.setDepth(depth);
    if (animate) addIdleMotion(scene, image, y, 3);
    return image;
  }

  if (classId && scene.textures.exists(getClassTextureKey(classId))) {
    const image = scene.add.image(x, y, getClassTextureKey(classId));
    image.setDisplaySize(displaySize, displaySize);
    image.setOrigin(0.5, 0.9);
    image.setDepth(depth);
    if (animate) addIdleMotion(scene, image, y, 4);
    return image;
  }

  const text = scene.add
    .text(x, y, icon, { fontSize: fontSize ?? `${Math.round(displaySize * 0.55)}px` })
    .setOrigin(0.5)
    .setDepth(depth);
  if (animate) addIdleMotion(scene, text, y, 2);
  return text;
}
