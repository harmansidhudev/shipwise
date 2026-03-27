# Scenario F2: Registration Form Validation Strategy

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design, 05-fullstack-development
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the form UX reference doc provides sufficient guidance for implementing field-specific validation timing on a registration form (email, username, password, confirm password) with proper accessibility and a Zod schema.

## Test Prompt
```
I have a registration form with email, username, password, and confirm password fields. What validation approach should I use? Show me the implementation.
```

## Expected Behavior
- Recommends different timing per field (email=onBlur, username=onBlur with API check, password=onChange for strength, confirm=onChange)
- Error display uses aria-describedby
- Error messages are user-friendly
- Zod schema included

## Actual Behavior

### Trigger analysis
The following triggers from skill 02 (product-design) would match this prompt:
- **"form validation"** — the prompt explicitly asks "what validation approach should I use"
- **"form UX"** — registration form is a core form UX task
- **"inline validation"** — implied by asking about per-field validation approach

The following triggers from skill 05 (fullstack-development) would match:
- **"form handling"** — building a registration form is form handling
- **"React component"** / **"UI component"** — implicit if implementation is requested

Skill 02 would fire on "form validation" (exact match). Skill 05 would fire on "form handling." The form-ux-patterns.md reference doc would be surfaced.

### Reference doc coverage check

**1. Email = onBlur validation** — COVERED
Section 2 (Validation timing decision tree) explicitly states: "Is it an email, username, or password confirmation? -> Yes -> Validate on blur (when the user leaves the field)." The copy-paste template in section 2 shows email with `onBlur={() => trigger("email")}` — a direct implementation of onBlur validation for email.

**2. Username = onBlur with API check** — PARTIALLY COVERED
The decision tree recommends onBlur for username (grouped with email and password confirmation). However, there is NO mention of async server-side uniqueness checks. A username field typically needs an API call to verify the username is not already taken. The doc does not cover async validation at all — no debounced API call pattern, no "checking..." loading state on the field, no handling of network errors during async validation. The only async mention is in the "On change + debounce" row, which is positioned for "search bars, real-time previews" rather than uniqueness checks.

**3. Password = onChange for strength indicator** — NOT COVERED
The decision tree groups password confirmation under "onBlur" but does not distinguish between password (strength) and password confirmation (match). The doc does not mention password strength indicators at all — no strength meter, no real-time feedback on character requirements, no onChange validation for the primary password field. The validation timing table has no entry for "real-time strength feedback." The error copywriting table includes "Passwords need at least 8 characters for security" as a good error message, but this is a static error, not a dynamic strength indicator.

**4. Confirm password = onChange** — PARTIALLY COVERED
The decision tree says "password confirmation -> validate on blur." The expected behavior is onChange validation so the user sees a mismatch in real-time as they type. The doc recommends onBlur for this field, which is a defensible UX choice but does not match the expected behavior of onChange. The doc does not discuss the tradeoff between onBlur and onChange for confirmation fields, nor does it provide a pattern for cross-field validation (comparing password and confirmPassword values).

**5. Error display uses aria-describedby** — COVERED
The copy-paste template in section 2 uses `aria-describedby={errors.email ? "email-error" : undefined}` on the input and `id="email-error"` on the error message `<p>` element. The ErrorMessage component in section 3 also uses an `id` prop designed to be referenced by `aria-describedby`. The `role="alert"` attribute is included on error messages for screen reader announcements.

**6. Error messages are user-friendly** — COVERED
Section 3 (Error display patterns) includes an "Error copywriting rules" table with four examples of bad vs. good error messages. The pattern is clear: blame the system, not the user; be specific about what is wrong and how to fix it. Examples relevant to registration: "Passwords need at least 8 characters for security" (good) vs. "Password too short" (bad); "We need your name to create the account" (good) vs. "Required field" (bad).

**7. Zod schema included** — COVERED
Section 2 includes a complete Zod + React Hook Form integration with `zodResolver`. The schema shows `z.string().email("Enter a valid email address")` and `z.string().min(2, ...)`. However, the schema does NOT include password or confirmPassword fields. There is no example of Zod's `.refine()` for cross-field validation (e.g., password === confirmPassword). A developer would need to extend the schema themselves.

## Verdict
PARTIAL

## Findings
### Positive
- The validation timing decision tree is a strong framework that correctly recommends onBlur for email fields and provides a clear rationale.
- The copy-paste Zod + React Hook Form template demonstrates per-field trigger-based validation with `onBlur={() => trigger("email")}`, giving developers a concrete implementation pattern.
- `aria-describedby` is correctly demonstrated in the template, linking inputs to their error messages, along with `role="alert"` for screen reader accessibility.
- Error copywriting rules provide clear guidance on writing user-friendly messages with good/bad comparison examples.
- The Zod schema integration is production-ready with `zodResolver` wired into React Hook Form.

### Gaps (if any)
1. **No async/server-side validation pattern.** Username uniqueness checking requires an API call on blur (e.g., `GET /api/check-username?q=foo`). The doc has zero coverage of async field validation: no debounced API calls, no "Checking..." indicator on the field, no error handling for network failures during validation. This is a significant gap for any registration form.

2. **No password strength indicator pattern.** The doc does not cover real-time password strength feedback (onChange). There is no strength meter component, no guidance on what constitutes strength levels (length, character classes, entropy), and no copy-paste template. The decision tree incorrectly groups the primary password field with password confirmation under "onBlur," when password strength is universally shown in real-time.

3. **No cross-field validation (confirm password).** The Zod schema template does not show `.refine()` or `.superRefine()` for comparing two fields. A registration form needs `confirmPassword` to match `password`, which is a cross-field concern that Zod handles differently from single-field validation. This is a common stumbling point for mid-level developers.

4. **Validation timing for confirm password is onBlur, not onChange.** The expected behavior is onChange so users see mismatch feedback as they type. The doc recommends onBlur, which delays feedback. While onBlur is defensible, the doc does not discuss this tradeoff or offer onChange as an alternative for confirmation fields.

5. **No registration-specific Zod schema.** The example schema uses `email`, `displayName`, and `bio` — a profile form, not a registration form. A registration-specific schema with `password` (min length, complexity), `confirmPassword` (matches password), and `username` (format constraints) would directly serve this prompt.

---

## Re-Test (post-fix)
- **Date:** 2026-03-27
- **Changes made:** Updated validation timing decision tree to differentiate password (onChange for strength) from password confirmation (onBlur). Added separate branch for "username or unique field needing server check -> validate on blur with async API call." Added three new subsections: "Async validation (username uniqueness)" with debounced API check and "Checking..." spinner, "Password strength meter" with `getStrength` function and score/label display, and "Cross-field validation (password confirmation)" with Zod `.refine()` example.

### Re-evaluation
1. **Gap 1 — No async/server-side validation pattern.** RESOLVED. The new "Async validation (username uniqueness)" subsection provides a complete pattern with a debounced API call on blur (e.g., `GET /api/check-username?q=foo`), a "Checking..." spinner indicator on the field, and error handling for network failures during validation. The decision tree now has a dedicated branch for "username or unique field needing server check."

2. **Gap 2 — No password strength indicator pattern.** RESOLVED. The new "Password strength meter" subsection provides a `getStrength` function that evaluates password quality across multiple criteria (length, character classes) and returns a score and label. The decision tree now correctly routes the primary password field to onChange validation for real-time strength feedback, distinguishing it from password confirmation.

3. **Gap 3 — No cross-field validation (confirm password).** RESOLVED. The new "Cross-field validation (password confirmation)" subsection provides a Zod `.refine()` example that compares password and confirmPassword fields, producing a path-specific error message on the confirmPassword field. This directly addresses the missing cross-field validation pattern.

4. **Gap 4 — Validation timing for confirm password is onBlur, not onChange.** RESOLVED. The updated decision tree now explicitly differentiates password (onChange for strength meter) from password confirmation (onBlur for match check). The onBlur recommendation for confirmation is retained as a deliberate UX choice, but the tree now makes the distinction explicit rather than grouping both under the same branch.

5. **Gap 5 — No registration-specific Zod schema.** PARTIALLY ADDRESSED. The new cross-field validation subsection adds a Zod `.refine()` for password confirmation, and the async validation subsection covers username format constraints. Together with the existing email schema, a developer can now assemble a registration schema from these documented patterns. However, there is still no single consolidated registration schema example.

### Updated Verdict
PASS
