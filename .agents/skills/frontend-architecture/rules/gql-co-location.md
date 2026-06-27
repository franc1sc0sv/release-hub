---
title: Co-locate GraphQL Documents with Their Feature
impact: HIGH
tags: graphql, apollo, organization
---

## Rule

Each feature has a `graphql/` subdirectory containing `<feature>.queries.ts` and `<feature>.mutations.ts`. These files export `gql` tagged template literals. Hooks in `hooks/` import from these co-located files. There is no global `graphql/` folder at the `src/` level.

## Correct

### `features/widgets/graphql/widgets.queries.ts`

```typescript
import { gql } from "@apollo/client";

export const GET_WIDGETS = gql`
  query GetWidgets($ownerId: ID!) {
    widgets(ownerId: $ownerId) {
      id
      name
      status
      itemCount
    }
  }
`;

export const GET_WIDGET_DETAIL = gql`
  query GetWidgetDetail($widgetId: ID!) {
    widget(id: $widgetId) {
      id
      name
      status
      items {
        id
        label
        value
      }
    }
  }
`;
```

### `features/widgets/graphql/widgets.mutations.ts`

```typescript
import { gql } from "@apollo/client";

export const SUBMIT_WIDGET = gql`
  mutation SubmitWidget($input: SubmitWidgetInput!) {
    submitWidget(input: $input) {
      widgetId
      status
      items {
        id
        value
      }
    }
  }
`;
```

### Hook importing from co-located graphql directory

```typescript
// features/widgets/hooks/useWidgets.ts
import { useQuery } from "@apollo/client";
import { GET_WIDGETS } from "../graphql/widgets.queries";
import type { Widget } from "../types";

export function useWidgets(ownerId: string) {
  const { data, loading, error } = useQuery(GET_WIDGETS, {
    variables: { ownerId },
  });

  return {
    widgets: (data?.widgets ?? []) as Widget[],
    loading,
    error,
  };
}
```

## Incorrect

Centralizing GraphQL documents in a shared top-level folder:

```
src/
  graphql/
    queries/
      widgets.ts       # WRONG: detached from feature
      items.ts
    mutations/
      widgets.ts
      items.ts
  features/
    widgets/
      hooks/
        useWidgets.ts  # imports from ../../graphql/queries/widgets
```

This breaks feature isolation. When you move or delete a feature, orphaned documents remain in the global folder. Co-location keeps each feature self-contained.

## Structure

```
features/
  widgets/
    graphql/
      widgets.queries.ts
      widgets.mutations.ts
    hooks/
      useWidgets.ts
      useSubmitWidget.ts
    components/
    pages/
  items/
    graphql/
      items.queries.ts
      items.mutations.ts
    hooks/
    components/
    pages/
```
