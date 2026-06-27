---
title: Route Guards Use CASL Abilities, Not Role Strings
impact: HIGH
tags: routing, permissions, casl, guards
---

## Rule

`protected-route.tsx` checks authentication (is the user logged in?). `role-route.tsx` checks CASL abilities, never role name strings. Use `ability.can(action, subject)` to gate routes. The CASL ability definitions from `@release-hub/shared` define:

- **admin** can `manage` all subjects
- **user** can `read` and `create` Widget, and `update`/`delete` their own Widget
- **user** can `read` Report

## Incorrect - Checking role strings directly

```typescript
// BAD: brittle role string checks, breaks when permissions change
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

function ReportsPage() {
  const { user } = useAuth();

  if (user.role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <ReportList />;
}
```

```typescript
// BAD: role-based guard component using string comparison
interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

// Usage:
<RoleGuard allowedRoles={['admin']}>
  <WidgetsPage />
</RoleGuard>
```

## Correct - CASL ability checks

### `protected-route.tsx` (authentication only)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { ROUTES } from '../lib/routes';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children ?? <Outlet />;
}
```

### `role-route.tsx` (CASL ability check)

```typescript
import { Navigate } from 'react-router-dom';
import { useAbility } from '../hooks/use-ability';
import { ROUTES } from '../lib/routes';

interface RoleRouteProps {
  action: string;
  subject: string;
  children: React.ReactNode;
}

export function RoleRoute({ action, subject, children }: RoleRouteProps) {
  const ability = useAbility();

  if (!ability.can(action, subject)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
```

### Usage in route config

```typescript
import { RoleRoute } from '../components/role-route';

// Reports - only users who can read Report
{
  path: ROUTES.REPORTS,
  element: (
    <RoleRoute action="read" subject="Report">
      <Suspense fallback={<PageSkeleton />}>
        <ReportsPage />
      </Suspense>
    </RoleRoute>
  ),
}

// Settings - only users who can manage Settings
{
  path: ROUTES.SETTINGS,
  element: (
    <RoleRoute action="manage" subject="Settings">
      <Suspense fallback={<PageSkeleton />}>
        <SettingsPage />
      </Suspense>
    </RoleRoute>
  ),
}

// Widgets - all authenticated users can read Widget (no RoleRoute needed)
{
  path: ROUTES.WIDGETS,
  element: (
    <Suspense fallback={<PageSkeleton />}>
      <WidgetsPage />
    </Suspense>
  ),
}
```

### CASL ability definitions (`@release-hub/shared`)

```typescript
import { AbilityBuilder, PureAbility } from '@casl/ability';

type AppAbility = PureAbility<[string, string]>;

export function defineAbilitiesFor(role: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

  switch (role) {
    case 'admin':
      can('manage', 'all');
      break;

    case 'user':
      can('read', 'Widget');
      can('create', 'Widget');
      can('update', 'Widget');
      can('delete', 'Widget');
      can('read', 'Report');
      break;
  }

  return build();
}
```

### Conditional UI based on abilities

```typescript
import { useAbility } from '../hooks/use-ability';

export function WidgetActions({ widget }: { widget: Widget }) {
  const ability = useAbility();

  return (
    <div>
      {ability.can('update', 'Widget') && widget.status === 'active' && (
        <Button onClick={() => updateWidget(widget.id)}>Edit</Button>
      )}
      {ability.can('manage', 'Widget') && (
        <Button variant="destructive" onClick={() => deleteWidget(widget.id)}>
          Delete
        </Button>
      )}
    </div>
  );
}
```
