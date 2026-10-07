# Cheatsheets

[![Frontend CI](https://github.com/Brijeshthummar02/cheatsheets/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Brijeshthummar02/cheatsheets/actions/workflows/frontend-ci.yml)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?logo=radix-ui&logoColor=white)](https://www.radix-ui.com/primitives) [![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?logo=lucide&logoColor=white)](https://lucide.dev/) [![Sonner](https://img.shields.io/badge/Sonner-Toast-111111?logo=react&logoColor=white)](https://sonner.emilkowal.ski/)

A developer starts with noise: scattered tabs, half-remembered syntax, and interview panic. This product becomes the quiet desk lamp in that noise. Each page should feel like a guided chapter where concepts unfold in sequence, not like a random knowledge dump. The user should feel: "I know exactly where I am, what I just learned, and what comes next."

## Overview

Cheatsheets is a story-driven learning app for developers.

- Topics: Java, Spring Boot, DSA, Git, and DevOps (containers, Kubernetes, CI/CD, IaC, cloud, observability, plus interview Q&A)
- Language support: English + Hinglish toggle
- Search: Fast concept search across all topics
- Data model: Static JSON assets served from frontend public files
- Runtime: Frontend-only Vite app (no backend required); needs Node 22.12+ (CI uses Node 24 LTS)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

App runs on <http://localhost:3000> by default.

## Build

```bash
cd frontend
npm run build
```

## Deployment (GitHub Pages)

The site is deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` on every push to `main`.

- Live URL: <https://brijeshthummar02.github.io/cheatsheets/>
- The workflow builds with `VITE_BASE_PATH=/<repo-name>/`; locally the base path defaults to `/`.
- To preview the Pages build locally (PowerShell): `$env:VITE_BASE_PATH='/cheatsheets/'; npm run build; npm run preview`, then open <http://localhost:4173/cheatsheets/>.
- After the build, `vite-plugin-static-routes.js` copies `index.html` to every route (and `404.html`) because GitHub Pages cannot rewrite URLs for a single-page app.
- Moving to a custom domain later: add a `CNAME` file in `frontend/public/`, and set `VITE_BASE_PATH: /` in the workflow.

## Open Source

- Suggested issue backlog is tracked in `OPEN_SOURCE_ISSUES.md`.
- PRs are welcome.
- Keep commits small, focused, and reviewable.
- Contribution guide: `CONTRIBUTING.md`.
- Community standards: `CODE_OF_CONDUCT.md`.
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`.
- Issue templates: `.github/ISSUE_TEMPLATE/`.

## License

MIT — see `LICENSE`.
