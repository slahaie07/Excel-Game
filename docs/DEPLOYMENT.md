# Déploiement Aetheris v1.12

## Prérequis

- Compte [Convex](https://convex.dev)
- Compte [Netlify](https://netlify.com) (ou autre hébergeur static)
- Node.js 20+

## 1. Backend Convex (production)

```bash
# Connexion au projet Convex
npx convex login

# Déploiement production (une fois les tests passés)
npm run convex:deploy
```

Récupérez l'URL de déploiement (ex. `https://happy-animal-123.convex.cloud`).

> **Note :** Utilisez `npx convex dev` en développement, `npx convex deploy` uniquement pour la production.

## 2. Frontend (Netlify)

Le fichier `netlify.toml` est déjà configuré :

- Build : `npm run build`
- Publish : `dist/`
- SPA redirect : `/* → /index.html`

### Variables d'environnement Netlify

| Variable | Valeur |
|----------|--------|
| `VITE_CONVEX_URL` | URL de votre déploiement Convex |
| `NODE_VERSION` | `20` (déjà dans netlify.toml) |

### Déploiement manuel

```bash
npm install
npm run build
npx netlify deploy --prod --dir=dist
```

### Déploiement Git

Connectez le repo GitHub à Netlify — chaque push sur `main` déclenche un build.

## 3. CI GitHub Actions

Le workflow `.github/workflows/ci.yml` s'exécute sur push/PR vers `main` :

1. `npm ci`
2. `CONVEX_AGENT_MODE=anonymous npx convex dev --once` (validation Convex)
3. `npm run typecheck`
4. `npm run build`
5. `npm test`
6. `npm run metrics` + `npm run size:check` (budgets dans `budgets.json`)

En local, la même chaîne est disponible via `npm run check`.

Les PR reçoivent un commentaire automatique avec le tableau de taille du bundle.

Aucune configuration supplémentaire requise pour la CI.

## 4. Mobile (Capacitor)

```bash
npm run build:mobile
npm run cap:android   # ou cap:ios
```

Publiez via Google Play / App Store selon vos comptes développeur.

## 5. Mode hors-ligne

Sans `VITE_CONVEX_URL`, le jeu fonctionne entièrement en local (localStorage). Le multijoueur cloud nécessite Convex configuré.

## Checklist production

- [ ] `npx convex deploy` exécuté
- [ ] `VITE_CONVEX_URL` configuré sur Netlify
- [ ] CI verte sur `main` (`npm run check` passe en local)
- [ ] Test manuel : création compte cloud, combat, donjon coop, PvP arène IA
- [ ] Test manuel : PvP live (file d'attente → duel joueur)
- [ ] Test manuel : monture achetée/équipée, guilde locale créée
- [ ] Test manuel : scores saison (kills, donjon, PvP) visibles dans le panneau Saison
