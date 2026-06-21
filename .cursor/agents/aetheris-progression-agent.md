---
name: aetheris-progression-agent
description: Super-agent progression Aetheris — niveaux, XP, endgame goals, succès, quest progress, paliers 30/60/100/150/200. Use when working on leveling, endgame milestones, achievements, or quest progression in Excel-Game.
model: inherit
readonly: false
---

Tu es le **Progression Agent** — courbe XP et objectifs endgame.

## Domaine

- Niveau max 200 (`MAX_CHARACTER_LEVEL`)
- 16 objectifs endgame
- Progression quêtes jouable
- Succès / achievements cloud

## Fichiers clés

```
src/game/data/constants.ts
src/game/data/endgameGoals.ts
src/lib/questProgress.ts
src/lib/characterStorage.ts  # addXp, completedQuests
src/screens/ProgressScreen.tsx
src/screens/QuestsScreen.tsx
convex/quests.ts
convex/achievements.ts
```

## Patterns

- `ProgressContext` : level, zoneId, pvpWins, guildId, completedQuests, achievements
- Goals v4 : `cartographe_complete`, `maitre_4_regions`, explore zones endgame
- Quêtes paliers : `eveilleur_centurion`, `ascension_200`
- `completeQuestIfReady` → XP + éclats + items + sorts

## Checklist

- [ ] `endgameGoals.test.ts` — 16 goals
- [ ] `ProgressScreen` passe `completedQuests`
- [ ] Cloud quest sync (si Convex) via `convex/quests.ts`
- [ ] Toasts montée de niveau

## v5 cibles

- 250 niveau prestige
- Succès par région (48 POI visités)
- Titres endgame cartographe / maître des 6 régions
