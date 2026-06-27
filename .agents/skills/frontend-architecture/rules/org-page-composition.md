---
title: Pages Orchestrate, Components Render
impact: HIGH
tags: architecture, pages, components
---

## Rule

Pages (`*-page.tsx`) are **route entry points**. They:

1. Call hooks to fetch data and manage state.
2. Handle the loading / error / empty state switching.
3. Compose feature components, passing data as props.

Pages contain **no complex JSX**. Components receive **data via props**, never call `useQuery` or manage fetching internally.

---

## Incorrect: Monolithic page with inline data fetching

```tsx
// src/features/widgets/pages/widgets-page.tsx -- WRONG
import { useQuery } from "@apollo/client";
import { GET_WIDGETS } from "../graphql/widgets-queries";

export function WidgetsPage() {
  const { data, loading, error } = useQuery(GET_WIDGETS);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date());
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");

  if (loading) return <div className="animate-spin ...">...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const widgets = data?.widgets ?? [];
  const filtered = widgets
    .filter((w) => (showArchived ? true : !w.archived))
    .filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : /* ... */ 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Widgets</h1>
        <div className="flex gap-2">
          <Input placeholder="Search widgets..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "date")}>
            {/* 20 more lines of select options */}
          </Select>
          <Switch checked={showArchived} onCheckedChange={setShowArchived} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((widget) => (
          <div key={widget.id} className="rounded-lg border p-4"
            onClick={() => setSelectedWidget(widget.id)}>
            <h3 className="font-semibold">{widget.name}</h3>
            <p className="text-sm text-muted-foreground">{widget.owner.name}</p>
            <p className="text-xs">{widget.itemCount} items</p>
            {/* 30 more lines of card content */}
          </div>
        ))}
      </div>
      {/* ... 50 more lines for the detail panel ... */}
    </div>
  );
}
```

This page has 200+ lines, manages 5 state variables, filters and sorts inline, and contains all the JSX. Impossible to test, reuse, or maintain.

---

## Correct: Page orchestrates, components render

```tsx
// src/features/widgets/hooks/use-widgets.ts
import { useQuery } from "@apollo/client";
import { GET_WIDGETS } from "../graphql/widgets-queries";
import type { Widget } from "../types";

export function useWidgets() {
  const { data, loading, error } = useQuery(GET_WIDGETS);
  const widgets: Widget[] = data?.widgets ?? [];
  return { widgets, loading, error };
}
```

```tsx
// src/features/widgets/pages/widgets-page.tsx -- CORRECT
import { useWidgets } from "../hooks/use-widgets";
import { WidgetList } from "../components/widget-list";
import { PageLoader } from "@/components/feedback/page-loader";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function WidgetsPage() {
  const { widgets, loading, error } = useWidgets();

  if (loading) return <PageLoader message="Loading widgets..." />;
  if (error) return <ErrorState error={error} />;
  if (widgets.length === 0) {
    return (
      <EmptyState
        title="No widgets yet"
        description="Create a widget to get started."
      />
    );
  }

  return <WidgetList widgets={widgets} />;
}
```

```tsx
// src/features/widgets/components/widget-list.tsx
import type { Widget } from "../types";
import { WidgetCard } from "./widget-card";

interface WidgetListProps {
  widgets: Widget[];
}

export function WidgetList({ widgets }: WidgetListProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Widgets</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <WidgetCard key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}
```

The page is ~15 lines. It orchestrates the three states and delegates rendering entirely to `WidgetList`.

---

## Dashboard example: Role-based composition

```tsx
// src/features/dashboard/hooks/use-dashboard-data.ts
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD } from "../graphql/dashboard-queries";
import type { DashboardData, UserRole } from "../types";

export function useDashboardData(role: UserRole) {
  const { data, loading, error } = useQuery(GET_DASHBOARD, {
    variables: { role },
  });

  const dashboard: DashboardData | null = data?.dashboard ?? null;
  return { dashboard, loading, error };
}
```

```tsx
// src/features/dashboard/pages/dashboard-page.tsx
import { useAuth } from "@/context/auth-context";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { UserDashboard } from "../components/user-dashboard";
import { AdminDashboard } from "../components/admin-dashboard";
import { PageLoader } from "@/components/feedback/page-loader";
import { ErrorState } from "@/components/feedback/error-state";

const dashboardByRole = {
  user: UserDashboard,
  admin: AdminDashboard,
} as const;

export function DashboardPage() {
  const { user } = useAuth();
  const { dashboard, loading, error } = useDashboardData(user.role);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} />;

  const DashboardView = dashboardByRole[user.role];
  return <DashboardView data={dashboard!} />;
}
```

The page picks the right component based on role and passes the fetched data as a prop. Each role-specific component owns its own layout and cards.

---

## Summary

| Concern              | Lives in          | Example                              |
| -------------------- | ----------------- | ------------------------------------ |
| Data fetching        | `hooks/`          | `useWidgets()`                       |
| State orchestration  | `pages/`          | loading/error/empty switching        |
| Visual rendering     | `components/`     | `WidgetList`, `WidgetCard`           |
| GraphQL definitions  | `graphql/`        | `GET_WIDGETS`                        |
| Shared feedback UI   | `src/components/` | `PageLoader`, `ErrorState`           |
