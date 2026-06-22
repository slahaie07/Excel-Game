# Aetheris — L'Éveil des Cristaux

MMORPG tactique mobile inspiré des grands RPG isométriques au tour par tour, avec un univers fantasy original.

## Univers

**Aetheris** se déroule sur **Terreval**, un monde où les fragments d'une étoile morte — les **Cristaux d'Aether** — ont accordé des pouvoirs extraordinaires à certains individus, les **Éveilleurs**. Mais les Ombres Cristallines corrompent tout sur leur passage...

## Fonctionnalités

### Combat tactique (v1.1)
- Grille isométrique au tour par tour (PA/PM)
- 8 classes avec sorts à effets (dégâts, soins, buffs, debuffs)
- Combat cloud synchronisé via Convex avec sorts serveur (`convex/lib/spells.ts`)
- Buffs/debuffs côté serveur (`convex/lib/combatEffects.ts`) + IA ennemie automatique
- Donjons coop jusqu'à 4 joueurs, PvP avec `startPvpCombat`
- Mode local hors-ligne conservé

### Monde ouvert
- 6 zones : Vallée des Éveils, Port de Nébula, Forêt de Lumina, Désert d'Umbra, Citadelle Stellaire, Arène PvP
- Voyages entre zones, monstres par zone
- Niveaux 1 à 60

### Progression
- 8 classes : Pyromancien, Gardien Cristallin, Éclaireur des Brumes, Invocateur d'Aether, Alchimiste des Runes, Archer Lunaire, Berserker Tellurique, Chronomancien
- XP, montée de niveau, stats, sorts
- Équipement (6 slots) et inventaire

### Quêtes
- Quêtes principales, secondaires et quotidiennes
- Objectifs : tuer, collecter, explorer, parler

### Métiers
- Récolte : Herboriste, Mineur, Bûcheron
- Craft : Alchimie, Forge, Joaillerie
- 3 métiers max par personnage

### Social & multijoueur (v1.2)
- Mode **hybride** : jeu solo hors-ligne + sync cloud Convex
- Chat temps réel (global, zone, guilde, trade)
- **Échange direct** joueur-à-joueur (`convex/trade.ts`)
- **Guerres de guildes** 24h avec scores (`convex/guildWars.ts`)
- **Boss monde** partagé — Colosse d'Aether (`convex/worldBoss.ts`)
- Présence joueurs en ligne par zone (avatars sur la carte)
- Guildes cloud (création, adhésion, liste)
- Marché d'Halan synchronisé (annonces Convex)
- Amis (demandes, acceptation, recherche par nom)
- Récompenses quotidiennes et succès

### PvP (v1.0)
- Arène classée 1v1, 2v2, 3v3
- Matchmaking Convex (file d'attente temps réel)
- Classement global synchronisé
- Rating et récompenses cloud

### Donjons
- 5 donjons avec progression par salles
- Boss finaux et récompenses
- Tour Infinie (endless)

### Compagnons & Havre
- 6 pets avec bonus passifs (XP, dégâts, soins...)
- Havre personnel décorable
- Boutique de meubles et upgrades

### Événements saisonniers
- 4 événements rotatifs (printemps, été, automne, hiver)
- Bonus XP/Éclats, monstres exclusifs, quêtes et boutique
- Progression locale + sync Convex (`convex/events.ts`)

### Live & notifications (v1.6)
- **Événements live cross-serveur** 48h — contribution globale, classement (`convex/liveEvents.ts`)
- **Notifications** in-app + push navigateur (PvP, live, guilde)
- **PvP équipes** — matchmaking snake draft 1v1/2v2/3v3 complet
- Cron automatique de rotation des événements live

### Saisons thématiques & endgame (v1.7)
- **Saisons PvP thématiques** — 4 thèmes rotatifs, bonus rating, cosmétiques exclusifs
- **Raid Abîme Fractal** — nouveau raid 4-6 joueurs (niv. 35, désert d'Umbra)
- **Push natives Capacitor** — enregistrement token iOS/Android (`@capacitor/push-notifications`)

### Guerres saisonnières & succès cloud (v1.8)
- **Campagnes de guerre** — saisons 14j, classement guildes, récompenses trésor top 3
- **Raid Étreinte du Nexus** — raid endgame 6-8 joueurs (niv. 58)
- **Succès cloud auto-sync** — déblocage automatique (combat, PvP, raids, guerres, live)

### Tournois, Panthéon & cosmétiques guilde (v1.9)
- **Tournois PvP hebdomadaires** — +3 pts/victoire, top 5 récompensés, cron auto (`convex/pvpTournaments.ts`)
- **Panthéon cross-serveur** — hall of fame par catégorie (PvP, saison, tournoi, raid, live, guerre)
- **Cosmétiques de guilde** — emblèmes et bannières achetables au trésor, récompenses campagne #1

### Ligues, mentorat & invasions (v1.10)
- **Ligues PvP** — Bronze → Diamant, points de ligue, classement par palier
- **Mentorat** — veterans (niv. 30+) guident apprentis (niv. ≤25), points mentor
- **Invasions dynamiques** — Ombres Cristallines par zone, kills auto en combat monde, récompenses

### Réputation, défis & boss invasion (v1.11)
- **Réputation factions** — Lumina, Umbra, Marchands Libres, rangs et allégeance
- **Défis PvP quotidiens** — 3 missions/jour, récompenses éclats + points ligue
- **Boss d'invasion** — Avatar des Ombres quand la barre atteint 100 %

### Graphismes isométriques
- Monde et combat en vue isométrique 2:1 (Phaser 3)
- Tuiles thématiques par zone, ombres, tri de profondeur
- Effets de particules sur les sorts en combat

### Mobile natif
```bash
npm run build:mobile   # Build + sync Capacitor
npm run cap:android    # Ouvrir Android Studio
npm run cap:ios        # Ouvrir Xcode
```

### Automatisme taille du projet

Le CI surveille la **grosseur** du bundle et du code (`budgets.json`) :

```bash
npm run metrics          # Rapport lignes de code + chunks
npm run size:check       # Vérifie les budgets (après build)
npm run check            # typecheck + test + build + métriques + budgets
npm run metrics:baseline # Met à jour la baseline de référence
```

- **Lazy loading** de tous les écrans (`React.lazy`)
- **Code splitting** : Phaser, React et Convex en chunks séparés
- **PR** : commentaire automatique avec tableau de taille
- Règle agent : `.cursor/rules/project-size.mdc`

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez http://localhost:5173 sur mobile ou desktop.

### Backend Convex (optionnel, multijoueur)

```bash
npm run convex:dev
```

Puis ajoutez `VITE_CONVEX_URL` dans `.env.local` (voir `.env.example`).

### Déploiement production

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour Convex + Netlify + CI GitHub Actions.

## Structure

```
src/
  game/data/     # Univers, classes, sorts, monstres, zones, items, quêtes
  screens/       # Écrans React (monde, combat, inventaire, etc.)
  stores/        # État global Zustand
convex/          # Backend temps réel (combat, guildes, marché, chat)
```

## Classes

| Classe | Rôle | Spécialité |
|--------|------|------------|
| Pyromancien | DPS | Dégâts de feu en zone |
| Gardien Cristallin | Tank | Protection et provocation |
| Éclaireur des Brumes | DPS | Furtivité et pièges |
| Invocateur d'Aether | Support | Invocations et contrôle |
| Alchimiste des Runes | Healer | Soins et buffs |
| Archer Lunaire | DPS | Tir à longue portée |
| Berserker Tellurique | DPS | Mêlée dévastatrice |
| Chronomancien | Support | Manipulation du temps |

## Roadmap

- [x] PvP arène classée
- [x] Donjons en groupe
- [x] Compagnons (pets)
- [x] Housing / Havre
- [x] App natives (Capacitor)
- [x] Événements saisonniers
- [x] Graphismes isométriques avancés
- [x] Multijoueur Convex temps réel complet (v1.0)
- [x] Combat cloud avancé + donjons coop (v1.1)
- [x] CI GitHub Actions + tests Vitest (v1.1)
- [x] Guerres de guildes, trade direct, boss monde (v1.2)
- [x] Raids 8 joueurs + housing cloud sync (v1.3)
- [x] Saisons ranked PvP + guild hall partagé (v1.4)
- [x] Récompenses de fin de saison, visites sociales, cosmétiques (v1.5)
- [x] Événements live cross-serveur, PvP équipes 2v2/3v3, notifications (v1.6)
- [x] Saisons thématiques PvP, raid Abîme Fractal, push natives Capacitor (v1.7)
- [x] Campagnes guerre de guildes, raid Nexus endgame, succès cloud sync (v1.8)
- [x] Tournois PvP hebdo, Panthéon cross-serveur, cosmétiques de guilde (v1.9)
- [x] Ligues PvP, mentorat joueurs, invasions monde dynamiques (v1.10)
- [x] Réputation factions, défis PvP quotidiens, boss invasion (v1.11)

## Licence

Projet original — Univers Aetheris © 2026
