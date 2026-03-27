# Scenario F3: Settings Page with Autosave

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design, 05-fullstack-development
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the form UX reference doc provides sufficient guidance for implementing an autosave settings page with a status indicator, error handling, and exclusions for sensitive/destructive fields.

## Test Prompt
```
Build a settings page with autosave. The user shouldn't have to click a save button — changes should save automatically with a status indicator.
```

## Expected Behavior
- Implements debounced autosave
- "Saving..." -> "Saved" -> "Unsaved changes" indicator
- Handles errors (retry, "Failed to save")
- Does NOT autosave password or destructive fields

## Actual Behavior

### Trigger analysis
The following triggers from skill 02 (product-design) would match this prompt:
- **"autosave"** — exact keyword match in the prompt ("autosave")
- **"form UX"** — a settings page is a form UX concern
- **"form validation"** — implicit (settings fields need validation)

The following triggers from skill 05 (fullstack-development) would match:
- **"form handling"** — a settings page involves form handling

Skill 02 would fire on "autosave" (exact match). This is the most direct trigger. The form-ux-patterns.md reference doc would be surfaced, specifically section 5 (Autosave patterns).

### Reference doc coverage check

**1. Debounced autosave** — COVERED
Section 5 provides a complete `useAutosave` hook with configurable debounce (`debounceMs = 2000` default). The hook uses `useRef` for timeout management and `clearTimeout` before setting a new timeout, implementing proper debounce. It compares serialized data with `JSON.stringify` to avoid unnecessary saves when data has not changed. This is a production-quality implementation.

**2. "Saving..." indicator** — COVERED
The `AutosaveIndicator` component in section 5 maps `AutosaveStatus` to labels:
- `saving` -> "Saving..."
- `saved` -> "All changes saved"
- `error` -> "Could not save -- retrying"
- `idle` -> empty (no indicator)

The component uses `aria-live="polite"` for screen reader accessibility, which is a good practice.

**3. "Saved" indicator** — COVERED
The status "saved" maps to "All changes saved" in the `AutosaveIndicator`. This renders after a successful save.

**4. "Unsaved changes" indicator** — NOT COVERED
The `useAutosave` hook has four states: `idle`, `saving`, `saved`, `error`. There is NO "unsaved" or "dirty" state. When a user modifies a field, the hook sets a debounce timer but the status remains whatever it was previously (likely `saved` from the last save, or `idle`). There is no immediate transition to an "Unsaved changes" state when the user starts typing. A proper implementation would set status to something like "unsaved" as soon as data changes and before the debounce fires. This means during the 2-second debounce window, the user sees "All changes saved" (stale) rather than "Unsaved changes" (correct).

**5. Error handling with retry** — PARTIALLY COVERED
The hook catches errors in the `save` callback and sets `status` to `"error"`. The indicator shows "Could not save -- retrying." However, the hook does NOT actually implement retry logic. When an error occurs, the status is set to "error" and stays there until the next data change triggers a new save attempt. There is no automatic retry (e.g., exponential backoff, retry after N seconds). The label says "retrying" but the code does not retry. A developer relying on this template would show a misleading message.

**6. "Failed to save" error state** — PARTIALLY COVERED
The error state exists and shows "Could not save -- retrying." This communicates failure, but the message implies retry is happening when it is not (see gap above). There is no "Failed to save" with a manual retry button as a fallback after automatic retries are exhausted.

**7. Does NOT autosave password or destructive fields** — COVERED
Section 5's decision table explicitly lists:
- "Payment / checkout form -> No -> Users must explicitly confirm financial actions"
- "Destructive action (delete account) -> No -> Requires intentional confirmation"

While "password" is not explicitly listed as a no-autosave field, the destructive/financial exclusions establish the principle. Section 10 (Anti-patterns) also states: "Only clear sensitive fields (passwords) after successful submit," which implicitly treats passwords as special. Additionally, section 9 (Pre-submit checklist) states: "If the action is irreversible (delete, publish, send) -> always confirm," reinforcing that destructive fields need explicit submission.

However, there is a gap: the doc does not show HOW to implement a mixed-mode form where some fields autosave and others require explicit submission. A settings page commonly has a "Change Password" section alongside autosaved preferences. The doc provides the decision framework for WHICH fields to exclude but no implementation pattern for the mixed mode (e.g., autosave wrapper that skips certain field names, or a separate sub-form with its own submit button for the password section).

## Verdict
PARTIAL

## Findings
### Positive
- The `useAutosave` hook is a solid, copy-paste-ready implementation with proper debounce, data diffing via `JSON.stringify`, and clean effect cleanup.
- The `AutosaveIndicator` component includes `aria-live="polite"` for accessibility, which many autosave implementations miss.
- The decision table in section 5 clearly delineates when autosave is appropriate vs. when it is not, covering payment, destructive actions, and forms with confirmation steps.
- The debounce delay is configurable with a sensible default (2000ms), and the `[CUSTOMIZE]` comment makes it obvious this should be tuned.
- The anti-patterns table reinforces autosave as a best practice for long forms (">2 minutes to complete"), which aligns with the settings page use case.

### Gaps (if any)
1. **No "Unsaved changes" state.** The `useAutosave` hook transitions from `idle`/`saved` directly to `saving` after the debounce fires. During the debounce window (while the user is typing or just paused), the indicator shows stale information. A "dirty" or "unsaved" state should be set immediately when data changes, before the debounce timer fires. This is critical UX feedback — users need to know their changes have not been persisted yet.

2. **Retry logic is labeled but not implemented.** The indicator says "Could not save -- retrying" but the hook does not retry. After an error, no automatic retry occurs. The hook waits for the next user-initiated data change to attempt another save. This is misleading. The hook should implement at least one automatic retry with a delay (e.g., retry after 3 seconds, then show "Failed to save" with a manual retry button after N attempts).

3. **No mixed-mode form pattern (autosave + explicit submit).** A settings page typically has both autosaved fields (display name, notification preferences, timezone) and explicit-submit fields (password, email change, account deletion). The doc explains WHICH fields to exclude from autosave but provides no implementation pattern for combining autosave and manual-submit sections in the same page.

4. **No optimistic UI or offline handling.** The autosave hook assumes a reliable network connection. There is no guidance on what happens when the user is offline (queue saves for later?), when saves take too long (timeout?), or whether to show the previous value optimistically while a save is in-flight. For a settings page, these edge cases matter because users may have slow connections.

5. **The saved state has no auto-clear.** After a successful save, the indicator shows "All changes saved" indefinitely until the next change. Some UX patterns fade this indicator after a few seconds to reduce visual noise. The doc does not discuss this timing consideration.

---

## Re-Test (post-fix)
- **Date:** 2026-03-27
- **Changes made:** Added "unsaved" status to the `AutosaveStatus` type. The `useAutosave` hook now sets status to "unsaved" immediately when data changes (before the debounce fires). Added auto-retry logic with 2 retries at 3-second intervals before showing a permanent error state. Added "Mixed-mode: autosave + explicit submit" pattern showing how to combine an autosave section with an explicit password change form on the same page.

### Re-evaluation
1. **Gap 1 — No "Unsaved changes" state.** RESOLVED. The `AutosaveStatus` type now includes an "unsaved" status. The hook sets status to "unsaved" immediately when data changes, before the debounce timer fires. During the debounce window, the indicator correctly shows "Unsaved changes" instead of stale "All changes saved" text, giving users accurate feedback about their persistence state.

2. **Gap 2 — Retry logic is labeled but not implemented.** RESOLVED. The hook now implements auto-retry with 2 retry attempts at 3-second intervals. If all retries are exhausted, the status transitions to a permanent error state (no longer misleadingly saying "retrying"). This closes the gap between the indicator label and the actual hook behavior.

3. **Gap 3 — No mixed-mode form pattern (autosave + explicit submit).** RESOLVED. The new "Mixed-mode: autosave + explicit submit" pattern shows a concrete implementation of a settings page where preference fields (display name, timezone, notifications) use the autosave hook, while a separate password change section uses its own explicit submit button and form handler. This directly addresses the most common settings page architecture.

4. **Gap 4 — No optimistic UI or offline handling.** NOT ADDRESSED by this fix. Offline queuing and optimistic updates remain uncovered. This is an edge case that goes beyond the core autosave pattern.

5. **Gap 5 — The saved state has no auto-clear.** NOT ADDRESSED by this fix. The indicator still shows "All changes saved" indefinitely. This is a minor polish concern.

### Updated Verdict
PASS
