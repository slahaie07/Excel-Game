# Déploiement M7 Studio

## Option 1 — Netlify (recommandé)

1. Connecter le repo GitHub sur [netlify.com](https://netlify.com)
2. **Base directory** : `m7-studio`
3. **Build command** : `npm run generate:assets && npm run build`
4. **Publish directory** : `m7-studio/dist`
5. Activer **Form notifications** dans Site settings → Forms → contact

Le formulaire de contact utilise **Netlify Forms** (configuré dans `index.html`).

### Variables d'environnement (optionnel)

Aucune requise pour le site statique.

---

## Option 2 — GitHub Pages

Le workflow `.github/workflows/deploy-m7-studio.yml` déploie automatiquement sur push `main` quand `m7-studio/` change.

1. Repo → Settings → Pages → Source : **GitHub Actions**
2. URL : `https://<user>.github.io/<repo>/`

---

## Option 3 — Render

```bash
# Build command
cd m7-studio && npm ci && npm run generate:assets && npm run build

# Publish path
m7-studio/dist
```

---

## Commandes locales

```bash
cd m7-studio
npm install
npm run generate:assets   # PNG depuis SVG (logo, OG image)
npm run build
npm run preview
```

## Assets de marque

| Fichier | Usage |
|---------|-------|
| `public/brand/logo-square.svg` / `.png` | Logo carré |
| `public/brand/logo-horizontal.svg` / `.png` | En-tête large |
| `public/brand/logo-icon.svg` / `.png` | Favicon / app icon |
| `public/brand/og-image.svg` / `.png` | Open Graph / réseaux sociaux |
| `public/portfolio/*.svg` | Visuels portfolio (6 projets) |

Générer les PNG : `npm run generate:assets`

## Formulaire contact

- Champs : prénom, nom, email, entreprise, type, budget, message
- Backend : Netlify Forms (POST vers `/`)
- Fallback : `contact@m7studio.fr`
