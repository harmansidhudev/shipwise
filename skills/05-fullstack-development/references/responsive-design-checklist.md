# Responsive Design Checklist

## When to use
Reference this when building responsive layouts, setting up Tailwind breakpoints, auditing mobile UX, or ensuring a page works across screen sizes.

## Decision framework

```
What layout am I building?
├── Content page (article, docs, marketing)
│   → Single column on mobile, max-width container, prose styles
├── Dashboard with sidebar
│   → Sidebar collapses to hamburger on mobile, sticky on desktop
├── Data table
│   → Horizontal scroll on mobile, or card layout for <768px
├── Form
│   → Single column on mobile, two-column on desktop for long forms
├── Grid of cards
│   → 1 col mobile → 2 col tablet → 3-4 col desktop
└── Navigation
    → Bottom tab bar on mobile, top nav or sidebar on desktop
```

## Copy-paste template

### Tailwind breakpoint setup

```ts
// tailwind.config.ts
// [CUSTOMIZE] Adjust breakpoints and container widths
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './shared/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '640px',   // Large phones / small tablets
      md: '768px',   // Tablets
      lg: '1024px',  // Small laptops
      xl: '1280px',  // Desktops
      '2xl': '1536px', // Large screens
    },
    extend: {
      // Container with responsive padding
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Mobile-first responsive layout

```tsx
// shared/components/Layout/AppLayout.tsx
// [CUSTOMIZE] Replace navigation items and branding
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile header — visible below lg */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">App Name</span>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <nav className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar — hidden below lg */}
        <nav className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white">
          <SidebarContent />
        </nav>

        {/* Main content — offset by sidebar width on desktop */}
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Responsive card grid

```tsx
// [CUSTOMIZE] Replace card content and column counts
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <div
      key={item.id}
      className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{item.description}</p>
    </div>
  ))}
</div>
```

### Responsive data table (table on desktop, cards on mobile)

```tsx
// [CUSTOMIZE] Replace columns and data shape
interface DataItem {
  id: string;
  name: string;
  status: string;
  amount: number;
}

function ResponsiveTable({ data }: { data: DataItem[] }) {
  return (
    <>
      {/* Mobile: card layout */}
      <div className="space-y-3 md:hidden">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900">{item.name}</span>
              <Badge>{item.status}</Badge>
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              ${item.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">{item.name}</td>
                <td className="px-4 py-3"><Badge>{item.status}</Badge></td>
                <td className="px-4 py-3 text-sm text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

### Responsive typography and spacing

```tsx
{/* [CUSTOMIZE] Adjust sizes for your design system */}

{/* Heading — scales with screen size */}
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
  Dashboard
</h1>

{/* Body text with responsive max-width for readability */}
<p className="max-w-prose text-sm text-neutral-600 sm:text-base">
  Long content text that should not exceed a comfortable reading width.
</p>

{/* Responsive padding */}
<section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
  Content with breathing room
</section>

{/* Responsive flex direction */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="text-lg font-semibold">Section Title</h2>
  <button className="w-full sm:w-auto">Action</button>
</div>
```

### Touch target and accessibility checklist

```tsx
{/* Minimum 44x44px touch targets on mobile */}
<button className="min-h-[44px] min-w-[44px] rounded-md px-4 py-2">
  Tap me
</button>

{/* Adequate spacing between interactive elements */}
<nav className="flex flex-col gap-1">
  <a href="#" className="block rounded-md px-3 py-2.5 text-sm hover:bg-neutral-100">
    Link 1
  </a>
  <a href="#" className="block rounded-md px-3 py-2.5 text-sm hover:bg-neutral-100">
    Link 2
  </a>
</nav>
```

### Pre-launch responsive checklist

```
Mobile (375px)
  [ ] Content readable without horizontal scroll
  [ ] Touch targets >= 44x44px
  [ ] Navigation accessible (hamburger or bottom tabs)
  [ ] Forms are single-column and usable
  [ ] Images scale without overflow
  [ ] Modals/dialogs fit the viewport
  [ ] Text does not require zooming (min 16px body)

Tablet (768px)
  [ ] Two-column layouts where appropriate
  [ ] Sidebar visible or easily toggled
  [ ] Tables use horizontal scroll or card fallback
  [ ] Images use srcset for appropriate resolution

Desktop (1280px+)
  [ ] Content constrained to max-width (no full-bleed text)
  [ ] Sidebar permanently visible
  [ ] Multi-column grids in use
  [ ] Hover states on interactive elements

Cross-cutting
  [ ] No layout shift on resize (CLS < 0.1)
  [ ] viewport meta tag present: <meta name="viewport" content="width=device-width, initial-scale=1">
  [ ] Font sizes use rem, not px (for accessibility zoom)
  [ ] Test with browser zoom at 200%
  [ ] prefers-reduced-motion respected for animations
  [ ] prefers-color-scheme for dark mode (if supported)
```

## Customization notes

- **Mobile-first:** Always write the mobile styles as the default, then add `sm:`, `md:`, `lg:` prefixes for larger screens. This ensures mobile works even if CSS fails to load.
- **Container queries** (Tailwind `@container`) are preferred over media queries when a component needs to respond to its parent's size rather than the viewport. Use for cards and widgets that appear in different contexts.
- **`line-clamp`:** Truncates text to a set number of lines. Essential for card layouts to prevent content from breaking the grid.
- **`min-h-screen`** on the root layout prevents the page from being shorter than the viewport. Combine with `flex flex-col` to push footers to the bottom.

## Companion tools

| Tool | Use for |
|------|---------|
| Chrome DevTools Device Mode | Testing responsive layouts across breakpoints |
| `anthropics/claude-code` → `frontend-design` | Generating responsive component markup |
| Polypane | Multi-viewport testing in a single window |
| Lighthouse | Auditing mobile performance and accessibility |
