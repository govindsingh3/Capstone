# DPRES Frontend

High-fidelity admin dashboard for the DPRES Readiness Command Center.

## Quick Start

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Documentation

- Architecture guide: [ARCHITECTURE.md](ARCHITECTURE.md)
- Print docs pointer: `npm run docs`

## Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router v6
- Zustand

## Developer Onboarding

### Branch Naming

- Feature: `feature/<short-scope>`
- Fix: `fix/<short-scope>`
- Chore: `chore/<short-scope>`

Examples:
- `feature/dashboard-alert-feed`
- `fix/simulation-progress-reset`
- `chore/update-auth-copy`

### Before Opening a PR

- Install dependencies: `npm install`
- Verify local build: `npm run build`
- Check docs pointer: `npm run docs`
- Confirm no dead imports/files were introduced

### PR Checklist

- Scope is focused to one concern (feature/fix/chore)
- Route-level lazy loading remains intact for new pages
- Accessibility checks included (focus-visible, labels/ARIA where needed)
- Visual changes align with theme tokens and utility classes
- Architecture notes updated when folder/import conventions change
