# Diagnostic Questionnaire

## When to use
Run this interview when a developer first uses Shipwise to establish their project profile and calibrate all output.

## The 9-Question Interview

### Q1: Project Type
**Ask:** "What are you building?"
**Options:** SaaS | Marketplace | Tool | API | Other (describe)

**Why it matters:** Determines which checklist items apply. A marketplace needs payment splitting; an API needs rate limiting docs; a SaaS needs billing portal.

### Q2: Target Audience
**Ask:** "Who is it for?"
**Options:** B2C consumers | B2B businesses | Developers | Internal tool

**Why it matters:**
- B2B → SOC 2 readiness, SLA pages, admin dashboards matter more
- B2C → SEO, onboarding flow, mobile experience matter more
- Developers → API docs, SDK, changelog, status page matter more
- Internal → Auth/SSO, audit logs, lower SEO priority

### Q3: Current Phase
**Ask:** "What phase are you in?"
**Options:** Idea | Designing | Building | Ready to ship | Already live

**Why it matters:** Sets the starting phase in state.json. Idea/Designing → design phase. Building → build. Ready to ship → ship. Live → grow.

### Q4: Tech Stack
**Ask:** "What's your tech stack? (or 'haven't decided yet')"
**Free text.** Parse for known frameworks.

**Why it matters:** Stack-specific templates (Next.js security headers vs Express helmet), deployment recommendations, and CI/CD templates.

### Q5: User Status
**Ask:** "Do you have users yet?"
**Options:** No | Beta testers | Paying customers

**Why it matters:** Paying customers → billing, legal compliance, and error tracking are P0. No users → more flexibility.

### Q6: Monetization
**Ask:** "Are you charging money?"
**Options:** No | Free | Freemium | Paid only

**Why it matters:** Determines whether billing/payments skill items appear in the checklist. "No" or "Free" → skip billing items.

### Q7: Team Size
**Ask:** "Solo or team?"
**Options:** Solo | Co-founded (2) | Small team (3-5) | Larger team (6+)

**Why it matters:** Solo → no ownership assignment needed. Team → enable @owner tags in checklist items. Larger team → incident response roles, war room setup.

### Q8: Experience Level
**Ask:** "How would you describe your experience level?"
**Options:**
- New to coding — learning with AI tools
- Junior — 1-2 years, comfortable with basics
- Mid-level — 3-5 years, independent
- Senior — 5+ years, architectural decisions

**Why it matters:** Controls ALL output verbosity throughout Shipwise. See experience calibration doc for full impact matrix.

### Q9: Expected Scale
**Ask:** "How many users do you expect at launch?"
**Options:** <100 | 100-1,000 | 1,000-10,000 | 10,000+

**Why it matters:** Adjusts priority of infrastructure items. <100 users don't need auto-scaling or load testing.

## Post-Interview Processing

1. Map Q8 answer to experience_level: New/Junior → beginner, Mid-level → intermediate, Senior → senior
2. Map Q3 answer to current_phase: Idea/Designing → design, Building → build, Ready to ship → ship, Live → grow
3. Detect stack from Q4 + codebase scan
4. Generate items array with priorities adjusted by Q9 scale
5. Store everything in shipwise-state.json
