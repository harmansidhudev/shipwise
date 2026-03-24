# MVP Scoping & RICE Scoring

## When to use

Reference this guide when defining your MVP feature set, prioritizing a backlog, resolving feature debates, or creating a product roadmap. Use MoSCoW for broad categorization and RICE for data-driven prioritization within categories.

## Decision framework

```
How do I decide what goes in the MVP?
│
├── Step 1: Brain dump
│   └── List every feature anyone has ever suggested. Do not filter yet.
│
├── Step 2: MoSCoW categorization
│   ├── Must-have   — App is broken or useless without it. Launch blocker.
│   ├── Should-have — Important but can ship 2-4 weeks after launch.
│   ├── Could-have  — Nice to have. Build if time allows.
│   └── Won't-have  — Explicitly out of scope. Write it down to prevent revisiting.
│
├── Step 3: Validate must-haves (max 3-5)
│   ├── More than 5 must-haves? → You are building too much. Demote some to should-have.
│   └── Each must-have answers: "If we launch without this, will users leave immediately?"
│
├── Step 4: RICE score the must-haves and should-haves
│   └── Rank by RICE score to break ties and sequence work.
│
└── Step 5: Scope lock
    └── Commit to must-haves only for MVP. Document everything else as post-MVP.
```

---

## MoSCoW categorization guide

| Category | Definition | Decision test | MVP inclusion |
|----------|------------|---------------|---------------|
| **Must-have** | App cannot function or deliver core value without it | "Would a user abandon the app on day 1 without this?" | Yes — launch blocker |
| **Should-have** | Important but workarounds exist | "Would users complain but still use the app without this?" | No — V1.1 (2-4 weeks post-launch) |
| **Could-have** | Desirable enhancement | "Would users notice if this was missing?" | No — V2 (2-3 months post-launch) |
| **Won't-have** | Explicitly excluded | "Is this out of scope for our target market/stage?" | No — maybe never |

**Key rule**: If everything is a must-have, nothing is. Force-rank by asking "if I could only ship THREE features, which three?"

---

## RICE scoring framework

RICE = (Reach x Impact x Confidence) / Effort

| Factor | Definition | Scale | How to estimate |
|--------|-----------|-------|-----------------|
| **Reach** | How many users will this affect per quarter? | Actual number (e.g., 500 users/quarter) | Use signup projections, existing user count, or funnel data |
| **Impact** | How much will this move the target metric per user? | 0.25 (minimal) / 0.5 (low) / 1 (medium) / 2 (high) / 3 (massive) | Compare to past features or estimate based on user research |
| **Confidence** | How sure are you about reach and impact estimates? | 100% (high — data-backed) / 80% (medium — some evidence) / 50% (low — gut feel) | Be honest. Gut feelings get 50%. |
| **Effort** | Person-months to build (or person-weeks for small teams) | Actual estimate (e.g., 2 person-weeks) | Include design, development, testing, documentation |

### RICE calibration examples

Use these examples to calibrate your own scoring. All examples assume a SaaS app with 1,000 active users.

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| Fix login bug (30% of users cannot log in) | 300 | 3 | 100% | 0.5 weeks | **1,800** | Highest |
| Add Google SSO | 500 | 2 | 80% | 2 weeks | **400** | High |
| Dashboard redesign | 800 | 1 | 50% | 6 weeks | **67** | Medium |
| Dark mode | 200 | 0.5 | 80% | 3 weeks | **27** | Low |
| Custom emoji reactions | 50 | 0.25 | 50% | 2 weeks | **3** | Lowest |

**How to read**: The login bug fix scores 1,800 (affects many users, massive impact, high confidence, low effort). Custom emoji scores 3 (few users care, minimal impact, uncertain value, moderate effort). The gap between 1,800 and 3 tells you exactly where to focus.

---

## Scope creep prevention strategies

1. **Written scope document** — Every feature in or out is documented with rationale. Decisions are not verbal.
2. **One-in-one-out rule** — Adding a new must-have requires demoting an existing must-have to should-have.
3. **Scope change log** — Track every scope change with date, who requested it, and the trade-off made.
4. **"Ship date is fixed" mindset** — The launch date does not move. If you are behind, cut scope, do not extend the timeline.
5. **Weekly scope review** — Spend 15 minutes reviewing the MoSCoW table weekly. Is anything creeping from should-have to must-have without a deliberate decision?
6. **"Just one more thing" tax** — Any scope addition must include an effort estimate reviewed by the person building it, not the person requesting it.

---

## Copy-paste templates

### RICE scoring spreadsheet template

```markdown
# RICE Scoring — [CUSTOMIZE] Project Name

Scoring date: [CUSTOMIZE] YYYY-MM-DD
Scored by: [CUSTOMIZE] Name

| # | Feature | MoSCoW | Reach (users/qtr) | Impact (0.25-3) | Confidence (%) | Effort (person-weeks) | RICE Score | Rank |
|---|---------|--------|--------------------|--------------------|----------------|----------------------|------------|------|
| 1 | [CUSTOMIZE] User authentication | Must | [CUSTOMIZE] 1000 | [CUSTOMIZE] 3 | [CUSTOMIZE] 100% | [CUSTOMIZE] 1 | [CALC] | |
| 2 | [CUSTOMIZE] Core workflow | Must | [CUSTOMIZE] 800 | [CUSTOMIZE] 3 | [CUSTOMIZE] 90% | [CUSTOMIZE] 3 | [CALC] | |
| 3 | [CUSTOMIZE] Email notifications | Should | [CUSTOMIZE] 600 | [CUSTOMIZE] 1 | [CUSTOMIZE] 80% | [CUSTOMIZE] 1 | [CALC] | |
| 4 | [CUSTOMIZE] Admin dashboard | Should | [CUSTOMIZE] 50 | [CUSTOMIZE] 2 | [CUSTOMIZE] 70% | [CUSTOMIZE] 4 | [CALC] | |
| 5 | [CUSTOMIZE] Social sharing | Could | [CUSTOMIZE] 200 | [CUSTOMIZE] 0.5 | [CUSTOMIZE] 50% | [CUSTOMIZE] 2 | [CALC] | |
| 6 | [CUSTOMIZE] Custom themes | Won't | — | — | — | — | — | — |

RICE formula: (Reach × Impact × Confidence) / Effort
```

### MoSCoW categorization template

```markdown
# MoSCoW Categorization — [CUSTOMIZE] Project Name

Date: [CUSTOMIZE] YYYY-MM-DD
Decision makers: [CUSTOMIZE] Names

## Must-have (launch blockers — MVP)
<!-- Max 3-5 items. If you have more, you are building too much. -->

| Feature | Rationale (why is this a launch blocker?) | RICE Score |
|---------|-------------------------------------------|------------|
| [CUSTOMIZE] User signup/login | Cannot use the app without authentication | [CALC] |
| [CUSTOMIZE] Core value workflow | This IS the product. Without it, there is no point. | [CALC] |
| [CUSTOMIZE] Basic data persistence | Users lose all work without saving. Unusable. | [CALC] |

## Should-have (V1.1 — 2-4 weeks post-launch)

| Feature | Rationale (why not MVP?) | Target release |
|---------|--------------------------|----------------|
| [CUSTOMIZE] Email notifications | Users can check the app manually for now | V1.1 |
| [CUSTOMIZE] Search/filter | Manageable with small data sets at launch | V1.1 |
| [CUSTOMIZE] Settings page | Defaults work for most users initially | V1.1 |

## Could-have (V2 — 2-3 months post-launch)

| Feature | Rationale (why low priority?) | Target release |
|---------|-------------------------------|----------------|
| [CUSTOMIZE] Dark mode | User preference, not core value | V2 |
| [CUSTOMIZE] Export to CSV | Manual workaround exists | V2 |
| [CUSTOMIZE] Team collaboration | Solo users first, teams later | V2 |

## Won't-have (explicitly out of scope)

| Feature | Rationale (why out of scope?) | Revisit condition |
|---------|-------------------------------|-------------------|
| [CUSTOMIZE] Mobile native app | Web-first strategy. PWA covers mobile. | When >50% traffic is mobile |
| [CUSTOMIZE] AI-powered features | Core product must prove value without AI | After PMF confirmed |
| [CUSTOMIZE] Marketplace/integrations | Need stable API first | V3+ |
```

### MVP scope document template

```markdown
# MVP Scope Document — [CUSTOMIZE] Product Name

## Meta
- **Author**: [CUSTOMIZE] Name
- **Date**: [CUSTOMIZE] YYYY-MM-DD
- **Status**: Draft | Approved | Locked
- **Target launch date**: [CUSTOMIZE] YYYY-MM-DD

## Product vision (one sentence)
[CUSTOMIZE] We help [target user] to [core action] so they can [desired outcome].

## Target user
[CUSTOMIZE] Describe your primary user persona in 2-3 sentences.

## MVP success criteria
<!-- How do you know if the MVP worked? Define 2-3 measurable goals. -->
1. [CUSTOMIZE] X signups within first 2 weeks
2. [CUSTOMIZE] Y% of users complete core workflow within first session
3. [CUSTOMIZE] Z% day-7 retention rate

## Feature scope

### Must-haves (MVP — shipping [CUSTOMIZE] date)
| # | Feature | User stories | RICE | Owner | Status |
|---|---------|-------------|------|-------|--------|
| 1 | [CUSTOMIZE] | Link to stories | [SCORE] | [NAME] | Not started |
| 2 | [CUSTOMIZE] | Link to stories | [SCORE] | [NAME] | Not started |
| 3 | [CUSTOMIZE] | Link to stories | [SCORE] | [NAME] | Not started |

### Should-haves (V1.1 — [CUSTOMIZE] date)
| # | Feature | RICE | Target |
|---|---------|------|--------|
| 1 | [CUSTOMIZE] | [SCORE] | V1.1 |
| 2 | [CUSTOMIZE] | [SCORE] | V1.1 |

### Out of scope (with rationale)
| Feature | Why out of scope | Revisit when |
|---------|-----------------|--------------|
| [CUSTOMIZE] | [REASON] | [CONDITION] |
| [CUSTOMIZE] | [REASON] | [CONDITION] |

## Roadmap

### MVP (Weeks 1-[CUSTOMIZE])
- [CUSTOMIZE] Must-have 1
- [CUSTOMIZE] Must-have 2
- [CUSTOMIZE] Must-have 3

### V1.1 (Weeks [CUSTOMIZE]-[CUSTOMIZE], 2-4 weeks post-launch)
- [CUSTOMIZE] Should-have features
- Quick wins from user feedback

### V2 (Month [CUSTOMIZE]-[CUSTOMIZE], 2-3 months post-launch)
- [CUSTOMIZE] Could-have features
- Data-informed features based on usage analytics

## Scope change log
| Date | Change | Requested by | Trade-off | Approved by |
|------|--------|-------------|-----------|-------------|
| | | | | |

## Risks and mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [CUSTOMIZE] Scope creep | Launch delay | One-in-one-out rule, weekly scope review |
| [CUSTOMIZE] Tech unknown | Effort underestimate | Spike first, adjust RICE after |
| [CUSTOMIZE] Low adoption | Wasted build effort | Validate with 5 user interviews before building |
```

---

## Customization notes

- **RICE effort units**: Use person-weeks for small teams (1-3 people) and person-months for larger teams. Be consistent across all features.
- **Reach estimation**: If you have no users yet, estimate based on your launch plan. "We will invite 200 beta users" means reach starts at 200 for broad features.
- **Confidence calibration**: Most teams overestimate confidence. If you have not talked to users about this feature, it is 50% confidence maximum.
- **MoSCoW review cadence**: Re-categorize weekly during the build phase. What seemed like a must-have may become a should-have as you learn more.
- **Scope document sharing**: Share the locked scope document with all stakeholders. Any scope change request must reference this document and follow the change log process.

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill — Implement prioritized features
- `google-labs-code/design-md` — Generate design specs from scope documents
