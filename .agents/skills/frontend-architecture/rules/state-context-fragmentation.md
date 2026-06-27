---
title: Keep Contexts Small and Focused
impact: MEDIUM
tags: state, context, performance
---

## Rule

Each React context handles exactly one concern. When a context value changes, every consumer re-renders. A monolithic context that holds unrelated state causes cascading re-renders across the entire app. Split by domain boundary.

## Incorrect

```tsx
// contexts/app-context.tsx
// BAD: god context — changing dark mode re-renders every component that reads user
interface AppContextValue {
  user: User | null;
  token: string | null;
  dark: boolean;
  locale: string;
  sidebarOpen: boolean;
  ability: AppAbility;
  login: (creds: LoginInput) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
```

## Correct

```tsx
// contexts/auth-context.tsx
// GOOD: only auth concern — changes only when user logs in/out
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (creds: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token"),
  );

  const login = async (creds: LoginInput) => {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_MUTATION,
      variables: creds,
    });
    setToken(data.login.token);
    setUser(data.login.user);
    localStorage.setItem("token", data.login.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    apolloClient.clearStore();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
```

```tsx
// contexts/ability-context.tsx
// GOOD: only CASL concern — rebuilds when user role changes
import { defineAbilityFor } from "@release-hub/shared";

const AbilityContext = createContext<AppAbility | null>(null);

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const ability = useMemo(
    () => defineAbilityFor(user ?? { role: "GUEST" }),
    [user],
  );

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export const useAbility = () => {
  const ctx = useContext(AbilityContext);
  if (!ctx) throw new Error("useAbility must be used within AbilityProvider");
  return ctx;
};
```

## Provider Composition in main.tsx

```tsx
// main.tsx
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";
import { AuthProvider } from "@/contexts/auth-context";
import { AbilityProvider } from "@/contexts/ability-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AppRouter } from "@/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <AbilityProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </AbilityProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
```

Order matters: `AbilityProvider` depends on `AuthProvider` (reads `useAuth`), so it nests inside. `ThemeProvider` is independent but placed innermost for convenience.
