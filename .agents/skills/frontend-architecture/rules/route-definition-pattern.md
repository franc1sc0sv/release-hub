---
title: Routes Use Path Constants and Lazy Loading
impact: HIGH
tags: routing, react-router, lazy-loading
---

## Rule

All route paths are defined as constants in `lib/routes.ts`. The router config in `routes/index.tsx` uses `React.lazy()` for every feature page. Route nesting mirrors the feature structure. The `app-layout` wraps all authenticated routes with `<Outlet />`. This project uses react-router-dom 7 in **library mode** (`createBrowserRouter`), NOT framework/Remix mode.

## Path Constants (`lib/routes.ts`)

```typescript
export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Widgets
  WIDGETS: '/widgets',
  WIDGET_DETAIL: '/widgets/:widgetId',

  // Items
  ITEMS: '/items',
  ITEM_DETAIL: '/items/:itemId',

  // Reports
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:reportId',

  // Settings
  SETTINGS: '/settings',
} as const;
```

## Incorrect - Hardcoded path strings, no lazy loading

```typescript
// BAD: path strings duplicated, no code splitting
import DashboardPage from '../features/dashboard/pages/dashboard-page';
import WidgetsPage from '../features/widgets/pages/widgets-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/widgets', element: <WidgetsPage /> },
    ],
  },
]);
```

## Correct - ROUTES constants with Suspense and lazy loading

```typescript
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ROUTES } from '../lib/routes';
import { AppLayout } from '../layouts/app-layout';
import { ProtectedRoute } from '../components/protected-route';
import { PageSkeleton } from '../components/page-skeleton';

const DashboardPage = lazy(() => import('../features/dashboard/pages/dashboard-page'));
const WidgetsPage = lazy(() => import('../features/widgets/pages/widgets-page'));
const WidgetDetailPage = lazy(() => import('../features/widgets/pages/widget-detail-page'));
const ItemsPage = lazy(() => import('../features/items/pages/items-page'));
const ReportsPage = lazy(() => import('../features/reports/pages/reports-page'));
const SettingsPage = lazy(() => import('../features/settings/pages/settings-page'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.WIDGETS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <WidgetsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.WIDGET_DETAIL,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <WidgetDetailPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.ITEMS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ItemsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.REPORTS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
```

## Route Tree Structure

```
/ (ProtectedRoute + AppLayout with <Outlet />)
  /dashboard              -> DashboardPage (lazy)
  /widgets                -> WidgetsPage (lazy)
  /widgets/:widgetId      -> WidgetDetailPage (lazy)
  /items                  -> ItemsPage (lazy)
  /items/:itemId          -> ItemDetailPage (lazy)
  /reports                -> ReportsPage (lazy)
  /reports/:reportId      -> ReportDetailPage (lazy)
  /settings               -> SettingsPage (lazy)
```

Navigation links also use the constants:

```typescript
import { ROUTES } from '../lib/routes';

<Link to={ROUTES.WIDGETS}>Widgets</Link>

// For parameterized routes, use a helper:
const toWidgetDetail = (widgetId: string) =>
  ROUTES.WIDGET_DETAIL.replace(':widgetId', widgetId);

<Link to={toWidgetDetail(widget.id)}>View widget</Link>
```
