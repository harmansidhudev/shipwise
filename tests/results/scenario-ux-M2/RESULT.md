# Scenario M2: Toast Notification System with Variants and Stacking

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02 (product-design)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that the micro-interaction-patterns reference doc provides a complete toast notification system with distinct visual styles per type, appropriate auto-dismiss behavior, stacking logic, and positioning rules.

## Test Prompt
```
Build a toast notification system. I need success, error, and info variants that stack and auto-dismiss.
```

## Expected Behavior
- Distinct visual styles per toast type (color, icon, border)
- Success auto-dismisses in 3-5 seconds
- Error toasts persist (manual dismiss only)
- Stacking is handled with a max visible count
- Positioning is specified (desktop and mobile)

## Actual Behavior

### Trigger analysis
The prompt contains "toast notification" which directly matches skill 02's trigger "toast notification". Skill 02 (product-design) fires. The micro-interaction-patterns.md Section 2 is the primary source.

### Reference doc coverage check

**Distinct visual styles per type:**
Covered. Section 2 "Toast / notification patterns" provides a table with four types (success, error, warning, info) each with distinct: Color (green-50/green-500, red-50/red-500, amber-50/amber-500, blue-50/blue-500), Icon (Checkmark circle, X circle, Triangle, Info circle), and auto-dismiss behavior. The STYLES constant in the ToastProvider component implements distinct `border-*` + `bg-*` + `text-*` classes per type. Each toast renders with a colored left border (`border-l-4`) for clear type differentiation.

**Success auto-dismiss (3-5s):**
Covered. The table specifies success auto-dismisses in 3s. The DISMISS_MS constant sets `success: 3000`. The ToastItem component uses a useEffect with `setTimeout(onDismiss, ms)` for auto-dismissal.

**Error persists:**
Covered. The table shows error has "No (manual)" for auto-dismiss and the DISMISS_MS constant sets `error: null`. When `ms` is null, the useEffect returns early without setting a timeout, so the toast stays until manually dismissed via the X button.

**Stacking handled:**
Covered. The positioning rules state: "Stacking: max 3 visible, queue the rest." The addToast function implements this with `.slice(-3)`, keeping only the 3 most recent toasts visible. The container uses `flex flex-col gap-2` for vertical stacking.

**Positioning specified:**
Covered. The positioning rules state: "if desktop -> top-right (16px from edge). If mobile -> bottom-center (safe area aware)." The container div uses `fixed top-4 right-4 z-50` for desktop and `max-sm:bottom-4 max-sm:left-1/2 max-sm:top-auto max-sm:right-auto max-sm:-translate-x-1/2` for mobile repositioning. The `aria-live="polite"` attribute is on the container for screen reader support.

## Verdict
PASS

## Findings
### Positive
- All five validation checkboxes are directly covered with specification and copy-paste implementation
- The toast system is architected as a React Context provider pattern (ToastProvider + useToast hook), which is the standard approach for toast systems
- Four toast types are defined (success, error, warning, info) even though the prompt only asked for three -- the additional warning type is a bonus
- Auto-dismiss durations are differentiated per type (3s success, 5s warning, 4s info, persistent error), showing intentional UX design
- Accessibility is addressed with `aria-live="polite"` on the container and `role="status"` on individual toasts
- The dismiss button has an `aria-label="Dismiss"` for screen reader users

### Gaps (if any)
- No enter/exit animation is specified for toasts. The toasts appear and disappear abruptly. A slide-in/fade-out transition would improve the micro-interaction quality. Section 7 (Transition and animation timing) provides timing tokens but is not cross-referenced from the toast section.
- Icon rendering is mentioned in the type table (Checkmark circle, X circle, Triangle, Info circle) but not implemented in the copy-paste component. The ToastItem only renders the message text and a dismiss button, with no icon. A `[CUSTOMIZE]` comment at the top mentions "Adjust icons" but no icon implementation is provided.
- No guidance on toast queue ordering when new toasts arrive while 3 are already visible. The `.slice(-3)` approach drops older toasts silently rather than queuing them.
