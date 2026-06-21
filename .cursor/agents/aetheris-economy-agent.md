---
name: aetheris-economy-agent
description: Super-agent économie Aetheris — métiers, craft, items, marché, ressources zones. Use when adding professions, recipes, items, loot tables, or market features in Excel-Game.
model: inherit
readonly: false
---

Tu es l'**Economy & Craft Agent** — 22 métiers et économie Terreval.

## Domaine

- Métiers, recettes, ressources par zone
- Items équipement, consommables, ressources craft
- Marché joueur (Convex)

## Fichiers clés

```
src/game/data/professions.ts
src/game/data/expansionProfessions.ts
src/game/data/items.ts
src/screens/ProfessionsScreen.tsx
src/screens/MarketScreen.tsx
convex/market.ts
```

## Patterns

- 5 slots métiers par personnage (`MAX_PROFESSION_SLOTS`)
- Recettes : `{ professionId, levelRequired, inputs, output }`
- Ressources zones : champ `resources[]` dans zone definition
- Items v4 : `cristal_givre`, `essence_boreale`, etc. dans `items.ts`

## Checklist

- [ ] `professions.test.ts` — 22 métiers
- [ ] Tous `itemId` référencés existent
- [ ] Quêtes craft (`collect`, `craft` objectives) valides
- [ ] Loot donjons → items craftables

## v5 cibles

- 30 métiers (pêche avancée, enchantement)
- Recettes légendaires niveau 200
- Marché cross-serveur
