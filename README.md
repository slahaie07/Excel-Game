# Aetheris — L'Éveil des Cristaux

MMORPG tactique mobile inspiré des grands RPG isométriques au tour par tour, avec un univers fantasy original.

## Univers

**Aetheris** se déroule sur **Terreval**, un monde où les fragments d'une étoile morte — les **Cristaux d'Aether** — ont accordé des pouvoirs extraordinaires à certains individus, les **Éveilleurs**. Mais les Ombres Cristallines corrompent tout sur leur passage...

## Fonctionnalités

### Combat tactique
- Grille isométrique au tour par tour (PA/PM)
- 8 classes uniques avec sorts propres
- IA ennemie, buffs/debuffs, victoire/défaite
- Boss et donjons

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

### Social & multijoueur
- Chat en temps réel (4 canaux : global, zone, guilde, trade)
- Présence joueurs en ligne par zone
- Guildes (création, adhésion)
- Marché d'Halan (achat/vente)

### PvP
- Arène classée 1v1, 2v2, 3v3
- Système de rating et classement
- Matchmaking avec adversaires

### Donjons
- 5 donjons avec progression par salles
- Boss finaux et récompenses
- Tour Infinie (endless)

### Compagnons & Havre
- 6 pets avec bonus passifs (XP, dégâts, soins...)
- Havre personnel décorable
- Boutique de meubles et upgrades

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
npx convex dev
```

Puis ajoutez `VITE_CONVEX_URL` dans `.env.local`.

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
- [ ] Multijoueur Convex temps réel complet
- [ ] Événements saisonniers
- [ ] Graphismes isométriques avancés

## Licence

Projet original — Univers Aetheris © 2026
