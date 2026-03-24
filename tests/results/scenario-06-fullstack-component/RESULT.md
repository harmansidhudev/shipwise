# Scenario 6: Fullstack Development — React Component Architecture

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 05-fullstack-development (primary); 04-tech-architecture (negative check)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the fullstack-development skill auto-triggers on a React component architecture prompt, that the generated data table component includes all required states (loading skeleton, empty with CTA, error with retry, populated), that accessibility features are present, that the design token approach is followed, and that skill 04 (tech-architecture) does NOT co-trigger.

## Test Prompt
```
Create a reusable data table component with sorting, filtering, pagination,
and row selection. It should handle loading, empty, and error states. Make
it accessible.
```

## Expected Behavior
- Skill 05 auto-triggers on trigger words in prompt.
- Skill 04 does NOT co-trigger.
- Generated component follows atomic design classification from SKILL.md and `component-architecture.md`.
- All four states represented: loading skeleton, empty state with CTA, error state with retry action, populated table.
- Accessibility features: ARIA roles, keyboard navigation, focus management.
- Design tokens used via Tailwind classes (not hardcoded color values).
- Touch targets ≥ 44px on interactive elements.

## Actual Behavior

### Trigger analysis — skill 05

Cross-referencing the prompt against skill 05's frontmatter trigger list:

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "data table component" | "component" | YES — exact literal match |
| "filtering" | (none exact) | NO direct match |
| "pagination" | (none exact) | NO direct match |
| "sorting" | (none exact) | NO direct match |
| "row selection" | (none exact) | NO direct match |
| "loading, empty, and error states" | (none exact) | NO direct match |
| "accessible" | (none exact) | NO direct match |

**Skill 05 fires** — "component" is a literal trigger word and appears verbatim in "data table component". One match is sufficient.

However, only ONE trigger word matches. The other prompt terms ("sorting", "filtering", "pagination", "accessible") are not in skill 05's trigger list. This means the trigger coverage is minimal — the skill fires, but the connection between the prompt's intent and the trigger is a single word. If the user had phrased it "build me a sortable data grid with filtering" without using "component", the skill would NOT have triggered at all. The trigger coverage for component-related work is narrow.

### Trigger analysis — skill 04 (negative check)

Cross-referencing the prompt against skill 04's trigger list: "framework selection", "which framework", "database choice", "choose a database", "tech stack", "architecture decisions", "hosting", "where to host", "auth strategy", "authentication approach", "REST vs GraphQL", "API architecture", "pick a stack", "stack recommendations".

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "data table component" | (none) | NO |
| "sorting" | (none) | NO |
| "filtering" | (none) | NO |
| "pagination" | (none) | NO |
| "accessible" | (none) | NO |

**Skill 04 does NOT co-trigger.** Zero matches against skill 04's trigger list. This is correct behavior.

### Component architecture classification

The `component-architecture.md` decision framework asks:
```
What am I building?
├── A single, reusable UI primitive (Button, Input, Icon)? → Atom
├── A small group of atoms working together? → Molecule
├── A complex section with business logic (Header, DataTable)? → Organism
```

A data table with sorting, filtering, pagination, and row selection is explicitly listed as an example **Organism** in the reference doc ("Complex section with business logic (Header, InvoiceTable, Sidebar)"). The `component-architecture.md` reference even provides a copy-paste template for a DataTable-style organism (`InvoiceTable`):

```tsx
// features/invoices/components/InvoiceTable.tsx
export function InvoiceTable({ invoices, onView, isLoading }: InvoiceTableProps) {
  if (isLoading) { return <TableSkeleton rows={5} cols={4} />; }
  return ( <div className="overflow-x-auto rounded-lg border border-neutral-200"> ... </div> );
}
```

The template handles the `isLoading` state and renders a skeleton. The skill would classify the requested component as an Organism and generate it accordingly.

**SKILL.md atomic design table also lists organisms:** "Organisms — compose molecules. May connect to state." A sortable/filterable data table with row selection is squarely in the Organism bucket.

The compound component pattern mentioned in SKILL.md ("use when a component has multiple related parts that share implicit state") is relevant here — a DataTable with SelectionContext or SortContext would be a valid implementation. The reference provides a Tabs compound component as a template to draw from.

### State coverage check

The test prompt requests "loading, empty, and error states." Let's check each one against the skill's materials:

**Loading state:**
- `component-architecture.md` DataTable template explicitly checks `if (isLoading) { return <TableSkeleton rows={5} cols={4} />; }`.
- The `responsive-design-checklist.md` mentions skeleton loaders indirectly through table layout guidance.
- **Loading skeleton: PRESENT in template.**

**Empty state:**
- The `component-architecture.md` template does NOT show an empty state branch. The `InvoiceTable` template only handles `isLoading` then renders the table. There is no `if (invoices.length === 0)` branch with a CTA.
- SKILL.md does not mention empty states in its component architecture section.
- **Empty state with CTA: NOT covered in any reference doc.** The skill has no prescribed template for empty states. The model would improvise a `<EmptyState>` component, but there is no reference material to draw from.

**Error state:**
- The `error-handling-patterns.md` reference provides an `ErrorBoundary` component for React:
```tsx
export class ErrorBoundary extends Component<Props, State> {
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```
- This provides a class-based ErrorBoundary with a "Try again" retry button. However, this catches render errors, not async fetch errors (e.g., a failed API call to load table data). For async error state in a data table, the pattern would be `if (error) { return <ErrorState onRetry={refetch} />; }` — this pattern is NOT in the skill's templates.
- The `error-handling-patterns.md` decision framework mentions "React component → ErrorBoundary + toast for async errors" but provides no copy-paste template for the async inline error state pattern.
- **Error state with retry button: PARTIALLY covered.** ErrorBoundary template exists for render errors. Inline async error state (API error while fetching table data) has no prescribed template.

**Populated state:**
- The `component-architecture.md` template renders a full `<table>` with header and body rows when data is present.
- **Populated state: PRESENT in template.**

**Summary of state coverage:** 2 of 4 states have templates (loading skeleton, populated). Empty-with-CTA has no coverage at all. Inline async error-with-retry has no dedicated template (only class-based ErrorBoundary for render errors).

### Accessibility check

The test prompt explicitly says "Make it accessible."

**What `component-architecture.md` covers:**
- The Tabs compound component template uses semantic ARIA roles: `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`. This demonstrates the pattern for compound components.
- The DataTable template uses a semantic `<table>` element with `<thead>`, `<tbody>`, `<th>`, `<td>`. Semantic HTML for tables inherently conveys structure to screen readers.
- The Button atom template uses `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` — keyboard focus styles are present.
- **No explicit mention of `aria-sort` on sortable columns**, `aria-label` on selection checkboxes, `aria-live` for dynamic updates, or keyboard navigation for row selection (`Space` to select, `Arrow` to move). These are the accessibility requirements most specific to a data table.

**What `responsive-design-checklist.md` covers:**
- The "Touch target and accessibility checklist" section states minimum 44x44px touch targets:
```tsx
<button className="min-h-[44px] min-w-[44px] rounded-md px-4 py-2">Tap me</button>
```
- The pre-launch checklist includes: "Touch targets >= 44x44px", "Font sizes use rem, not px (for accessibility zoom)", "Test with browser zoom at 200%", "prefers-reduced-motion respected".
- The checklist does NOT mention ARIA attributes for interactive table elements.

**What is NOT covered anywhere in the skill's references:**
- `aria-sort="ascending"` / `aria-sort="descending"` on sortable `<th>` elements
- `aria-checked` on row selection checkboxes
- `aria-label` or `aria-labelledby` on the table itself
- `role="grid"` and `aria-rowcount` / `aria-colcount` for complex interactive tables
- Keyboard navigation within the table (arrow keys, Home/End for row navigation)
- `aria-live="polite"` region for announcing sort/filter changes to screen reader users

**The companion tool for accessibility** is listed in `component-architecture.md`:
```
`anthropics/claude-code` → `frontend-design` | Generating accessible component markup, ARIA attributes
```
This is a companion tool external to the skill itself — accessibility beyond semantic HTML is effectively delegated to a different tool.

**Accessibility verdict:** The skill surfaces basic patterns (semantic `<table>`, keyboard focus on buttons, 44px touch targets), but lacks ARIA guidance specific to interactive table features (sorting, selection). The prompt specifically asks for accessibility — the skill would produce a component that is partially accessible but missing table-specific ARIA attributes.

### Design token / Tailwind check

SKILL.md has a dedicated "Design token implementation" section:
```ts
export const tokens = {
  color: { primary: { 500: '#3b82f6' }, neutral: { 500: '#6b7280' }, ... },
  spacing: { xs: '0.25rem', sm: '0.5rem', ... },
};
```

The SKILL.md instructs to "consume via CSS custom properties or your framework's theme system." All templates in `component-architecture.md` use Tailwind utility classes that reference token-like values:
- `bg-primary-500`, `text-neutral-900`, `border-neutral-200` — semantic color names
- `px-4 py-3`, `text-sm`, `rounded-lg` — spacing and typography tokens
- NO hardcoded hex values (e.g., `#3b82f6`) appear in any template

The Button template uses `cva` (class-variance-authority) for variant management:
```tsx
const buttonVariants = cva('...', {
  variants: { variant: { primary: 'bg-primary-500 text-white', ... }, size: { md: 'h-10 px-4' } }
});
```

**Design token approach: PRESENT and consistently applied.** The fixture project (`tailwind.config.ts`) uses the same standard Tailwind breakpoints. The skill's templates would generate Tailwind class-based styling that aligns with the fixture.

One nuance: the SKILL.md `tokens.ts` example defines tokens as TypeScript objects, but the templates use them as Tailwind class suffixes (`bg-primary-500`, not `bg-[${tokens.color.primary[500]}]`). This implies the tokens must be registered in `tailwind.config.ts` as custom colors. This is implied but not explicitly scaffolded in the skill.

### Touch targets ≥ 44px check

The `responsive-design-checklist.md` explicitly prescribes 44x44px minimum touch targets:
```tsx
<button className="min-h-[44px] min-w-[44px] rounded-md px-4 py-2">Tap me</button>
```

For a data table, interactive elements include:
- Sort toggle buttons on column headers
- Row selection checkboxes
- Pagination controls (prev/next buttons)
- Filter inputs and clear buttons

The checklist item "Touch targets >= 44px" is in the pre-launch checklist, but the DataTable organism template in `component-architecture.md` does not show these constraints on column header buttons or checkboxes. The template uses `Button variant="ghost" size="sm"` for the action button in each row — the `sm` size variant is defined as `h-8 px-3`, which is 32px tall, below the 44px minimum.

**Bug:** The Button atom template defines `size: { sm: 'h-8 px-3' }` — 32px height (h-8 = 2rem = 32px). This is below the 44px touch target minimum specified in `responsive-design-checklist.md`. The skill's own templates are internally inconsistent: the responsive checklist requires ≥44px, but the Button's `sm` variant uses 32px. In a data table, small buttons (sort, row actions) would be generated using `size="sm"` and would fail the touch target check.

### Sorting and filtering implementation

The test prompt requests sorting and filtering. Neither SKILL.md nor any reference doc provides a pattern for:
- Client-side sort state management (`useState<{ column: string; direction: 'asc' | 'desc' }>`)
- Column header click handlers to toggle sort direction
- Filter input with debounced onChange
- Integration with TanStack Query for server-side sort/filter via query params

The `state-management-guide.md` reference uses TanStack Query (`useUsers(filters)`) as a pattern for API data, which would be the correct approach for server-side filtering. The `api-design-patterns.md` reference shows query params (`?sort=-createdAt&status=active`) on the list endpoint. These pieces exist but are not assembled into a DataTable component pattern anywhere in the skill.

The model would need to synthesize these patterns to produce a sortable/filterable table. The output would likely be functional but not drawn from a single cohesive reference.

### Row selection implementation

Row selection (checkboxes for multi-select) is not covered anywhere in the skill's references. The state management decision tree in SKILL.md would suggest `useState` (selection state used by one component) or `React Context` (if parent needs to access selected rows). No template exists.

### Pagination integration in components

The `state-management-guide.md` shows TanStack Query pagination via query params. The `api-design-patterns.md` shows the backend pagination response shape (`{ data, pagination: { nextCursor, hasMore, limit } }`). But neither shows a `<Pagination>` UI component template. The skill would improvise prev/next button logic but has no prescribed component for it.

## Verdict: PARTIAL

### Validation Checklist

- [x] **Skill 05 auto-triggers** — "component" is a literal trigger word in the prompt ("data table component"). Fires reliably.
- [ ] **Trigger coverage is robust** — Only ONE trigger word matches ("component"). If the prompt used "data grid" or "table" instead of "component", the skill would not trigger. Trigger list has a coverage gap for UI-centric prompts.
- [x] **Skill 04 does NOT co-trigger** — Zero matches against skill 04's trigger list. Confirmed.
- [x] **Component architecture guidance surfaces** — SKILL.md has a full atomic design section. `component-architecture.md` has a DataTable organism template. Correct classification (Organism) is specified with an example.
- [x] **Loading skeleton state** — Template explicitly handles `isLoading` → `<TableSkeleton>`. Present.
- [ ] **Empty state with CTA** — No template exists in any reference doc. Not covered.
- [ ] **Error state with retry** — No inline async error state template. Only a class-based ErrorBoundary for render errors. Async fetch error handling in a component is not prescribed.
- [x] **Populated state** — Table render with rows is present in the template.
- [ ] **Table-specific accessibility (ARIA)** — No `aria-sort`, no `aria-checked` for selection, no keyboard nav for rows. Basic semantic HTML (`<table>`) is present but interactive ARIA attributes for sortable/selectable tables are absent.
- [x] **Touch target ≥ 44px mentioned** — `responsive-design-checklist.md` prescribes this explicitly with a code example.
- [ ] **Touch target ≥ 44px in generated component** — Button `sm` variant (`h-8` = 32px) is below 44px minimum. The skill's own templates are internally inconsistent on this requirement.
- [x] **Design token approach (Tailwind, no hardcoded colors)** — All templates use semantic Tailwind classes (`bg-primary-500`, `text-neutral-900`). No raw hex values in any template. Consistently applied.
- [ ] **Sorting implementation template** — No prescribed pattern for sort state, column header click handlers, or sort direction toggles.
- [ ] **Filtering implementation template** — No prescribed pattern for filter input, debounce, or integration with query params.
- [ ] **Row selection implementation template** — No prescribed pattern anywhere in the skill.
- [ ] **Pagination UI component template** — No `<Pagination>` component template. API response shape is defined but the UI is not.

## Findings

### Positive
- Trigger fires reliably via "component" and the skill correctly classifies data tables as Organisms with reference to an InvoiceTable example.
- Skill 04 does not co-trigger — the trigger boundaries between architecture decisions and implementation are clean for this prompt.
- Design token approach is excellent: Tailwind semantic classes throughout, CVA for variant management, no hardcoded values. This would produce maintainable, theme-able code.
- The ErrorBoundary template in `error-handling-patterns.md` is a solid component-level error handling pattern that would wrap the data table correctly.
- SKILL.md's atomic design table gives the mid-level developer a clear mental model for where the component fits and what it should/should not do (Organisms "may connect to state" but delegate data fetching to Pages).

### Negative
- **Missing states:** Two of four required states lack templates. Empty-with-CTA is completely absent from all reference docs. Inline async error-with-retry is only partially covered (ErrorBoundary covers render errors, not fetch errors). A mid-level developer would improvise both, with no guarantee of consistency with design system patterns.
- **Accessibility gap for interactive tables:** The skill produces semantically correct HTML tables, but sortable/selectable tables require additional ARIA (`aria-sort`, `aria-checked`, keyboard nav). The skill has no guidance for this. "Make it accessible" is partially answered. The companion tool (`anthropics/claude-code` → `frontend-design`) would need to be invoked separately for complete accessibility coverage.
- **Trigger coverage is fragile:** Only "component" triggers this skill for component work. A developer asking to "build a data grid" or "create a sortable table" would not trigger skill 05. The trigger list should include "table", "grid", "UI element", and "data display" at minimum.
- **Touch target inconsistency:** The `responsive-design-checklist.md` mandates ≥44px, but the Button atom template's `sm` size is 32px (`h-8`). For a data table with small action buttons, the generated code would violate the skill's own accessibility standard.
- **Feature completeness for requested functionality:** Sorting, filtering, and row selection — three of the four major features requested in the prompt — have no reference templates. The skill covers the structural shell (table markup, skeleton, responsive layout) but not the interactive behaviors that make a data table useful.

### Marketing-Worthy Outputs
- [x] The atomic design classification + compound component pattern for complex UI is well-explained and would resonate with mid-level developers who've encountered spaghetti component trees.
- [x] The CVA-based Button variant system (`buttonVariants = cva(...)`) is a clean, production-grade pattern that developers often struggle to implement cleanly.
- [ ] A fully implemented sortable/filterable/accessible data table is NOT achievable from the skill's reference materials alone without significant model improvisation beyond what's documented.

## Bugs / Issues to File
- [ ] **BUG-06-A: Empty state template missing** — No reference doc covers the empty state pattern (empty data + call-to-action). This is one of the most common UI states in data-driven apps. Add an `EmptyState` atom template to `component-architecture.md`.
- [ ] **BUG-06-B: Inline async error state not covered** — `error-handling-patterns.md` covers `ErrorBoundary` for render errors but not the `if (error) return <InlineError onRetry={refetch} />` pattern for async data fetch errors. Add a template for inline error states with retry to `component-architecture.md` or `error-handling-patterns.md`.
- [ ] **BUG-06-C: Trigger list too narrow for component work** — "component" is the only trigger that catches React UI prompts. Add "table", "grid", "sortable", "filterable", "data display", "UI component" to the skill 05 trigger list.
- [ ] **BUG-06-D: Button sm variant violates 44px touch target rule** — `component-architecture.md` Button template defines `size: { sm: 'h-8 px-3' }` (32px height). `responsive-design-checklist.md` mandates ≥44px. Either increase `sm` to `h-11` (44px) or add a note that `sm` should not be used for mobile touch targets.
- [ ] **BUG-06-E: No ARIA guidance for interactive table features** — Neither `component-architecture.md` nor `responsive-design-checklist.md` covers `aria-sort`, `aria-checked`, keyboard navigation for table rows, or `aria-live` for dynamic table updates. Add an "Interactive table accessibility" section to `component-architecture.md`.
- [ ] **BUG-06-F: No sorting/filtering/selection templates** — Three of the four main features in the test prompt (sort, filter, row select) have no reference templates. Add pattern templates for: (1) controlled sort state with column headers, (2) debounced filter input, (3) multi-row selection with Select All.
