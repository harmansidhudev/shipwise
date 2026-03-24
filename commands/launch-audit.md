---
name: launch-audit
description: "Full codebase re-scan for launch readiness. Updates shipwise-state.json with current status."
user_invocable: true
---

# /launch-audit Command

You are performing a comprehensive launch readiness audit.

## Steps

1. **Verify state exists.** If `.claude/shipwise-state.json` doesn't exist, tell the user to run `/shipwise` first.

2. **Deep scan the codebase.** Use the `launch-readiness-auditor` agent to perform a thorough scan. Check for:

   **Build phase items:**
   - CI/CD pipeline (GitHub Actions, etc.)
   - Test coverage (unit, integration, E2E)
   - TypeScript/type safety configuration
   - Linting and formatting setup
   - Security headers implementation
   - Input validation on API routes
   - Auth hardening (rate limiting, secure cookies, CSRF)
   - Error handling patterns
   - Environment variable management (.env.example)

   **Ship phase items:**
   - Error tracking (Sentry, etc.)
   - Health endpoints
   - Structured logging
   - Backup configuration
   - SEO basics (robots.txt, sitemap, meta tags, structured data)
   - Privacy policy and terms of service
   - Cookie consent
   - Billing/payment integration (if applicable)

   **Grow phase items:**
   - Analytics setup
   - Feedback mechanisms
   - Changelog

3. **Update state.** Write scan results to `shipwise-state.json`, marking newly found items as "done" and newly missing items appropriately.

4. **Log history.** Append current readiness percentage with timestamp to the history array.

5. **Report.** Display:
   - Overall readiness percentage (with trend if history exists)
   - Progress bar
   - Items completed since last audit
   - Remaining P0 gaps with time estimates
   - Recommended next actions (top 3)

6. **Experience-adjusted output:**
   - **Beginner:** Explain each gap in plain English, offer to fix the easiest one first
   - **Intermediate:** List gaps with time estimates, suggest priority order
   - **Senior:** Terse gap list only
