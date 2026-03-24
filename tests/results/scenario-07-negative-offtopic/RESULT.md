# Scenario 7: Negative Test — Off-Topic Prompts (Should NOT Trigger)

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** All 15 (00 through 14) — none should trigger
- **User archetype:** N/A (off-topic prompts)
- **Interaction mode:** Natural conversation
- **Test fixture:** N/A

## Objective
Verify that completely off-topic prompts do not accidentally trigger any Shipwise skill due to overly broad trigger words. Four prompts are tested: weather, networking, poetry, and job applications.

## Complete Trigger Inventory

The following is the full list of trigger strings extracted from all 15 skill frontmatters.

| Skill | Triggers |
|-------|---------|
| 00 launch-assess | "help me launch", "where am I", "what do I need", "launch checklist", "ship wisely", "am I ready", "what's next", "ready to ship", "launch readiness", "pre-launch" |
| 01 validate-idea | "validate my idea", "idea validation", "market research", "competitive analysis", "competitor analysis", "TAM SAM SOM", "market size", "user interview", "user interviews", "persona", "user persona", "landing page test", "MVP validation", "problem statement", "go-to-market", "customer discovery", "product-market fit", "is this a good idea", "problem worth solving", "target market", "willingness to pay", "concierge MVP", "wizard of oz", "jobs to be done", "JTBD" |
| 02 product-design | "product design", "MVP", "MVP scope", "user story", "user stories", "roadmap", "product roadmap", "wireframe", "information architecture", "user flow", "design system", "accessibility", "WCAG", "responsive design", "pricing model", "feature prioritization", "MoSCoW", "RICE scoring", "RICE", "design handoff", "design tokens", "color tokens", "typography scale", "spacing system", "component inventory", "breakpoints", "mobile-first" |
| 03 business-legal | "business entity", "LLC", "C-Corp", "S-Corp", "incorporation", "incorporate", "co-founder", "cofounder", "equity", "equity split", "vesting", "vesting schedule", "IP assignment", "intellectual property", "domain", "domain name", "trademark", "business bank account", "EIN", "accounting", "QuickBooks", "bookkeeping", "insurance", "legal foundation", "business formation", "Delaware", "operating agreement" |
| 04 tech-architecture | "framework selection", "which framework", "database choice", "choose a database", "tech stack", "architecture decisions", "hosting", "where to host", "auth strategy", "authentication approach", "REST vs GraphQL", "API architecture", "pick a stack", "stack recommendations" |
| 05 fullstack-development | "React", "Vue", "Svelte", "component", "API route", "database schema", "migration", "frontend", "backend", "fullstack development", "state management", "form handling", "API design", "caching", "error handling" |
| 06 platform-infrastructure | "CI/CD", "GitHub Actions", "Docker", "Dockerfile", "Docker Compose", "Terraform", "infrastructure as code", "deploy pipeline", "deployment", "secrets management", "environment variables", "env vars", "DNS", "SSL", "CDN", "Cloudflare", "container", "staging", "production", "preview environment", "IaC" |
| 07 quality-assurance | "testing", "unit test", "integration test", "E2E test", "end-to-end test", "Playwright", "Vitest", "load testing", "k6", "code quality", "test coverage", "ESLint", "Prettier", "cross-browser", "flaky test", "test pyramid" |
| 08 security-compliance | "security", "OWASP", "auth hardening", "rate limiting", "CSRF", "XSS", "SQL injection", "security headers", "CSP", "vulnerability", "pen test", "dependency scanning", "secret scanning", "gitleaks", "Snyk", "Dependabot", "helmet", "Argon2", "MFA", "input validation", "DOMPurify", "SSRF" |
| 09 observability | "monitoring", "observability", "Sentry", "error tracking", "logging", "structured logging", "alerting", "health check", "health endpoint", "backup", "disaster recovery", "incident response", "status page", "uptime", "APM", "metrics", "tracing", "Datadog", "Grafana", "Better Uptime", "auto-scaling", "HPA", "scale-to-zero", "runbook", "post-mortem", "RTO", "RPO" |
| 10 seo-performance | "SEO", "meta tags", "Open Graph", "sitemap", "robots.txt", "structured data", "JSON-LD", "canonical", "lighthouse", "performance", "bundle size", "image optimization", "caching", "landing page", "onboarding", "search console", "core web vitals", "Twitter Cards", "code splitting", "tree shaking", "lazy loading", "WebP", "AVIF", "srcset", "Cache-Control", "service worker", "CDN" |
| 11 billing-payments | "billing", "payment", "payments", "Stripe", "Paddle", "Lemon Squeezy", "subscription", "checkout", "invoice", "pricing", "plan", "trial", "free trial", "dunning", "webhook", "recurring", "revenue", "MRR", "churn", "proration", "payment processor", "billing portal", "tax compliance", "VAT", "sales tax" |
| 12 legal-compliance | "privacy policy", "terms of service", "cookie consent", "GDPR", "CCPA", "data protection", "compliance", "legal", "DPA", "DSAR", "data retention", "SOC 2", "open source license", "cookie banner", "license audit", "legal compliance" |
| 13 launch-execution | "launch", "deploy", "go live", "production", "release", "staging", "rollback", "war room", "launch day", "ship", "production readiness", "regression", "hotfix", "production deploy", "launch checklist", "staging test", "production ready", "Product Hunt", "launch sequence", "feature flag", "go/no-go" |
| 14 growth-ops | "analytics", "growth", "retention", "churn", "funnel", "A/B test", "experiment", "NPS", "feedback", "referral", "email campaign", "content strategy", "acquisition", "activation", "onboarding metrics", "cohort", "DAU", "MAU", "MRR", "CAC", "LTV", "cost optimization", "event tracking", "Amplitude", "Mixpanel", "PostHog", "GrowthBook" |

---

## Test Prompt A: "What's the weather like in Denver?"

### Trigger analysis

Check each token in the prompt against all skill triggers. Triggers are matched by substring/keyword.

| Word/phrase from prompt | Potential trigger match | Skill | Match? |
|------------------------|------------------------|-------|--------|
| "what's" | (none) | — | No |
| "the" | (none) | — | No |
| "weather" | (none) | — | No |
| "like" | (none) | — | No |
| "in" | (none) | — | No |
| "Denver" | (none) | — | No |

No trigger word from any skill appears in this prompt. The prompt contains no technology, product, legal, or business vocabulary that overlaps with any trigger list.

**Result: PASS — zero skills triggered.**

---

## Test Prompt B: "Explain how TCP/IP works"

### Trigger analysis

| Word/phrase from prompt | Potential trigger match | Skill | Match? |
|------------------------|------------------------|-------|--------|
| "Explain" | (none) | — | No |
| "how" | (none) | — | No |
| "TCP/IP" | (none) | — | No |
| "works" | (none) | — | No |

No trigger word matches. "TCP/IP" is a networking protocol not referenced in any skill trigger. Although skill 04 covers API architecture and skill 06 covers infrastructure, neither has "TCP", "IP", "network", or "protocol" as trigger words.

**Result: PASS — zero skills triggered.**

---

## Test Prompt C: "Write a poem about debugging"

### Trigger analysis

| Word/phrase from prompt | Potential trigger match | Skill | Match? |
|------------------------|------------------------|-------|--------|
| "Write" | (none) | — | No |
| "poem" | (none) | — | No |
| "about" | (none) | — | No |
| "debugging" | (none) | — | No |

"Debugging" is not a trigger word in any skill. Skill 07 (quality-assurance) covers code quality and testing but its triggers are specific tool and technique names ("testing", "unit test", "Playwright", etc.), not the generic word "debugging".

**Result: PASS — zero skills triggered.**

---

## Test Prompt D: "Help me write a cover letter for a software engineering job"

### Trigger analysis

This prompt requires the most careful scrutiny because it contains potentially broad-matching words ("Help me", "write", "engineering").

| Word/phrase from prompt | Potential trigger match | Skill | Match? |
|------------------------|------------------------|-------|--------|
| "Help me" | partial match concern: skill 00 has "help me launch" | 00 | NO — trigger is the full phrase "help me launch", not just "help me" |
| "write" | (none) | — | No |
| "a" | (none) | — | No |
| "cover" | (none) | — | No |
| "letter" | (none) | — | No |
| "for" | (none) | — | No |
| "a" | (none) | — | No |
| "software" | (none) | — | No |
| "engineering" | (none) | — | No |
| "job" | (none) | — | No |

The phrase "Help me write a cover letter" does not contain "launch", so the skill 00 trigger "help me launch" does not fire. No other trigger matches any word or phrase in this prompt.

**Result: PASS — zero skills triggered.**

---

## Validation Checklist

- [x] Prompt A ("weather in Denver") — 0 skills triggered
- [x] Prompt B ("TCP/IP") — 0 skills triggered
- [x] Prompt C ("poem about debugging") — 0 skills triggered
- [x] Prompt D ("cover letter") — 0 skills triggered

---

## Broad-Trigger Risk Assessment

Even though all four prompts passed, the following triggers were identified as candidates for accidental false-positives on real-world off-topic conversation:

| Trigger | Skill | Risk level | Reasoning |
|---------|-------|-----------|-----------|
| "component" | 05 fullstack-development | Medium | A single common English word. A prompt like "This is a key component of my argument" would fire skill 05. |
| "migration" | 05 fullstack-development | Medium | Common in non-dev contexts ("data migration", "bird migration", "visa migration"). |
| "security" | 08 security-compliance | Medium | Extremely common English word. "Job security", "security guard", "homeland security" would all match. |
| "performance" | 10 seo-performance | Medium | Common in all domains. "Performance review", "music performance", "athletic performance" would all match. |
| "compliance" | 12 legal-compliance | Medium | "Regulatory compliance", "compliance officer" in non-web contexts would fire this. |
| "legal" | 12 legal-compliance | Medium | Any discussion of laws, regulations, or legal matters would trigger this even if unrelated to app development. |
| "testing" | 07 quality-assurance | Medium | "I'm testing a new recipe", "drug testing" would match. |
| "caching" | 05 / 10 | Low | More technical, unlikely in off-topic chat, but appears in both skills 05 and 10 as a trigger. |
| "domain" | 03 business-legal | Low | "Domain expertise", "problem domain" in non-DNS contexts could match. |
| "plan" | 11 billing-payments | Low | "I need a plan for dinner" would technically match the trigger "plan" in skill 11. |
| "growth" | 14 growth-ops | Low | General business/personal conversation ("personal growth") would trigger. |
| "feedback" | 14 growth-ops | Low | "Give me feedback on my essay" would match. |
| "experiment" | 14 growth-ops | Low | Scientific or culinary contexts could trigger. |
| "retention" | 14 growth-ops | Low | HR contexts ("employee retention") would fire. |

### Notable finding: "plan" in skill 11

Skill 11 (billing-payments) has "plan" as a bare trigger word. This is a high false-positive risk. Many natural conversations include the word "plan" with no billing intent: "I need a plan", "what's your plan", "plan of attack". Claude Code trigger matching on a single common word like this will produce unwanted activations.

### The four test prompts are clean

None of the four off-topic prompts happened to contain any of the risky single-word triggers above. The test prompts were well-chosen: weather, networking, poetry, and cover letters do not overlap with any Shipwise vocabulary.

---

## Bugs / Issues Found

**BUG-S07-01 (Medium): "component" is too broad a trigger (skill 05)**
The trigger "component" is a common English word used outside software development. Example: "That's a key component of my business strategy" would trigger fullstack-development. Recommend narrowing to "React component", "UI component", or "Vue component".

**BUG-S07-02 (Medium): "security" is too broad a trigger (skill 08)**
"Security" appears in everyday language far beyond application security. "Job security" or "national security" would fire the security-compliance skill. Recommend replacing with "app security", "web security", or specific attack/tool names already in the list (OWASP, XSS, CSRF, etc.).

**BUG-S07-03 (Medium): "performance" is too broad a trigger (skill 10)**
"Performance" is domain-agnostic. Music, athletics, HR reviews all use this word. Recommend narrowing to "web performance", "Core Web Vitals", "Lighthouse score", or "page speed".

**BUG-S07-04 (Low): "plan" is too broad a trigger (skill 11)**
A single common noun with no qualifiers. "plan" appears in everyday conversation constantly. Recommend replacing with "pricing plan", "subscription plan", or "billing plan".

**BUG-S07-05 (Low): "legal" is too broad a trigger (skill 12)**
Any legal discussion unrelated to app compliance (contract law, employment law, criminal law) would fire the legal-compliance skill. Recommend narrowing to "app legal", "legal compliance", or relying on the more specific triggers already present (GDPR, CCPA, privacy policy, etc.).

---

## Summary

**Overall result: PASS for all four test prompts.**

None of the four prompts trigger any skill. The trigger vocabulary in Shipwise is sufficiently domain-specific that off-topic prompts about weather, networking protocols, poetry, and job applications produce zero matches.

However, the broad-trigger risk assessment identifies 14 triggers across 8 skills that could produce false-positives in real developer conversations that are adjacent to (but not about) webapp development. The most urgent are "component" (skill 05), "security" (skill 08), and "performance" (skill 10).
