# Chroniques d'Étheris

**MMORPG tactique mobile au tour par tour** — un univers fantasy original inspiré des grands MMORPG tactiques, développé avec notre propre lore, classes et systèmes de jeu.

## Univers d'Étheris

Le Continent d'Étheris a été brisé par la Grande Faille. Cinq cités-refuges subsistent, peuplées d'aventuriers de l'Étherium. Explorez 6 zones, affrontez 12 familles de monstres, et restaurez l'équilibre du monde.

## Fonctionnalités

### Gameplay Core
- **Combat tactique au tour par tour** — grille isométrique, PA/PM, sorts, effets de zone
- **8 classes jouables** — Gardien, Arcaniste, Rôdeur, Mystique, Forgeur, Ombrelame, Invocateur, Alchimiste
- **32+ sorts** — dégâts, soins, buffs, debuffs, invocations, contrôle
- **Exploration isométrique** — 6 zones avec niveaux 1-80
- **Donjons instanciés** — salles enchaînées, boss final, loot épique (Donjon des Cristaux, Tanière des Gobelins)
- **Transitions de zones** — parcourez le monde via les bords de carte

### Progression & Persistance
- **Sauvegarde automatique** — localStorage toutes les 30 secondes
- **Sélection de personnages** — plusieurs héros par appareil
- **Système XP/niveaux** — 80 niveaux max
- **Inventaire** — 30 slots + équipement (7 emplacements)

### Progression
- **Système de niveaux** — XP, montée de stats, 80 niveaux max
- **Équipement** — armes, armures, accessoires (5 raretés)
- **Inventaire** — 30 emplacements, objets empilables
- **Familiers** — œufs, dressage, compagnons de combat

### Quêtes & Contenu
- **Quêtes principales** — histoire en 4 chapitres
- **Quêtes secondaires** — familiers, exploration
- **Quêtes quotidiennes** — récompenses récurrentes
- **Donjons** — contenu coopératif

### Social & Économie
- **Chat temps réel** — Convex (global, zone, commerce) avec repli hors-ligne
- **Guildes** — création, grades, coffre, guerres
- **Boutique & échanges** — achat/vente d'objets
- **8 métiers d'artisanat** — forge, alchimie, couture, etc.
- **PvP** — arène classée (backend prêt)

### Technique
- **Frontend** — React 19 + Phaser 3 + TypeScript
- **Backend** — Convex (temps réel, persistance, multijoueur)
- **Mobile-first** — contrôles tactiles, responsive, PWA-ready

## Démarrage

```bash
npm install
npm run dev          # Frontend (port 5173)
npm run convex:dev   # Backend temps réel (optionnel)
```

## Structure

```
src/
├── data/          # Univers, classes, sorts, monstres, items, quêtes
├── game/
│   ├── combat/    # Moteur de combat tactique
│   └── scenes/    # Scènes Phaser (monde, combat)
├── store/         # État global (Zustand)
├── ui/            # Interface React (HUD, panneaux)
└── styles/        # CSS global mobile-first
convex/            # Backend temps réel
```

## Roadmap

- [ ] Sprites et animations pixel art
- [ ] Multijoueur en temps réel (Convex)
- [ ] Donjons instanciés coopératifs
- [ ] PvP arène classée
- [ ] Montures et enclos de guilde
- [ ] Événements saisonniers
- [ ] Export mobile (Capacitor)

## Licence

Projet original — Univers Étheris © 2026
