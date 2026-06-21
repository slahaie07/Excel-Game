# Aetheris — 10 Super-Agents de construction

Infrastructure multi-agents pour construire **Aetheris / Terreval** (Excel-Game) en parallèle avec Cursor.

## Vue d'ensemble

```
                    ┌──────────────────────┐
                    │ aetheris-orchestrator │
                    │  (chef d'orchestre)   │
                    └──────────┬───────────┘
         ┌──────────┬─────────┼─────────┬──────────┐
         ▼          ▼         ▼         ▼          ▼
    world-agent  quest-agent  combat   dungeon   economy
         │          │         agent     agent     agent
         ▼          ▼         ▼         ▼          ▼
    social-agent visual-agent progression backend-agent
                              │
                              ▼
                       ship-agent (QA + release)
```

## Les 10 super-agents

| # | Agent | Fichier | Rôle |
|---|-------|---------|------|
| 0 | **Orchestrateur** | `aetheris-orchestrator.md` | Coordonne, parallélise, valide |
| 1 | **Monde** | `aetheris-world-agent.md` | Zones, carte, régions, POI |
| 2 | **Quêtes** | `aetheris-quest-agent.md` | Chroniques, dailies, guilde |
| 3 | **Combat** | `aetheris-combat-agent.md` | Classes, sorts, monstres |
| 4 | **Donjons** | `aetheris-dungeon-agent.md` | Donjons, raids, boss |
| 5 | **Économie** | `aetheris-economy-agent.md` | Métiers, craft, marché |
| 6 | **Social** | `aetheris-social-agent.md` | Guildes, PvP, factions |
| 7 | **Visuels** | `aetheris-visual-agent.md` | Assets, particules, UI |
| 8 | **Progression** | `aetheris-progression-agent.md` | XP, endgame, quêtes jouables |
| 9 | **Backend** | `aetheris-backend-agent.md` | Convex, cloud sync |
| 10 | **Ship** | `aetheris-ship-agent.md` | Tests, build, PR |

Fichiers : `.cursor/agents/*.md`

## Invocation

### Automatique

Cursor délègue selon le champ `description` de chaque agent. Utilise des phrases comme :

- « Ajoute une zone dans le marais » → **world-agent**
- « 20 nouvelles quêtes donjon » → **quest-agent** + **dungeon-agent**
- « Construis le jeu en multi-agent » → **orchestrator**

### Explicite

```
/aetheris-orchestrator complète la v5 raids régionaux
/aetheris-quest-agent ajoute les quêtes POI manquantes
/aetheris-ship-agent valide et ouvre une PR
```

Ou en langage naturel :

> Lance les agents world, quest et visual en parallèle pour la v5.

### Commande slash

`/build-aetheris` — voir `.cursor/commands/build-aetheris.md`

## Pipeline type (nouvelle version)

| Phase | Agents en parallèle | Livrable |
|-------|-------------------|----------|
| 1 — Données | world, combat, dungeon, economy | `expansion*VXX.ts` |
| 2 — Contenu | quest, progression | quêtes + endgame |
| 3 — Social | social, backend | Convex + factions |
| 4 — Polish | visual | assets, particules |
| 5 — Release | ship | vX.Y.0, PR |

## État actuel (v4.2)

| Métrique | Valeur |
|----------|--------|
| Zones | 24 |
| Régions | 6 |
| Quêtes | 196 |
| Donjons | 94 |
| Métiers | 22 |
| Classes | 15 |
| Niveau max | 200 |
| Objectifs endgame | 16 |

## Prochaines étapes (v5 — à assigner aux agents)

1. **world** + **visual** — assets PNG dédiés 24 zones
2. **quest** — quêtes POI restantes (landmark, vendor, teleporter)
3. **dungeon** — 30 donjons régionaux mythiques
4. **backend** — sync quêtes cloud temps réel
5. **social** — raid guilde cross-région
6. **ship** — GAME_DESIGN.md à jour, CI vert

## Développement local

```bash
npm install
npm test
npm run build
npx convex dev   # CONVEX_AGENT_MODE=anonymous pour agents cloud
```

## Extension

Pour ajouter un agent :

1. Créer `.cursor/agents/aetheris-<name>-agent.md` avec frontmatter YAML
2. Documenter ici dans le tableau
3. Mettre à jour `aetheris-orchestrator.md` si nouveau dans le pipeline
