---
title: Use CASL Can Component for Conditional UI
impact: HIGH
tags: permissions, casl, components
---

## Rule

Use `<Can>` from `@/context/ability.context` for declarative show/hide of UI elements based on CASL permissions. Use `useAbility()` for imperative checks inside hooks or event handlers. Never check role strings directly — all permission logic flows through the CASL ability instance so that rules stay centralized and testable.

Subjects: `User`, `Widget`, `Item`, `Report`, `Favorite`, etc.
Roles: **admin** (manage all), **user** (read and create own widgets, update/delete own widgets).

## Incorrect — Hardcoded role string checks

```typescript
import { useAuth } from '@/context/auth.context';

export function WidgetActions({ widget }: { widget: Widget }) {
  const { user } = useAuth();

  return (
    <div className="flex gap-2">
      {/* BAD: couples UI to role names, breaks when permissions change */}
      {user.role === 'admin' && (
        <Button variant="destructive">Delete widget</Button>
      )}

      {user.role === 'admin' && (
        <Button>Publish</Button>
      )}

      {user.role !== 'user' && (
        <Button variant="outline">Edit</Button>
      )}
    </div>
  );
}
```

## Correct — Declarative `<Can>` component

```typescript
import { Can } from '@/context/ability.context';
import { Button } from '@/components/ui/button';
import type { Widget } from '@/types';

export function WidgetActions({ widget }: { widget: Widget }) {
  return (
    <div className="flex gap-2">
      <Can I="delete" a="Widget">
        <Button variant="destructive">Delete widget</Button>
      </Can>

      <Can I="update" a="Widget">
        <Button variant="outline">Edit</Button>
      </Can>
    </div>
  );
}
```

## Correct — Admin-only review actions

```typescript
import { Can } from '@/context/ability.context';
import { Button } from '@/components/ui/button';
import type { Widget } from '@/types';

interface WidgetReviewActionsProps {
  widget: Widget;
  onApprove: (widgetId: string) => void;
  onReject: (widgetId: string) => void;
}

export function WidgetReviewActions({ widget, onApprove, onReject }: WidgetReviewActionsProps) {
  return (
    <Can I="manage" a="Widget">
      <div className="flex gap-2">
        <Button onClick={() => onApprove(widget.id)}>
          Approve widget
        </Button>
        <Button variant="destructive" onClick={() => onReject(widget.id)}>
          Reject widget
        </Button>
      </div>
    </Can>
  );
}
```

## Correct — Imperative `useAbility()` check in a hook

```typescript
import { useAbility } from '@/context/ability.context';
import { useCallback } from 'react';

export function useWidgetExport(widgetId: string) {
  const ability = useAbility();

  const canExport = ability.can('export', 'Widget');

  const handleExport = useCallback(async () => {
    if (!ability.can('export', 'Widget')) return;
    // proceed with CSV/PDF export logic
    const response = await exportWidgets(widgetId);
    downloadFile(response);
  }, [ability, widgetId]);

  return { canExport, handleExport };
}
```

Usage in a component:

```typescript
import { useWidgetExport } from '../hooks/use-widget-export';
import { Button } from '@/components/ui/button';

export function WidgetToolbar({ widgetId }: { widgetId: string }) {
  const { canExport, handleExport } = useWidgetExport(widgetId);

  return (
    <div className="flex items-center gap-2">
      {canExport && (
        <Button variant="outline" onClick={handleExport}>
          Export widgets
        </Button>
      )}
    </div>
  );
}
```

## When to use which

| Approach | Use case |
|---|---|
| `<Can I="action" a="Subject">` | Declarative show/hide of JSX elements |
| `useAbility().can('action', 'Subject')` | Inside hooks, event handlers, or when you need the boolean value |
| **Never** `user.role === '...'` | Role strings couple UI to auth implementation and break when rules change |
