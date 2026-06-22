#!/usr/bin/env node
/**
 * Vérifie les budgets de taille (budgets.json).
 * Usage: npm run build && node scripts/check-bundle-size.mjs
 */
import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function pctChange(current, baseline) {
  if (!baseline || baseline === 0) return 0;
  return Math.round(((current - baseline) / baseline) * 1000) / 10;
}

async function main() {
  const budgets = JSON.parse(await readFile(join(ROOT, "budgets.json"), "utf8"));
  const latestPath = join(ROOT, ".metrics/latest.json");
  const baselinePath = join(ROOT, budgets.growth.baselineFile);

  if (!(await fileExists(latestPath))) {
    console.error("❌ .metrics/latest.json introuvable — lancez: npm run metrics");
    process.exit(1);
  }

  const latest = JSON.parse(await readFile(latestPath, "utf8"));
  const baseline = (await fileExists(baselinePath))
    ? JSON.parse(await readFile(baselinePath, "utf8"))
    : null;

  const errors = [];
  const warnings = [];
  const { bundle, codebase } = latest;
  const b = budgets.bundle;
  const c = budgets.codebase;
  const g = budgets.growth;

  if (bundle.chunks.length === 0) {
    errors.push("Aucun chunk JS dans dist/ — npm run build requis");
  }

  if (bundle.totalRaw > b.maxTotalJsRawKb) {
    errors.push(
      `Bundle total ${bundle.totalRaw} KB > max ${b.maxTotalJsRawKb} KB`,
    );
  }
  if (bundle.totalGzip > b.maxTotalJsGzipKb) {
    errors.push(
      `Bundle gzip ${bundle.totalGzip} KB > max ${b.maxTotalJsGzipKb} KB`,
    );
  }

  for (const chunk of bundle.chunks) {
    if (chunk.rawKb > b.maxSingleChunkRawKb) {
      errors.push(
        `Chunk ${chunk.name}: ${chunk.rawKb} KB > max ${b.maxSingleChunkRawKb} KB`,
      );
    }
    if (chunk.gzipKb > b.maxSingleChunkGzipKb) {
      errors.push(
        `Chunk ${chunk.name} gzip: ${chunk.gzipKb} KB > max ${b.maxSingleChunkGzipKb} KB`,
      );
    }
  }

  if (codebase.srcLines > c.maxSrcLines) {
    errors.push(`src/ ${codebase.srcLines} lignes > max ${c.maxSrcLines}`);
  }
  if (codebase.convexLines > c.maxConvexLines) {
    errors.push(`convex/ ${codebase.convexLines} lignes > max ${c.maxConvexLines}`);
  }
  if (codebase.screenFiles > c.maxScreenFiles) {
    warnings.push(
      `${codebase.screenFiles} écrans > recommandé ${c.maxScreenFiles} — envisager lazy loading`,
    );
  }

  if (baseline?.bundle?.totalGzip) {
    const growth = pctChange(bundle.totalGzip, baseline.bundle.totalGzip);
    if (growth > g.maxBundleGrowthPercent) {
      errors.push(
        `Croissance bundle +${growth}% > max +${g.maxBundleGrowthPercent}% vs baseline`,
      );
    } else if (growth > g.maxBundleGrowthPercent / 2) {
      warnings.push(`Croissance bundle +${growth}% vs baseline`);
    }
  } else {
    warnings.push(
      "Pas de baseline — exécutez: npm run metrics:baseline (après un build sain)",
    );
  }

  console.log("\n🔍 Vérification budgets Aetheris\n");
  console.log(
    `Bundle: ${bundle.totalRaw} KB brut / ${bundle.totalGzip} KB gzip (${bundle.chunks.length} chunks)`,
  );
  console.log(
    `Code:   ${codebase.srcLines} lignes src, ${codebase.convexLines} convex\n`,
  );

  for (const w of warnings) console.log(`⚠ ${w}`);
  for (const e of errors) console.log(`❌ ${e}`);

  if (errors.length > 0) {
    console.log(`\n${errors.length} erreur(s) budget — CI bloquée.\n`);
    process.exit(1);
  }

  console.log("\n✓ Tous les budgets respectés.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
