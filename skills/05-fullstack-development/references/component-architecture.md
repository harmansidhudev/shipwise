# Component Architecture

## When to use
Reference this when building new UI components, refactoring existing ones, or deciding how to structure a component library using atomic design principles.

## Decision framework

```
What am I building?
├── A single, reusable UI primitive (Button, Input, Icon)?
│   → Atom
├── A small group of atoms working together (SearchBar, FormField)?
│   → Molecule
├── A complex section with business logic (Header, DataTable)?
│   → Organism
├── A page layout shell with slots for content?
│   → Template
└── A route that fetches data and wires everything together?
    → Page
```

**Compound component pattern** — use when a component has multiple related parts that share implicit state:
- Tabs (Tab.List, Tab.Panel, Tab.Trigger)
- Select (Select.Root, Select.Trigger, Select.Option)
- Accordion (Accordion.Root, Accordion.Item, Accordion.Trigger, Accordion.Content)

## Copy-paste template

### Atom — Button component

```tsx
// shared/components/Button/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

// [CUSTOMIZE] Add or remove variants to match your design system
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        destructive: 'bg-error-500 text-white hover:bg-error-600',
        ghost: 'hover:bg-neutral-100',
        link: 'text-primary-500 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

### Molecule — FormField component

```tsx
// shared/components/FormField/FormField.tsx
import { type ReactNode } from 'react';

// [CUSTOMIZE] Adjust styling classes to match your design tokens
interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-error-500">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}
```

### Organism — DataTable component

```tsx
// features/invoices/components/InvoiceTable.tsx
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import type { Invoice } from '../types';

// [CUSTOMIZE] Replace Invoice type and columns with your domain model
interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (id: string) => void;
  isLoading?: boolean;
}

export function InvoiceTable({ invoices, onView, isLoading }: InvoiceTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Invoice</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Status</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Amount</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 text-sm font-mono">{inv.number}</td>
              <td className="px-4 py-3 text-sm">{inv.customerName}</td>
              <td className="px-4 py-3">
                <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-right">${inv.amount.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onView(inv.id)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Compound component — Tabs

```tsx
// shared/components/Tabs/Tabs.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

// [CUSTOMIZE] Add animation, orientation, or keyboard nav as needed
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs.Root>');
  return ctx;
}

function Root({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

function List({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex gap-1 border-b border-neutral-200">{children}</div>;
}

function Trigger({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;
  return <div role="tabpanel" className="py-4">{children}</div>;
}

export const Tabs = { Root, List, Trigger, Panel };
```

**Usage:**

```tsx
<Tabs.Root defaultTab="overview">
  <Tabs.List>
    <Tabs.Trigger id="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger id="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel id="overview">Overview content here</Tabs.Panel>
  <Tabs.Panel id="settings">Settings content here</Tabs.Panel>
</Tabs.Root>
```

## Customization notes

- **CVA (class-variance-authority)** keeps variant logic co-located with the component. If you use Tailwind, this is the recommended approach. For CSS Modules or styled-components, adapt the pattern accordingly.
- **`cn` utility** merges class names using `clsx` + `tailwind-merge`. Create it as:
  ```ts
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
  ```
- **forwardRef** is required on atoms so parent components can attach refs (e.g., for focus management, tooltips).
- **Compound components** use React Context internally. The `useTabsContext` hook enforces correct usage.

## Companion tools

| Tool | Use for |
|------|---------|
| `anthropics/claude-code` → `frontend-design` | Generating accessible component markup, ARIA attributes |
| Storybook | Visual testing and documentation of atoms/molecules |
| Chromatic | Visual regression testing for component libraries |
