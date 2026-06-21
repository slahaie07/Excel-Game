# Aetheris — Document de conception

## Vision

Créer un MMORPG tactique mobile aussi complet que les références du genre, avec un univers original centré sur les Cristaux d'Aether.

## Systèmes implémentés (v1.12)

| Système | Statut | Description |
|---------|--------|-------------|
| Création de compte | ✅ | Local + Convex |
| Création de personnage | ✅ | 10 classes équilibrées (5 archétypes × 2), 5 slots |
| Combat tactique | ✅ | Grille isométrique, PA/PM, sorts serveur, buffs cloud |
| Donjons coop | ✅ | Jusqu'à 4 joueurs, combat partagé Convex |
| Guerres de guildes | ✅ | Déclaration, scores 24h, contribution membres |
| Trade direct | ✅ | Sessions P2P avec double confirmation |
| Raids 8 joueurs | ✅ | 2 raids, phases, combat coop Convex |
| Havre cloud | ✅ | Sync Convex, achat/upgrade meubles |
| UX trade/guerres | ✅ | Étapes échange, timer guerre, barre score |
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

## Classes (v1.12)

10 classes équilibrées — 60 points de stats chacune, 3 sorts de départ, synchronisation client (`src/game/data/`) et serveur (`convex/characters.ts`, `convex/lib/spells.ts`).

| Archétype | Classes |
|-----------|---------|
| Soins | Alchimiste des Runes, Luminaire |
| Magie | Pyromancien, Cryomancien |
| Bouclier | Gardien Cristallin, Bastion de Fer |
| Gros dégâts | Berserker Tellurique, Éclaireur des Brumes |
| À distance | Archer Lunaire, Invocateur d'Aether |

Équilibrage sorts : sort de base (3 PA) ≈ 9–15 dégâts ou 15–25 soins ; sort de zone (5–6 PA) ≈ 11–19 dégâts.

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

## v1.3 — Raids & Havre cloud

| Module | Fichier | Rôle |
|--------|---------|------|
| Raids | `raids.ts` | Runs 8 joueurs, phases, lancement |
| Havre | `havens.ts` | Achat meubles, upgrade, visiteurs |
| Combat raid | `combat.ts` | `startRaidCombat`, `getCombatByRaidRun` |

## v1.4 — Saisons ranked & Guild Hall

| Module | Fichier | Rôle |
|--------|---------|------|
| Saisons | `seasons.ts` | Saisons 30j, classement saison, rating isolé |
| Guild Hall | `guildHall.ts` | Meubles partagés, trésor guilde, upgrade 3 niveaux |
| PvP | `pvp.ts` | Enregistrement automatique des matchs saison |

## v1.5 — Récompenses saison & social

| Module | Fichier | Rôle |
|--------|---------|------|
| Cosmétiques | `cosmetics.ts` | Récompenses, titres/cadres saison, équipement |
| Guild Hall | `guildHall.ts` | Visites sociales, emotes, exploration publique |
| Saisons | `seasons.ts` | Finalisation auto + distribution des récompenses |

## v1.6 — Live events & PvP équipes

| Module | Fichier | Rôle |
|--------|---------|------|
| Live Events | `liveEvents.ts` | Événements 48h cross-serveur, contribution globale, classement |
| Notifications | `notifications.ts` | In-app + push navigateur (PvP, live, guilde) |
| PvP | `pvp.ts` | Matchmaking snake draft 1v1/2v2/3v3, file d'attente |
| Crons | `crons.ts` | Rotation automatique des événements live |

## v1.7 — Saisons thématiques & push natives

| Module | Fichier | Rôle |
|--------|---------|------|
| Thèmes saison | `lib/seasonThemes.ts` | 4 thèmes rotatifs, bonus rating, cosmétiques champion |
| Push tokens | `notifications.ts` | Enregistrement tokens Capacitor iOS/Android |
| Raids | `game/data/raids.ts` | Abîme Fractal — raid intermédiaire 5 phases |

## v1.8 — Guerres saisonnières & succès cloud

| Module | Fichier | Rôle |
|--------|---------|------|
| Campagnes guerre | `guildWarSeasons.ts` | Saisons 14j, classement guildes, trésor top 3 |
| Guerres | `guildWars.ts` | Finalisation auto, points saison, notifications victoire |
| Succès | `lib/achievementUnlock.ts` | Déblocage auto combat/PvP/raid/guerre/live |
| Raids | `game/data/raids.ts` | Étreinte du Nexus — raid endgame 8 phases |

## v1.9 — Tournois, Panthéon & cosmétiques guilde

| Module | Fichier | Rôle |
|--------|---------|------|
| Tournois PvP | `pvpTournaments.ts` | Tournois 7j, points +3/victoire, récompenses top 5 |
| Panthéon | `hallOfFame.ts` | Hall of fame cross-serveur par catégorie |
| Cosmétiques guilde | `guildCosmetics.ts` | Emblèmes/bannières, achat trésor, équipement |
| Crons | `crons.ts` | Rotation tournoi hebdo (12h) |

## v1.10 — Ligues, mentorat & invasions

| Module | Fichier | Rôle |
|--------|---------|------|
| Ligues PvP | `pvpLeagues.ts`, `lib/pvpLeagues.ts` | Bronze→Diamant, points ligue, classement |
| Mentorat | `mentorship.ts` | Demande/acceptation, points mentor, progrès apprenti |
| Invasions | `worldInvasions.ts` | Invasions zone 72h, kills auto combat monde |
| Combat | `combat.ts` | Hook invasion + mentorat PvE |
| PvP | `pvp.ts` | Hook ligue + mentorat PvP |

## v1.11 — Réputation, défis & boss invasion

| Module | Fichier | Rôle |
|--------|---------|------|
| Factions | `factions.ts`, `lib/factions.ts` | Réputation Lumina/Umbra/Neutre, allégeance |
| Défis PvP | `pvpDailyChallenges.ts` | 3 défis quotidiens, récompenses ligue |
| Boss invasion | `worldInvasions.ts` | Avatar des Ombres à 100 % progression |
| Combat | `combat.ts` | Réputation zone sur victoire PvE |

## v1.15 — Écran Factions

| Module | Fichier | Rôle |
|--------|---------|------|
| Hub factions | `factions.ts`, `FactionsScreen.tsx` | Réputation, quêtes hebdo, boutique |
| Contenu | `lib/factionContent.ts`, `lib/factionQuests.ts` | Quêtes, articles, progression |
| Combat/PvP | `combat.ts`, `pvp.ts` | Progression quêtes cloud |

## v1.20 — Sprites monstres & territoires faction

| Module | Fichier | Rôle |
|--------|---------|------|
| Monstres | `assets.ts`, `spriteLoader.ts`, `public/assets/monsters/` | 6 sprites isométriques + idle |
| Territoires | `factionTerritories.ts`, `lib/factionTerritories.ts` | Statut zone selon campagnes |
| Monde | `WorldTerritoryBanner.tsx`, `WorldScreen.tsx` | Bannière contrôle territorial |
| Combat | `LocalCombatScreen.tsx`, `factionProgress.ts` | Bonus XP zone fortifiée |
| Roster | `ClassScreen`, `CharacterCreateScreen`, `CharacterSelectScreen` | Portraits illustrés |
| API | `getFactionTerritory` | Query Convex territoire + multiplicateur XP |

## v1.19 — Sprites isométriques & récompenses campagne

| Module | Fichier | Rôle |
|--------|---------|------|
| Assets | `assets.ts`, `public/assets/` | 10 portraits, 6 fonds zones |
| Sprites | `spriteLoader.ts`, `IsoWorldScene`, `IsoCombatScene` | Portraits sur grille Phaser |
| Récompenses | `lib/factionCampaignRewards.ts` | Top 3 : titre + cadres or/argent/bronze |

## v1.18 — Visuels & classement campagnes

| Module | Fichier | Rôle |
|--------|---------|------|
| Assets | `public/assets/`, `game/data/assets.ts` | Fonds zones, combat, portraits classes |
| Rendu | `WorldScreen`, `*CombatScreen` | Overlays illustrés derrière Phaser |
| Social | `playerDisplay.ts`, `presence.ts`, `social.ts` | Cadres visibles chat + présence |
| Campagnes | `getCampaignLeaderboard`, `FactionsUI` | Top contributeurs par faction |
| Monde | `WorldCampaignBanner.tsx` | Bannière progression campagne alliée |

## v1.17 — Campagnes faction & titres sociaux

| Module | Fichier | Rôle |
|--------|---------|------|
| Campagnes | `factionCampaigns.ts`, `lib/factionCampaignProgress.ts` | Objectifs hebdo coop, contributions, récompenses |
| Social | `social.ts`, `presence.ts`, `ChatSenderLine.tsx` | Titres visibles chat + présence zone |
| Local | `factionProgress.ts` | Campagnes et titres hors-ligne |

## v1.16 — Récompenses faction & local

| Module | Fichier | Rôle |
|--------|---------|------|
| Cosmétiques rang | `lib/factionRewards.ts`, `cosmetics.ts` | Titres/cadres Champion & Exalté |
| Progression locale | `lib/factionProgress.ts` | Réputation + quêtes hors-ligne |
| Monde | `WorldScreen.tsx` | Badge faction alliée |

## v1.14 — Talents actifs en combat

| Effet talent | Application |
|--------------|-------------|
| Soins / regen / bouclier | Multiplicateur sur les sorts et buffs |
| Dégâts magiques / mêlée / distance | Bonus selon élément et portée du sort |
| Défense passive | Réduction des dégâts ennemis reçus |
| PV max / PM | Appliqués au début de chaque combat |
| Portée | +1 case max (Œil d'Aigle) |

## v1.13 — Progression de classe

| Module | Fichier | Rôle |
|--------|---------|------|
| Déblocage sorts | `classProgression.ts`, `convex/lib/classProgression.ts` | Sorts débloqués par niveau |
| Talents | `talents.ts`, `convex/lib/talents.ts` | 2 paliers par archétype, points au level-up |
| Fiche classe | `ClassScreen.tsx` | Grimoire, stats, sélection talents |
| Migration | `syncCharacterProgression` | Chronomancien → Cryomancien |

Voir `docs/DEPLOYMENT.md`.
