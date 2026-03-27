# Scenario M1: Responsive Submit Button with State Machine

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02 (product-design)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that the micro-interaction-patterns reference doc provides a complete button state machine with idle, loading, success, and error states, including consistent width, disabled during loading, checkmark on success, and shake on error.

## Test Prompt
```
My submit button just says 'Submit' and does nothing visible while the form is processing. How do I make it feel responsive?
```

## Expected Behavior
- Provides full state machine: idle -> loading -> success/error
- Button is disabled during loading state
- Button width remains consistent (no layout shift) via min-width
- Success state shows a checkmark icon
- Error state shows shake animation
- States auto-return to idle after defined durations

## Actual Behavior

### Trigger analysis
The prompt mentions "submit button", "processing", and "responsive" which matches skill 02's triggers: "button states", "micro-interaction". Skill 02 (product-design) fires. The micro-interaction-patterns.md reference doc is the primary source.

### Reference doc coverage check

**Full state machine (idle -> loading -> success/error):**
Covered. Section 1 "Button state machine" defines the state diagram: "idle -> hover -> active -> loading -> success/error -> idle." A detailed table specifies visual treatment, cursor, ARIA attributes, and duration for each of the six states (idle, hover, active, loading, success, error). The SubmitButton component implements a `ButtonState` type of `'idle' | 'loading' | 'success' | 'error'` with transitions managed via `useState` and `useEffect`.

**Button disabled during loading:**
Covered. The state table shows loading state has cursor `not-allowed` and ARIA `aria-busy="true" aria-disabled="true"`. The SubmitButton component sets `disabled={state === 'loading'}` and `aria-busy={state === 'loading'}` on the button element. The `handleClick` function returns early if `state === 'loading'`, preventing double-submission.

**Width consistent (no layout shift):**
Covered. The rules state: "If loading -> preserve button width with min-width so layout does not shift." The SubmitButton component applies `min-w-[120px]` class and uses `inline-flex items-center justify-center` to center content regardless of state text length.

**Success state (checkmark):**
Covered. The SubmitButton component renders `{state === 'success' && <span className="mr-2">checkmark</span>}` (HTML entity for checkmark) and displays "Done!" text. The state table shows success has "Green tint, checkmark" visual and `aria-live="polite"`. Auto-returns to idle after 1.5s via `setTimeout`.

**Error state (shake):**
Covered. The SubmitButton component applies `animate-shake` class in error state with "bg-red-500 text-white" styling and "Failed" text. The state table shows error has "Red tint, shake" visual and `aria-live="assertive"`. A tailwind.config.ts shake keyframe is provided: translateX oscillation at 25% and 75%. Auto-returns to idle after 2s.

**Auto-return to idle:**
Covered. The useEffect hook handles both: success returns to idle after 1500ms, error returns to idle after 2000ms. Both use `setTimeout` with proper cleanup via `clearTimeout`.

## Verdict
PASS

## Findings
### Positive
- All six validation checkboxes are directly covered with both design specification and copy-paste implementation
- The state machine is well-defined with a clear diagram, per-state visual/behavior table, and working React component
- Accessibility is addressed via ARIA attributes (aria-busy, aria-disabled, aria-live) for each state
- The tailwind.config.ts shake keyframe is provided separately for easy integration
- Double-submit prevention is handled at both the click handler level (early return) and DOM level (disabled attribute)

### Gaps (if any)
- The hover and active states from the state diagram are implemented via CSS classes (hover:bg-primary-600, active:scale-[0.98]) but not as explicit states in the TypeScript ButtonState type. This is appropriate for CSS-only states but means the state machine code does not fully match the state diagram. This is a stylistic choice, not a functional gap.
- No guidance on button text customization during loading (currently hardcoded to "Saving..."). A more flexible approach would accept a `loadingLabel` prop.
