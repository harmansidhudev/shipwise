# Accessibility Design Checklist (WCAG 2.2 AA)

## When to use

Reference this checklist during the design phase, before any code is written. Fixing accessibility at design stage costs minutes; fixing it after development costs hours or days. Run through this checklist for every screen at mid-fi wireframe stage or higher. Re-audit after significant design changes.

## Decision framework

```
Is my design accessible?
│
├── Have I checked color contrast?
│   ├── Normal text (< 24px / < 18.5px bold): 4.5:1 minimum
│   ├── Large text (≥ 24px / ≥ 18.5px bold): 3:1 minimum
│   └── UI components & graphical objects: 3:1 minimum
│
├── Can users navigate without a mouse?
│   ├── Every interactive element reachable by Tab key
│   ├── Logical tab order (left-to-right, top-to-bottom)
│   ├── No keyboard traps (user can always Tab away)
│   └── Visible focus indicator on every focused element
│
├── Can users understand content without seeing it?
│   ├── Images have alt text (decorative images have alt="")
│   ├── Icons have text labels or aria-label
│   ├── Information is not conveyed by color alone
│   └── Form fields have visible labels (not just placeholders)
│
├── Are interactive elements large enough to tap?
│   ├── Touch targets ≥ 44x44 px (WCAG 2.5.8)
│   ├── Spacing between targets ≥ 8px
│   └── Inline links have adequate surrounding padding
│
└── Does the design respect user preferences?
    ├── Motion can be reduced (prefers-reduced-motion)
    ├── Text can be resized to 200% without breaking layout
    └── Dark mode / high contrast mode supported or planned
```

---

## Contrast requirements reference

| Element type | Minimum ratio | Example |
|-------------|---------------|---------|
| Normal text (< 24px) | **4.5:1** | #595959 on #FFFFFF = 5.9:1 (pass) |
| Large text (≥ 24px or ≥ 18.5px bold) | **3:1** | #767676 on #FFFFFF = 4.5:1 (pass) |
| UI components (borders, icons, form controls) | **3:1** | Input border must be visible against background |
| Non-text graphical objects | **3:1** | Chart lines, icons conveying information |
| Placeholder text | **4.5:1** recommended | Most default placeholders fail — use visible labels instead |
| Disabled elements | No requirement | But should still be visually distinguishable |

**Tools**: WebAIM Contrast Checker, Figma A11y plugin, Chrome DevTools color picker (shows contrast ratio inline).

---

## Touch target reference

| Target type | Minimum size | Recommended | Notes |
|-------------|-------------|-------------|-------|
| Buttons | 44 x 44 px | 48 x 48 px | Include padding in the tap area |
| Icon buttons | 44 x 44 px | 48 x 48 px | Icon can be 24px inside a 44px+ hit area |
| Text links (inline) | 44px height | 48px height | Add vertical padding to reach minimum |
| Checkbox / radio | 44 x 44 px | 48 x 48 px | Make the label clickable too |
| Close / dismiss buttons | 44 x 44 px | 48 x 48 px | Often under-sized — check these |
| List items (tappable rows) | 44px height | 48px height | Full row should be the target |
| Spacing between targets | 8px minimum | 12px | Prevents accidental taps on adjacent items |

---

## The 30-item checklist

Organized by the four WCAG principles: Perceivable, Operable, Understandable, Robust.

### Perceivable (10 items)
Can all users perceive the content regardless of ability?

| # | Check | WCAG SC | Pass | Fail | N/A |
|---|-------|---------|------|------|-----|
| 1 | Normal text has 4.5:1 contrast ratio against background | 1.4.3 | [ ] | [ ] | [ ] |
| 2 | Large text (≥24px / ≥18.5px bold) has 3:1 contrast ratio | 1.4.3 | [ ] | [ ] | [ ] |
| 3 | UI components (borders, icons, controls) have 3:1 contrast | 1.4.11 | [ ] | [ ] | [ ] |
| 4 | Information is not conveyed by color alone (use icons, patterns, or text too) | 1.4.1 | [ ] | [ ] | [ ] |
| 5 | All images have meaningful alt text planned (or alt="" for decorative) | 1.1.1 | [ ] | [ ] | [ ] |
| 6 | Video/audio content has captions or transcript planned | 1.2.1, 1.2.2 | [ ] | [ ] | [ ] |
| 7 | Text can be resized to 200% without content being clipped or overlapping | 1.4.4 | [ ] | [ ] | [ ] |
| 8 | Content reflows to a single column at 320px width without horizontal scroll | 1.4.10 | [ ] | [ ] | [ ] |
| 9 | Spacing between text (line height, paragraph, letter, word) can be adjusted without breaking layout | 1.4.12 | [ ] | [ ] | [ ] |
| 10 | No content is hidden behind hover-only interactions (tooltip content also accessible via focus/click) | 1.4.13 | [ ] | [ ] | [ ] |

### Operable (10 items)
Can all users operate the interface regardless of input method?

| # | Check | WCAG SC | Pass | Fail | N/A |
|---|-------|---------|------|------|-----|
| 11 | Every interactive element is reachable by keyboard (Tab key) | 2.1.1 | [ ] | [ ] | [ ] |
| 12 | No keyboard traps — user can always Tab or Escape away from any element | 2.1.2 | [ ] | [ ] | [ ] |
| 13 | Tab order follows a logical reading sequence (left-to-right, top-to-bottom) | 2.4.3 | [ ] | [ ] | [ ] |
| 14 | Visible focus indicator on every focusable element (not just browser default) | 2.4.7, 2.4.11 | [ ] | [ ] | [ ] |
| 15 | Touch targets are at least 44x44 px with at least 8px spacing between them | 2.5.8 | [ ] | [ ] | [ ] |
| 16 | No time limits on content, or user can extend/disable timers | 2.2.1 | [ ] | [ ] | [ ] |
| 17 | Animations and auto-playing content can be paused, stopped, or hidden | 2.2.2 | [ ] | [ ] | [ ] |
| 18 | Motion-triggered interactions have non-motion alternatives | 2.5.4 | [ ] | [ ] | [ ] |
| 19 | Design respects prefers-reduced-motion (no essential animations) | 2.3.3 | [ ] | [ ] | [ ] |
| 20 | Skip navigation link planned for pages with repeated header/nav | 2.4.1 | [ ] | [ ] | [ ] |

### Understandable (6 items)
Can all users understand the content and how to use the interface?

| # | Check | WCAG SC | Pass | Fail | N/A |
|---|-------|---------|------|------|-----|
| 21 | Page language is set (lang attribute on html element) | 3.1.1 | [ ] | [ ] | [ ] |
| 22 | Form fields have visible labels (not placeholder-only) | 3.3.2 | [ ] | [ ] | [ ] |
| 23 | Required fields are clearly indicated (not by color alone) | 3.3.2 | [ ] | [ ] | [ ] |
| 24 | Error messages identify the field and describe how to fix the error | 3.3.1, 3.3.3 | [ ] | [ ] | [ ] |
| 25 | Navigation is consistent across pages (same order, same labels) | 3.2.3 | [ ] | [ ] | [ ] |
| 26 | No unexpected context changes on focus or input (no auto-submit, no surprise navigation) | 3.2.1, 3.2.2 | [ ] | [ ] | [ ] |

### Robust (4 items)
Is the design structured for assistive technology compatibility?

| # | Check | WCAG SC | Pass | Fail | N/A |
|---|-------|---------|------|------|-----|
| 27 | Semantic HTML elements planned (nav, main, article, aside, header, footer — not div soup) | 4.1.2 | [ ] | [ ] | [ ] |
| 28 | ARIA landmarks planned for page regions (banner, navigation, main, complementary, contentinfo) | 4.1.2 | [ ] | [ ] | [ ] |
| 29 | Custom components have ARIA roles, states, and properties specified (e.g., role="dialog", aria-expanded) | 4.1.2 | [ ] | [ ] | [ ] |
| 30 | Dynamic content changes have an announcement strategy (aria-live regions for notifications, toasts, errors) | 4.1.3 | [ ] | [ ] | [ ] |

---

## Copy-paste template

### Accessibility audit template

```markdown
# Accessibility Audit — [CUSTOMIZE] Product Name

Audit date: [CUSTOMIZE] YYYY-MM-DD
Auditor: [CUSTOMIZE] Name
Design tool: [CUSTOMIZE] Figma / Sketch / other
Contrast checker used: [CUSTOMIZE] WebAIM / Figma A11y plugin / other

## Summary
- Total checks: 30
- Pass: [COUNT]
- Fail: [COUNT]
- N/A: [COUNT]
- Overall: [PASS/FAIL]

## Perceivable
| # | Check | Result | Notes / Fix needed |
|---|-------|--------|--------------------|
| 1 | Normal text contrast (4.5:1) | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Body text: #333 on #FFF = 12.6:1 |
| 2 | Large text contrast (3:1) | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Headings: #555 on #FFF = 7.4:1 |
| 3 | UI component contrast (3:1) | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Input borders: #CCC on #FFF = 1.6:1 — NEEDS FIX, use #767676 |
| 4 | Color not sole indicator | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Error states use red color + error icon + text |
| 5 | Alt text planned | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Hero image, feature screenshots, team photos need alt |
| 6 | Captions/transcripts | [CUSTOMIZE] Pass/Fail/N/A | [CUSTOMIZE] No video content |
| 7 | Text resizable to 200% | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Layout uses rem units, tested at 200% |
| 8 | Content reflows at 320px | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Single column layout at mobile |
| 9 | Text spacing adjustable | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] No fixed-height containers on text |
| 10 | No hover-only content | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Tooltips also accessible via focus |

## Operable
| # | Check | Result | Notes / Fix needed |
|---|-------|--------|--------------------|
| 11 | Keyboard reachable | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] All buttons, links, inputs in tab order |
| 12 | No keyboard traps | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Modal closes on Escape, returns focus |
| 13 | Logical tab order | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Tab order annotated on designs |
| 14 | Visible focus indicator | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] 2px blue ring on all focusable elements |
| 15 | Touch targets ≥ 44px | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Icon buttons measured at 44x44, spacing 12px |
| 16 | No time limits | [CUSTOMIZE] Pass/Fail/N/A | [CUSTOMIZE] Session timeout warns 2 min before, extendable |
| 17 | Pause/stop animations | [CUSTOMIZE] Pass/Fail/N/A | [CUSTOMIZE] Auto-playing carousel has pause button |
| 18 | Non-motion alternatives | [CUSTOMIZE] Pass/Fail/N/A | [CUSTOMIZE] No motion-triggered interactions |
| 19 | Reduced motion respected | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Animations disabled when prefers-reduced-motion |
| 20 | Skip navigation link | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] "Skip to main content" link planned |

## Understandable
| # | Check | Result | Notes / Fix needed |
|---|-------|--------|--------------------|
| 21 | Page language set | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] lang="en" on html element |
| 22 | Visible form labels | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] All inputs have visible labels above field |
| 23 | Required fields indicated | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Asterisk + "(required)" text |
| 24 | Descriptive error messages | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] "Email format invalid — use name@example.com" |
| 25 | Consistent navigation | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Same nav order on all pages |
| 26 | No unexpected changes | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] No auto-submit, forms require explicit button click |

## Robust
| # | Check | Result | Notes / Fix needed |
|---|-------|--------|--------------------|
| 27 | Semantic HTML planned | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] nav, main, article, aside annotated on wireframes |
| 28 | ARIA landmarks planned | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] banner, navigation, main, contentinfo regions marked |
| 29 | Custom component ARIA | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Modal: role="dialog", aria-modal="true"; Dropdown: aria-expanded |
| 30 | Dynamic content strategy | [CUSTOMIZE] Pass/Fail | [CUSTOMIZE] Toast notifications use aria-live="polite", form errors use aria-live="assertive" |

## Action items
| # | Issue | Severity | Fix | Owner | Status |
|---|-------|----------|-----|-------|--------|
| [NUM] | [CUSTOMIZE] Input border contrast too low | High | Change border from #CCC to #767676 | [NAME] | Open |
| [NUM] | [CUSTOMIZE] Missing skip nav link | Medium | Add hidden skip link before header | [NAME] | Open |
| [NUM] | [CUSTOMIZE] Carousel lacks pause button | Medium | Add pause/play toggle | [NAME] | Open |
```

---

## Common accessibility failures at design stage

These are the issues most frequently caught too late. Check them first.

| Issue | How often missed | Impact | Fix at design stage |
|-------|-----------------|--------|---------------------|
| Insufficient contrast on secondary text (muted gray) | Very common | Blocks WCAG compliance | Check every gray text against its background |
| Placeholder-only form labels | Very common | Screen readers cannot identify fields | Add visible label above every input |
| Icon buttons without text labels | Common | Unlabeled for screen readers | Add aria-label or visible text |
| Color-only error indicators (red border only) | Common | Invisible to colorblind users | Add icon + text alongside color |
| Touch targets < 44px (especially icon buttons) | Common | Frustrating on mobile, fails WCAG 2.5.8 | Pad hit area to 44px minimum |
| Missing focus indicators | Common | Keyboard users cannot see where they are | Design a visible custom focus ring |
| No skip navigation link | Moderate | Keyboard users must tab through entire nav on every page | Add "Skip to main content" as first focusable element |
| Auto-playing animations with no pause | Moderate | Distracting, causes nausea for some users | Add pause control, respect prefers-reduced-motion |

---

## Customization notes

- **Audit frequency**: Run this checklist at mid-fi wireframe stage for every new feature. Re-run after significant visual design changes. Run a final audit before development handoff.
- **Team size scaling**: Solo developers can self-audit using this checklist. Teams of 3+ should have a dedicated accessibility reviewer (does not need to be a specialist — just a consistent second pair of eyes).
- **Automated vs manual**: About 30-40% of accessibility issues can be caught by automated tools (Axe, Lighthouse). The remaining 60-70% require human review. This checklist covers both.
- **Legal context**: WCAG 2.2 AA is the standard required by the EU European Accessibility Act (2025), US ADA (case law), and most national accessibility legislation. Targeting AA satisfies most legal requirements.
- **Screen reader testing**: Design-stage audit does not replace screen reader testing. Plan for VoiceOver (macOS/iOS) or NVDA (Windows) testing during development.

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill — Implement accessible components
- `google-labs-code/design-md` — Generate accessible design specifications
