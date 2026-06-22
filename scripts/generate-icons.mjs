import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/icons");
const resourcesDir = path.resolve(__dirname, "../resources");

async function createIcon(size, outPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a0e1a"/>
      <circle cx="50%" cy="45%" r="${size * 0.28}" fill="#f4d03f" opacity="0.9"/>
      <text x="50%" y="78%" text-anchor="middle" font-family="serif" font-size="${size * 0.22}" fill="#f4d03f">É</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

await mkdir(outDir, { recursive: true });
await mkdir(resourcesDir, { recursive: true });

await createIcon(192, path.join(outDir, "icon-192.png"));
await createIcon(512, path.join(outDir, "icon-512.png"));
await createIcon(1024, path.join(resourcesDir, "icon.png"));
await createIcon(2732, path.join(resourcesDir, "splash.png"));

console.log("Icons generated in public/icons and resources/");
