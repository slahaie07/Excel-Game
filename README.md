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
- [ ] Récompenses de fin de saison, visites sociales guild hall (v1.5+)

## Licence

Projet original — Univers Aetheris © 2026
