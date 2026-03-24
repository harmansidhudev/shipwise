# State Management Guide

## When to use
Reference this when choosing a state management solution, setting up a new store, or refactoring existing state logic to reduce complexity.

## Decision framework

```
┌─────────────────────────────────┐
│ Is the state used by ONE        │
│ component only?                 │
├── YES → useState / useReducer   │
├── NO                            │
│   ┌─────────────────────────────┐
│   │ Is it server/async data?    │
│   ├── YES → TanStack Query      │
│   ├── NO                        │
│   │   ┌─────────────────────────┐
│   │   │ Shared by parent +      │
│   │   │ 1-2 children?           │
│   │   ├── YES → Lift state up   │
│   │   ├── NO                    │
│   │   │   ┌─────────────────────┐
│   │   │   │ 3-5 components in   │
│   │   │   │ one subtree?        │
│   │   │   ├── YES → Context     │
│   │   │   ├── NO                │
│   │   │   │   ┌─────────────────┐
│   │   │   │   │ Global app      │
│   │   │   │   │ state?          │
│   │   │   │   ├── Simple →      │
│   │   │   │   │   Zustand       │
│   │   │   │   └── Complex w/    │
│   │   │   │       middleware →  │
│   │   │   │       Redux Toolkit │
│   │   │   └─────────────────────┘
│   │   └─────────────────────────┘
│   └─────────────────────────────┘
└─────────────────────────────────┘
```

### Quick reference table

| Scenario | Tool | Example |
|----------|------|---------|
| Toggle, form input, modal open/close | `useState` | Dropdown visibility |
| Complex local state with transitions | `useReducer` | Multi-step wizard |
| API data (list, detail, mutations) | TanStack Query | User list, create user |
| Theme, locale, auth user | Context | `<ThemeProvider>` |
| Shopping cart, notifications, UI prefs | Zustand | Global cart store |
| Large app with devtools, middleware, sagas | Redux Toolkit | Enterprise dashboard |

## Copy-paste template

### Zustand store — shopping cart example

```ts
// features/cart/store/cart-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// [CUSTOMIZE] Replace CartItem with your domain type
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  // Derived (computed via selectors below)
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],

        addItem: (item) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          }),

        removeItem: (id) =>
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          })),

        updateQuantity: (id, quantity) =>
          set((state) => ({
            items: quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          })),

        clearCart: () => set({ items: [] }),
      }),
      {
        name: 'cart-storage', // [CUSTOMIZE] localStorage key
      }
    ),
    { name: 'CartStore' } // [CUSTOMIZE] DevTools display name
  )
);

// Selectors — use these in components to avoid unnecessary re-renders
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartItem = (id: string) => (state: CartState) =>
  state.items.find((item) => item.id === id);
```

**Usage in a component:**

```tsx
// features/cart/components/CartSummary.tsx
import { useCartStore, selectCartTotal, selectCartCount } from '../store/cart-store';

export function CartSummary() {
  const total = useCartStore(selectCartTotal);
  const count = useCartStore(selectCartCount);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <div>
      <p>{count} items — ${total.toFixed(2)}</p>
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}
```

### TanStack Query — server state example

```ts
// features/users/api/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// [CUSTOMIZE] Replace with your API client and types
interface User {
  id: string;
  name: string;
  email: string;
}

const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...userKeys.all, 'list', filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useUsers(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/v1/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json() as Promise<{ data: User[]; total: number }>;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create user');
      return res.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

### React Context — theme example

```tsx
// shared/providers/ThemeProvider.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

// [CUSTOMIZE] Add your themes and token sets
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}
```

## Customization notes

- **Zustand selectors** are critical for performance. Always select the narrowest slice of state your component needs. Never do `const state = useCartStore()` — it re-renders on every state change.
- **TanStack Query keys** follow a hierarchy. The `userKeys` factory pattern keeps keys consistent and makes invalidation predictable.
- **Context** is fine for low-frequency updates (theme, locale, auth). Avoid it for frequently changing data (mouse position, timers) because every consumer re-renders on every change.
- **persist middleware** in Zustand serializes state to `localStorage` by default. For sensitive data, use `sessionStorage` or skip persistence.

## Companion tools

| Tool | Use for |
|------|---------|
| React DevTools | Inspecting component state and re-renders |
| Zustand DevTools (via Redux DevTools extension) | Time-travel debugging for Zustand stores |
| TanStack Query DevTools | Monitoring query status, cache, and refetch behavior |
