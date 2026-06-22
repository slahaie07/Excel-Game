#!/usr/bin/env node
/**
 * Déploiement production Aetheris — Convex + build + Netlify.
 *
 * Variables requises :
 *   CONVEX_DEPLOY_KEY   — clé de déploiement Convex (dashboard → Settings → Deploy Key)
 *   NETLIFY_AUTH_TOKEN  — token Netlify (User settings → Applications)
 *   NETLIFY_SITE_ID     — ID du site Netlify
 *
 * Usage : node scripts/deploy-production.mjs
 */

import { execSync } from "node:child_process";

const required = ["CONVEX_DEPLOY_KEY", "NETLIFY_AUTH_TOKEN", "NETLIFY_SITE_ID"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error("\n❌ Variables manquantes :", missing.join(", "));
  console.error(`
Configurez-les puis relancez :

  export CONVEX_DEPLOY_KEY="..."
  export NETLIFY_AUTH_TOKEN="..."
  export NETLIFY_SITE_ID="..."

  node scripts/deploy-production.mjs

Convex : https://dashboard.convex.dev → projet → Settings → Deploy Key
Netlify : https://app.netlify.com/user/applications#personal-access-tokens
Site ID : Netlify → Site settings → General → Site details → API ID
`);
  process.exit(1);
}

function run(cmd, label) {
  console.log(`\n▶ ${label}\n   ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

console.log("🚀 Déploiement Aetheris v1.12\n");

run(
  "npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name VITE_CONVEX_URL",
  "Convex deploy + build Vite"
);

run(
  "npx netlify-cli deploy --prod --dir=dist",
  "Netlify production deploy"
);

console.log("\n✅ Déploiement terminé.\n");
