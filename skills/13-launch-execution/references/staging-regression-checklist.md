# Staging Regression Checklist

## When to use
Run this full checklist against your staging environment before every production deployment — it is your last safety net before real users see your code.

## Decision framework

```
What kind of deploy is this?
├── First launch / major release?
│   → Run the FULL checklist below (all categories)
├── Feature release (new user-facing functionality)?
│   → Run P0 categories + any categories the feature touches
├── Hotfix (single bug fix)?
│   → Run affected flow + auth + payment (abbreviated regression)
└── Infrastructure-only change (no UI/API changes)?
    → Run health checks + auth + one core flow smoke test
```

---

## Copy-paste template

Copy this checklist into your project tracker, war room channel, or PR description. Replace `[CUSTOMIZE]` markers with your app-specific flows.

```markdown
# Staging Regression Checklist
**Release:** [CUSTOMIZE: version or release name]
**Date:** [CUSTOMIZE: YYYY-MM-DD]
**Tested by:** [CUSTOMIZE: name]
**Staging URL:** [CUSTOMIZE: https://staging.yourapp.com]
**Browser(s):** [CUSTOMIZE: Chrome 12x + Safari/Firefox]
**Mobile device:** [CUSTOMIZE: iPhone 15 / Pixel 8 / emulator]

---

## P0 — Auth Flows
- [ ] Signup with email/password — account created, verification email received
- [ ] Signup with OAuth — [CUSTOMIZE: Google / GitHub / Apple] — account created, redirects correctly
- [ ] Login with email/password — session created, redirected to dashboard
- [ ] Login with OAuth — session created, correct user data loaded
- [ ] Password reset — request email received, reset link works, new password accepted
- [ ] Session expiry — after [CUSTOMIZE: 24h / 7d / 30d], user is redirected to login
- [ ] Session refresh — active users are not logged out mid-session
- [ ] MFA enrollment — [CUSTOMIZE: TOTP / SMS] — setup flow completes, code accepted
- [ ] MFA login — prompted for second factor, correct code grants access, wrong code rejected
- [ ] Logout — session destroyed, cannot access protected routes, back button does not restore session
- [ ] Account lockout — after [CUSTOMIZE: 5] failed attempts, account is temporarily locked
- [ ] Concurrent sessions — [CUSTOMIZE: allowed / single-session-only] — behaves as expected

## P0 — Core Features
- [ ] [CUSTOMIZE: Primary user action] — end-to-end flow completes successfully
- [ ] Create — new [CUSTOMIZE: resource] created, visible in list, persisted after refresh
- [ ] Read — [CUSTOMIZE: resource] list loads, detail view shows correct data
- [ ] Update — edit [CUSTOMIZE: resource], changes saved, UI reflects update immediately
- [ ] Delete — remove [CUSTOMIZE: resource], confirmation prompt shown, item removed from list
- [ ] Search — query returns relevant results, empty query handled, no results state shown
- [ ] Filtering — [CUSTOMIZE: filter fields] narrow results correctly, filters combinable
- [ ] Sorting — [CUSTOMIZE: sort fields] reorder correctly, default sort is sensible
- [ ] Pagination — page navigation works, deep pages load, page size respected
- [ ] File upload — [CUSTOMIZE: images / documents / CSV] — upload succeeds, preview shown, size limit enforced
- [ ] File download / export — [CUSTOMIZE: PDF / CSV / image] — downloads correctly, file is valid
- [ ] Real-time features — [CUSTOMIZE: websockets / SSE / polling] — updates appear without refresh

## P0 — Payment Flows
- [ ] Checkout — [CUSTOMIZE: one-time / subscription] — payment completes with test card (4242...)
- [ ] Subscription create — plan selected, payment processed, user upgraded, access granted
- [ ] Subscription upgrade — plan change reflected, prorated charge correct, new features accessible
- [ ] Subscription downgrade — plan change reflected, access adjusted at period end
- [ ] Subscription cancel — cancellation confirmed, access continues until period end, no further charges
- [ ] Failed payment — declined card handled gracefully, user notified, retry mechanism works
- [ ] Webhook processing — Stripe/[CUSTOMIZE: provider] webhooks received and processed on staging
- [ ] Invoice / receipt — generated correctly, accessible to user, amounts match
- [ ] Free trial — [CUSTOMIZE: trial length] — trial starts, trial expiry triggers correct behavior
- [ ] Coupon / promo code — [CUSTOMIZE: if applicable] — discount applied correctly at checkout
- [ ] Tax calculation — [CUSTOMIZE: if applicable] — tax shown correctly for test addresses
- [ ] Refund flow — [CUSTOMIZE: if applicable] — refund processed, user notified, access adjusted

## P0 — Security
- [ ] HTTPS redirect — HTTP requests redirect to HTTPS (no mixed content warnings)
- [ ] CSP headers — Content-Security-Policy header present, no violations in console
- [ ] X-Frame-Options — set to DENY or SAMEORIGIN
- [ ] Auth on protected routes — unauthenticated access returns 401/redirects to login
- [ ] Authorization — users cannot access other users' data (test with 2 accounts)
- [ ] Input validation — XSS payloads rejected (try `<script>alert(1)</script>` in text fields)
- [ ] SQL injection — parameterized queries verified (try `' OR 1=1 --` in search fields)
- [ ] CSRF protection — state-changing requests require valid token
- [ ] Rate limiting — rapid repeated requests return 429 after threshold
- [ ] File upload validation — reject oversized files, reject non-allowed extensions, scan for malware if applicable
- [ ] Admin endpoints — protected, not accessible to regular users
- [ ] API keys — no test/sandbox keys leaking to client, production keys in env vars only

## P1 — Email Flows
- [ ] Welcome email — sent on signup, subject correct, body renders, links point to production URLs
- [ ] Password reset email — sent on request, link works, expires after [CUSTOMIZE: 1h]
- [ ] Email verification — link works, re-send option available
- [ ] Payment receipt — sent after purchase, amounts correct, links to dashboard
- [ ] Subscription change confirmation — sent on upgrade/downgrade/cancel
- [ ] [CUSTOMIZE: notification type] email — trigger condition works, content correct
- [ ] Notification preferences — user can opt out, preferences are respected
- [ ] Emails render in Gmail — no broken layout, images load, links work
- [ ] Emails render in Outlook — no broken layout (Outlook is the hardest)
- [ ] Emails do not land in spam — SPF/DKIM/DMARC passing (check headers)
- [ ] Unsubscribe link — present in marketing emails, one-click unsubscribe works
- [ ] Reply-to address — set to a monitored inbox

## P1 — Edge Cases
- [ ] Empty states — new account with no data shows helpful empty state (not a blank page or error)
- [ ] Error states — API errors show user-friendly message, not stack trace or raw JSON
- [ ] 404 page — navigating to non-existent route shows custom 404 page
- [ ] 500 error handling — server error shows friendly error page, error logged to Sentry
- [ ] Rate limits — user sees helpful message when rate limited, not a cryptic error
- [ ] Concurrent requests — rapid double-clicks on submit do not create duplicates
- [ ] Large data sets — list views with [CUSTOMIZE: 100+ / 1000+] items load without crashing
- [ ] Long text input — very long names/descriptions handled (truncated or scrollable, not breaking layout)
- [ ] Special characters — unicode, emojis, RTL text do not break UI or cause encoding errors
- [ ] Slow network — app degrades gracefully on 3G (loading spinners shown, no hanging)
- [ ] Offline state — [CUSTOMIZE: if applicable] — offline banner shown, data not lost
- [ ] Browser back/forward — navigation state preserved, no stale data shown

## P1 — Mobile / Responsive
- [ ] 375px (mobile) — layout renders, text readable, buttons tappable (min 44px tap target)
- [ ] 768px (tablet) — layout adapts, no horizontal scroll, navigation accessible
- [ ] 1024px (laptop) — layout fills space, no unnecessary whitespace or cramped elements
- [ ] 1440px (desktop) — layout centered or fills, max-width constraints respected
- [ ] Touch interactions — swipe, pinch-to-zoom, long-press behave correctly
- [ ] Orientation change — portrait ↔ landscape transition does not break layout or lose state
- [ ] Mobile keyboard — input fields not obscured when keyboard is open
- [ ] Mobile navigation — hamburger menu / bottom nav works, back button behaves correctly
- [ ] iOS Safari quirks — viewport height correct (100dvh), overscroll behavior acceptable
- [ ] Android Chrome — layout and interactions match iOS behavior

## P2 — Performance
- [ ] Page load time — [CUSTOMIZE: homepage / dashboard] loads in < [CUSTOMIZE: 2s] on cable
- [ ] Largest Contentful Paint (LCP) — < 2.5s on mobile (check with Lighthouse)
- [ ] Cumulative Layout Shift (CLS) — < 0.1 (no layout jumps during load)
- [ ] Interaction to Next Paint (INP) — < 200ms (UI responds to clicks immediately)
- [ ] API response times — critical endpoints respond in < [CUSTOMIZE: 200ms / 500ms]
- [ ] Image optimization — images served in WebP/AVIF, properly sized, lazy-loaded below fold
- [ ] Bundle size — JS bundle < [CUSTOMIZE: 200KB] gzipped (check with build output)
- [ ] Caching — static assets have cache headers, API responses cached where appropriate
- [ ] Database queries — no N+1 queries on list pages (check query logs)
- [ ] Memory leaks — long session does not increase memory usage (check browser DevTools)

---

## Sign-off

| Role | Name | Status | Date |
|------|------|--------|------|
| QA / Tester | [CUSTOMIZE] | [ ] Passed / [ ] Failed | |
| Engineering Lead | [CUSTOMIZE] | [ ] Approved | |
| Product Owner | [CUSTOMIZE] | [ ] Approved | |

**Blocking issues found:**
- [CUSTOMIZE: list any P0 failures here — these must be fixed before deploy]

**Known issues (non-blocking):**
- [CUSTOMIZE: list any P1/P2 issues to address post-launch]
```

---

## Customization notes

- **Add your own flows**: The `[CUSTOMIZE]` markers indicate where you should add your app-specific features. A SaaS will have different core flows than an e-commerce app or a developer tool.
- **Scale the checklist**: For a solo launch with <100 users, focus on P0 items only. For a team launch targeting 1K+ users, complete all categories.
- **Automate what you can**: Move repeatable checks (auth flows, API response times, Core Web Vitals) into your automated test suite (Playwright, Cypress) so the manual checklist shrinks over time.
- **Time budget**: Full checklist takes ~1-2 hours manual. P0-only takes ~30-45 minutes. Automated suite can cover 60-70% of P0 items.

## Companion tools

- Playwright (`npx playwright test`) — automate browser-based regression tests
- Lighthouse CI (`npx lhci autorun`) — automate Core Web Vitals checks
- Sentry — verify zero new errors on staging after deploy
- Stripe test mode — use test card numbers for payment flow verification
- Mail testing (Mailtrap / Mailpit) — capture and inspect transactional emails in staging
