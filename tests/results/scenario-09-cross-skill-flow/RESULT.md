# Scenario 9: Cross-Skill Flow — Architecture → Development

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 04-tech-architecture → 05-fullstack-development
- **User archetype:** beginner
- **Interaction mode:** sequential multi-turn conversation (same session)
- **Test fixture:** none specified (no state file pre-loaded)

## Objective
Evaluate whether the cross-skill transition from tech-architecture (skill 04) to fullstack-development (skill 05) is smooth or jarring across three sequential prompts. Specifically: do the skills build coherent context on the chosen stack, and does the session have any continuity mechanism that carries the tech decisions from prompt 1 into prompts 2 and 3?

## Test Prompts (in sequence)

```
[Prompt 1] I'm building a project management SaaS. Help me choose my tech stack.
[Prompt 2] Great, let's go with Next.js, Postgres, and Clerk for auth. Now help me
           set up the database schema for projects, tasks, and team members.
[Prompt 3] Now build me the API endpoints for creating and listing projects.
```

---

## Prompt 1 Analysis: "Help me choose my tech stack"

### Trigger matching — skill 04 (tech-architecture)

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "tech stack" | "tech stack" | YES — exact match |
| (no other architecture phrases) | "framework selection", "which framework", etc. | No additional matches |

Skill 04 fires. One exact trigger match is sufficient.

### Trigger matching — skill 05 (fullstack-development)

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "building" | (no bare "building" trigger) | NO |
| "project management SaaS" | "React", "Vue", "component", "API route", "database schema", etc. | NO |
| "tech stack" | (no "tech stack" trigger in skill 05) | NO |

Skill 05 does NOT co-trigger on prompt 1. This is the correct behavior. The two skills are cleanly separated here.

### State file behavior

Skill 04 SKILL.md instructs: "Before making any recommendation, check `.claude/shipwise-state.json`" for project type, audience, stack, scale, experience level, and team size. If state is absent: "ask the minimum needed: 'What are you building, who is it for, and how many users do you expect at launch?'"

No state file is present in the test scenario. Skill 04 would therefore gate behind a clarifying question rather than immediately recommending a stack. The user said "I'm building a project management SaaS" — this partially answers "what are you building." The skill still needs audience (B2B? B2C?) and scale before it can tailor the recommendation.

**Result for prompt 1:** Claude would ask a follow-up question, not deliver a direct stack recommendation. The user's prompt contains enough context to identify the project type (SaaS), but audience and scale are missing. This is correct defensive behavior but means prompt 1 does not produce a full stack recommendation in a single turn.

### Beginner-mode behavior (once context is gathered)

Skill 04's beginner block for frontend says: "Recommend ONE framework. Default to Next.js." For a SaaS dashboard, the quick-recommendations table independently maps to Next.js (App Router). The full-stack recommendation mode would assemble: Next.js + REST + Postgres/Prisma + Clerk + Vercel. This aligns well with what the user chooses in prompt 2.

---

## Prompt 2 Analysis: "Database schema for projects, tasks, and team members"

### Trigger matching — skill 05 (fullstack-development)

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "database schema" | "database schema" | YES — exact match |
| "Next.js" | "React" (not "Next.js") | NO — "Next.js" is not in the trigger list |
| "Postgres" | (no "postgres" trigger) | NO |
| "Clerk" | (no "clerk" trigger) | NO |

Skill 05 triggers on "database schema" — one exact match. This is correct: the user is now in fullstack-development territory.

### Trigger matching — skill 04 (tech-architecture)

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "database schema" | "database choice" | NO — "database schema" is not "database choice" |
| "Next.js, Postgres, and Clerk" | "auth strategy", "authentication approach" | NO |
| "team members" | (nothing) | NO |

Skill 04 does NOT co-trigger on prompt 2. Clean transition.

### Continuity gap — the central problem

Prompt 2 begins: "Great, let's go with Next.js, Postgres, and Clerk for auth." This is the user confirming their stack choices, but **there is no mechanism in the skill system to have automatically recorded those choices from prompt 1**.

Skill 04 SKILL.md says at the end: "Once the developer picks their stack: 1. Update `shipwise-state.json` → `project.stack` with all selections." This is an instruction to Claude, not an automated hook. Whether Claude actually writes to `shipwise-state.json` at the end of prompt 1 depends on whether it followed that instruction, and whether the user's confirmation in prompt 2 was clear enough to trigger the write.

The hooks system does **not** help here:
- `session-context.sh` reads from `shipwise-state.json` at session start — it does not update mid-session on stack decisions.
- `post-edit-check.sh` fires on file edits — it does not fire on conversational stack choices.
- `stop-updater.sh` runs at session end — too late for intra-session continuity.
- No hook writes stack choices to state on conversational confirmation.

**Conclusion:** The stack "Next.js, Postgres, Clerk" exists only in the conversation thread. Skill 05 has no mechanism to read it from state. Skill 05's SKILL.md makes no reference to reading `shipwise-state.json`. The skill body covers generic database schema conventions (snake_case, UUIDs, timestamps, soft deletes, indexes) but does not personalize them to Postgres specifically. There is nothing in skill 05 that would cause it to say "since you chose Prisma earlier, here is the schema in Prisma SDL" — it would produce generic patterns.

### What skill 05 would actually produce for the schema question

Skill 05 SKILL.md's "Database schema conventions" section covers:
- Table naming: `snake_case`, plural
- Primary keys: UUID v7 or CUID2
- Timestamps: `created_at`, `updated_at` on every table
- Soft deletes: `deleted_at`
- Foreign keys: `<singular_table>_id`
- Indexes: every FK, every WHERE column
- Enums: string enums or lookup tables, not DB-level
- Booleans: `is_` prefix

The skill also references `references/database-migration-guide.md` for the ORM recommendation. Skill 04's ORM table says "TypeScript (rapid prototyping) → Prisma" — but this is in skill 04, not skill 05. Skill 05 does not repeat the ORM recommendation.

**Beginner-mode gap:** There is no beginner block in skill 05 for the database schema section. The conventions table is experience-level agnostic. A beginner asking about schema for projects, tasks, and team members would receive the conventions table with no example Prisma schema or concrete CREATE TABLE statements. The skill points to a reference doc (`references/database-migration-guide.md`) but does not inline a copy-paste example for this specific use case.

---

## Prompt 3 Analysis: "Build me the API endpoints for creating and listing projects"

### Trigger matching — skill 05 (fullstack-development)

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "API endpoints" | "API route" | YES — close semantic match (not exact; trigger says "API route", not "API endpoints") |
| "creating and listing" | "API design" | YES — semantic match |

The trigger "API route" is a reasonable match for "API endpoints." "API design" also matches the task. Skill 05 stays active. No skill switch occurs on prompt 3 — this is the expected behavior.

### Trigger matching — skill 04 (tech-architecture)

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "API endpoints" | "REST vs GraphQL", "API architecture" | NO — "API endpoints" does not match "REST vs GraphQL" or "API architecture" exactly |

Skill 04 does not re-trigger on prompt 3. Good.

### Content produced by skill 05 for prompt 3

Skill 05's "API design patterns" section provides RESTful conventions:
- `GET /api/v1/resources` — list with pagination and filtering
- `POST /api/v1/resources` — create

This directly addresses what the user asked. The skill also covers pagination (cursor vs offset), filtering via query params, versioning, and rate limiting.

**Continuity gap (again):** The user asked for endpoints specifically for "projects." The API design section provides generic patterns, not a tailored `GET /api/v1/projects` and `POST /api/v1/projects` with the fields defined in the schema from prompt 2. The schema work done in prompt 2 (projects, tasks, team members) informs what fields the API endpoints should accept and return — but skill 05 has no access to what was discussed in prompt 2 except through the conversation thread.

**Next.js specifics:** The user chose Next.js in prompt 2. In Next.js App Router, API routes are defined in `app/api/[route]/route.ts`. Skill 05 does not mention Next.js API route conventions specifically. The SKILL.md is framework-agnostic. A beginner would not know whether to use `pages/api/` or `app/api/route.ts` from this skill alone.

---

## Cross-Skill Continuity Assessment

### What provides continuity

1. **The conversation thread itself.** In a single Claude session, all three prompts exist in the same context window. Claude has access to what was said in prompts 1 and 2 when answering prompt 3. This is not a Shipwise mechanism — it is native LLM behavior. The cross-skill transition works only because of this baseline, not because of any plugin infrastructure.

2. **CLAUDE.md context (from scaffold).** The `templates/claude-md-inject.md` template shows that after scaffolding, the project's CLAUDE.md contains: project type, audience, stack (frontend, backend, database, hosting, auth), current phase, experience level, scale target, and active gaps. If a scaffold was run before this session, the CLAUDE.md would contain `Stack: Next.js / Postgres / Clerk` and Claude would read it at session start. However:
   - No scaffold is run before this scenario.
   - Even if it were, the CLAUDE.md template uses `{{stack_summary}}` placeholders — these are filled at scaffold time. The stack is only in CLAUDE.md if scaffold already happened.
   - The skill 04 SKILL.md instructs Claude to write choices to `shipwise-state.json` after decisions, but this depends on Claude following the instruction, not on any hook or automation.

3. **session-context.sh hook.** This hook fires at session start and injects the readiness score, P0 gaps, and active skills into context. However, it reads from `shipwise-state.json`, which does not exist at the start of this scenario. The hook exits early (`[ ! -f "$STATE_FILE" ] && exit 0`). No context is injected.

### What does NOT provide continuity

- No hook writes stack decisions to state during a conversation.
- Skill 05 does not read `shipwise-state.json` at all — its SKILL.md has no instruction to check state before responding.
- There is no shared session memory file that skills read/write to track intra-session choices.
- The skills are independent SKILL.md files with no cross-references to each other except skill 04's "After decisions are made" section, which says to route to skill 05. But that routing is a suggestion for the developer, not a mechanism that passes context.

### Is the skill switch jarring?

For a developer reading the responses:

- **Prompt 1 → Prompt 2:** The switch from architecture advice to schema design is thematically coherent (you chose the stack, now you build with it). Claude's response would be coherent because the conversation thread carries the context. The jarring part is that skill 05's schema guidance is generic — it does not reference the Postgres/Prisma choice or produce a Prisma schema block. A beginner would expect to see actual schema code after "help me set up the database schema," but skill 05 delivers conventions, not code.

- **Prompt 2 → Prompt 3:** No skill switch occurs. Skill 05 handles both schema and API design. The transition within prompt 3 is smooth. The same generic-vs-specific gap applies: the API patterns are framework-agnostic, not tailored to Next.js App Router.

### The "After decisions are made" routing instruction

Skill 04 SKILL.md explicitly says:
> Once the developer picks their stack: [...] 3. Route to `05-fullstack-development` for implementation guidance

This is an explicit handoff instruction. However, it is written as narrative guidance to Claude, not as a system-level routing rule. There is no hook that enforces this routing. If Claude follows the instruction, it would proactively say "Now let's move to implementation — skill 05 will guide you on the schema and API work." But whether it does so is non-deterministic and depends on how Claude interprets the instruction.

---

## Verdict: PARTIAL

### Validation Checklist

- [x] **Prompt 1 triggers skill 04** — "tech stack" is an exact match in skill 04's trigger list. Skill 04 fires.
- [x] **Skill 05 does NOT co-trigger on prompt 1** — Prompt 1 contains no skill 05 trigger words ("React", "Vue", "component", "database schema", "API route", etc.). Clean separation.
- [x] **Prompt 2 transitions to skill 05** — "database schema" is an exact trigger match for skill 05. Correct.
- [x] **Skill 04 does NOT co-trigger on prompt 2** — "database schema" does not match "database choice" (skill 04's trigger). Clean.
- [x] **Prompt 3 stays in skill 05** — "API endpoints" semantically matches "API route" and "API design." Skill 05 remains active.
- [x] **Skill 04 does NOT re-trigger on prompt 3** — No architecture trigger words in prompt 3.
- [ ] **Skill system carries stack context between prompts** — FAILS. No hook or mechanism writes the stack decision to state mid-session. Skill 05 does not read shipwise-state.json. Continuity depends entirely on the LLM's conversation window, not on Shipwise infrastructure.
- [ ] **CLAUDE.md context informs all three responses** — FAILS for this scenario. No scaffold was run, so no CLAUDE.md exists with project context. The `templates/claude-md-inject.md` template has unfilled `{{placeholders}}` until scaffold runs.
- [ ] **Skill 05 schema response is personalized to Postgres/Prisma** — FAILS. Skill 05's schema section is ORM-agnostic and does not produce Prisma SDL or SQL DDL. A beginner receives conventions, not code.
- [ ] **Skill 05 API response is personalized to Next.js** — FAILS. Skill 05's API design patterns are framework-agnostic. No mention of `app/api/route.ts` or Next.js App Router conventions.
- [ ] **Skill 04 explicitly hands off to skill 05** — PARTIAL. The "After decisions are made" section instructs this routing, but it is non-binding narrative text, not an enforced mechanism.
- [ ] **Beginner receives copy-paste code for schema** — FAILS. Skill 05 has no beginner block with an inline Prisma schema example. The reference doc is external and may not exist.
- [x] **No jarring skill switch (thematic coherence)** — The topic progression (architecture → schema → API) is logically coherent. The switch is not jarring in terms of topic flow.

---

## Findings

### Positive
- The trigger separation between skills 04 and 05 works correctly across all three prompts. Skill 04 fires on prompt 1 only. Skill 05 fires on prompts 2 and 3 only. No co-triggering.
- The semantic trigger "API route" matching "API endpoints" works reasonably in practice, though it is not an exact match.
- Skill 04's "After decisions are made" section explicitly names skill 05 as the next stop — there is at least an intent for handoff built into the skill.
- The LLM's native conversation window provides de facto session continuity: Claude remembers "Next.js, Postgres, Clerk" from prompt 2 when answering prompt 3 without any Shipwise help.
- The thematic flow (architecture → schema → API) is coherent and would feel natural to a developer.

### Negative
- **No intra-session state write:** When a user confirms their stack in prompt 2, nothing in the Shipwise system writes `project.stack` to `shipwise-state.json`. The hooks are hook-event-driven (session start, file edit, deploy, session stop) — there is no "on conversational confirmation" hook. The whole cross-skill continuity is dependent on Claude's context window and how well it follows the "Update shipwise-state.json" instruction in skill 04.
- **Skill 05 is blind to the chosen stack:** Skill 05's SKILL.md contains no instruction to read `shipwise-state.json` before responding. It cannot know the user chose Postgres/Prisma vs SQLite/Drizzle vs MongoDB. It produces the same generic schema conventions regardless. This is a significant gap: a beginner who asked for "the database schema" expects to see schema code for their chosen database and ORM, not a table of naming conventions.
- **No copy-paste code in skill 05 for schema:** The CLAUDE.md states "Reference docs must contain at least one copy-paste code template." Skill 05 has a code template for form handling (React Hook Form + Zod) and an error handling class — but not for database schema. A beginner doing prompt 2 would get no Prisma schema to copy.
- **Next.js API route conventions absent:** Skill 05 teaches generic REST conventions but does not address Next.js App Router's `route.ts` file structure. A beginner following prompt 3 would not know how to implement the patterns in their chosen framework.
- **Session-context hook is inert:** Because no `shipwise-state.json` exists at session start, `session-context.sh` exits immediately. The hook that is supposed to inject readiness score and active skills into the context window produces nothing. The entire session runs without Shipwise's contextual injection.
- **CLAUDE.md template is unfilled:** The `templates/claude-md-inject.md` shows `{{project_type}}`, `{{stack_summary}}`, `{{experience_level}}` placeholders. Without a prior scaffold run, these are empty. No project context reaches Claude through CLAUDE.md.
- **Skill 04 routing instruction is non-binding:** "Route to 05-fullstack-development" is prose in a SKILL.md file. There is no API or hook enforcement. Whether Claude follows it is non-deterministic.

---

## Bugs / Issues to File

- [ ] **BUG-09-A: No intra-session hook to write stack decisions to state** — When a developer confirms their stack in conversation, nothing writes to `shipwise-state.json`. The "Update shipwise-state.json → project.stack" instruction in skill 04 SKILL.md is non-binding prose. A `PostToolUse` or conversation-turn hook that detects stack confirmations and writes to state would fix this. Without it, the session-context hook and all state-dependent skills are inert for new users.

- [ ] **BUG-09-B: Skill 05 does not read shipwise-state.json** — Skill 05's SKILL.md has no instruction to check state before responding. It cannot personalize schema or API guidance to the chosen ORM, database, or framework. Fix: add a "Read project context first" block to skill 05 (matching skill 04's pattern) that reads `project.stack` and tailors guidance accordingly.

- [ ] **BUG-09-C: Skill 05 lacks copy-paste schema example for beginner** — The beginner archetype in prompt 2 expects a concrete Prisma schema or SQL DDL for their specific entities (projects, tasks, team members). Skill 05 delivers naming conventions only. A `<!-- beginner -->` block with an inline Prisma schema template (covering common SaaS entities) would resolve this.

- [ ] **BUG-09-D: No Next.js App Router API route guidance in skill 05** — A user who chose Next.js in prompt 1 and asks for API endpoints in prompt 3 would receive generic REST patterns with no mention of `app/api/[resource]/route.ts` file structure. Skill 05 should include a Next.js-specific API route template, either inline or in a reference doc, and its beginner block should surface it when Next.js is the chosen stack.

- [ ] **BUG-09-E: session-context.sh is inert for new users** — The hook exits immediately when no `shipwise-state.json` exists. New projects get no Shipwise context injection at session start. The scaffold command (`/shipwise`) must be run first, but this is not enforced or surfaced to the user. Consider having the hook output a one-time "Run /shipwise to activate launch tracking" message when state is absent, instead of silently exiting.

- [ ] **BUG-09-F: Skill 04 "route to skill 05" is non-binding** — The handoff instruction at the end of skill 04 is prose with no enforcement mechanism. If Claude misses it, the developer is left with a stack decision but no guidance on how to start building. Consider a dedicated transition message template that skill 04 is instructed to output verbatim when the stack decision is finalized.
