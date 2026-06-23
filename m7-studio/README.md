# M7 Studio — Site vitrine premium

Studio créatif **or & noir** : branding, web design, développement, motion et stratégie digitale.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** — build rapide
- **Tailwind CSS 4** — design system responsive
- **React Router 7** — navigation multi-pages

## Démarrage

```bash
cd m7-studio
npm install
npm run dev
```

Ouvrir http://localhost:5174

## Build production

```bash
npm run build
npm run preview
```

## Structure

```
m7-studio/
├── public/              # Favicon, assets statiques
├── src/
│   ├── components/
│   │   ├── layout/      # Header, Footer, Layout
│   │   └── ui/          # Button, Logo, Section, ServiceIcon
│   ├── data/            # Services, portfolio, équipe
│   ├── hooks/           # useScrollReveal
│   ├── lib/             # Constantes marque
│   ├── pages/           # Accueil, Services, Portfolio, À propos, Contact
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css        # Design tokens or/noir
└── docs/
    └── BRAND.md         # Charte graphique
```

## Pages

| Route | Contenu |
|-------|---------|
| `/` | Hero, stats, services, processus, portfolio, témoignages, CTA |
| `/services` | 6 offres détaillées + méthode de travail |
| `/portfolio` | Galerie filtrable par catégorie |
| `/about` | Histoire, valeurs, équipe |
| `/contact` | Formulaire + coordonnées |

## Identité visuelle

| Token | Valeur |
|-------|--------|
| Noir principal | `#0A0A0A` |
| Or signature | `#C9A962` |
| Or clair | `#E8D5A3` |
| Typo titres | Cormorant Garamond |
| Typo corps | DM Sans |

## Responsive

- Mobile-first (menu hamburger < 1024px)
- Grilles adaptatives (1 → 2 → 3/4 colonnes)
- Touch-friendly (boutons, formulaires)

## Licence

© 2026 M7 Studio — Projet original
