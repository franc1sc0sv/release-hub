---
title: Feature Modules Are Self-Contained
impact: CRITICAL
tags: organization, architecture, feature
---

## Rule

Every feature in `src/features/<feature>/` has exactly **4 subdirectories**:

```
src/features/<feature>/
  pages/          # Route entry points
  components/     # Feature-scoped UI components
  hooks/          # Feature-scoped data/logic hooks
  graphql/        # Co-located queries, mutations, fragments
```

No `utils/`, `types/`, `services/`, or other subdirectories inside a feature.

**Types placement**: Feature-local types go in the file that uses them. If a type is shared across multiple files within the same feature, place it in a `types.ts` at the feature root (`src/features/widgets/types.ts`).

---

## Incorrect: Type-first / global-first organization

```
src/
  components/
    widgets/
      WidgetCard.tsx             # WRONG: feature component in global dir
  hooks/
    useWidgets.ts                # WRONG: feature hook in global dir
  types/
    widget.ts                    # WRONG: feature types in global dir
```

This scatters widget logic across the entire `src/` tree. Finding all widget code requires searching everywhere.

---

## Correct: Feature-first organization

```
src/features/widgets/
  pages/
    widgets-page.tsx
    widget-detail-page.tsx
  components/
    widget-card.tsx
    widget-row.tsx
    edit-widget-dialog.tsx
  hooks/
    use-widgets.ts
    use-update-widget.ts
  graphql/
    widgets-queries.ts
    widgets-mutations.ts
  types.ts                       # shared within this feature only
```

---

## Incorrect: Global hooks for feature logic

```tsx
// src/hooks/useWidgets.ts  -- WRONG location
import { useQuery } from "@apollo/client";
import { GET_WIDGETS } from "../graphql/widgets-queries";

export function useWidgets(ownerId: string) {
  return useQuery(GET_WIDGETS, { variables: { ownerId } });
}
```

---

## Correct: Feature-scoped hook

```tsx
// src/features/widgets/hooks/use-widgets.ts
import { useQuery } from "@apollo/client";
import { GET_WIDGETS } from "../graphql/widgets-queries";
import type { Widget } from "../types";

export function useWidgets(ownerId: string) {
  const { data, loading, error } = useQuery(GET_WIDGETS, {
    variables: { ownerId },
  });

  const widgets: Widget[] = data?.widgets ?? [];

  return { widgets, loading, error };
}
```

---

## All 6 features follow this pattern

| Feature            | Path                              |
| ------------------ | --------------------------------- |
| Dashboard          | `src/features/dashboard/`         |
| Widgets            | `src/features/widgets/`           |
| Items              | `src/features/items/`             |
| Auth               | `src/features/auth/`              |
| Settings           | `src/features/settings/`          |
| Reports            | `src/features/reports/`           |
