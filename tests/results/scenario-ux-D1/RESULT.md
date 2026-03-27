# Scenario D1: B2B SaaS Dashboard Design

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 05 (fullstack-development)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that skill 05 + dashboard-ux-patterns reference doc provides comprehensive guidance when a mid-level developer asks for a full B2B SaaS dashboard design covering layout, KPIs, empty states, responsiveness, and mobile behavior.

## Test Prompt
```
Design a dashboard for a B2B SaaS. The user needs to see key metrics (revenue, active users, churn rate), recent activity, and quick actions. The dashboard should work on mobile too.
```

## Expected Behavior
- Recommends bento grid or structured layout pattern for KPIs + charts
- Provides KPI card pattern with trend indicator (arrow + percentage + comparison period)
- Addresses zero-data / empty state for new dashboards
- Specifies responsive behavior across breakpoints (mobile single-column, tablet 2-col, desktop 3-4 col)
- Includes or references date range selector
- Describes mobile single-column stacking with bottom tab bar navigation

## Actual Behavior

### Trigger analysis
The prompt contains "dashboard" which matches skill 05's trigger list ("dashboard", "dashboard layout", "KPI card", "bento grid"). Skill 05 (fullstack-development) fires. The prompt also touches on responsive design, which is a secondary match for skill 02 (product-design) via "responsive design" and "mobile-first" triggers, but skill 05 is the primary match since the user is asking to build/design a dashboard (implementation-focused).

### Reference doc coverage check

**Bento grid / structured layout:**
Covered. Section 1 "Dashboard layout patterns" provides a decision framework: "What type of dashboard? Analytics/metrics (KPIs + charts) -> Bento grid: mixed-size cards, responsive." The decision tree correctly maps a B2B SaaS with KPIs + charts to bento grid. A copy-paste BentoGrid component with responsive Tailwind classes (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) is provided.

**KPI cards with trend:**
Covered. Section 2 "KPI card patterns" specifies every KPI card needs: "metric name, current value, trend indicator (arrow + percentage), comparison period, and optional sparkline area." Formatting table covers currency, percentage, count, and duration types. Copy-paste KPICard component includes trend direction (up/down/flat), percentage, comparisonLabel, and aria-label for accessibility. Color-blind safety addressed: "Never use color alone -- always pair with arrows."

**Zero-data state:**
Covered. Section 3 "Zero-data / empty dashboard state" distinguishes two variants: "If user is brand new (no data ever) -> show welcome state with sample data and a call to action" and "If user has data but none for selected period -> show no-data state with hint to change filters." Copy-paste DashboardEmptyState component implements both variants with `first-time` and `no-data` props.

**Responsive behavior specified:**
Covered. Section 8 "Responsive dashboard behavior" provides a breakpoint table with behavior for Navigation, KPI cards, Charts, Tables, and Date selector across Mobile (<640px), Tablet (768px+), and Desktop (1280px+). Copy-paste ResponsiveShell component implements sidebar (hidden on mobile) + bottom tab bar (visible on mobile only).

**Date range:**
Covered. Section 4 "Date range selector" provides preset options (Today, 7d, 30d, 90d, YTD, Custom), persistence via localStorage, and a comparison toggle. Copy-paste DateRangeSelector component is provided.

**Mobile single-column:**
Covered. The responsive behavior table shows Mobile (<640px): KPI cards as "Horizontal scroll", Charts as "Full-width stacked", Tables as "Card view per row", Navigation as "Bottom tab bar." The ResponsiveShell component implements `md:hidden` bottom nav and `md:ml-64` sidebar layout.

## Verdict
PASS

## Findings
### Positive
- All six validation checkboxes are directly covered by the reference doc with both guidance and copy-paste code
- The decision framework in Section 1 naturally guides the user to the correct layout pattern (bento grid) for this use case
- Responsive behavior is specified at a granular per-element level across three breakpoints
- Accessibility is addressed (ARIA labels, color-blind safe trend indicators)
- Anti-patterns section (Section 9) warns against common mistakes like full-page spinners, no empty state, and color-only indicators

### Gaps (if any)
- The "recent activity" part of the prompt (activity feed / timeline component) is not covered by a dedicated pattern in the reference doc. The bento grid can hold an activity widget, but no ActivityFeed component template is provided. This is a minor gap since the user asked about dashboard structure, not a specific activity feed implementation.
- Quick actions pattern is not explicitly addressed. The doc covers layout, KPIs, empty states, and responsiveness, but does not have a "quick actions" card or shortcut pattern. Again minor since the bento grid accommodates this as a widget.
