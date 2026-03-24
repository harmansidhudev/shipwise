# Scenario 8: Negative Test — Adjacent But Wrong Skill

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 05-fullstack-development (expected to trigger), 04-tech-architecture (must NOT trigger)
- **User archetype:** N/A
- **Interaction mode:** Auto-trigger
- **Test fixture:** N/A

## Objective
Verify that a prompt about React Hook Form + Zod validation correctly triggers skill 05 (fullstack-development) and does NOT co-trigger skill 04 (tech-architecture). Also verify that the skill contains relevant content for the specific use case (multi-step form with per-step validation).

## Test Prompt

```
Help me set up React Hook Form with Zod validation for a multi-step signup form.
I need steps for: basic info, company details, and plan selection. Each step
should validate before allowing next.
```

---

## Skill 05 Trigger Analysis (fullstack-development)

Full trigger list for skill 05:

| Trigger | Present in prompt? | Match detail |
|---------|-------------------|--------------|
| "React" | YES | "React Hook Form" contains the word "React" — literal substring match |
| "Vue" | No | — |
| "Svelte" | No | — |
| "component" | No | Not present |
| "API route" | No | — |
| "database schema" | No | — |
| "migration" | No | — |
| "frontend" | No | — |
| "backend" | No | — |
| "fullstack development" | No | — |
| "state management" | No | — |
| "form handling" | No | "signup form" does not contain the literal string "form handling" |
| "API design" | No | — |
| "caching" | No | — |
| "error handling" | No | — |

**Matching triggers: 1 — "React"**

The trigger "React" appears as a bare keyword. The prompt says "React Hook Form", which contains the substring "React". Under keyword/substring matching, this fires. Skill 05 triggers.

Note: "form handling" does NOT match — the prompt says "signup form", not "form handling". The trigger requires the literal phrase "form handling". However, the single match on "React" is sufficient for the skill to activate.

**Result: Skill 05 TRIGGERS correctly.**

---

## Skill 04 Trigger Analysis (tech-architecture)

Full trigger list for skill 04:

| Trigger | Present in prompt? | Match detail |
|---------|-------------------|--------------|
| "framework selection" | No | The prompt is not asking which framework to pick |
| "which framework" | No | — |
| "database choice" | No | — |
| "choose a database" | No | — |
| "tech stack" | No | — |
| "architecture decisions" | No | — |
| "hosting" | No | — |
| "where to host" | No | — |
| "auth strategy" | No | — |
| "authentication approach" | No | — |
| "REST vs GraphQL" | No | — |
| "API architecture" | No | — |
| "pick a stack" | No | — |
| "stack recommendations" | No | — |

**Matching triggers: 0**

No trigger word from skill 04 appears anywhere in the prompt. The prompt asks how to implement a specific UI pattern (multi-step form with validation), not which technologies to choose. The trigger vocabulary for skill 04 is entirely decision/selection oriented ("which framework", "choose a database", "pick a stack") — none of which overlap with the how-to-implement vocabulary in the test prompt.

**Result: Skill 04 does NOT trigger. Correct.**

---

## Skill 00 Trigger Analysis (launch-assess / orchestrator)

As a secondary check, confirm the orchestrator does not fire.

| Trigger | Present in prompt? |
|---------|-------------------|
| "help me launch" | No — "Help me set up" is present, but "launch" is not |
| "where am I" | No |
| "what do I need" | No |
| "launch checklist" | No |
| "ship wisely" | No |
| "am I ready" | No |
| "what's next" | No |
| "ready to ship" | No |
| "launch readiness" | No |
| "pre-launch" | No |

**Result: Skill 00 does NOT trigger. Correct.**

---

## Adjacent Skill Sweep

For completeness, check remaining skills for any unexpected matches.

| Skill | Potentially matching words in prompt | Verdict |
|-------|--------------------------------------|---------|
| 01 validate-idea | "problem statement"? No. "persona"? No. | No match |
| 02 product-design | "user flow"? No. "MVP"? No. | No match |
| 03 business-legal | "domain"? No. "plan"? — "plan selection" contains the word "plan" | POTENTIAL MATCH — see below |
| 06 platform-infrastructure | "deployment"? No. "production"? No. | No match |
| 07 quality-assurance | "testing"? No — the word "testing" does not appear. "validation" is not a trigger. | No match |
| 08 security-compliance | "security"? No. "input validation"? No — "validation" appears but "input validation" as a phrase does not. | No match |
| 09 observability | None | No match |
| 10 seo-performance | "performance"? No — "perform" does not appear. "landing page"? No. | No match |
| 11 billing-payments | "plan"? YES — "plan selection" contains the bare word "plan" | MATCH — see below |
| 12 legal-compliance | "compliance"? No. "legal"? No. | No match |
| 13 launch-execution | "ship"? No. "production"? No. "staging"? No. | No match |
| 14 growth-ops | "experiment"? No. "feedback"? No. | No match |

### Finding: Skill 11 (billing-payments) false-positive risk

Skill 11 has "plan" as a bare trigger word. The test prompt contains "plan selection" (referring to a pricing tier selection step in the signup form). The substring "plan" is present.

Under literal keyword matching, skill 11 (billing-payments) would co-trigger alongside skill 05. This is a false positive — the developer is asking about form UI/validation, not about billing implementation. The word "plan" in context means "subscription tier", not "implement billing".

This is an unintended co-trigger. The skill 11 trigger list should replace bare "plan" with "pricing plan", "subscription plan", or "billing plan" to avoid this class of false positive.

**Result: Skill 11 unexpectedly co-triggers due to the bare "plan" trigger word. This is a bug.**

---

## Content Validation: Does Skill 05 Contain the Right Content?

### React Hook Form + Zod

Skill 05 SKILL.md contains a dedicated section at line 131: "Form handling — React Hook Form + Zod". It includes a complete working code template using `useForm`, `zodResolver`, `z.object()` schema definition, `register`, `handleSubmit`, and `formState.errors`. This directly addresses what the developer is asking for.

### Multi-step form pattern

The prompt specifically asks for a multi-step form with three steps (basic info, company details, plan selection) and per-step validation before advancing.

Skill 05 does NOT contain a multi-step form pattern. The form handling section covers a single-step form (a `ContactForm` component). There is no `useState`-based step management, no `currentStep` tracking, no schema-per-step approach, and no "validate before next step" pattern in the skill.

The skill would provide the correct React Hook Form + Zod foundation, but the developer would receive a single-form template and would need to adapt it to multi-step behavior without explicit guidance from the skill.

**Skill 05 content gap: multi-step form orchestration is absent.** The skill handles the validation layer (RHF + Zod) but not the wizard/stepper pattern around it.

---

## Boundary Clarity Assessment: Skill 04 vs Skill 05

The central question for this scenario is whether the trigger boundary between these two skills is clear enough to prevent the form validation prompt from accidentally activating skill 04.

**Skill 04 trigger vocabulary is decision-focused:** Every trigger in skill 04 is about choosing between options ("framework selection", "which framework", "choose a database", "REST vs GraphQL", "pick a stack"). None describe implementation tasks.

**Skill 05 trigger vocabulary is implementation-focused:** Triggers cover specific technologies ("React", "Vue", "Svelte"), patterns ("state management", "form handling"), and code artifacts ("API route", "database schema", "migration").

The boundary is structurally clear and robust. A "how to implement X with technology Y" prompt will reliably hit skill 05, not skill 04. A "what technology should I choose for X" prompt will reliably hit skill 04, not skill 05.

The test prompt ("Help me set up React Hook Form...") is unambiguously on the implementation side. There is no risk of skill 04 activating.

---

## Validation Checklist

- [x] Skill 05 triggers on "React" — confirmed YES
- [x] Skill 04 does NOT trigger — confirmed, zero matching triggers
- [x] Skill 00 does NOT trigger — confirmed, zero matching triggers
- [x] Skill 05 contains React Hook Form + Zod content — YES (line 131)
- [ ] Skill 05 contains multi-step form patterns — NO (gap identified)
- [x] Trigger boundary between skills 04 and 05 is clear — YES, structurally robust
- [ ] No unexpected co-triggers from adjacent skills — FAIL: skill 11 co-triggers on "plan"

---

## Bugs / Issues Found

**BUG-S08-01 (Medium): Skill 11 co-triggers on "plan" in "plan selection"**
The bare trigger "plan" in skill 11 (billing-payments) matches the phrase "plan selection" in the test prompt. The developer is asking about multi-step form UI, not billing — but skill 11 would activate and inject billing-related guidance. This creates unwanted noise and potentially confusing output. Recommend replacing bare "plan" with "pricing plan", "subscription plan", or "billing plan" in skill 11's trigger list.

**BUG-S08-02 (Low): Skill 05 has no multi-step form pattern**
The form handling section covers a single-form implementation using React Hook Form + Zod. There is no multi-step wizard pattern (step state management, per-step schema validation, progress indicators). A developer following the scenario 8 prompt would get useful foundation code but no guidance on the specific architecture they need (step tracking, conditional schema application, back/next navigation). Recommend adding a multi-step form section to skill 05 with a `useMultiStepForm` hook pattern or equivalent.

---

## Summary

Skill 05 (fullstack-development) correctly triggers on "React" in "React Hook Form". Skill 04 (tech-architecture) does not trigger — the trigger boundary between the two skills is clear and robust because skill 04 is oriented entirely toward technology selection decisions while skill 05 covers implementation patterns.

The main unexpected finding is that skill 11 (billing-payments) co-triggers due to the bare "plan" trigger word matching "plan selection". This is a false positive introduced by an overly short trigger string.

The second finding is a content gap: skill 05 covers single-form React Hook Form + Zod patterns well but lacks a multi-step form wizard pattern, which is the specific structure the test prompt requests.
