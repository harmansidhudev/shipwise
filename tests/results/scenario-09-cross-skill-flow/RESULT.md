# Scenario 09: Cross-Skill Flow -- Architecture to Development (RE-TEST Round 2)

## Metadata
- **Date:** 2026-03-24 (re-test round 2)
- **Skills tested:** 04-tech-architecture -> 05-fullstack-development
- **User archetype:** beginner
- **Method:** Static file inspection verifying fixes for BUG-09-C2, BUG-09-G, BUG-09-F

## Verdict: PASS

All three prior bugs are fixed. No new issues found.

---

## Bug Fix Verification

### BUG-09-C2: Prisma TeamMember model broken / referenced but never defined
**STATUS: FIXED**

File: `skills/05-fullstack-development/references/database-migration-guide.md`, lines 102-116

`model TeamMember` now exists with:
- `id String @id @default(cuid())`
- `role String @default("member")` with comment: `// "owner" | "admin" | "member" | "viewer"`
- `userId String @map("user_id")`
- `projectId String @map("project_id")`
- `createdAt DateTime @default(now()) @map("created_at")`
- `updatedAt DateTime @updatedAt @map("updated_at")`
- `user User @relation(fields: [userId], references: [id])` -- resolves User.teamMemberships
- `project Project @relation(fields: [projectId], references: [id])` -- resolves Project.teamMembers
- `@@unique([userId, projectId])` -- prevents duplicate memberships
- `@@map("team_members")` -- snake_case table name
- `@@index([projectId])` -- index on foreign key

Bidirectional relations verified:
- User model (line 53): `teamMemberships TeamMember[]` -- resolves via TeamMember.user
- Project model (line 72): `teamMembers TeamMember[]` -- resolves via TeamMember.project

This schema will now pass `prisma validate` without error. A beginner can copy-paste it.

### BUG-09-G: No beginner block in "Database schema conventions" section
**STATUS: FIXED**

File: `skills/05-fullstack-development/SKILL.md`, line 243

The "Database schema conventions" section (starts line 228) now has a `<!-- beginner -->` block at line 243 that explains:
- Why snake_case matters (matches SQL standards)
- Why UUIDs matter (prevents ID enumeration)
- Why timestamps matter (debugging)
- Why soft deletes matter (data recovery)
- Points to the reference doc for a complete copy-paste Prisma schema

Also has `<!-- intermediate -->` (line 246) and `<!-- senior -->` (line 249) blocks. All three experience levels are covered.

### BUG-09-F: Handoff was prose-based, not a verbatim template
**STATUS: FIXED**

File: `skills/04-tech-architecture/SKILL.md`, lines 339-352

The "After state is written" section now contains:
- Line 340: "Output this confirmation message verbatim (replacing bracketed values):"
- Lines 342-350: A fenced code block with the exact template:
  ```
  Stack saved: [framework] + [database] + [orm] + [auth] -> [hosting].
  All future Shipwise guidance will be tailored to this stack.

  Ready to build? I can help with:
  - "Set up my database schema" -> schema design with [orm] templates
  - "Build API endpoints" -> [api_style] patterns for [framework]
  - "/launch-checklist architecture" -> verify all stack decisions are locked in
  ```
- Line 352: "This message serves as a natural handoff to skill 05 (fullstack-development) or skill 06 (platform-infrastructure)"

This is a verbatim template with bracketed placeholders, not prose. The word "verbatim" is explicitly used in the instruction.

---

## Full Validation Checklist

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | `model TeamMember` exists with userId, projectId, role | PASS | Lines 102-116 of database-migration-guide.md |
| 2 | User.teamMemberships TeamMember[] resolves | PASS | Line 53 User model + line 110 TeamMember.user relation |
| 3 | Project.teamMembers TeamMember[] resolves | PASS | Line 72 Project model + line 111 TeamMember.project relation |
| 4 | @@unique([userId, projectId]) constraint | PASS | Line 113 |
| 5 | Beginner block in schema conventions section | PASS | Line 243 of SKILL.md |
| 6 | Skill 04 verbatim handoff template | PASS | Lines 340-350, "verbatim" instruction + code block |
| 7a | Trigger transitions (04->05) | PASS | "tech stack" triggers 04; "database schema" triggers 05 |
| 7b | Mandatory state update | PASS | Lines 312-336 of skill 04, "MANDATORY" header |
| 7c | State reading/persisting in skill 05 | PASS | Lines 42-51, reads + persists discovered stack |
| 7d | Next.js App Router guidance | PASS | Line 47 of skill 05 mentions App Router route.ts |

---

## New Bugs Found

None.
