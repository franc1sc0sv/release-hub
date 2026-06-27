---
title: Apollo Cache Is Server State, React Context Is Client State
impact: HIGH
tags: state, apollo, context
---

## Rule

Server data (users, widgets, items, reports) flows exclusively through Apollo Client and its normalized cache. Client-only state (dark mode, sidebar open, locale) flows through React context. Never store server data in React context. Never use Apollo local state (`@client` directives or reactive variables) for UI preferences.

## Incorrect

```tsx
// features/items/context/items-context.tsx
// BAD: server data stored in React context
interface ItemsContextValue {
  items: Item[];
  loading: boolean;
  fetchItems: () => Promise<void>;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await client.query({ query: GET_ITEMS });
    setItems(data.items); // duplicating Apollo cache into React state
    setLoading(false);
  };

  return (
    <ItemsContext.Provider value={{ items, loading, fetchItems }}>
      {children}
    </ItemsContext.Provider>
  );
}
```

## Correct

```tsx
// features/items/graphql/use-item-feed.ts
// GOOD: server data via Apollo hook — cache handles deduplication
import { useQuery } from "@apollo/client";
import { GET_ITEMS } from "./items.queries";

export function useItemFeed(ownerId: string) {
  return useQuery(GET_ITEMS, {
    variables: { ownerId },
  });
}
```

```tsx
// contexts/theme-context.tsx
// GOOD: client-only UI state via React context
interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const toggle = () =>
    setDark((prev) => {
      localStorage.setItem("theme", prev ? "light" : "dark");
      return !prev;
    });

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
```

## The Three Contexts in Release Hub

| Context | Purpose | What It Holds |
|---------|---------|---------------|
| `AuthContext` | Authentication state | Current user, JWT token, login/logout |
| `AbilityContext` | CASL permissions | `AppAbility` instance from `@release-hub/shared` |
| `ThemeContext` | UI preferences | Dark mode toggle |

Everything else (users, widgets, items, reports) is server state and lives in the Apollo cache.
