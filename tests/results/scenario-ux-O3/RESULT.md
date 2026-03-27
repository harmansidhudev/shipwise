# Scenario O3: Dormant User Re-engagement Strategy

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify the onboarding reference doc provides guidance for re-engaging a user who signed up 10 days ago and never returned.

## Test Prompt
```
A user signed up 10 days ago and never came back. What should I do to re-engage them?
```

## Expected Behavior
- Email sequence with timing
- In-app welcome back state
- Activation metrics reference
- No aggressive re-engagement

## Actual Behavior

### Trigger Match
The test prompt discusses re-engagement of a dormant user. While there is no exact "re-engagement" trigger in the SKILL.md trigger list, the phrases "onboarding flow", "first-time user", and "activation metric" are listed triggers. The concept of a user who "never came back" relates to onboarding failure and activation. The trigger match is indirect -- the skill may or may not auto-trigger depending on how broadly the trigger engine interprets the prompt. A trigger like "re-engagement", "dormant user", or "churn" would strengthen coverage.

### Validation Item Analysis

1. **Email sequence with timing:** COVERED. Section 7 ("Re-engagement for dormant users") provides a 3-email sequence table with timing at Day 7, Day 14, and Day 30. Each row includes a subject line template and content focus. The trigger logic specifies: "If user signed up AND never activated AND last login > 7 days ago --> start re-engagement sequence." For the test prompt's 10-day-old user, they would be between the Day 7 and Day 14 emails, meaning the Day 7 email should already have been sent. This aligns well with the scenario.

2. **In-app welcome back state:** COVERED. Section 7 provides a `WelcomeBack` React component that calculates days since last visit, displays a personalized greeting, lists recent updates, and includes a "Pick up where I left off" CTA plus a dismiss button. This handles the in-app experience when the dormant user does return.

3. **Activation metrics reference:** COVERED. Section 6 defines activation metrics with a table of events by product type and a definition template. Section 7's trigger logic explicitly references activation state: "If user signed up AND never activated" vs "If user activated AND last login > 14 days ago." This connects the re-engagement strategy back to whether the user hit the activation milestone, which is the correct framing for the test prompt's "signed up but never came back" scenario.

4. **No aggressive re-engagement:** COVERED. Section 8 (Anti-patterns) includes "Re-engagement emails too aggressively (daily)" with the fix "Space emails: Day 7, Day 14, Day 30 max." The email sequence in Section 7 follows this exact spacing. The 3-email maximum over 30 days is conservative and respectful.

## Verdict
PASS

## Findings

### Positive Observations
- The trigger logic in Section 7 correctly distinguishes between "never activated" users and "activated but churned" users, which require different messaging strategies. This is a sophisticated distinction that many onboarding docs miss.
- The email timing (Day 7, 14, 30) is grounded in the anti-patterns table, creating internal consistency between the positive guidance and the anti-pattern warnings.
- The WelcomeBack component includes `onDismiss` so the returning user is not trapped, consistent with the anti-pattern guidance about forced experiences.
- The Day 30 email includes an incentive (discount/extended trial) as a last resort, showing appropriate escalation.

### Gaps
- **Trigger coverage is weak.** The SKILL.md trigger list does not include "re-engagement", "dormant user", "churn", "win-back", or "retention." A developer asking the test prompt's question may not get this skill auto-triggered. Adding these triggers would close the gap.
- No guidance on unsubscribe handling or email compliance (CAN-SPAM, GDPR consent). The email sequence section assumes the user can be emailed but does not mention opt-out requirements.
- No guidance on what "never came back" looks like analytically -- whether to use last login timestamp, last API call, or session-based activity. The trigger logic uses "last login > 7 days ago" but does not define what constitutes a "login" for SPAs or API-first products.
- No push notification or in-app notification channel mentioned as alternatives to email for re-engagement. Some users may not open emails but would respond to browser push or mobile notifications.
- The WelcomeBack component has placeholder `[CUSTOMIZE]` items for recent updates but no guidance on how to programmatically source "what's new" content (e.g., from a changelog feed or feature flag system).
