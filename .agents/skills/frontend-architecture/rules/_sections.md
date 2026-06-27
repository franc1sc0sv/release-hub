## Organization

- [org-feature-module-structure](./org-feature-module-structure.md) — Each feature = pages/ + components/ + hooks/ + graphql/
- [org-shared-layer-criteria](./org-shared-layer-criteria.md) — Code stays feature-local until a 2nd feature needs it
- [org-page-composition](./org-page-composition.md) — Pages orchestrate data; components render props

## Routing

- [route-definition-pattern](./route-definition-pattern.md) — Path constants in lib/routes.ts, lazy-loaded pages, createBrowserRouter
- [route-guards](./route-guards.md) — CASL-based route guards, never hardcoded role strings

## GraphQL

- [gql-co-location](./gql-co-location.md) — Queries/mutations co-located in features/*/graphql/
- [gql-hook-pattern](./gql-hook-pattern.md) — Always wrap Apollo operations in custom hooks

## Permissions

- [perm-casl-component-pattern](./perm-casl-component-pattern.md) — Use <Can> component and useAbility() for conditional UI
- [perm-can-view-wrapper](./perm-can-view-wrapper.md) — CanView = Can + fallback UI for page-level gating

## State Management

- [state-server-vs-client](./state-server-vs-client.md) — Apollo for server data, React context for UI state
- [state-context-fragmentation](./state-context-fragmentation.md) — Small focused contexts, no monolithic AppContext

## Shared Code

- [shared-promotion-to-packages](./shared-promotion-to-packages.md) — packages/ui = shadcn primitives, packages/shared = cross-app types/logic

## Animation

- [anim-framer-motion-patterns](./anim-framer-motion-patterns.md) — Framer Motion for page transitions, staggered lists, hover/tap, layout animations

## Imports & Naming

- [import-absolute-aliases](./import-absolute-aliases.md) — @/ alias via Vite + tsconfig, relative only within same feature
- [import-naming-conventions](./import-naming-conventions.md) — kebab-case files, PascalCase components, use- prefix hooks
