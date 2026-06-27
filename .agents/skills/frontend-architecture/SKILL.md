---
name: frontend-architecture
description: >
  Canonical folder structure and architecture rules for the Release Hub frontend
  (apps/web). Defines feature-first organization, GraphQL co-location,
  CASL permission patterns, route structure, shadcn/ui usage, and promotion criteria
  for shared code. Use when creating new features, adding components, deciding where
  code belongs, or reviewing frontend architecture decisions.
metadata:
  category: architecture
  extends: platform-frontend
  tags:
    - release-hub
    - frontend
    - architecture
    - folder-structure
    - react
    - graphql
    - casl
    - shadcn
  status: ready
  version: 1
---

# Principles

- **Feature-first organization** — group code by domain feature (widgets, items, settings), not by file type (components/, hooks/, services/). Each feature is self-contained.
- **Co-locate aggressively** — GraphQL documents, hooks, components, and types live inside the feature that uses them. Only promote to shared when a second feature needs it.
- **Flat shared layer** — `components/`, `context/`, `hooks/`, and `lib/` at the src root hold only cross-cutting code used by 2+ features or the app shell.
- **shadcn/ui is the component library** — primitives live in `packages/ui` via shadcn/ui (Radix + CVA + Tailwind). Never create custom primitives when shadcn has one. Feature components compose these primitives.
- **Named exports everywhere** — never use default exports except for lazy-loaded page components. Named exports are searchable and refactor-friendly.
- **No barrel files** — import directly from the file that defines the export. No `index.ts` re-exports within feature folders. Package entry points (`@release-hub/shared`, `@release-hub/ui`) are the exception.
- **Types from @release-hub/shared** — domain types are defined in `packages/shared/src/types.ts`. Do not duplicate them in the frontend; import them.
- **CASL is the single permission truth** — use `useAbility()` and `<Can>` from `context/ability.context.tsx` for all permission checks. Never hardcode role strings in components.
- **Apollo = server state, Context = client state** — GraphQL data goes through Apollo Client hooks. UI state (theme, sidebar, locale) goes through React context. Never mix the two.
- **Handle all four states** — every data-fetching component must handle loading, error, empty, and success using the shared `PageLoader`, `ErrorState`, and `EmptyState` components.
- **Route path constants** — all route paths defined in `lib/routes.ts`. Navigation always references these constants, never hardcoded strings.
- **Animate everything with Framer Motion** — page transitions, staggered lists, hover/tap micro-interactions, layout reflows, expand/collapse. Use shared presets from `lib/animations.ts`. Respect `prefers-reduced-motion`.

# Canonical Folder Structure

```
apps/web/src/
  main.tsx                          # ReactDOM.createRoot, provider composition
  App.tsx                           # Router provider, top-level route definitions
  index.css                         # Tailwind v4 + custom fonts

  routes/
    index.tsx                       # createBrowserRouter route tree
    protected-route.tsx             # Auth guard (redirects unauthenticated)
    role-route.tsx                  # CASL-based route guard

  layouts/
    app-layout.tsx                  # Sidebar + header + <Outlet />
    auth-layout.tsx                 # Centered card layout for login/register

  features/
    dashboard/
      pages/dashboard-page.tsx
      components/                   # admin-dashboard, user-dashboard, stat-card-grid...
      hooks/use-dashboard-data.ts
      graphql/dashboard.queries.ts
    widgets/
      pages/                        # widgets-page, widget-detail-page, widget-history-page
      components/                   # widget-card, widget-checklist, export-dialog...
      hooks/                        # use-widgets, use-submit-widget...
      graphql/                      # widgets.queries.ts, widgets.mutations.ts
    items/
      pages/ | components/ | hooks/ | graphql/
    auth/
      pages/ | components/ | hooks/ | graphql/
    settings/
      pages/ | components/ | hooks/ | graphql/
    reports/
      pages/ | components/ | hooks/ | graphql/

  components/
    shell/                          # app-shell, main-nav, user-menu, page-transition
    feedback/                       # page-loader, error-state, empty-state, not-found
    permission/                     # can-view (CASL wrapper with fallback)

  context/
    ability.context.tsx             # CASL AbilityProvider (already exists)
    auth.context.tsx                # User session, token, login/logout
    theme.context.tsx               # Dark/light mode toggle

  hooks/
    use-auth.ts                     # App-wide auth convenience hook
    use-locale.ts                   # i18n language switch

  lib/
    animations.ts                   # Framer Motion shared presets (fadeIn, slideUp, stagger, springTap)
    apollo-client.ts                # Apollo Client setup, auth link, cache config
    i18n.ts                         # react-i18next init, namespace lazy loading
    routes.ts                       # Route path constants (ROUTES.DASHBOARD, etc.)

  locales/
    es/ | en/                       # Namespace JSON files per feature
```

# Prerequisites

These must be installed/configured before building features:

| Package | Where | Why |
|---------|-------|-----|
| `@apollo/client` + `graphql` | apps/web | GraphQL data fetching |
| `@graphql-codegen/*` | apps/web (dev) | Auto-generate typed hooks from schema |
| `react-i18next` + `i18next` | apps/web | ES/EN internationalization |
| `react-hook-form` + `@hookform/resolvers` + `zod` | apps/web | Form validation |
| `date-fns` | apps/web | Date formatting |
| shadcn/ui init | packages/ui | Component scaffolding |
| `motion` (framer-motion) | apps/web | Page transitions, micro-interactions, layout animations |
| `@/` path alias | vite.config.ts + tsconfig.json | Absolute imports |
| `VITE_API_URL` | .env | API endpoint |

# Rules

See [rules index](rules/_sections.md) for detailed patterns.

# Workflow

When creating or modifying frontend code in `apps/web/src/`:

1. **Locate** — determine which feature the code belongs to. If it maps to one of the 6 sections (dashboard, widgets, items, auth, settings, reports), it goes in `features/<section>/`.
2. **Classify** — determine the file type:
   - Route entry point → `features/<section>/pages/<name>-page.tsx`
   - UI component → `features/<section>/components/<name>.tsx`
   - Data hook → `features/<section>/hooks/use-<name>.ts`
   - GraphQL document → `features/<section>/graphql/<section>.queries.ts` or `.mutations.ts`
3. **Check sharing scope** — if used by 2+ features, it belongs in the shared layer (`components/`, `hooks/`, `context/`, or `lib/`). If only 1 feature, keep it feature-local.
4. **Check package promotion** — if useful to both `apps/web` and `apps/api`, it belongs in `packages/shared`. If it is a generic UI primitive with no Release Hub business logic, it belongs in `packages/ui` (shadcn/ui).
5. **Wire permissions** — wrap role-restricted content with `<Can>` or check `useAbility()`. Never check `role === 'admin'` directly.
6. **Wire i18n** — all user-facing strings use `useTranslation('<namespace>')`. No hardcoded Spanish or English strings in components.

# Examples

## Positive Trigger

User: "Create the widget detail page for Release Hub."

Expected behavior: Apply this skill to place the page at `features/widgets/pages/widget-detail-page.tsx`, co-locate its hooks and GraphQL queries, and wire CASL permissions.

## Positive Trigger

User: "Where should I put a date formatter utility?"

Expected behavior: Check if used by one feature or multiple. If only widgets, place in `features/widgets/` as a local helper. If 2+ features, place in `lib/`.

## Non-Trigger

User: "Write a NestJS resolver for the widgets module."

Expected behavior: Do not apply this skill; it covers `apps/web` only.

# Troubleshooting

## Skill Does Not Trigger

- Cause: Request wording does not match frontend architecture scope.
- Solution: Rephrase with keywords like "folder structure", "feature module", "frontend organization", or "where to put".

## Guidance Conflicts With Another Skill

- Cause: Overlapping scope with `platform-frontend` or `design-frontend`.
- Solution: This skill is authoritative for Release Hub-specific folder structure decisions. Defer to `platform-frontend` for generic component patterns and `design-frontend` for styling.
