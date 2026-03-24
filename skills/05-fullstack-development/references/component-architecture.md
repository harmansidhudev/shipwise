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
        sm: 'h-8 px-3 text-sm', // Note: sm (32px) is below 44px touch target minimum. Use md or lg for mobile touch targets.
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

## Empty State Pattern

Use an `EmptyState` component whenever a list or table has no rows to show. This keeps the UI informative rather than blank, and gives users a clear next action.

### EmptyState component

```tsx
// shared/components/EmptyState/EmptyState.tsx
import type { ReactNode } from 'react';
import { Button } from '@/shared/components/Button';

// [CUSTOMIZE] Replace icon type with your icon library (e.g., lucide-react, heroicons)
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-neutral-400">{icon}</div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

### Usage in a DataTable

```tsx
import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';

export function ProjectTable({ data, isFiltered, onCreateProject }) {
  if (data.length === 0) return (
    isFiltered
      ? <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="No results match your search."
          description="Try adjusting your filters or clearing the search term."
        />
      : <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="No projects yet."
          description="Create your first project to get started."
          actionLabel="Create project"
          onAction={onCreateProject}
        />
  );

  // … render table rows
}
```

**Variants at a glance:**

| Scenario | title | description | actionLabel |
|---|---|---|---|
| Empty list with CTA | "No projects yet." | "Create your first project to get started." | "Create project" |
| Empty search results | "No results match your search." | "Try adjusting your filters or clearing the search term." | *(omit)* |

## Interactive Table Accessibility

Sortable, selectable tables need explicit ARIA markup so screen readers and keyboard users get the same experience as mouse users.

**Key attributes:**

- `aria-sort` on sortable `<th>` elements — values: `ascending` | `descending` | `none`
- `role="checkbox"` + `aria-checked` on row-selection cells
- `aria-live="polite"` region announces dynamic updates (sorting, filtering) without interrupting the user
- Keyboard pattern: **Arrow keys** to move focus between cells, **Space** to toggle row selection, **Enter** to activate the primary row action

### Accessible table header + row template

```tsx
// [CUSTOMIZE] Wire sortField/sortDir state and onSort/onSelect handlers to your table state
interface SortState {
  field: string;
  dir: 'ascending' | 'descending' | 'none';
}

function SortableHeader({
  label, field, sort, onSort,
}: { label: string; field: string; sort: SortState; onSort: (field: string) => void }) {
  const ariaSortValue = sort.field === field ? sort.dir : 'none';
  return (
    <th
      scope="col"
      aria-sort={ariaSortValue}
      className="px-4 py-3 text-left text-sm font-medium text-neutral-500 cursor-pointer select-none"
      onClick={() => onSort(field)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSort(field); }}
      tabIndex={0}
    >
      {label}
      {sort.field === field && (sort.dir === 'ascending' ? ' ▲' : ' ▼')}
    </th>
  );
}

function SelectableRow({
  row, isSelected, onSelect, onActivate,
}: { row: { id: string; name: string }; isSelected: boolean; onSelect: () => void; onActivate: () => void }) {
  return (
    <tr
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === ' ') { e.preventDefault(); onSelect(); }
        if (e.key === 'Enter') onActivate();
      }}
      tabIndex={0}
      className="hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          role="checkbox"
          aria-checked={isSelected}
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Select ${row.name}`}
          className="h-4 w-4 rounded border-neutral-300"
        />
      </td>
      <td className="px-4 py-3 text-sm">{row.name}</td>
    </tr>
  );
}

// Wrap your table in a container that announces updates to screen readers
function AccessibleTable({ rows, sort, onSort }) {
  return (
    <>
      {/* aria-live region: announces sort/filter changes without stealing focus */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {sort.field ? `Table sorted by ${sort.field}, ${sort.dir}` : ''}
      </div>
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-4 py-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              <SortableHeader label="Name" field="name" sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {rows.map((row) => (
              <SelectableRow key={row.id} row={row} isSelected={false} onSelect={() => {}} onActivate={() => {}} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
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
