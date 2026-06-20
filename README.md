# Chroniques d'Astralys

Prototype mobile d'un RPG tactique dans un univers original. Le jeu tient dans `index.html`, fonctionne hors ligne et sauvegarde la progression dans le navigateur avec `localStorage`.

## Univers

Astralys est un archipel où des fragments de constellations tombent sur terre. Les joueurs incarnent des nomades capables d'utiliser ces éclats pour combattre, fabriquer des objets et explorer des régions dangereuses.

## Fonctionnalités présentes

- Création de personnage avec 3 classes jouables:
  - Lame d'Aurore
  - Tisse-brume
  - Forge-rune
- Interface mobile-first avec navigation fixe.
- Combat tactique au tour par tour sur grille 7x5.
- Points d'action, déplacement, portée, attaques, soins et IA ennemie simple.
- Monde explorable avec plusieurs zones, dangers, monstres et ressources.
- Quêtes avec objectifs, progression et récompenses.
- Inventaire, consommables, équipement et bonus de statistiques.
- Métiers et recettes de craft.
- Bestiaire/codex débloqué par découverte.
- Journal d'aventure et sauvegarde automatique locale.

## Lancer le jeu

Ouvrir simplement `index.html` dans un navigateur moderne, sur mobile ou ordinateur.

## Vision de production

Cette version est une première tranche jouable. Pour atteindre l'ampleur d'un MMORPG tactique complet, les prochaines étapes seraient:

1. Ajouter un moteur de carte isométrique avec tuiles, obstacles et transitions.
2. Créer davantage de classes, sorts, panoplies, familiers et compagnons.
3. Ajouter donjons, boss, économie, hôtel de vente et guildes.
4. Remplacer `localStorage` par un backend avec comptes, sauvegardes cloud et anti-triche.
5. Ajouter multijoueur temps réel/asynchrone, chat, amis et combats de groupe.
6. Produire des assets visuels/sonores originaux et une vraie pipeline mobile.
