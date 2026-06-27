---
title: Shared Layer Is for Cross-Cutting Code Only
impact: HIGH
tags: organization, shared, promotion
---

## Rule

Top-level directories `src/components/`, `src/context/`, `src/hooks/`, and `src/lib/` hold code used by **2 or more features** or the app shell (layout, routing, auth).

**The two-feature rule**: code stays feature-local until a second feature needs it. Only then does it get promoted to the shared layer.

---

## Incorrect: Premature promotion to shared layer

```tsx
// src/components/item-card.tsx  -- WRONG: only items uses this
interface ItemCardProps {
  title: string;
  summary: string;
  updatedAt: string;
  onEdit: () => void;
}

export function ItemCard({ title, summary, updatedAt, onEdit }: ItemCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <span className="text-xs">{updatedAt}</span>
      <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
```

Only `features/items/` uses `ItemCard`. Putting it in `src/components/` pollutes the shared layer and misleads other developers into thinking it is a reusable building block.

---

## Correct: Keep it feature-local

```tsx
// src/features/items/components/item-card.tsx  -- correct location
interface ItemCardProps {
  title: string;
  summary: string;
  updatedAt: string;
  onEdit: () => void;
}

export function ItemCard({ title, summary, updatedAt, onEdit }: ItemCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <span className="text-xs">{updatedAt}</span>
      <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
```

---

## Correct: Shared feedback components (used by 3+ features)

```
src/components/feedback/
  page-loader.tsx       # spinner shown while page data loads
  error-state.tsx       # error illustration + retry button
  empty-state.tsx       # illustration + message + optional CTA
```

```tsx
// src/components/feedback/page-loader.tsx
import { Loader2 } from "lucide-react";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

```tsx
// src/components/feedback/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      {icon}
      <h3 className="font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
```

These live in `src/components/feedback/` because widgets, items, dashboard, reports, and settings all render loading, error, and empty states.

---

## Correct shared layer examples

| Path                          | Reason                                              |
| ----------------------------- | --------------------------------------------------- |
| `src/components/feedback/`    | PageLoader, ErrorState, EmptyState -- used everywhere |
| `src/context/auth-context.tsx` | Auth state consumed by all features + app shell      |
| `src/hooks/use-ability.ts`    | CASL permission hook used by all features            |
| `src/lib/apollo-client.ts`    | Apollo Client instance shared across all features    |
| `src/lib/ability.ts`          | CASL ability builder used by auth context + hooks    |

---

## Promotion checklist

Before moving code from a feature to the shared layer:

1. A **second feature** actually imports or needs the code (not hypothetically).
2. The API is **generic enough** -- no feature-specific props or domain terms baked in.
3. The component/hook is placed in a **semantically grouped directory** (`src/components/feedback/`, `src/components/layout/`, etc.), not dumped loose in `src/components/`.
