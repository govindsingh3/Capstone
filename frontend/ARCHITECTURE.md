# DPRES Frontend Architecture

## Overview
This frontend uses a **feature-based structure** with a shared shell and route-level lazy loading for performance.

- Framework: React + Vite
- Routing: React Router v6
- Global UI state: Zustand
- Styling: Tailwind CSS + design tokens
- Motion: Framer Motion

---

## Folder Conventions

```text
src/
  features/               # Feature modules (page + feature-local widgets/mock data)
    dashboard/
    institution/
    simulation/
    insights/
    learning/
    reports/
  shared/
    layout/               # App shell primitives (sidebar, topbar, shell)
  store/                  # Global stores (ui store)
  routes/                 # Route composition/guards
  layouts/                # Route wrappers (AppLayout/AuthLayout)
  pages/                  # Auth screens only (Login/Register)
  context/                # AuthContext
  hooks/                  # hook wrappers (useAuth)
```

### Ownership Rules
- Keep **feature-specific code** inside its feature folder.
- Put cross-feature primitives in `shared/`.
- Keep route guards and route mapping in `routes/AppRoutes.jsx`.
- Keep auth-only UI under `pages/`.

---

## Import Rules

### Preferred imports
- Use barrel exports where they do **not** hurt chunking:
  - `src/shared/layout/index.js`
  - `src/store/index.js`

### Chunking rule (important)
- For route-level lazy loading, import each page directly by file path in `AppRoutes.jsx`.
- Do **not** lazy import all features through a single barrel for routes, because it can merge page chunks and reduce splitting effectiveness.

Example (good):
```js
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage.jsx"));
```

---

## Routing & Access Control

- `ProtectedRoute` gates authenticated access.
- `RoleRoute` enforces role-based page access using the `roleAccess` map.
- All feature pages are wrapped in `Suspense` via `LazyRoute` for graceful loading fallback.

---

## State Management

`src/store/uiStore.js` manages UI-only global state:
- `sidebarCollapsed`
- `mobileSidebarOpen`
- `theme` (`dark` / `light`)

Theme preference is persisted in `localStorage` (`dpres_theme`).

---

## Design System

Defined in Tailwind config + global CSS.

### Core tokens
- Primary: `#0F172A`
- Secondary: `#3B82F6`
- Accent: `#06B6D4`
- Background: `#020617`

### Reusable utility classes
- `.glass-card`
- `.surface-card`
- `.interactive`
- `.focus-ring`
- `.text-muted`

### Accessibility baseline
- Focus-visible rings on all interactive controls.
- Semantic labels/ARIA on menus, navigation, progress bars, and charts.

---

## Performance Guidelines

- Keep route-level lazy loading for every top-level page.
- Keep heavyweight visualization logic split into feature-local widgets.
- Prefer native SVG/CSS charts unless a charting library is strictly needed.
- After major UI changes, run `npm run build` and inspect output chunk sizes.

---

## Maintenance Checklist

When adding a new feature page:
1. Create folder under `src/features/<feature>/`.
2. Add page component and optional `widgets/` subfolder.
3. Wire lazy route in `src/routes/AppRoutes.jsx`.
4. Add navigation item in `src/shared/layout/navigation.js` if user-facing.
5. Ensure keyboard focus and ARIA coverage.
6. Build and verify chunk size impact.
