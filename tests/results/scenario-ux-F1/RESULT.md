# Scenario F1: Multi-Step Signup Form

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design, 05-fullstack-development
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the form UX reference doc provides sufficient guidance for building a multi-step signup form with per-step validation, progress indicator, and back navigation.

## Test Prompt
```
Build a multi-step signup form for a SaaS. Steps: account info (email, password), company details (name, size, industry), plan selection (free, pro, enterprise). Each step should validate before allowing next.
```

## Expected Behavior
- Skill 02 or 05 auto-triggers on "multi-step form" or "form handling"
- Response references the multi-step decision framework from form-ux-patterns.md
- Progress indicator included
- Per-step validation (not all-at-end)
- Back navigation between steps
- Button states handled (loading on "Next"/"Submit")
- Button disabled during submission

## Actual Behavior

### Trigger analysis
The following triggers from skill 02 (product-design) would match this prompt:
- **"form validation"** — the prompt explicitly asks for per-step validation
- **"form UX"** — building a signup form is a form UX task
- **"inline validation"** — implied by "validate before allowing next"
- **"onboarding flow"** — a signup form is an onboarding entry point
- **"button states"** — implicit in the submit/next interaction

The following triggers from skill 05 (fullstack-development) would match:
- **"multi-step form"** — exact phrase match to the prompt's "multi-step signup form"
- **"form handling"** — building any form triggers this
- **"React component"** / **"UI component"** — building a form component (implicit)

Both skills would fire. Skill 05's "multi-step form" trigger is the most direct lexical match. Skill 02 would fire on "form validation" and "form UX". In practice, the orchestrator should surface form-ux-patterns.md as the primary reference.

### Reference doc coverage check

**1. Multi-step decision framework** — COVERED
Section 1 ("Multi-step vs single-page decision framework") provides a clear decision tree. The prompt describes 3 distinct mental contexts (account, company, plan) and likely >7 fields total, so both branches point to "Multi-step." The doc would correctly guide the response to choose a multi-step layout.

**2. Progress indicator** — COVERED
The multi-step rules checklist states: "Show a progress indicator (step 2 of 4) so users know how much is left." The copy-paste multi-step form shell includes a full `<nav aria-label="Form progress">` component with numbered steps, completed checkmarks, and active-step highlighting.

**3. Per-step validation (not all-at-end)** — COVERED
The checklist states: "Validate per step before allowing 'Next' — do not wait until the final submit." Section 2 (Validation timing decision tree) provides further detail on when to validate specific field types (email on blur, etc.). The Zod + React Hook Form template in section 2 shows per-field trigger-based validation.

**4. Back navigation between steps** — COVERED
The checklist states: "Allow back navigation — never trap users in a step." The copy-paste shell includes `goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))` and passes `onBack` to each step component.

**5. Button states handled (loading on "Next"/"Submit")** — PARTIALLY COVERED
Section 4 (Button state machine) provides a full state machine (idle -> hover -> active -> loading -> success -> error -> idle) and a copy-paste SubmitButton component with spinner, disabled state during loading, and success/error feedback. However, the multi-step form shell in section 1 does NOT wire the SubmitButton into the step navigation — it only provides bare `onNext`/`onBack` callbacks with no loading state on the "Next" button. A developer would need to manually combine sections 1 and 4. The doc does not explicitly state that the "Next" button should also show a loading state when per-step async validation runs.

**6. Button disabled during submission** — COVERED
The SubmitButton component in section 4 sets `disabled={status !== "idle"}`, preventing double-clicks during loading. The loading state also uses `cursor-not-allowed`.

**7. State preservation across steps** — COVERED
The checklist states: "Save state between steps — if the user refreshes, they pick up where they left off." However, the copy-paste shell uses only `useState` which does not persist across refresh. The checklist tells you to do it, but the template does not implement it (no localStorage or session persistence). This is a minor gap — the doc gives the right advice but the template does not follow through.

## Verdict
PARTIAL

## Findings
### Positive
- The multi-step decision framework is clear and would correctly guide the developer to choose a multi-step layout for this prompt.
- Progress indicator is fully implemented in the copy-paste shell with accessible markup (`aria-label`, semantic `<nav>` and `<ol>`).
- Per-step validation is explicitly called out in the checklist AND supported by the Zod/RHF validation template in section 2.
- Back navigation is implemented in the shell with `onBack` prop.
- The button state machine in section 4 is thorough with a complete component including spinner, disabled state, success/error feedback, and shake animation.
- Error copywriting rules in section 3 would produce user-friendly validation messages.

### Gaps (if any)
1. **No "Next" button loading state in the multi-step shell.** The multi-step template (section 1) and the SubmitButton (section 4) are presented as separate, disconnected patterns. The doc never shows how to compose them — e.g., making the "Next" button enter a loading state while async per-step validation runs (like checking if an email is already registered). A mid-level developer would need to figure out this integration themselves.

2. **State persistence across refresh is advised but not implemented.** The checklist says "if the user refreshes, they pick up where they left off," but the copy-paste shell uses plain `useState` with no persistence mechanism. Adding a `useEffect` to sync to `localStorage` or `sessionStorage` would close this gap.

3. **No guidance on plan selection UI pattern.** The prompt asks for a plan selection step (free/pro/enterprise), which is a radio-card or pricing-card pattern. The reference doc covers generic form fields but has no guidance on selection-card layouts (e.g., horizontal card group with feature highlights). This would likely be handled by skill 02's pricing model content, but the form UX doc itself does not address it.

4. **No password strength indicator.** The signup form includes a password field, but the reference doc's validation timing tree says only "email, username, or password confirmation -> validate on blur." There is no mention of real-time password strength feedback (onChange), which is a standard expectation for signup forms.

---

## Re-Test (post-fix)
- **Date:** 2026-03-27
- **Changes made:** Added "Multi-step state persistence" section with a `usePersistedStep` hook that syncs current step and form data to sessionStorage. Added "Composing multi-step with button states" subsection showing how to wire the SubmitButton component into step navigation with async validation loading state on the "Next" button.

### Re-evaluation
1. **Gap 1 — No "Next" button loading state in the multi-step shell.** RESOLVED. The new "Composing multi-step with button states" subsection explicitly shows how to integrate the SubmitButton component from section 4 into the multi-step form's step navigation. The "Next" button now enters a loading state while async per-step validation runs (e.g., checking if an email is already registered), closing the gap between the previously disconnected sections 1 and 4.

2. **Gap 2 — State persistence across refresh is advised but not implemented.** RESOLVED. The new "Multi-step state persistence" section provides a complete `usePersistedStep` hook that uses sessionStorage to persist both the current step index and accumulated form data. On page refresh, the hook restores the user to their last completed step with all previously entered data intact, directly implementing the advice from the checklist.

3. **Gap 3 — No guidance on plan selection UI pattern.** NOT ADDRESSED by this fix. This gap is outside the scope of the form UX reference doc and would be better served by skill 02's pricing model content. No change expected here.

4. **Gap 4 — No password strength indicator.** NOT ADDRESSED by this fix. Password strength feedback is covered by the F2 fix (added to the validation timing section), not the multi-step form section. See scenario F2 re-test.

### Updated Verdict
PASS
