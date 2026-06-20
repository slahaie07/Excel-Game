import Phaser from "phaser";
import { CLASS_PORTRAITS, getClassTextureKey } from "../data/assets";

export function preloadClassPortraits(scene: Phaser.Scene): void {
  for (const [classId, path] of Object.entries(CLASS_PORTRAITS)) {
    const key = getClassTextureKey(classId);
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  }
}

export function addEntityVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: {
    icon: string;
    classId?: string;
    displaySize: number;
    depth: number;
    fontSize?: string;
  }
): Phaser.GameObjects.GameObject {
  const { icon, classId, displaySize, depth, fontSize } = options;

  if (classId && scene.textures.exists(getClassTextureKey(classId))) {
    const image = scene.add.image(x, y, getClassTextureKey(classId));
    image.setDisplaySize(displaySize, displaySize);
    image.setOrigin(0.5, 0.9);
    image.setDepth(depth);
    return image;
  }

  return scene.add
    .text(x, y, icon, { fontSize: fontSize ?? `${Math.round(displaySize * 0.55)}px` })
    .setOrigin(0.5)
    .setDepth(depth);
}
