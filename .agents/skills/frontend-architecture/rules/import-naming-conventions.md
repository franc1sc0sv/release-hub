---
title: File and Export Naming Conventions
impact: MEDIUM
tags: naming, exports, conventions
---

## Rule

- **Files**: always `kebab-case` with lowercase (`widget-card.tsx`, `use-widgets.ts`).
- **Component exports**: `PascalCase` (`WidgetCard`, `WidgetTable`).
- **Hook exports**: `camelCase` with `use` prefix (`useWidgets`, `useItemFeed`).
- **GraphQL constants**: `SCREAMING_SNAKE_CASE` (`GET_WIDGETS`, `CREATE_ITEM`).
- **Page files**: end with `-page.tsx` suffix (`items-page.tsx`, `reports-page.tsx`).
- **Exports**: always named exports. Default exports only for `React.lazy` page components.

## File to Export Mapping

### Components

```tsx
// features/widgets/components/widget-card.tsx
export function WidgetCard({ widget }: WidgetCardProps) { ... }

// features/items/components/item-list.tsx
export function ItemList({ items }: ItemListProps) { ... }

// features/reports/components/report-entry-form.tsx
export function ReportEntryForm({ widgetId }: ReportEntryFormProps) { ... }
```

### Hooks

```tsx
// features/widgets/hooks/use-widgets.ts
export function useWidgets(ownerId: string) { ... }

// features/items/hooks/use-item-feed.ts
export function useItemFeed(ownerId: string) { ... }

// features/reports/hooks/use-report-submission.ts
export function useReportSubmission() { ... }
```

### GraphQL

```tsx
// features/widgets/graphql/widgets.queries.ts
export const GET_WIDGETS = gql`
  query GetWidgets($ownerId: ID!) {
    widgets(ownerId: $ownerId) {
      id
      name
      items { id label value }
    }
  }
`;

// features/items/graphql/items.mutations.ts
export const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) { id label }
  }
`;
```

### Pages

```tsx
// features/widgets/pages/widgets-page.tsx
// Named export for direct use
export function WidgetsPage() { ... }

// Default export ONLY for React.lazy
export default WidgetsPage;
```

```tsx
// router.tsx
const WidgetsPage = lazy(() => import("@/features/widgets/pages/widgets-page"));
const ItemsPage = lazy(() => import("@/features/items/pages/items-page"));
const ReportsPage = lazy(() => import("@/features/reports/pages/reports-page"));
```

### Types

```tsx
// features/widgets/types/widget.types.ts
export interface WidgetRecord {
  id: string;
  ownerId: string;
  updatedAt: string;
  status: WidgetStatus;
}

export type WidgetStatus = "ACTIVE" | "ARCHIVED" | "PENDING" | "BLOCKED";
```

## Quick Reference

| Kind | File Name | Export Name | Export Style |
|----------|-----------|-------------|-------------|
| Component | `widget-card.tsx` | `WidgetCard` | `export function` |
| Hook | `use-item-feed.ts` | `useItemFeed` | `export function` |
| GraphQL query | `widgets.queries.ts` | `GET_WIDGETS` | `export const` |
| GraphQL mutation | `items.mutations.ts` | `CREATE_ITEM` | `export const` |
| Page | `reports-page.tsx` | `ReportsPage` | named + default |
| Type | `widget.types.ts` | `WidgetRecord` | `export interface` |
| Utility | `format-value.ts` | `formatValue` | `export function` |
