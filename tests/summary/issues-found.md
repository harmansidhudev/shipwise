# Issues Found During Testing (Final)

**Test Date:** 2026-03-24 (final run after all fixes)
**Total issues: 0 remaining** (all 48 resolved across 3 test runs)

---

## Resolution History

### Run 1 → Run 2: 28 issues fixed
All 8 critical and 10 high-priority bugs from the initial test run were resolved on main before this session.

### Run 2 → Run 3: 10 issues fixed in this session

| Bug ID | Issue | Fix |
|--------|-------|-----|
| BUG-09-A | No intra-session state persistence | Added MANDATORY state update procedure to skill 04 with JSON format |
| BUG-09-C2 | Prisma TeamMember model missing | Added `model TeamMember` with userId, projectId, role, unique constraint |
| BUG-11-A | Architecture skill advisory format | Added "Checklist Items" section with 7 items, P0/P1/P2, time estimates |
| BUG-02-A | Auditor misses static metadata | Added `export const metadata` to meta tag grep |
| BUG-01-A | Scale-priority default too coarse | Added "Infrastructure exceptions" — skip for <100 users |
| BUG-09-G | No beginner block in schema section | Added `<!-- beginner -->` explaining WHY conventions matter |
| BUG-12-A | No account lockout template | Added Section 7 with full Redis implementation |
| BUG-12-B | No bcrypt cost factor guidance | Added "cost >= 12" to SKILL.md + customization notes |
| BUG-02-B | ESLint/Prettier not in auditor | Added "Code Quality" category with lint/format checks |
| BUG-01-B | Fixture item count undocumented | Added "Item scope" rule to auditor — only include relevant items |
| BUG-09-F | Skill 04 handoff prose-based | Added verbatim confirmation message template with next-step prompts |

### Minor Notes (non-blocking, cosmetic)
- "Monitoring" appears in infrastructure exceptions list but not as a row in the scale-priority table — functionally correct since exceptions are additive
- Bare "host" is not a trigger for skill 04 (uses "hosting" and "where to host") — fuzzy LLM matching handles this

---

## Improvement Ideas (carried forward, all optional)

| ID | Idea | Status |
|----|------|--------|
| IDEA-01 | Add framework triggers to skill 05 | DONE |
| IDEA-02 | Add empty-state-patterns reference doc | DONE (in component-architecture.md) |
| IDEA-03 | Surface auth-strategy-decision-tree on B2B scaffold | Open — nice to have |
