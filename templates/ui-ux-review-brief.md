# UI/UX Review Brief

> Complete this brief before running a design self-review (see `skills/02-product-design/references/design-audit-workflow.md`) or before running `/launch-audit`. It captures everything a reviewer needs to understand your project's current UI/UX state.

**Cross-reference:** After completing this brief, use the [Design Audit Workflow](../skills/02-product-design/references/design-audit-workflow.md) to systematically review your UI across 14 dimensions.

---

## Experience-level guidance

<!-- beginner -->
**Fill sections 1, 2, 3, 6, 10.** The audit workflow will help you discover the rest. Don't worry about design tokens or animation inventories yet — focus on mapping your routes and states.

<!-- intermediate -->
**Fill everything except section 8.** Focus on section 6 (state handling matrix) — that's where most gaps hide. Empty states and error states are the most commonly missed.

<!-- senior -->
**Fill the whole thing.** Pay extra attention to section 4 (design tokens) — inconsistent tokens are the #1 design system issue in codebases that "look fine" but feel off.

---

## Copy-paste template

Copy this into a new markdown file in your project (e.g., `.claude/ui-ux-review-brief.md`) and fill it in.

```markdown
# UI/UX Review Brief — [Project Name]
**Date:** YYYY-MM-DD
**Completed by:** [Your name]
**Purpose:** [Pre-launch audit / Redesign assessment / Investor demo prep]

---

## 1. Product Overview

| Field | Value |
|-------|-------|
| What it does | [One sentence: "A SaaS that helps X do Y"] |
| Target user | [Who uses this? Be specific: "Solo founders building their first SaaS"] |
| Stage | [MVP / Beta / Public / Established] |
| Team size | [Solo / 2-3 / Small team / Larger team] |
| Designer on team? | [Yes — dedicated / Yes — part-time / No — developer-designed] |
| Competitors | [2-3 competitors and how your UI differs from theirs] |

## 2. Tech Stack

| Layer | Tool |
|-------|------|
| Framework | [e.g., Next.js 14 App Router] |
| Styling | [e.g., Tailwind CSS v3.4] |
| Fonts | [e.g., Inter (body), Newsreader (headings)] |
| Icons | [e.g., Lucide React / Heroicons / custom SVG] |
| UI library | [e.g., shadcn/ui / Radix / Headless UI / none] |
| Theming | [e.g., CSS variables + next-themes / Tailwind dark: / single theme] |
| Animation | [e.g., Framer Motion / CSS transitions only / none] |

## 3. Route Inventory

| Route | Purpose | Auth required | Key elements |
|-------|---------|--------------|-------------|
| `/` | Landing page | No | Hero, features, pricing CTA |
| `/login` | Authentication | No | Email/password form, OAuth buttons |
| `/dashboard` | Main app view | Yes | KPI cards, activity feed, sidebar nav |
| `/settings` | User preferences | Yes | Profile form, billing, notifications |
| [CUSTOMIZE: add all routes] | | | |

## 4. Design Tokens

### Colors (per theme)

| Token | Light theme | Dark theme |
|-------|------------|------------|
| `--bg` | [e.g., #FFFFFF] | [e.g., #0D1117] |
| `--text` | [e.g., #1A1A1A] | [e.g., #E5E5E5] |
| `--text-muted` | [e.g., #737373] | [e.g., #A3A3A3] |
| `--primary` | [e.g., #2563EB] | [e.g., #3B82F6] |
| `--surface` | [e.g., #F9FAFB] | [e.g., #1F2937] |
| `--border` | [e.g., #E5E7EB] | [e.g., #374151] |
| `--error` | [e.g., #DC2626] | [e.g., #EF4444] |
| `--success` | [e.g., #16A34A] | [e.g., #22C55E] |
| [CUSTOMIZE: add remaining tokens] | | |

### Typography Scale

| Name | Size | Weight | Line height | Usage |
|------|------|--------|-------------|-------|
| `text-xs` | [e.g., 12px] | 400 | 1.5 | Captions, labels |
| `text-sm` | [e.g., 14px] | 400 | 1.5 | Secondary text |
| `text-base` | [e.g., 16px] | 400 | 1.6 | Body text |
| `text-lg` | [e.g., 20px] | 600 | 1.4 | Section headings |
| `text-xl` | [e.g., 24px] | 700 | 1.3 | Page headings |
| `text-2xl` | [e.g., 32px] | 700 | 1.2 | Hero text |
| [CUSTOMIZE: add more sizes if used] | | | | |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| Base unit | [e.g., 4px / 8px] | |
| `--space-1` | [e.g., 4px] | Tight gaps |
| `--space-2` | [e.g., 8px] | Default gap |
| `--space-4` | [e.g., 16px] | Card padding |
| `--space-8` | [e.g., 32px] | Section gaps |
| `--space-16` | [e.g., 64px] | Page sections |

### Shadows & Radii

| Token | Value |
|-------|-------|
| Border radius (buttons) | [e.g., 8px / rounded-lg] |
| Border radius (cards) | [e.g., 12px / rounded-xl] |
| Border radius (inputs) | [e.g., 6px / rounded-md] |
| Shadow (cards) | [e.g., 0 1px 3px rgba(0,0,0,0.1)] |
| Shadow (modals) | [e.g., 0 25px 50px rgba(0,0,0,0.25)] |

## 5. Component Inventory

| Component | Purpose | Variants/Sizes | Location |
|-----------|---------|----------------|----------|
| Button | Primary actions | primary, secondary, ghost, danger / sm, md, lg | `components/ui/button.tsx` |
| Input | Form fields | text, email, password, textarea / with label, with error | `components/ui/input.tsx` |
| Card | Content containers | default, bordered, elevated | `components/ui/card.tsx` |
| Modal | Overlay dialogs | sm, md, lg / with footer, without | `components/ui/modal.tsx` |
| [CUSTOMIZE: list all reusable components] | | | |

## 6. State Handling Matrix

For each major screen, mark which states are implemented:

| Screen | Empty | Loading | Populated | Error | Offline | Notes |
|--------|-------|---------|-----------|-------|---------|-------|
| Dashboard | [yes/no] | [yes/no] | [yes/no] | [yes/no] | [n/a] | |
| Project list | [yes/no] | [yes/no] | [yes/no] | [yes/no] | [n/a] | |
| Settings | [n/a] | [yes/no] | [yes/no] | [yes/no] | [n/a] | |
| [CUSTOMIZE: add all data-driven screens] | | | | | | |

## 7. Accessibility Status

### Done
- [ ] All images have alt text
- [ ] All form inputs have associated labels
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip-to-content link present
- [ ] Semantic HTML landmarks (main, nav, header, footer)
- [ ] Heading hierarchy (one h1 per page, no skipped levels)
- [ ] Reduced motion respected (`prefers-reduced-motion`)
- [ ] Keyboard navigation works through entire app

### Known Gaps
- [CUSTOMIZE: list known accessibility issues]

## 8. Animation Inventory

| Animation | Trigger | Duration | Easing | Reduced motion handled? |
|-----------|---------|----------|--------|------------------------|
| Page transitions | Route change | 300ms | ease-out | [yes/no] |
| Modal enter/exit | Open/close | 200ms | ease-in-out | [yes/no] |
| Button hover | Hover | 150ms | ease | [n/a — CSS only] |
| Skeleton pulse | Data loading | 2000ms loop | ease-in-out | [yes/no] |
| [CUSTOMIZE: list all animations] | | | | |

## 9. Key Measurements

| Measurement | Value |
|-------------|-------|
| Sidebar width (expanded) | [e.g., 280px] |
| Sidebar width (collapsed) | [e.g., 64px] |
| Header height | [e.g., 64px] |
| Content max-width | [e.g., 1200px] |
| Mobile breakpoint | [e.g., 640px] |
| Tablet breakpoint | [e.g., 768px] |
| Card padding | [e.g., 24px] |
| Page padding (desktop) | [e.g., 32px] |
| Page padding (mobile) | [e.g., 16px] |
| Touch target minimum | [e.g., 44px] |

## 10. Known Issues

| # | Severity | Description | Affected pages |
|---|----------|-------------|---------------|
| 1 | Critical | [e.g., Login form has no error state] | /login |
| 2 | Major | [e.g., Dashboard empty state is a blank white page] | /dashboard |
| 3 | Minor | [e.g., Footer links are misaligned on mobile] | All pages |
| [CUSTOMIZE: add all known UI/UX issues] | | | |

## 11. Screenshot Notes

[CUSTOMIZE: Choose one]
- Screenshots are in `/docs/screenshots/` directory
- Screenshots are in Figma at [link]
- No screenshots yet — will capture during audit
- Using browser DevTools responsive mode for review
```
