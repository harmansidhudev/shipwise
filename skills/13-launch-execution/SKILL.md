---
name: launch-execution
description: "Launch day planning — staging regression, production verification, rollback plans, war room setup, launch-day sequence, monitoring protocol."
triggers:
  - "launch day"
  - "go live"
  - "production deploy"
  - "rollback plan"
  - "war room"
  - "launch checklist"
  - "staging test"
  - "production ready"
  - "Product Hunt"
  - "launch sequence"
---

# Launch Execution

> Phase 3: SHIP | Sprint 3 (planned)

## Coverage

- Staging full regression
- Production readiness verification
- Rollback plan template (DB reversal, feature flags, communication)
- Support channels (in-app chat, email, escalation)
- Transactional email testing
- Launch-day sequence (engineering + marketing coordination):
  - T-2h: staging final check
  - T-1h: deploy to production, verify health
  - T-0: PH/HN/Reddit posts, first social
  - T+30m: email waitlist
  - T+1h: check error rates, signup funnel
  - T+2h: second social, respond to comments
  - T+4h: daily summary, address issues
- War room setup (role assignments, dedicated channel)
- Monitoring protocol (error rates, latency, signups, payments)
- Rapid hotfix process

## Checklist Items

### Rollback Plan
<!-- beginner -->
**Create a rollback plan** — Before launch, write down exactly how to undo the deploy if things go wrong. Include: how to revert the code, how to revert database changes, who to notify, and what to tell users. Having this plan BEFORE you need it prevents panic.

<!-- intermediate -->
**Rollback plan** — Code revert procedure, DB migration rollback, feature flags, communication templates, DNS rollback if applicable.

<!-- senior -->
**Rollback plan** → Code/DB/feature-flag/DNS revert procedures.

## Companion tools
- `coreyhaines31/marketingskills` → `launch-strategy`
