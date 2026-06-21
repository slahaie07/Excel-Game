import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const brandDir = path.join(root, "public", "brand");

const exports = [
  { src: "logo-square.svg", out: "logo-square.png", width: 512 },
  { src: "logo-horizontal.svg", out: "logo-horizontal.png", width: 1600 },
  { src: "logo-icon.svg", out: "logo-icon.png", width: 256 },
  { src: "og-image.svg", out: "og-image.png", width: 1200 },
];

for (const item of exports) {
  const input = path.join(brandDir, item.src);
  const output = path.join(brandDir, item.out);
  await sharp(input).resize(item.width).png().toFile(output);
  console.log(`✓ ${item.out}`);
}

console.log("Assets PNG générés dans public/brand/");
