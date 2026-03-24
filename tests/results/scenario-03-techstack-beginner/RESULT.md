# Scenario 3: Tech Stack Decision — Beginner

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 04-tech-architecture
- **User archetype:** beginner
- **Interaction mode:** auto-trigger (trigger words present in prompt)
- **Test fixture:** tests/fixtures/beginner-nextjs-project/

## Objective
Verify that the tech-architecture skill triggers correctly on a beginner's full-stack question, delivers a single opinionated recommendation (not a comparison table), uses beginner-mode language, and avoids co-triggering skill 05 (fullstack-development).

## Test Prompt
```
I'm starting a new SaaS product for HR teams. I need to pick my tech stack.
What frontend framework should I use? I know a little React. Also need a
database and somewhere to host it. What do you recommend?
```

## Expected Behavior
- Skill 04 auto-triggers; skill 05 does NOT co-trigger.
- Response reads project context from `.claude/shipwise-state.json` first (or asks the minimum scoping question if state is absent).
- For frontend: recommends ONE framework (Next.js), no comparison table.
- For database: recommends PostgreSQL + Prisma, no alternatives listed.
- For hosting: recommends Vercel, no infrastructure discussion.
- Response uses plain language suitable for a beginner.
- Companion skills mentioned at the end.

## Actual Behavior

### Trigger analysis

The prompt contains the following words. Cross-referencing against skill 04 triggers:

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "tech stack" | "tech stack" | YES |
| "frontend framework" | "framework selection" / "which framework" | YES (semantic) |
| "database" | "database choice" | YES (semantic) |
| "somewhere to host" | "hosting" / "where to host" | YES |

Skill 04 has 4 direct or near-direct trigger matches. It will fire.

Cross-referencing against skill 05 (fullstack-development) triggers:

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "frontend framework" | "frontend" | YES — "frontend" is a literal trigger in skill 05 |
| (nothing else) | "React", "component", "API route", "backend", etc. | No other matches |

**Bug found:** The prompt contains the word "frontend" (in "frontend framework"). Skill 05 has "frontend" as a bare trigger word. This would cause skill 05 to co-trigger alongside skill 04. The scenario description assumed this wouldn't happen, but the skill 05 trigger list is too broad. See Bugs section.

### State file gap

No `shipwise-state.json` exists in `tests/fixtures/beginner-nextjs-project/.claude/`. SKILL.md says: "If state doesn't exist, ask the minimum needed: 'What are you building, who is it for, and how many users do you expect at launch?'" The skill would prompt for context before answering rather than immediately giving recommendations. This is correct defensive behavior but means the response is gated behind a clarifying question — the test prompt would not produce a direct stack recommendation in a single turn.

### Beginner-mode frontend recommendation

The `<!-- beginner -->` block in SKILL.md for frontend explicitly instructs: "Recommend ONE framework. Don't present a comparison table — it causes decision paralysis. Default to Next.js unless there's a clear reason not to." The developer mentions "I know a little React" — this actually reinforces the Next.js default pick. The skill would correctly give a single recommendation.

The quick-recommendations table in SKILL.md (for all levels) shows "SaaS with dashboard → Next.js (App Router)" which aligns with the HR SaaS use case.

### Beginner-mode database recommendation

The `<!-- beginner -->` block instructs: "Use PostgreSQL with Prisma... Don't mention alternatives unless asked." This is clean opinionated advice with no comparison.

### Beginner-mode API strategy

The `<!-- beginner -->` block for API says: "Default to REST. Start with REST API routes." This is appropriate. However, the test prompt does not ask about API strategy — the skill applies the full-stack recommendation mode (SKILL.md: "When a developer asks 'what stack should I use'...combine all decision trees"). The beginner will receive a REST recommendation without asking — which is fine, but it means more output than the user requested.

### Beginner-mode hosting

The `<!-- beginner -->` block: "Your app is Next.js, so let's deploy to Vercel. Connect your GitHub repo and it's live in 2 minutes." Single recommendation, no infrastructure talk. Correct.

### Auth strategy

The skill's full-stack recommendation mode also includes auth (step 4: "Auth follows from framework + audience"). For a B2B SaaS (HR teams), the skill would recommend Clerk or Auth0. The beginner block says: "Recommend Clerk for SaaS." The prompt did not ask about auth, but the skill may volunteer it as part of a full-stack recommendation. This is a potential verbosity issue for beginners.

### Companion skills surfaced

SKILL.md lists two companion tools in the "Companion tools" section:
- `alirezarezvani/claude-skills` → `senior-architect`
- `levnikolaevich/claude-code-skills` → architecture audit

Both are labeled "senior-architect" and "architecture audit" — these are senior-oriented companions. For a beginner user, surfacing these is unlikely to be helpful and may be confusing. The skill has no beginner-filtered companion tool section.

### Decision matrix / quick recommendations table

The SKILL.md body contains a "Quick recommendations by project type" table. The beginner block for framework says to NOT present a comparison table. However, the quick-recommendations table is in the main skill body (not in an experience-level block), so it may be rendered regardless of experience level. This is ambiguous — whether the runtime filters to `<!-- beginner -->` blocks only, or renders the full skill body plus experience blocks, is not specified in the SKILL.md.

## Verdict: ⚠️ PARTIAL

### Validation Checklist

- [x] **Skill 04 auto-triggers** — "tech stack", "frontend framework" (→ "framework selection"), "database", "host" all match trigger words in the frontmatter.
- [ ] **Skill 05 does NOT co-trigger** — FAILS. "frontend" is a bare trigger in skill 05's trigger list and appears verbatim in the prompt ("frontend framework"). Skill 05 would co-trigger.
- [ ] **State-aware response** — No `shipwise-state.json` exists in the fixture. Skill correctly gates on missing state and asks a clarifying question. The test prompt does not produce a direct answer in one turn.
- [x] **Beginner: single framework recommendation** — `<!-- beginner -->` block explicitly says "Recommend ONE framework… Default to Next.js." Correct behavior specified.
- [x] **Beginner: PostgreSQL + Prisma, no alternatives** — `<!-- beginner -->` block says "Use PostgreSQL with Prisma. Don't mention alternatives unless asked." Correct.
- [x] **Beginner: single hosting pick (Vercel)** — `<!-- beginner -->` block gives one-liner Vercel recommendation. Correct.
- [ ] **No comparison table shown to beginner** — The quick-recommendations table in SKILL.md is outside any experience-level block, so it may render for all users regardless of experience level. Ambiguous, likely broken.
- [x] **Companion skills referenced** — SKILL.md has a "Companion tools" section. Content is present.
- [ ] **Companion tools are beginner-appropriate** — Both companions are architect-level tools ("senior-architect", "architecture audit"). Not appropriate for a beginner user. No experience-level filtering on companion tools.
- [x] **Beginner-friendly WHY explanations** — Each `<!-- beginner -->` block includes plain-language rationale (e.g., "Prisma gives you a visual way to design your database and handles migrations").

## Findings

### Positive
- The skill's beginner-mode blocks are well-written: each one gives a single pick with a short rationale and an action ("Want me to scaffold it?").
- Framework choice (Next.js) is correct for the stated use case (SaaS with dashboard, some React knowledge, B2B).
- Database pick (PostgreSQL + Prisma) is sensible for a beginner building a B2B SaaS.
- Hosting pick (Vercel + Next.js) is the natural pairing and requires minimal explanation.
- The full-stack recommendation mode assembles a cohesive stack narrative rather than answering framework, DB, and hosting as isolated questions.
- The example stack in SKILL.md ("Solo SaaS, <1K users: Next.js + tRPC + Postgres (via Supabase) + Clerk + Vercel") aligns closely with what this beginner would need.

### Negative
- **Skill 05 co-trigger bug:** "frontend" is a bare trigger in skill 05. Because the prompt says "frontend framework," skill 05 fires alongside skill 04. The two skills have overlapping scope (05 covers component architecture, project structure — irrelevant here) and would produce a confusing, bloated response.
- **Missing state file in fixture:** The beginner-nextjs-project fixture has no `.claude/shipwise-state.json`. The skill requires state for experience_level and project.type before it can tailor output. Without it, the skill asks a clarifying question rather than delivering immediate recommendations. The test as written assumes a post-scaffold state, but no scaffold state was created in the fixture.
- **Experience-level block rendering is unspecified:** SKILL.md uses `<!-- beginner -->`, `<!-- intermediate -->`, `<!-- senior -->` HTML comment blocks, but there is no documented rendering mechanism that strips the other two blocks. If the runtime renders the full SKILL.md, beginners see all three experience tiers, including comparison tables marked for seniors.
- **Quick-recommendations table not gated by experience level:** The "Quick recommendations by project type" table appears in the skill body before any experience block. Beginners would see it even though the beginner block says to avoid comparison tables.
- **Companion tools not experience-filtered:** Both listed companions are senior-architect tools. A beginner user would receive references to tools they cannot meaningfully use.
- **Auth volunteered without being asked:** Full-stack recommendation mode adds auth to the output even though the user asked only about frontend, database, and hosting. For a beginner, this increases cognitive load.

### Marketing-Worthy Outputs
- [ ] The cohesive full-stack recommendation ("Next.js + REST + Postgres/Prisma + Clerk + Vercel, all in one answer") is compelling to demo if the experience-level filtering works cleanly.

## Bugs / Issues to File
- [ ] **BUG-03-A: Skill 05 co-triggers on "frontend"** — The trigger word "frontend" in skill 05's frontmatter is too broad. Any question containing the word "frontend" (including "frontend framework" in a stack-selection question) will fire skill 05 alongside skill 04. Fix: tighten the trigger to "frontend development" or "frontend architecture", not the bare word "frontend".
- [ ] **BUG-03-B: No shipwise-state.json in beginner-nextjs-project fixture** — The scenario specifies the fixture is "after scaffold", but no state file exists. The skill's behavior is gated on reading state. Either the fixture needs a state file added, or the scenario needs a setup step documented.
- [ ] **BUG-03-C: Experience-level rendering mechanism undocumented** — The `<!-- beginner -->` / `<!-- senior -->` blocks in SKILL.md have no defined rendering contract. If the host shows the full SKILL.md content, the "no comparison tables for beginners" rule is violated by the tables that appear in the main skill body and in senior blocks.
- [ ] **BUG-03-D: Companion tools section not experience-filtered** — Companion tools reference senior-level architect skills that are not appropriate for beginners. The section should have experience-level variants or be omitted from beginner output.
