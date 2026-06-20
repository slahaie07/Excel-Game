# Aetheris — Document de conception

## Vision

Créer un MMORPG tactique mobile aussi complet que les références du genre, avec un univers original centré sur les Cristaux d'Aether.

## Systèmes implémentés (v1.2)

| Système | Statut | Description |
|---------|--------|-------------|
| Création de compte | ✅ | Local + Convex |
| Création de personnage | ✅ | 8 classes, 5 slots |
| Combat tactique | ✅ | Grille isométrique, PA/PM, sorts serveur, buffs cloud |
| Donjons coop | ✅ | Jusqu'à 4 joueurs, combat partagé Convex |
| Guerres de guildes | ✅ | Déclaration, scores 24h, contribution membres |
| Trade direct | ✅ | Sessions P2P avec double confirmation |
| Boss monde | ✅ | HP partagé, leaderboard, respawn 4h |
| Monde / zones | ✅ | 6 zones isométriques, voyage |
| Inventaire | ✅ | 6 slots équipement |
| Quêtes | ✅ | Main, side, daily |
| Métiers | ✅ | 6 métiers, craft |
| Guildes | ✅ | Création, adhésion |
| Marché | ✅ | Achat/vente |
| PvP Arène | ✅ | 1v1/2v2/3v3, rating, classement |
| Donjons | ✅ | 5 donjons, salles, boss, récompenses |
| Chat | ✅ | 4 canaux, overlay mobile |
| Compagnons | ✅ | 6 pets, bonus passifs |
| Havre (housing) | ✅ | Décoration, boutique, upgrades |
| Présence multijoueur | ✅ | Joueurs en ligne par zone |
| Événements saisonniers | ✅ | 4 saisons, quêtes, boutique, monstres |
| Rendu isométrique | ✅ | Monde + combat Phaser 3 |
| App natives | ✅ | Capacitor iOS/Android |

## Systèmes v0.2 (précédent)

Voir historique : PvP, donjons, pets, havre, chat, présence, Capacitor.

## Économie

- **Éclats (✦)** : monnaie principale (combat, quêtes, vente)
- **Poussière Stellaire (✧)** : monnaie premium

## Formules de combat

- PA max = 6 + floor(niveau / 10)
- PM max = 3 + floor(agilité / 5) + floor(niveau / 15)
- PV max = 50 + vitalité × 5 + niveau × 10
- XP suivant = niveau × 100 + (niveau - 1) × 50

## Zones et niveaux

1. Vallée des Éveils (1-10) — Tutoriel
2. Port de Nébula (1-60) — Hub
3. Forêt de Lumina (10-25)
4. Désert d'Umbra (25-40) — PvP
5. Citadelle Stellaire (40-60) — Endgame
6. Arène des Éveilleurs (10-60) — PvP

## Événements saisonniers

| Saison | Événement | Bonus |
|--------|-----------|-------|
| Printemps | Renaissance de Lumina | x1.25 XP |
| Été | Éclipse d'Aether | x1.5 XP |
| Automne | Invasion des Ombres | x1.35 XP |
| Hiver | Fête des Cristaux | x1.4 XP, x1.5 Éclats |

Chaque événement propose : monstres exclusifs, quêtes, boutique limitée, multiplicateurs de récompenses.

## Donjons

- Ruines Corrompues (niv. 8)
- Sanctuaire de Lumina (niv. 15)
- Pyramide des Ombres (niv. 30)
- Nexus d'Aether (niv. 50)
- Tour Infinie (niv. 40, endless)

## Multijoueur Convex (v1.0)

### Architecture hybride

- **Comptes locaux** (`local_*`) : tout en localStorage, pas de Convex
- **Comptes cloud** : auth Convex, personnages synchronisés
- Pattern **Cloud/Local** sur chaque écran sensible aux hooks React

### Backend Convex

| Module | Fichier | Rôle |
|--------|---------|------|
| Comptes & persos | `accounts.ts`, `characters.ts` | Auth, création, sync |
| Combat | `combat.ts` | Combats synchronisés, buffs |
| Social | `social.ts` | Guildes, marché, chat, daily |
| PvP | `pvp.ts` | File d'attente, matchs, classement |
| Donjons | `dungeons.ts` | Runs multijoueur |
| Présence | `presence.ts` | Joueurs en ligne par zone |
| Amis | `friends.ts` | Liste d'amis |
| Succès | `achievements.ts` | Achievements & daily status |
| Événements | `events.ts` | Progression saisonnière cloud |

### Buffs & debuffs

Les sorts peuvent appliquer des effets persistants (`buffs[]` sur chaque entité) :
- `damage`, `defense`, `mp`, `shield`, `regen`, `invisibility`
- Durée en tours, tick à chaque fin de tour
- Implémenté localement (`src/game/combat/effects.ts`) et côté serveur (`convex/lib/combatEffects.ts`)

## Combat cloud v1.1

### Mutations principales

| Mutation | Rôle |
|----------|------|
| `startCombat` | Combat monde (monstres) |
| `startDungeonCombat` | Combat coop lié à un `dungeonRun` |
| `startPvpCombat` | Combat PvP lié à un `pvpMatch` |
| `castSpell` | Lance un sort avec portée, coût PA, effets serveur |
| `endTurn` | Tick buffs, tour suivant, IA ennemie auto |
| `applyVictoryRewards` | XP/Éclats pour tous les `participantCharacterIds` |

### Donjons coop

1. `startDungeonRun` → leader crée le run
2. `joinDungeonRun` → jusqu'à 4 membres (runs `waiting` ou `active`)
3. `startDungeonCombat` → combat partagé avec une entité par joueur
4. Victoire → `advanceRoom` → salle suivante ou fin du donjon

## v1.2 — Guerres, trade, boss monde

| Module | Fichier | Rôle |
|--------|---------|------|
| Guerres | `guildWars.ts` | `declareWar`, `contributeToWar`, scores |
| Trade P2P | `trade.ts` | `startTrade`, `updateTradeOffer`, `confirmTrade` |
| Boss monde | `worldBoss.ts` | `attackWorldBoss`, `getBossLeaderboard` |

Voir `docs/DEPLOYMENT.md`.
