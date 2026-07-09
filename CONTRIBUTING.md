# Contributing Guide

Thank you for contributing to Cheatsheets.

## Local Setup

1. Install Node.js 18+.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Run the app:

```bash
npm run dev
```

4. Validate before opening a PR:

```bash
npm run lint
npm run build
```

## Branch Naming

Use short, descriptive branch names:

- feat/<short-topic>
- fix/<short-topic>
- docs/<short-topic>
- chore/<short-topic>

Examples:

- feat/git-search-shortcuts
- fix/mobile-sidebar-focus
- docs/readme-open-source

## Commit Style

Use clear commit messages. Conventional Commit style is preferred:

- feat: add chapter progress badges
- fix: prevent stale section fetch race
- docs: add contributor setup notes
- chore: remove unused ui primitives

## Pull Request Checklist

- Keep scope focused to one concern.
- Ensure lint passes: `npm run lint`.
- Ensure build passes: `npm run build`.
- Add or update docs when behavior changes.
- Add screenshots for visible UI changes.
- Link related issue(s) in PR description.

## Reporting Issues

Please use the issue templates:

- Bug Report for defects and regressions.
- Feature Request for enhancements.

Include clear reproduction steps and expected behavior.
