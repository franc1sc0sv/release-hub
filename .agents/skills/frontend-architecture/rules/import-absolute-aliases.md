---
title: Use Absolute Imports with the @ Alias
impact: MEDIUM
tags: imports, tooling, vite
---

## Rule

Vite and TypeScript are configured with `@/` as an alias pointing to `apps/web/src/`. All cross-feature imports use the `@/` alias. Relative imports are only acceptable within the same feature subdirectory (sibling or direct child files).

## Incorrect

```tsx
// apps/web/src/features/reports/components/report-summary.tsx
// BAD: deep relative imports crossing feature boundaries
import { ItemCard } from "../../../../features/items/components/item-card";
import { useAuth } from "../../../contexts/auth-context";
import { Button } from "../../../components/ui/button";
import type { Item } from "../../../../types/item";
```

## Correct

```tsx
// apps/web/src/features/reports/components/report-summary.tsx
// GOOD: absolute imports for cross-feature and shared code
import { ItemCard } from "@/features/items/components/item-card";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@release-hub/ui/components/ui/button";
import type { Item } from "@release-hub/shared";
```

```tsx
// apps/web/src/features/widgets/components/widget-table.tsx
// GOOD: relative imports within the same feature are acceptable
import { WidgetRow } from "./widget-row";
import { useWidgets } from "../hooks/use-widgets";
import { WIDGET_FIELDS } from "../graphql/widgets.queries";
```

## Configuration

### vite.config.ts

```ts
// apps/web/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### tsconfig.json

```jsonc
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## When to Use Relative vs Absolute

| Scenario | Style | Example |
|----------|-------|---------|
| Same feature, sibling file | Relative | `./widget-row` |
| Same feature, parent/child directory | Relative | `../hooks/use-widgets` |
| Different feature | Absolute | `@/features/items/components/item-card` |
| Shared contexts | Absolute | `@/contexts/auth-context` |
| Shared lib utilities | Absolute | `@/lib/apollo-client` |
| Monorepo packages | Package name | `@release-hub/shared`, `@release-hub/ui` |
