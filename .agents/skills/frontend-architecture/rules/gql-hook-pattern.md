---
title: Wrap Apollo Operations in Custom Hooks
impact: HIGH
tags: graphql, apollo, hooks
---

## Rule

Never call `useQuery` or `useMutation` directly in components. Wrap every Apollo operation in a feature-specific custom hook (e.g., `useItemFeed`, `useSubmitWidget`). The hook handles typing, variables, and data transformation. Components stay clean and decoupled from Apollo internals.

## Incorrect

Calling `useQuery` directly inside a page component:

```typescript
// features/items/pages/ItemFeedPage.tsx -- WRONG
import { useQuery } from "@apollo/client";
import { GET_ITEMS } from "../graphql/items.queries";
import type { Item } from "../types";

export function ItemFeedPage({ listId }: { listId: string }) {
  const { data, loading, error } = useQuery(GET_ITEMS, {
    variables: { listId, limit: 20 },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error.message} />;

  // Component now knows about Apollo's response shape
  const items: Item[] = data?.items?.edges.map(
    (edge: { node: Item }) => edge.node
  ) ?? [];

  return <ItemList items={items} />;
}
```

Problems: the component is coupled to Apollo's response structure, the transformation logic is not reusable, and testing requires mocking Apollo internals.

## Correct

### Query hook with data transformation

```typescript
// features/items/hooks/useItemFeed.ts
import { useQuery } from "@apollo/client";
import { GET_ITEMS } from "../graphql/items.queries";
import type { Item, GetItemsQuery } from "../types";

interface UseItemFeedResult {
  items: Item[];
  loading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  fetchMore: () => void;
}

export function useItemFeed(listId: string): UseItemFeedResult {
  const { data, loading, error, fetchMore } = useQuery<GetItemsQuery>(
    GET_ITEMS,
    {
      variables: { listId, limit: 20 },
    }
  );

  const items: Item[] =
    data?.items?.edges.map((edge) => edge.node) ?? [];
  const hasMore = data?.items?.pageInfo.hasNextPage ?? false;

  return {
    items,
    loading,
    error,
    hasMore,
    fetchMore: () =>
      fetchMore({
        variables: { cursor: data?.items?.pageInfo.endCursor },
      }),
  };
}
```

### Clean component consuming the hook

```typescript
// features/items/pages/ItemFeedPage.tsx
import { useItemFeed } from "../hooks/useItemFeed";

export function ItemFeedPage({ listId }: { listId: string }) {
  const { items, loading, error, hasMore, fetchMore } =
    useItemFeed(listId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error.message} />;

  return <ItemList items={items} hasMore={hasMore} onLoadMore={fetchMore} />;
}
```

### Mutation hook with clean return type

```typescript
// features/widgets/hooks/useSubmitWidget.ts
import { useMutation } from "@apollo/client";
import { SUBMIT_WIDGET } from "../graphql/widgets.mutations";
import { GET_WIDGETS } from "../graphql/widgets.queries";
import type {
  SubmitWidgetMutation,
  SubmitWidgetInput,
} from "../types";

interface UseSubmitWidgetResult {
  submitWidget: (input: SubmitWidgetInput) => Promise<void>;
  loading: boolean;
}

export function useSubmitWidget(
  widgetId: string
): UseSubmitWidgetResult {
  const [mutate, { loading }] = useMutation<SubmitWidgetMutation>(
    SUBMIT_WIDGET,
    {
      refetchQueries: [
        { query: GET_WIDGETS, variables: { widgetId } },
      ],
    }
  );

  const submitWidget = async (input: SubmitWidgetInput) => {
    await mutate({ variables: { input } });
  };

  return { submitWidget, loading };
}
```

### Component using the mutation hook

```typescript
// features/widgets/components/WidgetForm.tsx
import { useSubmitWidget } from "../hooks/useSubmitWidget";
import type { SubmitWidgetInput } from "../types";

export function WidgetForm({ widgetId }: { widgetId: string }) {
  const { submitWidget, loading } = useSubmitWidget(widgetId);

  const handleSubmit = async (input: SubmitWidgetInput) => {
    await submitWidget(input);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Why

- **Testability**: hooks can be unit-tested without rendering components or mocking Apollo Provider.
- **Reuse**: multiple components can call the same hook without duplicating query logic.
- **Encapsulation**: Apollo response shapes, cache updates, and refetch logic stay hidden from the UI layer.
- **Type safety**: the hook defines a clean return interface instead of leaking Apollo's generic types into components.
