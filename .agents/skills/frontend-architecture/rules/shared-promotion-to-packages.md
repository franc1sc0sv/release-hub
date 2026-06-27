---
title: Promote to packages/ui or packages/shared Based on Scope
impact: MEDIUM
tags: monorepo, shared, packages, shadcn
---

## Rule

- **`packages/shared`** = cross-app code: TypeScript types, CASL ability definitions, validation schemas, enums. Used by both `apps/web` and `apps/api`.
- **`packages/ui`** = shadcn/ui generic primitives (Button, Dialog, Card, Input) plus the `cn()` utility. Zero Release Hub business logic.
- **Feature components stay in `apps/web/src/features/`** and never get promoted to packages.
- Never create a custom primitive when shadcn/ui already has one. Extend with CVA variants instead.

## Promotion Decision Tree

```
Is it a TypeScript type, enum, CASL rule, or validation schema?
  YES → packages/shared
  NO  ↓

Is it a generic UI primitive with no business logic?
  YES → Does shadcn/ui already have it?
    YES → Use the shadcn component, extend with CVA variants
    NO  → packages/ui
  NO  ↓

It stays in apps/web/src/features/<feature>/components/
```

## Examples

| Artifact | Location | Reason |
|----------|----------|--------|
| `UserRole` enum | `packages/shared` | Used by API for guards and Web for CASL |
| `defineAbilityFor()` | `packages/shared` | CASL rules shared between API and Web |
| `CreateWidgetInput` zod schema | `packages/shared` | Validated on both client and server |
| `cn()` utility | `packages/ui/lib/utils` | Tailwind merge helper, no business logic |
| `Button` | `packages/ui` | shadcn/ui primitive |
| `Dialog` | `packages/ui` | shadcn/ui primitive |
| `ItemCard` | `apps/web/src/features/items/components/item-card.tsx` | Items-specific UI, not reusable outside items |
| `WidgetTable` | `apps/web/src/features/widgets/components/widget-table.tsx` | Widgets-specific, tied to domain |
| `ReportEntryForm` | `apps/web/src/features/reports/components/report-entry-form.tsx` | Feature component with business logic |

## Extending shadcn Primitives with CVA

```tsx
// packages/ui/components/ui/badge.tsx
// GOOD: extend shadcn Badge with project-specific variants via CVA
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Project-specific variants added here
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
```

## Incorrect

```tsx
// packages/ui/components/item-card.tsx
// BAD: business component in packages/ui
export function ItemCard({ item }: { item: Item }) {
  return (
    <Card>
      <CardHeader>{item.title}</CardHeader>
      <CardContent>{item.body}</CardContent>
      <CardFooter>By {item.owner.name}</CardFooter>
    </Card>
  );
}
```

```tsx
// apps/web/src/components/ui/custom-dialog.tsx
// BAD: reinventing what shadcn already provides
export function CustomDialog({ open, onClose, children }: CustomDialogProps) {
  return open ? <div className="fixed inset-0 z-50 ...">{children}</div> : null;
}
```
