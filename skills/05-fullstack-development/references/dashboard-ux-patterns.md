# Dashboard UX Patterns

Reusable patterns for building data dashboards that are readable, responsive, and accessible. Covers layout, KPI cards, empty states, date selectors, data density, real-time updates, widget personalization, and responsive behavior.

## When to use
Reference this when building a new dashboard view, adding KPI cards or charts, handling empty/zero-data states, or making an existing dashboard responsive and accessible.

---

## 1. Dashboard layout patterns

### Decision framework
```
What type of dashboard?
├── Analytics/metrics (KPIs + charts)
│   → Bento grid: mixed-size cards, responsive
├── Admin panel (data tables + actions)
│   → Sidebar + main content area
├── Simple overview (few metrics + activity)
│   → Full-width stacked cards
└── Real-time monitoring
    → Dense grid with auto-refresh indicators
```
- If mostly numbers and charts → **bento grid**
- If mostly tables with row actions → **sidebar + content**
- If only 3-5 things to show → **stacked cards**
- If data changes every few seconds → **dense grid** with refresh indicators

| Layout | Best for | Example products |
|--------|----------|------------------|
| Bento grid | KPIs + mixed charts | Stripe Dashboard, Vercel Analytics |
| Sidebar + content | Admin CRUD, settings | Django Admin, Retool |
| Stacked cards | Simple overviews | Notion home, Linear My Issues |
| Dense grid | Monitoring, ops | Grafana, Datadog |

### Copy-paste: Bento grid layout
```tsx
// components/dashboard/BentoGrid.tsx
// [CUSTOMIZE] Adjust grid column spans to match your metric count
interface BentoGridProps { children: React.ReactNode }
export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
interface BentoCardProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg"; // sm=1col, md=2col on lg, lg=full width
}
export function BentoCard({ children, size = "sm" }: BentoCardProps) {
  const span = { sm: "col-span-1", md: "lg:col-span-2", lg: "lg:col-span-4" };
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${span[size]}`}>
      {children}
    </div>
  );
}
// Usage: <BentoGrid><BentoCard size="md"><Chart /></BentoCard></BentoGrid>
```

---

## 2. KPI card patterns

Every KPI card needs: **metric name**, **current value**, **trend indicator** (arrow + percentage), **comparison period**, and optional **sparkline area**.

- Green + up arrow = positive trend, Red + down arrow = negative trend
- **Never use color alone** — always pair with arrows so colorblind users can read trends

| Metric type | Format | Example |
|-------------|--------|---------|
| Currency | $ + commas + 2 decimals | $12,345.67 |
| Percentage | Number + % | 68.2% |
| Count | Commas, abbreviate >10k | 1,234 or 12.3k |
| Duration | Human-readable | 2m 34s |

### Copy-paste: KPICard component
```tsx
// components/dashboard/KPICard.tsx
// [CUSTOMIZE] Add your own metric types and formatting logic
interface KPICardProps {
  label: string;
  value: string;
  trend: { direction: "up" | "down" | "flat"; percentage: number; comparisonLabel: string };
  sparkline?: React.ReactNode;
}
export function KPICard({ label, trend, value, sparkline }: KPICardProps) {
  const cfg = {
    up:   { arrow: "\u2191", color: "text-green-600", bg: "bg-green-50" },
    down: { arrow: "\u2193", color: "text-red-600",   bg: "bg-red-50" },
    flat: { arrow: "\u2192", color: "text-gray-500",  bg: "bg-gray-50" },
  };
  const { arrow, color, bg } = cfg[trend.direction];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color} ${bg}`}
          aria-label={`${trend.direction} ${trend.percentage}%`}>
          {arrow} {trend.percentage}%
        </span>
        <span className="text-xs text-gray-400">{trend.comparisonLabel}</span>
      </div>
      {sparkline && <div className="mt-3 h-10">{sparkline}</div>}
    </div>
  );
}
```

---

## 3. Zero-data / empty dashboard state

- If user is brand new (no data ever) → show **welcome state** with sample data and a call to action
- If user has data but none for selected period → show **no-data state** with hint to change filters

### Copy-paste: DashboardEmptyState component
```tsx
// components/dashboard/DashboardEmptyState.tsx
// [CUSTOMIZE] Replace actions and illustrations with your onboarding flow
interface DashboardEmptyStateProps {
  variant: "first-time" | "no-data";
  actionLabel?: string;
  onAction?: () => void;
}
export function DashboardEmptyState({ variant, actionLabel, onAction }: DashboardEmptyStateProps) {
  if (variant === "first-time") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-4xl" role="img" aria-label="chart">&#x1F4CA;</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Welcome! Your dashboard is ready.</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Once you {actionLabel?.toLowerCase() ?? "add your first data"}, metrics appear here.
        </p>
        {onAction && (
          <button onClick={onAction}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {actionLabel ?? "Get started"}
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-lg font-semibold text-gray-900">No data for this period</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Try expanding your date range or adjusting your filters to see results.
      </p>
    </div>
  );
}
```

---

## 4. Date range selector

| Preset | Value | Notes |
|--------|-------|-------|
| Today | 1 day | Default for real-time dashboards |
| Last 7 days | 7d | Default for most analytics |
| Last 30 days | 30d | Monthly overview |
| Last 90 days | 90d | Quarterly view |
| This year | YTD | Year-to-date |
| Custom | User picks | Always offer a custom escape hatch |

- **Persist selection** — save last choice in `localStorage` so it sticks across sessions
- **Comparison toggle** — "Compare to previous period" overlays prior period data

### Copy-paste: DateRangeSelector component
```tsx
// components/dashboard/DateRangeSelector.tsx
// [CUSTOMIZE] Wire up your date library (dayjs, date-fns) and state management
type Preset = "today" | "7d" | "30d" | "90d" | "year" | "custom";
interface DateRangeSelectorProps {
  value: Preset;
  onChange: (preset: Preset) => void;
  compareEnabled: boolean;
  onCompareToggle: (enabled: boolean) => void;
}
const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" }, { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" }, { key: "90d", label: "90 days" },
  { key: "year", label: "Year" },   { key: "custom", label: "Custom" },
];
export function DateRangeSelector({ value, onChange, compareEnabled, onCompareToggle }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
        {PRESETS.map(({ key, label }) => (
          <button key={key}
            onClick={() => { onChange(key); localStorage.setItem("dashboard-date-preset", key); }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              value === key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}>
            {label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1.5 text-sm text-gray-500">
        <input type="checkbox" checked={compareEnabled}
          onChange={(e) => onCompareToggle(e.target.checked)} className="rounded border-gray-300" />
        Compare to previous period
      </label>
    </div>
  );
}
```

---

## 5. Data density guidelines

- **Max 7 +/- 2 metrics visible** without scrolling (Miller's Law)
- If you need more → use **progressive disclosure**: show summary first, click to expand
- Hover or click for detail — do not clutter the default view

### Copy-paste: ExpandableMetricCard component
```tsx
// components/dashboard/ExpandableMetricCard.tsx
// [CUSTOMIZE] Add your detailed metrics in the expanded section
import { useState } from "react";
interface ExpandableMetricCardProps {
  title: string;
  summary: string;
  children: React.ReactNode;
}
export function ExpandableMetricCard({ title, summary, children }: ExpandableMetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left" aria-expanded={expanded}>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{summary}</p>
        </div>
        <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>&#x25BC;</span>
      </button>
      {expanded && <div className="border-t border-gray-100 px-5 pb-5 pt-3">{children}</div>}
    </div>
  );
}
```

---

## 6. Real-time vs polling

- If collaborative or monitoring (live users, server health) → **real-time** (WebSocket or SSE)
- If analytics or reporting → **polling** every 30-60 seconds
- If data changes less than once per minute → polling is simpler and cheaper
- Always show a **stale indicator** so users know when data was last fetched

### Copy-paste: usePolling hook with stale indicator
```tsx
// hooks/usePolling.ts
// [CUSTOMIZE] Adjust interval and stale threshold for your use case
import { useEffect, useState, useCallback, useRef } from "react";
interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  intervalMs: number;
  enabled?: boolean;
}
interface UsePollingResult<T> {
  data: T | null;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  refresh: () => void;
}
export function usePolling<T>({ fetcher, intervalMs, enabled = true }: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try { const result = await fetcher(); setData(result); setLastUpdated(new Date()); }
    finally { setIsRefreshing(false); }
  }, [fetcher]);
  useEffect(() => {
    if (!enabled) return;
    refresh();
    intervalRef.current = setInterval(refresh, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [refresh, intervalMs, enabled]);
  return { data, lastUpdated, isRefreshing, refresh };
}

// components/dashboard/StaleIndicator.tsx
interface StaleIndicatorProps { lastUpdated: Date | null; isRefreshing: boolean }
export function StaleIndicator({ lastUpdated, isRefreshing }: StaleIndicatorProps) {
  if (isRefreshing) return <span className="text-xs text-blue-500">Refreshing...</span>;
  if (!lastUpdated) return null;
  const s = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  return <span className="text-xs text-gray-400">Last updated {s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`}</span>;
}
```

---

## 7. Widget personalization

- Let users **reorder** dashboard widgets via drag-and-drop
- Let users **hide/show** widgets from a settings panel
- **Persist layout** to user profile (database) or `localStorage` for quick MVP
- If no saved layout exists → fall back to your default layout

### Copy-paste: DashboardGrid with stored layout config
```tsx
// components/dashboard/DashboardGrid.tsx
// [CUSTOMIZE] Replace WIDGET_REGISTRY with your actual widget components
import { useState } from "react";
interface WidgetConfig { id: string; visible: boolean; order: number }
type WidgetRegistry = Record<string, React.ComponentType>;
const WIDGET_REGISTRY: WidgetRegistry = {
  // [CUSTOMIZE] revenue: RevenueCard, users: UsersCard, activity: ActivityFeed
};
const STORAGE_KEY = "dashboard-layout";
function loadLayout(defaults: WidgetConfig[]): WidgetConfig[] {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : defaults; }
  catch { return defaults; }
}
function saveLayout(layout: WidgetConfig[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); }

export function DashboardGrid({ defaults }: { defaults: WidgetConfig[] }) {
  const [layout, setLayout] = useState<WidgetConfig[]>(() => loadLayout(defaults));
  const visible = layout.filter((w) => w.visible).sort((a, b) => a.order - b.order);
  const toggle = (id: string) => {
    const next = layout.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    setLayout(next); saveLayout(next);
  };
  return (
    <div>
      <details className="mb-4">
        <summary className="cursor-pointer text-sm text-gray-500">Customize dashboard</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {layout.map((w) => (
            <label key={w.id} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={w.visible} onChange={() => toggle(w.id)} className="rounded border-gray-300" />
              {w.id}
            </label>
          ))}
        </div>
      </details>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((w) => { const W = WIDGET_REGISTRY[w.id]; return W ? <W key={w.id} /> : null; })}
      </div>
    </div>
  );
}
```

---

## 8. Responsive dashboard behavior

| Element | Mobile (<640px) | Tablet (768px+) | Desktop (1280px+) |
|---------|----------------|-----------------|-------------------|
| Navigation | Bottom tab bar | Collapsible sidebar | Fixed sidebar |
| KPI cards | Horizontal scroll | 2-column grid | 3-4 column grid |
| Charts | Full-width stacked | 2-column grid | Bento grid |
| Tables | Card view per row | Horizontal scroll | Full table |
| Date selector | Dropdown | Inline pills | Inline pills + comparison |

### Copy-paste: responsive dashboard shell
```tsx
// components/dashboard/ResponsiveShell.tsx
// [CUSTOMIZE] Swap navigation components for your design system
interface ResponsiveShellProps { sidebar: React.ReactNode; children: React.ReactNode }
export function ResponsiveShell({ sidebar, children }: ResponsiveShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white md:block">
        {sidebar}
      </aside>
      <main className="px-4 py-6 md:ml-64 md:px-6 lg:px-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white py-2 md:hidden">
        {/* [CUSTOMIZE] Add your mobile nav items */}
        <span className="text-xs text-gray-500">Home</span>
        <span className="text-xs text-gray-500">Analytics</span>
        <span className="text-xs text-gray-500">Settings</span>
      </nav>
    </div>
  );
}
```

---

## 9. Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|--------------|-------------|-----|
| Showing 20+ metrics on one screen | Cognitive overload — users can't focus | Limit to 7 +/- 2; use progressive disclosure |
| No date range context on metrics | Users don't know what period a number covers | Always show active date range near KPIs |
| Full-page spinner while loading | Feels slow, blocks all interaction | Use skeleton loaders per card |
| Charts without axis labels | Users guess what axes mean | Always label both axes with units |
| Real-time data without stale indicator | Users trust stale numbers | Show "Last updated X ago" near live data |
| No empty state for new users | Blank screen feels broken | Add welcome message with clear first action |
| Color-only status indicators | Inaccessible to colorblind users (8% of men) | Pair color with icons, arrows, or text |
| Non-responsive dashboard | Horizontal scroll on mobile | Use responsive grid, card views for tables |

---

## Companion tools

| Tool | Use for |
|------|---------|
| `anthropics/claude-code` → `frontend-design` | Dashboard visual design |
| `bencium/bencium-marketplace` → `controlled-ux-designer` | Dashboard color system and typography |
| Recharts / Tremor | Chart components for React dashboards |
| `react-grid-layout` | Drag-and-drop widget reordering |
| `date-fns` / `dayjs` | Date range calculations and formatting |
