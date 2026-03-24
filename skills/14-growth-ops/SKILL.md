---
name: growth-ops
description: "Post-launch growth — analytics, event tracking, A/B testing, feedback loops, retention analysis, cost optimization, email campaigns, referral programs, and content strategy."
triggers:
  - "analytics"
  - "event tracking"
  - "A/B testing"
  - "funnel"
  - "retention"
  - "churn"
  - "growth"
  - "referral program"
  - "email campaign"
  - "NPS"
  - "onboarding optimization"
  - "content strategy"
  - "user feedback"
---

# Growth Ops

> Phase 4: GROW | Sprint 6 (planned)
> Consolidated from analytics + post-launch-ops + growth-marketing (G12)

## Analytics Coverage

- Platform selection (Amplitude, Mixpanel, PostHog, Umami)
- Event taxonomy (noun_verb naming, property schema)
- Funnel instrumentation (signup → activation → core action → payment)
- Web vitals tracking
- A/B testing (GrowthBook, Statsig)
- Session replay (FullStory, Hotjar, PostHog — PII redaction)

## Operations Coverage

- Feedback loops (in-app widget, NPS day 7, power user outreach)
- Activation rate analysis (drop-off identification, onboarding iteration)
- Bug triage cadence (P0 same-day, P1 48h, public changelog)
- Retention cohort tracking (D1, D7, D30)
- Cost optimization (weekly cloud review, right-sizing, billing alerts)
- Security patch cadence
- Post-incident reviews (blameless retro)

## Growth Coverage

- Email lifecycle campaigns (onboarding, re-engagement, upgrade, churn prevention, win-back)
- Referral program design (double-sided, tracking, reward mechanics)
- Paid acquisition testing ($500/3 channels/2 weeks, measure CAC)
- Content strategy template (SEO keyword calendar, publish cadence)
- Community building (Discord/Slack, changelog, case studies)

## Checklist Items

### Analytics Setup
<!-- beginner -->
**Set up analytics** — You need to know how people use your app. Pick ONE analytics tool (PostHog is free and open source). Track key events: signup, activation (first core action), and payment. Without this, you're guessing what to improve.

<!-- intermediate -->
**Analytics (PostHog/Amplitude)** — Event taxonomy, funnel instrumentation, web vitals. Track signup → activation → core action → payment.

<!-- senior -->
**Analytics** → Event taxonomy + funnel + vitals.

## Companion tools
- `coreyhaines31/marketingskills` → full 26-skill suite
- `alirezarezvani/claude-skills` → `growth-marketer`, `content-creator`
