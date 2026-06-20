# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static, zero-dependency HTML project** (an interactive Excel
keyboard-shortcuts learning game in French). There is no package manager, lockfile,
build system, lint config, or automated test suite.

### Services / how to run
- There is a single "service": a static web page. Run it with any static file server
  from the repo root, e.g. `python3 -m http.server 8000`, then open
  `http://localhost:8000/index.html`.
- No build step and no "dev" vs "prod" distinction — the HTML/CSS/JS is served as-is.
- Linting/testing/building: not applicable (no tooling is configured in the repo).

### Non-obvious notes
- `index.html` is currently a minimal placeholder (a welcome heading plus a "Testez le
  bouton" button that triggers a `Bravo, le jeu fonctionne !` alert). This is what
  GitHub Pages serves.
- The full game's source HTML actually lives in `.github/workflows/jekyll-docker.yml`
  (it contains a complete self-contained HTML game, not a real GitHub Actions workflow).
  A static server serves it as `application/yaml`, so browsers download rather than
  render it. Do not assume that file is CI config.
- `Excel-Game.html` and `Optimisation de connaissances.html` (~2.4 MB each) are saved
  ChatGPT conversation pages, not the app; ignore them for running the product.
