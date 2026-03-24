# Scenario 4: Tech Stack Decision — Senior (Contentious Choice)

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 04-tech-architecture
- **User archetype:** senior
- **Interaction mode:** auto-trigger (trigger words present in prompt)
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the tech-architecture skill correctly surfaces the tRPC vs GraphQL tension for a TypeScript monorepo with real-time needs, delivers a nuanced senior-mode answer using the backend-api-decision-tree reference, and avoids over-explaining.

## Test Prompt
```
I'm deciding between tRPC and GraphQL for a Next.js monorepo. The frontend
and backend are in the same repo, same team owns both. We need real-time
subscriptions for a few features. What's the tradeoff?
```

## Expected Behavior
- Skill 04 triggers on "API architecture" or "REST vs GraphQL" or related terms.
- Skill reads state from `.claude/shipwise-state.json` to confirm senior experience level and TypeScript monorepo context.
- Response does NOT pick a single winner — it surfaces the genuine tension (tRPC is the decision-tree default for a TS monorepo with a single client; GraphQL has built-in subscriptions but adds caching complexity and a client library requirement).
- The backend-api-decision-tree reference doc is consulted; its comparison table and "When to mix approaches" section are surfaced.
- Senior-mode output: terse, assumes TS knowledge, highlights non-obvious trade-offs.
- No over-explanation of what tRPC or GraphQL are.

## Actual Behavior

### Trigger analysis

Cross-referencing prompt phrases against skill 04 trigger list:

| Phrase in prompt | Skill 04 trigger | Match? |
|-----------------|-----------------|--------|
| "tRPC" | (not in trigger list) | NO |
| "GraphQL" | (not in trigger list) | NO |
| "monorepo" | (not in trigger list) | NO |
| "real-time subscriptions" | (not in trigger list) | NO |
| (none present) | "REST vs GraphQL" | NO — prompt does not say "REST vs GraphQL" |
| (none present) | "API architecture" | NO — prompt does not say "API architecture" |

**Critical bug found:** None of the exact trigger strings in skill 04's frontmatter match anything in this prompt. The triggers are:

```
"framework selection", "which framework", "database choice", "choose a database",
"tech stack", "architecture decisions", "hosting", "where to host",
"auth strategy", "authentication approach", "REST vs GraphQL",
"API architecture", "pick a stack", "stack recommendations"
```

The prompt says "tRPC", "GraphQL", "monorepo", "real-time subscriptions", and "tradeoff" — none of these appear in the trigger list. The phrase "REST vs GraphQL" is a trigger, but the prompt does not contain it. "API architecture" is a trigger, but the prompt does not contain that phrase either.

**Skill 04 would NOT auto-trigger on this prompt.** The scenario's stated expectation ("does the skill auto-trigger?") fails silently.

Cross-referencing against skill 05 triggers: "backend" is not in the prompt. "API design" is not in the prompt. No skill 05 triggers match either.

**Result: No skill triggers at all.** The prompt would fall through to general Claude behavior with no Shipwise skill active.

### State file gap

No `shipwise-state.json` exists in `tests/fixtures/midlevel-saas-project/.claude/`. Even if the trigger issue were fixed, the skill cannot read `experience_level` = "senior" from state. The scenario specifies the fixture is "after scaffold", but the scaffold was never materialized in the fixture directory.

### Decision tree coverage (hypothetical — assuming skill fires)

Assuming the skill were triggered manually or the trigger list were expanded to include "tRPC", "GraphQL", and "subscriptions", the decision tree in SKILL.md's Backend section handles this scenario well:

The decision tree in SKILL.md reads:
```
Is your frontend and backend in the same repo (monorepo)?
├── Yes → Is it TypeScript end-to-end?
│   ├── Yes → tRPC (type-safe, zero codegen)
```

The prompt satisfies both conditions (same repo, TypeScript Next.js). The decision tree points to tRPC.

However, the tree does NOT handle the real-time subscriptions fork. The SKILL.md decision tree does not branch on "do you need subscriptions?" — it only has a comment: "Special case: real-time needed → add WebSocket/SSE layer to any of the above." This does not resolve the tension between tRPC subscriptions and GraphQL subscriptions.

### backend-api-decision-tree.md reference doc coverage

The reference doc (`references/backend-api-decision-tree.md`) is more thorough. Key findings:

1. **The comparison table addresses real-time directly:**
   | Criteria | GraphQL | tRPC |
   |----------|---------|------|
   | Real-time | Subscriptions built-in | Subscriptions built-in |

   Both are listed as supporting subscriptions. This undercuts the premise that GraphQL is "better for subscriptions" — the reference doc says tRPC also has built-in subscriptions. This is accurate: tRPC v10+ supports subscriptions via WebSocket.

2. **The primary flowchart resolves to tRPC for this exact scenario:**
   Q1: Same TypeScript monorepo? YES → Q2: Only client is web app you control? YES → tRPC.
   The developer said "same team owns both" and it's a Next.js monorepo — Q2 is YES. The tree returns tRPC unambiguously.

3. **The "Customization notes" section explicitly addresses this:**
   "For real-time features: All four approaches support real-time. REST uses SSE/WebSocket; GraphQL has subscriptions; tRPC has subscriptions; gRPC has bidirectional streaming. Pick based on your primary API style, not the real-time need."

   This is the critical insight for this scenario. The reference doc correctly states that real-time is NOT a differentiator between tRPC and GraphQL — both support it. The question reduces to: which is better for a TS monorepo with a single team? Answer: tRPC.

4. **The comparison table surfaces the genuine non-obvious trade-offs:**
   - Caching: GraphQL "Complex (needs Apollo/urql)" vs tRPC "SWR/React Query" — this is the real cost of GraphQL in a monorepo context.
   - Debugging: GraphQL has a playground; tRPC has tRPC panel and dev tools.
   - Over/under-fetching: GraphQL solves it; tRPC makes it N/A (direct function calls).

5. **The "When to mix approaches" section gives a nuanced escape hatch:** "tRPC + REST: tRPC for your web app, REST/OpenAPI for public developer API" — relevant if the HR SaaS ever needs a partner/integration API.

### Senior-mode output quality (hypothetical)

If the skill fires with `experience_level = senior`, the `<!-- senior -->` block for API strategy says:
"Discuss edge cases — when to mix approaches (REST for public API + tRPC for internal), GraphQL federation for microservices, gRPC for hot paths. Point them to the decision tree reference."

This is appropriately terse. It defers detail to the reference doc rather than re-explaining basics. It would NOT over-explain what tRPC or GraphQL are.

The `<!-- senior -->` blocks elsewhere (frontend, database, hosting) are similarly compact. Senior mode is well-calibrated throughout.

### Does the skill give a nuanced answer vs. just picking one?

The SKILL.md skill behavior says: "Present 1-2 recommendations (not all options) with reasoning." For a senior user, the decision tree unambiguously returns tRPC. The reference doc then confirms the real-time concern is a non-issue (tRPC supports subscriptions). A correctly-behaving skill would:
1. Say tRPC is the clear call for a TS monorepo with a single team.
2. Address the real-time concern: tRPC subscriptions work; this is not a reason to choose GraphQL.
3. Note when GraphQL would be the right choice instead (multiple clients, different data shapes, external consumers).

The scenario brief says "Should not just pick one" and expects a nuanced answer — but given the reference doc and decision tree, **picking tRPC IS the correct nuanced answer**. The tension the scenario anticipates (tRPC vs GraphQL for subscriptions) is dissolved by the reference doc's explicit note that both support real-time. A genuinely nuanced senior response would explain WHY tRPC wins here despite the subscription concern, rather than hedging between the two options.

## Verdict: ⚠️ PARTIAL

### Validation Checklist

- [ ] **Skill 04 auto-triggers** — FAILS. None of the prompt's words ("tRPC", "GraphQL", "monorepo", "subscriptions", "tradeoff") appear in skill 04's trigger list. The skill does not fire.
- [ ] **State file exists with senior experience level** — FAILS. No `shipwise-state.json` in `tests/fixtures/midlevel-saas-project/.claude/`. Experience level cannot be read.
- [x] **backend-api-decision-tree.md covers tRPC vs GraphQL** — YES. The reference doc has a full comparison table with both options, the decision flowchart resolves this exact scenario, and the customization notes address the subscriptions concern directly.
- [x] **Reference doc handles the monorepo + same-team scenario** — YES. Q1/Q2 in the flowchart map directly to the prompt's constraints and return tRPC.
- [x] **Real-time subscriptions tension addressed** — YES, but not in the way the scenario expects. The reference doc shows both tRPC and GraphQL support subscriptions, dissolving the tension. The correct answer is "use tRPC, add WebSocket subscriptions to it."
- [ ] **Skill gives a nuanced answer (not just picking one)** — PARTIAL. The decision tree is deterministic for this scenario (tRPC wins). A senior-appropriate response would explain the reasoning rather than hedge. The scenario brief's expectation of "should not just pick one" misreads the scenario — this IS a clear-cut case once you know tRPC supports subscriptions.
- [x] **Senior-mode output is terse** — YES, based on `<!-- senior -->` blocks in SKILL.md. They are concise and defer to reference docs.
- [x] **Senior-mode avoids over-explaining** — YES. Senior blocks omit beginner rationale and go straight to trade-offs and pointers.
- [ ] **Trigger words match** — FAILS. "tRPC", "GraphQL", "subscriptions" are NOT in the trigger list. Scenario predicted these would match; they do not.

## Findings

### Positive
- The `backend-api-decision-tree.md` reference doc is the strongest piece of content in this skill. It is thorough, covers the exact scenario, and has the critical insight that real-time is not a differentiator (both support it).
- The comparison table in the reference doc surfaces genuinely non-obvious trade-offs: GraphQL caching complexity, tRPC's superior type inference, and the debugging story.
- The "When to mix approaches" section and "Customization notes" in the reference doc are senior-appropriate and practically useful.
- The `<!-- senior -->` blocks throughout SKILL.md are well-calibrated: terse, assumption-heavy, pointer-to-reference-doc style.
- The decision tree in the reference doc resolves this scenario unambiguously. A senior reading it would immediately understand why tRPC is the right call and what would make them choose GraphQL instead.
- Copy-paste templates for tRPC setup (Next.js App Router) and GraphQL (Pothos) are both present in the reference doc — useful for a senior who decides to go either way.

### Negative
- **Critical: Skill 04 does not trigger on this prompt.** "tRPC", "GraphQL", "monorepo", "real-time subscriptions", "tradeoff" — none are in the trigger list. The scenario's entire premise assumes auto-triggering, which fails. This is the most serious gap in this scenario.
- **No state file in fixture:** The midlevel-saas-project fixture has no `.claude/shipwise-state.json`. The scenario is labeled as testing against a "senior" user, but there is no mechanism for the skill to know this without state. The fixture is also named "midlevel" — its intended experience level may not be senior.
- **Fixture mismatch:** The scenario uses `midlevel-saas-project` but tests senior behavior. The fixture name implies an intermediate user, not a senior. This is either a scenario design error or the state file (which is missing) was supposed to specify `experience_level: senior`.
- **The "tension" in the scenario is partially false:** The scenario frames this as tRPC (better for monorepo) vs GraphQL (better for subscriptions). The reference doc explicitly states both support subscriptions. The scenario brief needs to be updated to reflect the actual trade-off (tRPC wins for a same-team TS monorepo; the subscription concern is a red herring).
- **Trigger list does not cover API technology names:** The entire domain of "tRPC", "GraphQL", "REST" (standalone), "gRPC", "WebSocket" is absent from the trigger list, even though this skill is specifically designed for API architecture decisions. This is a significant gap.

### Marketing-Worthy Outputs
- [ ] The `backend-api-decision-tree.md` reference doc resolving the tRPC/GraphQL/subscriptions question with a single clear flowchart + "all four support real-time" note would be compelling to show as a screenshot — but only if the skill actually triggers.

## Bugs / Issues to File
- [ ] **BUG-04-A (Critical): Skill 04 trigger list missing API technology names** — "tRPC", "GraphQL", "gRPC", "WebSocket", "subscriptions", "monorepo", "API tradeoff", "REST vs tRPC" are all absent from the trigger list. Any developer asking a direct tRPC/GraphQL comparison question will not trigger this skill. Add: "tRPC", "GraphQL", "gRPC", "API tradeoff", "subscriptions" to the trigger list.
- [ ] **BUG-04-B: No shipwise-state.json in midlevel-saas-project fixture** — Same root cause as BUG-03-B. Scenarios 3 and 4 both require a post-scaffold state file that doesn't exist. Fixtures need state files created as part of test setup, or a setup script needs to be documented.
- [ ] **BUG-04-C: Fixture name / scenario archetype mismatch** — Scenario 4 is labeled "Senior" and tests senior behavior, but uses `midlevel-saas-project` fixture. The fixture name implies an intermediate developer. If the scenario requires senior state, either rename the fixture or use the `senior-monorepo-project` fixture (which exists in the test suite) instead.
- [ ] **BUG-04-D: Scenario brief contains inaccurate tension framing** — The brief states "tRPC better for monorepo same-team BUT GraphQL better for subscriptions." The reference doc explicitly shows tRPC has built-in subscriptions (same as GraphQL). The scenario brief should be updated to reflect the actual trade-off: tRPC wins for same-team TS monorepo; GraphQL is only preferable if external clients or different data shape needs are introduced.
- [ ] **BUG-04-E: Decision tree in SKILL.md body does not branch on real-time needs** — The in-body decision tree (not the reference doc) has only a "Special case" comment for real-time. The reference doc handles it properly. The in-body tree should be updated or the real-time branch added to avoid confusion when the reference doc is not consulted.
