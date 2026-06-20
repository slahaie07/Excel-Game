# Aetheris — Document de conception

## Vision

Créer un MMORPG tactique mobile aussi complet que les références du genre, avec un univers original centré sur les Cristaux d'Aether.

## Systèmes implémentés (v0.1)

| Système | Statut | Description |
|---------|--------|-------------|
| Création de compte | ✅ | Local + Convex |
| Création de personnage | ✅ | 8 classes, 5 slots |
| Combat tactique | ✅ | Grille, PA/PM, sorts |
| Monde / zones | ✅ | 6 zones, voyage |
| Inventaire | ✅ | 6 slots équipement |
| Quêtes | ✅ | Main, side, daily |
| Métiers | ✅ | 6 métiers, craft |
| Guildes | ✅ | Création, adhésion |
| Marché | ✅ | Achat/vente |
| PvP | 🔶 | Zone prévue, arène à venir |
| Donjons | 🔶 | Données définies, gameplay à venir |
| Chat | 🔶 | Backend Convex prêt |
| Compagnons | 🔶 | Données pets, UI à venir |

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

## Donjons

- Ruines Corrompues (niv. 8)
- Sanctuaire de Lumina (niv. 15)
- Pyramide des Ombres (niv. 30)
- Nexus d'Aether (niv. 50)
- Tour Infinie (niv. 40, endless)
