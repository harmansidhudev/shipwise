# Design Audit Workflow

> Self-review your UI before shipping. A structured approach to catching visual,
> interaction, and accessibility issues without needing a designer.

## When to use

Run a design audit:
- Before your first public launch
- Before sharing with investors or beta users
- After a major redesign or feature addition
- Quarterly, for established products

---

## 1. The 14-dimension audit

Every UI can be evaluated across these 14 dimensions. For each one, use the quick test to check in 30 seconds, then dig into common failures if something feels off.

| # | Dimension | What to check | Quick test (30 sec) | Severity if missing |
|---|-----------|--------------|---------------------|---------------------|
| 1 | Visual Hierarchy | Primary CTA is the most prominent element. Eye flows in intended order. | Squint at the page. Can you still tell what the primary action is? If not, hierarchy needs work. | High — users don't know what to do |
| 2 | Typography | Consistent scale. Readable line lengths (45-90 chars). Proper heading hierarchy (h1→h2→h3). | Count your font sizes. If you have more than 6-8 distinct sizes, your scale is inconsistent. | Medium — looks unprofessional |
| 3 | Color & Contrast | WCAG AA compliance (4.5:1 normal text). Consistent palette. Color not used as sole information carrier. | Paste your muted text color and background into a contrast checker. If the ratio is below 4.5:1, you have a failure. | Critical — unusable for low-vision users, legal risk |
| 4 | Spacing & Alignment | Consistent spacing rhythm. Elements aligned to grid. No orphaned whitespace. | Toggle a CSS grid overlay (browser dev tools → "Show grid"). Are elements snapping to consistent tracks? | Medium — looks amateur |
| 5 | Responsive Behavior | Works at 375px, 768px, 1440px. No horizontal scroll. No content loss on mobile. | Resize your browser to 375px wide. Is anything cut off, overflowing, or impossible to tap? | High — mobile users can't use it |
| 6 | Interactive States | Every button has hover/active/focus/disabled states. Links distinguishable from text. | Tab through the page with your keyboard. Can you see where focus is at all times? | High — keyboard/a11y users are blocked |
| 7 | Empty States | Every list/grid/dashboard has an empty state. Clear guidance on next action. | Delete all data in a test account. Is any page completely blank with no guidance? | High — new users see nothing |
| 8 | Loading States | Visual feedback within 100ms of user action. Skeleton screens for data-heavy views. | Throttle your network to "Slow 3G" in dev tools. Click a button that loads data. Do you see feedback or a blank pause? | Medium — app feels broken |
| 9 | Error States | Errors are human-readable. They tell the user what to do next. Visually distinct. Recoverable. | Disconnect from the internet and submit a form. Is the error message helpful or a stack trace? | High — users get stuck |
| 10 | Navigation & Wayfinding | User always knows where they are. Can get back. No dead ends. | Start on any page and try to get "home" in one click. If you can't, navigation has a gap. | High — users feel lost |
| 11 | Forms & Inputs | Labels associated. Validation timing appropriate. Error messages specific. | Submit a form with invalid data. Does it tell you which field is wrong and how to fix it? | High — conversion killer |
| 12 | Accessibility Basics | Skip link. Focus visible. ARIA on interactive elements. Reduced motion respected. | Press Tab once on your page. Does a "Skip to content" link appear? If not, it's missing. | Critical — legal + usability |
| 13 | Content Quality | CTAs are specific (not "Click here"). Headings scannable. No lorem ipsum in production. | Read only the headings on a page. Can you understand what the page does without reading body text? | Medium — poor communication |
| 14 | Performance Perception | Page feels fast. Above-fold content loads first. No layout shifts. | Hard refresh (Cmd+Shift+R). Does content paint smoothly top-to-bottom, or do elements jump around? | Medium — feels unpolished |

---

### Dimension details

#### 1. Visual Hierarchy

**Common failures:**
- Multiple elements competing for attention (two large bold headings, multiple colored buttons)
- Primary CTA is the same visual weight as secondary actions
- Wall-of-text with no visual breaks (no headings, no whitespace, no emphasis)

**Fix pattern:**
```css
/* Make exactly ONE primary CTA stand out. Secondary actions are ghost/outline. */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  padding: 12px 24px;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 12px 24px;
}
```

#### 2. Typography

**Common failures:**
- More than 2 font families (1 is ideal, 2 is the max)
- Line lengths exceeding 90 characters on desktop (makes reading exhausting)
- Heading levels skipped (h1 → h3 with no h2)

**Fix pattern:**
```css
/* Constrain line length for readability */
.prose {
  max-width: 65ch; /* ~65 characters per line */
}

/* Type scale using a 1.25 ratio (major third) */
:root {
  --text-xs: 0.8rem;    /* 12.8px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.563rem;  /* 25px */
  --text-2xl: 1.953rem; /* 31.2px */
  --text-3xl: 2.441rem; /* 39px */
}
```

#### 3. Color & Contrast

**Common failures:**
- Muted/secondary text on light backgrounds fails WCAG AA (need ≥4.5:1)
- Placeholder text in inputs too light to read
- Info conveyed only by color (red = error, green = success) without icon or text

**Fix pattern:**
```css
/* Ensure muted text passes contrast. #737373 on white = 4.6:1 (passes AA). */
:root {
  --color-muted: #737373; /* not #999 (2.8:1 — fails) */
}

/* Never rely on color alone — add an icon */
.error-message {
  color: var(--color-error);
}
.error-message::before {
  content: "⚠ "; /* Icon reinforces meaning beyond color */
}
```

See the [Contrast Ratio Quick Reference](#5-contrast-ratio-quick-reference) at the end of this doc.

#### 4. Spacing & Alignment

**Common failures:**
- Mixing arbitrary pixel values (13px here, 17px there) instead of a scale
- Elements not aligned to the same vertical axis
- Inconsistent padding between cards/sections

**Fix pattern:**
```css
/* 4px spacing scale — use only these values */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

#### 5. Responsive Behavior

**Common failures:**
- Tables overflow on mobile with no horizontal scroll or alternative layout
- Navigation hamburger menu doesn't work or covers content
- Touch targets smaller than 44px (frustrating on mobile)

**Fix pattern:**
```css
/* Ensure touch targets meet 44px minimum */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Responsive table: stack on mobile */
@media (max-width: 640px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  thead { display: none; }
  td::before {
    content: attr(data-label);
    font-weight: 600;
  }
}
```

#### 6. Interactive States

**Common failures:**
- Buttons have no visible hover state (feels unresponsive)
- Focus indicator removed (`outline: none`) with no replacement
- Disabled buttons have no visual distinction from enabled ones

**Fix pattern:**
```css
/* Global focus indicator — catches everything */
*:focus-visible {
  outline: 2px solid var(--color-primary, #2563eb);
  outline-offset: 2px;
}

/* Button state coverage */
.btn {
  transition: background-color 150ms ease, transform 100ms ease;
}
.btn:hover { filter: brightness(0.95); }
.btn:active { transform: scale(0.98); }
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

#### 7. Empty States

**Common failures:**
- Page renders a blank area when there's no data
- Empty state exists but has no call-to-action (user doesn't know what to do next)
- Same generic empty state used everywhere ("No data" with no context)

**Fix pattern:**
```tsx
// [CUSTOMIZE] Replace icon, title, description, and CTA for each page context
function EmptyState({ icon, title, description, ctaLabel, onAction }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-gray-400">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      <button onClick={onAction} className="mt-4 btn btn-primary">
        {ctaLabel}
      </button>
    </div>
  );
}
```

#### 8. Loading States

**Common failures:**
- No feedback between click and result (user clicks again, causing duplicate actions)
- Full-page spinner blocking all interaction instead of skeleton showing layout
- Loading indicator appears after a noticeable delay (should be <100ms)

**Fix pattern:**
```tsx
// [CUSTOMIZE] Adjust the skeleton shape to match your actual content layout
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-5/6 rounded bg-gray-200" />
    </div>
  );
}
```

#### 9. Error States

**Common failures:**
- Raw error codes or stack traces shown to users
- Generic "Something went wrong" with no recovery action
- Error disappears before user can read it

**Fix pattern:**
```tsx
// [CUSTOMIZE] Adjust messaging, styling, and retry logic for your app
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="font-medium text-red-800">Something didn't work</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <button onClick={onRetry} className="mt-3 text-sm font-medium text-red-700 underline">
        Try again
      </button>
    </div>
  );
}
```

#### 10. Navigation & Wayfinding

**Common failures:**
- No breadcrumbs on deep pages (user doesn't know where they are)
- Logo doesn't link back to home/dashboard
- Dead-end pages with no navigation out

**Fix pattern:**
```tsx
// [CUSTOMIZE] Replace breadcrumb items with your route structure
function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex items-center gap-1">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <a href={item.href} className="hover:text-gray-700">{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

#### 11. Forms & Inputs

**Common failures:**
- Inputs without `<label>` or `aria-label` (screen readers can't identify the field)
- Validation only on submit (user fills 10 fields, then sees errors at the top)
- Error messages say "Invalid input" instead of "Email must include @"

**Fix pattern:**
```tsx
// [CUSTOMIZE] Adapt validation logic and error messages to your fields
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby={error ? "email-error" : undefined}
    aria-invalid={!!error}
    className="mt-1 block w-full rounded border px-3 py-2"
  />
  {error && (
    <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
      {error}
    </p>
  )}
</div>
```

#### 12. Accessibility Basics

**Common failures:**
- No skip navigation link (keyboard users must tab through the entire nav on every page)
- `outline: none` in CSS reset with no replacement focus indicator
- Animations play for users who have "Reduce motion" enabled in OS settings

**Fix pattern:**
```html
<!-- Skip link — first element in <body> -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">
  Skip to main content
</a>

<!-- Main content landmark -->
<main id="main-content">
  <!-- page content -->
</main>
```

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 13. Content Quality

**Common failures:**
- CTAs say "Click here" or "Submit" instead of specific actions ("Create project", "Send invite")
- Headings don't describe the content beneath them (generic: "Overview", "Details")
- Lorem ipsum or placeholder text left in production

**Fix pattern:**
```
Bad:  "Click here to learn more"
Good: "Read the setup guide"

Bad:  "Submit"
Good: "Create account"

Bad:  "Error"
Good: "We couldn't save your changes. Check your connection and try again."
```

#### 14. Performance Perception

**Common failures:**
- Layout shift when fonts load (flash of unstyled text pushes content down)
- Images load without dimensions, causing reflow
- Heavy JavaScript bundle blocks above-fold rendering

**Fix pattern:**
```html
<!-- Prevent font-load layout shift -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

<!-- Prevent image layout shift — always set dimensions -->
<img src="/hero.webp" width="800" height="400" alt="Hero image"
     style="aspect-ratio: 800/400; width: 100%; height: auto;" />
```

---

## 2. The 3-phase audit process

Don't fix everything at once. Work in three passes ordered by user impact.

### Phase 1: Critical (fix before any user sees it)

These issues make your app unusable or create legal risk.

| Dimension | What to check | Why it's critical |
|-----------|--------------|-------------------|
| 3. Color & Contrast | Run every text/background pair through a contrast checker | Low-vision users can't read your content. Legal liability under ADA/EAA. |
| 12. Accessibility Basics | Verify skip link, focus indicators, form labels | Keyboard and screen reader users are completely blocked without these. |
| 7. Empty States | Check every list, grid, and dashboard page with zero data | New users and trial users will see empty states first — a blank page means they leave. |
| 5. Responsive | Load on a 375px viewport and tap every interactive element | Mobile traffic is 50%+ for most SaaS. Broken mobile = lost half your users. |
| 11. Forms & Inputs | Submit every form with invalid data | Forms without labels are invisible to screen readers. Bad validation kills conversion. |
| 9. Error States | Disconnect network, trigger API errors | Users hit errors constantly. "Something went wrong" with no recovery is a dead end. |

### Phase 2: Refinement (fix before sharing with stakeholders)

These issues make your app feel unfinished.

| Dimension | What to check | Why it matters |
|-----------|--------------|----------------|
| 6. Interactive States | Tab through every page, hover every button | Missing hover/focus states make the app feel dead and block keyboard users. |
| 8. Loading States | Throttle network, trigger every data-loading flow | Without loading feedback, users think the app is broken and click again. |
| 10. Navigation | Try to reach "home" from every page, check for dead ends | Lost users don't convert. Navigation dead ends increase bounce rate. |
| 13. Content Quality | Read every heading and CTA. Any "Click here" or "Submit"? | Vague CTAs reduce click-through. Generic headings hurt scannability and SEO. |
| 12. Accessibility | Check heading hierarchy, ARIA landmarks, touch targets | Screen readers use headings to navigate. Missing landmarks = no page structure. |

### Phase 3: Polish (fix for production quality)

These issues separate "functional" from "professional."

| Dimension | What to check | Why it elevates quality |
|-----------|--------------|------------------------|
| 1. Visual Hierarchy | Squint test every page. One clear primary action? | Clear hierarchy reduces cognitive load and increases conversion. |
| 2. Typography | Count distinct font sizes. Check line lengths. | Consistent typography signals professionalism and improves readability. |
| 4. Spacing & Alignment | Toggle grid overlay. Consistent rhythm? | Aligned elements look intentional. Inconsistent spacing looks careless. |
| 14. Performance | Hard refresh, watch for layout shifts and loading jank | Smooth loading builds trust. Jank makes the app feel cheap. |

---

## 3. Audit template

Copy this template into a new markdown file for each audit. Fill in findings as you work through the three phases.

```markdown
# UI/UX Audit — [Project Name]
**Date:** YYYY-MM-DD
**Auditor:** [Your name]
**Pages audited:** [list every page/route you reviewed]

## Phase 1: Critical
| Dimension | Status | Finding | Fix | Effort |
|-----------|--------|---------|-----|--------|
| Color contrast | ⚠ | Muted text (#999) on white = 2.8:1 | Darken to #737373 (4.6:1) | 5 min |
| Accessibility basics | ✗ | No skip-to-content link | Add skip link as first element in body | 10 min |
| Empty states | ✗ | /dashboard shows blank when no data | Add EmptyState component with CTA | 30 min |
| Responsive | ⚠ | Nav hamburger overlaps content at 375px | Fix z-index and add overflow-hidden | 15 min |
| Forms & inputs | ✗ | 3 inputs missing labels | Add htmlFor + label to each | 10 min |
| Error states | ⚠ | API errors show raw JSON | Wrap in user-friendly ErrorState component | 20 min |

## Phase 2: Refinement
| Dimension | Status | Finding | Fix | Effort |
|-----------|--------|---------|-----|--------|
| Interactive states | ⚠ | No focus indicator (outline: none in reset) | Add global :focus-visible rule | 5 min |
| Loading states | ✗ | /projects page shows blank during fetch | Add Skeleton component | 20 min |
| Navigation | ✓ | Logo links home, breadcrumbs on all deep pages | — | — |
| Content quality | ⚠ | 2 buttons say "Submit" | Change to "Save changes" / "Send invite" | 5 min |

## Phase 3: Polish
| Dimension | Status | Finding | Fix | Effort |
|-----------|--------|---------|-----|--------|
| Visual hierarchy | ✓ | Primary CTA clearly stands out | — | — |
| Typography | ⚠ | 9 distinct font sizes, some unused | Consolidate to 7-size scale | 15 min |
| Spacing | ⚠ | Cards use 14px padding, sidebar uses 16px | Standardize to var(--space-4) | 10 min |
| Performance | ✗ | Layout shift from web font loading | Add font-display: swap + preload | 10 min |

## Summary
- **Critical issues:** X
- **Refinement items:** Y
- **Polish items:** Z
- **Estimated total effort:** N hours
```

**Status legend:** ✓ Pass | ⚠ Partial (needs improvement) | ✗ Fail (must fix)

---

## 4. Automated checks

These are checked automatically when you run `/launch-audit`:
- Color contrast ratio calculation
- `prefers-reduced-motion` support detection
- Skip navigation link presence
- Focus indicator styling
- Form label associations
- Empty/loading state component detection
- Heading hierarchy validation
- ARIA landmark presence
- Touch target sizing

For a **full visual audit** (responsive screenshots, theme comparisons, animation review, content strategy), you'll need manual review using the 14-dimension table above. The automated checks catch code-level issues; the dimensions cover what only human eyes can evaluate.

---

## 5. Contrast ratio quick reference

| Ratio | WCAG AA (normal text) | WCAG AA (large text) | WCAG AAA |
|-------|----------------------|---------------------|----------|
| 3:1   | Fail                 | Pass                | Fail     |
| 4.5:1 | Pass                 | Pass                | Fail     |
| 7:1   | Pass                 | Pass                | Pass     |

Large text = 18px regular OR 14px bold.

**Common failing pairs (test these first):**

| Pair | Ratio | AA Normal | AA Large |
|------|-------|-----------|----------|
| Gray `#999` on white `#fff` | 2.8:1 | Fail | Fail |
| Light gray `#ccc` on white `#fff` | 1.6:1 | Fail | Fail |
| Brand blue `#4A90D9` on white | 3.5:1 | Fail | Pass |
| Dark gray `#555` on white | 7.5:1 | Pass | Pass |
| Gray `#737373` on white | 4.6:1 | Pass | Pass |
| White `#fff` on dark `#1a1a1a` | 17.4:1 | Pass | Pass |

**WCAG contrast formula (for reference):**
```
Relative luminance:
  L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin

  where R_lin = (R/255 <= 0.04045) ? R/255/12.92 : ((R/255 + 0.055)/1.055)^2.4

Contrast ratio:
  CR = (L_lighter + 0.05) / (L_darker + 0.05)
```

---

## 6. Experience-level guidance

<!-- beginner -->
**Start with Phase 1 only.** Open your site on your phone — if anything looks broken, that's your first fix. Then check your text colors at [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/). Enter your text color and background color — it will tell you pass or fail. Those two steps catch 60% of critical issues. Come back to Phase 2 and 3 when Phase 1 is clean.

<!-- intermediate -->
**Run all three phases.** Use the audit template above — copy it into a markdown file and fill it in as you go. Focus on the dimensions you've never explicitly thought about — most intermediate developers have decent visual design but miss empty states, error message copy, and accessibility basics (skip links, focus indicators, heading hierarchy). The quick tests will surface issues in under 10 minutes.

<!-- senior -->
**You'll spot most issues by feel, but run the numbers.** Do use the contrast checker and the automated `/launch-audit` scan. The most common senior mistake is assuming accessibility is fine because it "looks accessible." Run the actual contrast ratios, verify heading hierarchy in the DOM (not just visually), and check that your skip link works. The audit template is useful for documenting findings and delegating fixes to junior team members.
