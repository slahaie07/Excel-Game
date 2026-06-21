---
description: Lance la construction Aetheris en multi-agent — orchestrateur + 9 spécialistes
---

# Construire Aetheris (multi-agent)

Exécute le pipeline complet via les 10 super-agents du projet.

## Étapes

1. **Lire l'état** — `AGENTS.md`, `CHANGELOG.md`, branche courante
2. **Orchestrer** — invoquer `/aetheris-orchestrator` avec l'objectif utilisateur
3. **Paralléliser** selon le besoin :
   - Données monde → `/aetheris-world-agent`
   - Quêtes & narration → `/aetheris-quest-agent`
   - Combat & monstres → `/aetheris-combat-agent`
   - Donjons & raids → `/aetheris-dungeon-agent`
   - Métiers & items → `/aetheris-economy-agent`
   - Guildes & PvP → `/aetheris-social-agent`
   - Assets & UI → `/aetheris-visual-agent`
   - XP & endgame → `/aetheris-progression-agent`
   - Convex cloud → `/aetheris-backend-agent`
4. **Valider** — `/aetheris-ship-agent` : `npm test`, `npm run build`, version, PR

## Jalons Dofus Touch

Viser : zones ×2, quêtes 250+, donjons 120+, métiers 30, assets complets.

## Règles

- Branches `cursor/<name>-af72`
- Commits atomiques, tests avant push
- Ne pas estimer en jours — décrire composants techniques
