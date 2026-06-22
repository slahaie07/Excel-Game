#!/usr/bin/env node
/**
 * Métriques projet Aetheris — taille code, bundle, fichiers.
 * Usage: node scripts/project-metrics.mjs [--json] [--save-baseline]
 */
import { readdir, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");
const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const saveBaseline = args.has("--save-baseline");

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "android",
  "ios",
  ".convex",
  "_generated",
]);

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, files);
    } else if (CODE_EXT.has(e.name.slice(e.name.lastIndexOf(".")))) {
      files.push(full);
    }
  }
  return files;
}

async function countLines(files) {
  let total = 0;
  const byDir = {};
  for (const f of files) {
    const content = await readFile(f, "utf8");
    const lines = content.split("\n").length;
    total += lines;
    const top = relative(ROOT, f).split("/")[0] ?? "root";
    byDir[top] = (byDir[top] ?? 0) + lines;
  }
  return { total, byDir };
}

async function analyzeBundle(distDir) {
  const assetsDir = join(distDir, "assets");
  let entries;
  try {
    entries = await readdir(assetsDir);
  } catch {
    return { chunks: [], totalRaw: 0, totalGzip: 0 };
  }

  const chunks = [];
  for (const name of entries) {
    if (!name.endsWith(".js")) continue;
    const path = join(assetsDir, name);
    const buf = await readFile(path);
    const gzip = gzipSync(buf);
    chunks.push({
      name,
      rawKb: Math.round((buf.length / 1024) * 10) / 10,
      gzipKb: Math.round((gzip.length / 1024) * 10) / 10,
    });
  }
  chunks.sort((a, b) => b.rawKb - a.rawKb);
  const totalRaw = chunks.reduce((s, c) => s + c.rawKb, 0);
  const totalGzip = chunks.reduce((s, c) => s + c.gzipKb, 0);
  return {
    chunks,
    totalRaw: Math.round(totalRaw * 10) / 10,
    totalGzip: Math.round(totalGzip * 10) / 10,
  };
}

async function countScreens() {
  const screensDir = join(ROOT, "src/screens");
  const files = await walk(screensDir);
  return files.length;
}

async function main() {
  const srcFiles = await walk(join(ROOT, "src"));
  const convexFiles = await walk(join(ROOT, "convex"));
  const srcLines = await countLines(srcFiles);
  const convexLines = await countLines(convexFiles);
  const bundle = await analyzeBundle(join(ROOT, "dist"));
  const screenCount = await countScreens();

  let distSizeMb = 0;
  try {
    const d = await stat(join(ROOT, "dist"));
    distSizeMb = Math.round((d.size / 1024 / 1024) * 100) / 100;
  } catch {
    /* dist absent */
  }

  const report = {
    generatedAt: new Date().toISOString(),
    codebase: {
      srcLines: srcLines.total,
      srcByTopDir: srcLines.byDir,
      convexLines: convexLines.total,
      srcFiles: srcFiles.length,
      convexFiles: convexFiles.length,
      screenFiles: screenCount,
    },
    bundle,
    distSizeMb,
  };

  const metricsDir = join(ROOT, ".metrics");
  await mkdir(metricsDir, { recursive: true });
  await writeFile(
    join(metricsDir, "latest.json"),
    JSON.stringify(report, null, 2),
  );

  if (saveBaseline) {
    await writeFile(
      join(metricsDir, "baseline.json"),
      JSON.stringify(report, null, 2),
    );
    if (!asJson) console.log("✓ Baseline sauvegardée dans .metrics/baseline.json");
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("\n📊 Métriques Aetheris\n");
  console.log("Code");
  console.log(`  src/     ${report.codebase.srcLines.toLocaleString()} lignes (${report.codebase.srcFiles} fichiers)`);
  console.log(`  convex/  ${report.codebase.convexLines.toLocaleString()} lignes (${report.codebase.convexFiles} fichiers)`);
  console.log(`  écrans   ${report.codebase.screenFiles} fichiers`);
  console.log("\nBundle (dist/assets/*.js)");
  if (bundle.chunks.length === 0) {
    console.log("  ⚠ Aucun build — lancez npm run build");
  } else {
    console.log(`  total    ${bundle.totalRaw} KB brut / ${bundle.totalGzip} KB gzip`);
    console.log("  chunks:");
    for (const c of bundle.chunks.slice(0, 8)) {
      console.log(`    ${c.name.padEnd(28)} ${String(c.rawKb).padStart(7)} KB  (${c.gzipKb} KB gzip)`);
    }
    if (bundle.chunks.length > 8) {
      console.log(`    ... +${bundle.chunks.length - 8} autres`);
    }
  }
  console.log(`\n  dist/    ${distSizeMb} MB\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
