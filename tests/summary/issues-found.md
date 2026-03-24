# Issues Found During Testing

**Test Date:** 2026-03-24
**Source:** 12 QA scenarios (scenario-01 through scenario-12)
**Total issues:** 38 (8 critical, 10 high, 12 medium, 5 low, 3 improvement ideas)

---

## Critical (must fix before launch)

**BUG-04-A: Skill 04 trigger list missing all API technology names**
*Source: Scenario 4*
"tRPC", "GraphQL", "gRPC", "WebSocket", "subscriptions", "monorepo", "API tradeoff", "REST vs tRPC" are entirely absent from skill 04's trigger list. A developer asking a direct tRPC/GraphQL comparison question — one of the most common architecture decisions in TypeScript SaaS — receives no Shipwise guidance. The reference doc (backend-api-decision-tree.md) is the best content in this skill but is completely unreachable via auto-trigger. Fix: add "tRPC", "GraphQL", "gRPC", "API tradeoff", "subscriptions", "monorepo architecture" to skill 04's frontmatter triggers.

**BUG-03-C: Experience-level rendering mechanism is undocumented**
*Source: Scenario 3*
SKILL.md files use `<!-- beginner -->`, `<!-- intermediate -->`, `<!-- senior -->` HTML comment blocks, but there is no documented contract specifying how these blocks are filtered at runtime. If the host renders full SKILL.md content, beginners see comparison tables and terse senior output intended to be hidden from them. The "no comparison tables for beginners" rule in skill 04 is violated by the quick-recommendations table that appears in the main skill body before any experience block. Fix: document the rendering contract explicitly; either move all experience-sensitive content inside blocks, or specify that the runtime strips non-matching blocks before presenting to the user.

**BUG-09-A: No intra-session hook to write stack decisions to state**
*Source: Scenario 9*
When a developer confirms their stack in conversation, nothing writes to `shipwise-state.json`. Skill 04's "Update shipwise-state.json → project.stack" instruction is non-binding prose — whether Claude follows it is non-deterministic. All downstream skills (05, 06, 08, etc.) that could personalize output based on stack choice receive no signal. The session-context.sh hook reads state but no hook writes state mid-conversation. Fix: implement a mechanism (hook or explicit instruction pattern) to persist stack decisions to state when confirmed in conversation.

**BUG-09-E: session-context.sh is inert for new users (no state file)**
*Source: Scenario 9*
The session-context hook exits immediately (`[ ! -f "$STATE_FILE" ] && exit 0`) when no `shipwise-state.json` exists. Every new project runs without any Shipwise context injection until the user explicitly runs `/shipwise`. There is no prompt or hint to the user that they need to run it. New users who install the plugin and start coding receive zero value until they discover and run the scaffold command. Fix: have the hook output a one-time message when state is absent: "Run /shipwise to activate launch tracking" rather than silently exiting.

**BUG-04-B / BUG-03-B: No shipwise-state.json in test fixtures**
*Source: Scenarios 3, 4*
Scenarios 3 and 4 require a post-scaffold state file that doesn't exist in either fixture. Skills gate on reading `experience_level` and `project.stack` from state before delivering tailored advice. Without it, skill 04 asks a clarifying question rather than delivering recommendations. Fix: either add state files to each fixture as part of test setup, or document a required setup step that creates the state before these skills are invoked.

**BUG-S07-02: "security" is too broad a trigger (skill 08)**
*Source: Scenario 7*
"Security" is an extremely common English word. "Job security", "national security", "food security", "security guard" in any developer conversation would fire the security-compliance skill unexpectedly. Fix: remove bare "security" trigger and rely on the more specific triggers already present (OWASP, XSS, CSRF, auth hardening, Snyk, etc.) or replace with "web security", "app security", "application security".

**BUG-S07-03: "performance" is too broad a trigger (skill 10)**
*Source: Scenario 7*
"Performance" matches in HR ("performance review"), music, athletics, and general engineering contexts unrelated to web app performance. Fix: narrow to "web performance", "Core Web Vitals", "Lighthouse score", "page performance", "bundle performance".

**BUG-03-A: Skill 05 co-triggers on bare "frontend" word**
*Source: Scenario 3*
Skill 05 has "frontend" as a bare trigger word. Any prompt containing the word "frontend" — including "frontend framework" in a stack-selection question — fires skill 05 (fullstack-development) alongside skill 04 (tech-architecture). The two skills have overlapping scope and produce a bloated, confusing response. Fix: tighten to "frontend development", "frontend architecture", or "frontend implementation" rather than the bare word.

---

## High (should fix before marketing)

**BUG-001: Placeholder substitution unspecified in CLAUDE.md template**
*Source: Scenario 1*
`templates/claude-md-inject.md` uses `{{mustache}}` style placeholders (`{{project_type}}`, `{{top_gaps}}`, `{{stack_summary}}`, etc.) but neither SKILL.md nor shipwise.md instructs how Claude should fill them. A model could leave the literal `{{top_gaps}}` string in the user's CLAUDE.md. Fix: add explicit instruction in SKILL.md and shipwise.md: "Replace each `{{placeholder}}` with the corresponding value from the auditor's JSON output. `{{top_gaps}}` = the first 3 items from the auditor's `checklist` array where `status = 'todo'` and `priority = 'P0'`."

**BUG-04-C: Fixture name / scenario archetype mismatch**
*Source: Scenario 4*
Scenario 4 is labeled "Senior" and tests senior behavior, but uses the `midlevel-saas-project` fixture. The fixture name implies an intermediate developer. If the scenario requires senior state, either rename the fixture or use the `senior-monorepo-project` fixture (which exists in the test suite) instead.

**BUG-05-A: requestId missing from error format**
*Source: Scenario 5*
`error-handling-patterns.md` does not include `requestId` in the error response envelope. The format is `{ error: { code, message, details? } }` — no correlation ID. For production debugging (matching a client error report to a server log line), requestId is essential. Fix: add `requestId: crypto.randomUUID()` or equivalent to the error envelope and global handler in error-handling-patterns.md.

**BUG-06-A: Empty state template missing from all reference docs**
*Source: Scenario 6*
No reference doc covers the empty state pattern (empty data + call-to-action). This is one of the most common UI states in data-driven apps. The component-architecture.md DataTable template handles isLoading and populated states but has no `if (data.length === 0)` branch. Fix: add an `EmptyState` atom template to component-architecture.md.

**BUG-06-E: No ARIA guidance for interactive table features**
*Source: Scenario 6*
Neither component-architecture.md nor responsive-design-checklist.md covers `aria-sort` on sortable columns, `aria-checked` on row selection checkboxes, keyboard navigation for table rows, or `aria-live` for dynamic table updates. The skill produces semantically correct HTML tables but not accessible interactive tables. When a developer explicitly asks to "make it accessible," the skill partially answers the request. Fix: add an "Interactive table accessibility" section to component-architecture.md.

**BUG-09-B: Skill 05 does not read shipwise-state.json**
*Source: Scenario 9*
Skill 05's SKILL.md has no instruction to check state before responding. It cannot personalize schema or API guidance to the chosen ORM, database, or framework. A developer who chose Postgres/Prisma via skill 04 receives the same generic schema conventions as a developer who chose MongoDB. Fix: add a "Read project context first" block to skill 05 matching skill 04's pattern.

**BUG-09-C: Skill 05 lacks copy-paste schema example for beginners**
*Source: Scenario 9*
The CLAUDE.md states "Reference docs must contain at least one copy-paste code template." Skill 05 has templates for form handling and error handling but not for database schema. A beginner asking for "the database schema for projects, tasks, and team members" receives naming conventions, not schema code. Fix: add a beginner block with an inline Prisma schema template covering common SaaS entities (users, organizations, projects, tasks).

**BUG-S08-01: Skill 11 co-triggers on bare "plan" in "plan selection"**
*Source: Scenarios 7, 8*
Skill 11 (billing-payments) has "plan" as a bare trigger word. The phrase "plan selection" in a multi-step form prompt fires billing guidance where none was intended. This is confirmed as an active false positive in scenario 8. Fix: replace bare "plan" with "pricing plan", "subscription plan", or "billing plan".

**BUG-09-D: No Next.js App Router API route guidance in skill 05**
*Source: Scenario 9*
Skill 05 teaches generic REST conventions but does not address Next.js App Router's `route.ts` file structure (`app/api/[resource]/route.ts`). A user who chose Next.js asks for API endpoints and receives framework-agnostic patterns with no guidance on file placement. Fix: add a Next.js-specific section to skill 05's API design patterns, or update the beginner block to surface the App Router template when Next.js is detected in state.

**BUG-002: Scale-priority table incomplete**
*Source: Scenarios 1, 2*
The scale-priority table in skill 00's SKILL.md covers only 8 items. Approximately 17 of the ~25 auditor checklist items (CI/CD, legal pages, SEO metadata, security headers, error boundaries, health endpoints, etc.) have no scale-based adjustment and default to the auditor's generic priority assignment. For a <100-user beginner project, CI/CD might reasonably be P2 rather than P1. Fix: expand the scale table to cover all ~25 items, or add a default rule: "For items not listed, use P2 for <100 users, P1 for 100-1K, P0 for 1K+."

---

## Medium (fix in next sprint)

**BUG-S07-01: "component" is too broad a trigger (skill 05)**
*Source: Scenarios 3, 7*
"Component" is a common English word beyond React development. "A key component of my business strategy" would fire the fullstack-development skill. Additionally, the narrow trigger means "data grid", "sortable table", "UI element" do not trigger the skill at all (only "component" does). Fix: tighten to "React component", "UI component", "Vue component", "Svelte component"; add "data grid", "table component", "UI element" as explicit triggers.

**BUG-05-B: No admin/role-based access control template**
*Source: Scenario 5*
Neither SKILL.md nor any reference doc provides a `requireRole('admin')` or similar guard pattern. Admin-only endpoints are a common pattern in every SaaS app but the developer must implement the guard themselves without reference guidance. Fix: add a `requireRole(role)` middleware factory to api-design-patterns.md.

**BUG-05-C: Pagination type inconsistency**
*Source: Scenario 5*
SKILL.md says "offset-based for admin tables" but api-design-patterns.md only provides a cursor-based template. The developer is told one thing and given a template for another. Fix: either add an offset-based template to api-design-patterns.md, or update the SKILL.md guidance to "cursor-based for all list endpoints" for consistency.

**BUG-06-B: Inline async error state not covered**
*Source: Scenario 6*
error-handling-patterns.md covers ErrorBoundary for render errors but not the `if (error) return <InlineError onRetry={refetch} />` pattern for async data fetch errors. A data table's most common error scenario is a failed API call — this has no prescribed template. Fix: add an inline error state template with retry action to component-architecture.md or error-handling-patterns.md.

**BUG-06-C: Skill 05 trigger list too narrow for component work**
*Source: Scenario 6*
Only "component" reliably catches React UI prompts. "Build a data grid", "create a sortable table", "make a filterable list" would not trigger skill 05. Fix: add "table", "grid", "sortable", "filterable", "data display", "UI component" to skill 05's trigger list.

**BUG-06-D: Button sm variant (32px) violates 44px touch target rule**
*Source: Scenario 6*
component-architecture.md defines Button `size: { sm: 'h-8 px-3' }` (32px height). responsive-design-checklist.md mandates ≥44px touch targets. The skill's own templates are internally inconsistent. Fix: either increase the `sm` size to `h-11` (44px) or add a code comment: "Do not use size='sm' on mobile touch targets."

**BUG-04-D: Scenario 4 brief contains inaccurate tension framing**
*Source: Scenario 4*
The brief states "GraphQL better for subscriptions" — the reference doc explicitly shows tRPC also has built-in subscriptions. This is a false premise that could mislead future test runners. Fix: update the scenario brief to reflect the actual trade-off (tRPC wins for same-team TS monorepo; GraphQL is preferable only for external clients or different data shape needs).

**BUG-04-E: In-body decision tree does not branch on real-time needs**
*Source: Scenario 4*
The decision tree in skill 04's SKILL.md body has only a "Special case: real-time needed → add WebSocket/SSE layer" comment. The reference doc handles this correctly. Fix: update the in-body tree to include the real-time fork or remove the comment and rely entirely on the reference doc.

**BUG-11-A: Architecture skill is wrong format for /launch-checklist**
*Source: Scenario 11*
The `/launch-checklist architecture` command routes to skill 04, but skill 04 is structured as a decision advisor (decision trees, comparison tables, recommendation logic) — not a checklist. It has no pre-formatted checklist items with checkboxes, time estimates, or "Want me to implement this?" prompts. Fix: either add a dedicated checklist section to skill 04, or create a separate `04-architecture-checklist.md` reference that formats the architecture concerns as actionable checklist items.

**BUG-11-B: Invalid domain input has no error handler**
*Source: Scenario 11*
`/launch-checklist cooking` produces undefined behavior. The command handles missing domain (no argument) but not an invalid domain. Fix: add a fallback clause to commands/launch-checklist.md: "If the domain is not in the mapping table: respond with 'Unknown domain: [domain]. Available domains are: [list].'"

**BUG-09-F: Skill 04 "route to skill 05" is non-binding**
*Source: Scenario 9*
The handoff instruction at the end of skill 04 is prose with no enforcement. Whether Claude follows it is non-deterministic. Fix: add a dedicated transition message template that skill 04 is instructed to output verbatim when the stack decision is finalized, e.g., "Stack locked: Next.js + Postgres + Clerk. Now run `/launch-checklist fullstack` or ask me to help with your database schema."

**BUG-10-A: Output symbol rendering implicit not specified**
*Source: Scenario 10*
The launch-readiness-auditor outputs `"status": "done" | "partial" | "todo"` but the checkmark/warning/X symbol mapping is never documented. The rendering layer must infer the mapping. Fix: add a display spec to commands/launch-audit.md: "`done` → ✓, `partial` → ⚠, `todo` → ✗" and specify where the symbols appear in the output.

---

## Low (nice to have)

**BUG-003: No first-item prioritization rule for guided mode**
*Source: Scenario 1*
The beginner post-scaffold says "Let's start with the most important item" but there is no rule specifying ordering or selection criteria. P0 > P1 > P2 is implied but not stated. Fix: add explicit rule to SKILL.md: "The first item in guided mode is always the first P0 item from the auditor's checklist, sorted by the auditor's priority field."

**BUG-005: ESLint/Prettier not a first-class auditor checklist item**
*Source: Scenario 2*
The auditor's scanning procedure has no dedicated check for linting/formatting configuration (.eslintrc*, .prettier*, biome.json). These would be present in the midlevel fixture but would not appear as a "done" item in the audit JSON. Fix: add a "Code quality tooling" item to the auditor's checklist.

**BUG-006: Rate limiting detection is too coarse**
*Source: Scenario 2*
The auditor Greps globally for `rateLimit`/`rate-limit`. It would miss granular rate limiting on individual sensitive routes. The check is a file-presence test, not a route-coverage test. Fix: improve to check for rate limiting calls within route handler files specifically, not just anywhere in the codebase.

**BUG-07: midlevel fixture missing dependabot.yml**
*Source: Scenario 2*
A "mid-level SaaS with beta testers" would realistically have Dependabot configured. The absence means the fixture tests only the negative case. Fix: add `.github/dependabot.yml` to the fixture to enable positive-case detection testing, or document the absence as intentional.

**BUG-05-D: No password/credentials auth guidance in skill 05**
*Source: Scenario 5*
The skill has no coverage for password hashing, credentials-based signup, or JWT issuance. Any prompt asking to build a signup endpoint with username/password auth falls entirely outside the skill's templates. Fix: add a "Custom credentials auth" section or reference to skill 08's auth-hardening-checklist.md when a signup prompt is detected.

---

## Improvement Ideas

**IDEA-01: Add "Next.js" as an explicit skill 05 trigger**
*Source: Scenario 9*
"Next.js" is not in skill 05's trigger list (only "React" is). A developer saying "I'm using Next.js, how do I..." would only trigger on "React" incidentally if that word appears. Adding "Next.js", "Nuxt", "SvelteKit", "Remix" as explicit framework triggers would increase coverage for framework-specific implementation questions.

**IDEA-02: Add `references/empty-state-patterns.md`**
*Source: Scenario 6*
Empty states are one of the most commonly forgotten UI requirements, and they are highly visible to users (every new account sees them). A dedicated reference doc with `EmptyState` templates (empty list with CTA, empty search results, first-time user onboarding state) would fill a gap present across multiple skills.

**IDEA-03: Skill 04 should surface the auth-strategy-decision-tree on B2B SaaS scaffold**
*Source: Scenarios 1, 12*
The auth-strategy-decision-tree.md is one of the most practically useful reference docs (8 auth options with a B2B decision path to Clerk vs Auth0 with cost table). During scaffold, if the user says "B2B SaaS", skill 04 / the auditor could proactively reference this decision tree. Currently it is only surfaced if the user asks about auth strategy explicitly.
