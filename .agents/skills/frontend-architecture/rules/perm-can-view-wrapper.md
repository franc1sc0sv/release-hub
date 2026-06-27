---
title: Use CanView for Section-Level Permission Gating
impact: MEDIUM
tags: permissions, components, guard
---

## Rule

`components/permission/can-view.tsx` combines a CASL ability check with fallback UI (access-denied message or redirect). Use `CanView` at the page level — inside route definitions or at the top of page components — to gate entire sections. It differs from `<Can>` which simply hides its children without rendering any fallback.

- `<Can>` = element-level toggle (show/hide a button, link, or section). No fallback.
- `<CanView>` = page/section-level gate. Shows fallback UI when the user lacks permission.

## CanView component implementation

```typescript
// components/permission/can-view.tsx
import type { ReactNode } from 'react';
import { useAbility } from '@/context/ability.context';

interface CanViewProps {
  action: string;
  subject: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function CanView({ action, subject, fallback, children }: CanViewProps) {
  const ability = useAbility();

  if (ability.can(action, subject)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}
```

## AccessDenied fallback component

```typescript
// components/permission/access-denied.tsx
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <ShieldAlert className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Access denied</h2>
      <p className="text-muted-foreground">
        You do not have permission to view this section.
      </p>
      <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
        Back to home
      </Button>
    </div>
  );
}
```

## Correct — Gating an entire page with CanView

```typescript
// features/reports/pages/reports-page.tsx
import { CanView } from '@/components/permission/can-view';
import { AccessDenied } from '@/components/permission/access-denied';
import { ReportList } from '../components/report-list';

export default function ReportsPage() {
  return (
    <CanView action="read" subject="Report" fallback={<AccessDenied />}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <ReportList />
      </div>
    </CanView>
  );
}
```

## Correct — Gating a subsection within a page

```typescript
// features/widgets/pages/widgets-page.tsx
import { Can } from '@/context/ability.context';
import { CanView } from '@/components/permission/can-view';
import { AccessDenied } from '@/components/permission/access-denied';
import { WidgetTable } from '../components/widget-table';
import { WidgetExportPanel } from '../components/widget-export-panel';

export default function WidgetsPage() {
  return (
    <CanView action="read" subject="Widget" fallback={<AccessDenied />}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Widgets</h1>
        <WidgetTable />

        {/* Element-level: export panel only visible to those who can export */}
        <Can I="export" a="Widget">
          <WidgetExportPanel />
        </Can>
      </div>
    </CanView>
  );
}
```

## Incorrect — Using `<Can>` alone for page-level gating

```typescript
// BAD: user with no permission sees a blank page — no feedback
import { Can } from '@/context/ability.context';
import { ReportList } from '../components/report-list';

export default function ReportsPage() {
  return (
    <Can I="read" a="Report">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <ReportList />
      </div>
    </Can>
  );
}
```

## When to use which

| Component | Scope | Fallback | Typical location |
|---|---|---|---|
| `<Can>` | Element (button, link, card section) | None — children hidden silently | Inside components |
| `<CanView>` | Page or major section | `<AccessDenied />`, redirect, or custom UI | Top of page components, inside route config |
