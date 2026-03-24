# Scaffold Tests

## Purpose
Verify that `/shipwise` scaffold generates correct artifacts from the diagnostic interview.

## Test Scenarios

### T1: Basic scaffold (solo SaaS, intermediate, building)
**Interview answers:** SaaS, B2C, Building, Next.js+Postgres, No users, Freemium, Solo, Mid-level (3-5yr), 100-1K
**Expected artifacts:**
- `.claude/shipwise-state.json` exists and is valid JSON
- `experience_level` = "intermediate"
- `current_phase` = "build"
- `expected_scale` = "100-1000"
- `app_type` = "saas"
- `monetization` = "freemium"
- Items array is non-empty
- All P0 items include: error tracking, backups, auth hardening, CI/CD, security headers
- CDN priority = P1 (100-1K scale)
- Load testing priority = P2 (100-1K scale)
- History array has exactly one entry with timestamp and readiness percentage
- CLAUDE.md contains Shipwise context block
- `.claude/settings.json` contains hook entries for SessionStart, PostToolUse, PreToolUse, Stop

### T2: Beginner scaffold (new developer, idea phase)
**Interview answers:** Tool, Developers, Idea, "haven't decided yet", No users, Free, Solo, New to coding, <100
**Expected:**
- `experience_level` = "beginner"
- `current_phase` = "design"
- `expected_scale` = "0-100"
- Post-scaffold enters guided mode: "Let's start with your top priority. Say 'next' when ready."
- CDN = P2, load testing = P2, auto-scaling = skip
- Status page = P2 (small scale)
- Incident response = P2 (solo, small scale)

### T3: Senior scaffold (large scale, team)
**Interview answers:** SaaS, B2B, Ready to ship, Python+FastAPI+Postgres, Beta testers, Paid only, Small team (3-5), Senior (5+yr), 10K+
**Expected:**
- `experience_level` = "senior"
- `current_phase` = "ship"
- `expected_scale` = "10000+"
- CDN = P0, load testing = P0, status page = P0, incident response = P0
- Post-scaffold shows terse status summary only (no guided mode)
- Team items include `owner: null` fields for assignment
- Auto-scaling = P1

### T4: Marketplace type with payments
**Interview answers:** Marketplace, B2C, Building, React+Node+Stripe, No users, Paid only, Co-founded (2), Mid-level, 1K-10K
**Expected:**
- `app_type` = "marketplace"
- Billing/payment items are P0 (paid marketplace)
- Escrow/payout items appear in checklist
- `expected_scale` = "1000-10000"
- CDN = P0 (1K-10K scale)

### T5: API product (developer-facing)
**Interview answers:** API, Developers, Building, Go+Postgres, Beta testers, Freemium, Solo, Senior, 1K-10K
**Expected:**
- `app_type` = "api"
- API documentation items are P0
- Rate limiting is P0
- SDK/client library items appear
- Dashboard/admin UI items are P1

### T6: Re-run when state already exists
**Precondition:** `.claude/shipwise-state.json` already exists with valid data
**Action:** Run `/shipwise` with no arguments
**Expected:**
- Does NOT re-run the interview
- Shows current status summary instead
- Readiness percentage displayed
- Current phase shown
- P0 gaps listed

### T7: Interview question flow completeness
**Action:** Run `/shipwise` on a fresh project
**Expected:**
- All 9 questions asked in sequence
- Each question waits for user response before proceeding
- Invalid answers prompt re-ask or clarification
- "haven't decided yet" is accepted for tech stack question

### T8: CLAUDE.md injection
**Precondition:** Project has existing CLAUDE.md with other content
**Action:** Run `/shipwise` scaffold
**Expected:**
- Existing CLAUDE.md content is preserved
- Shipwise context block is appended (not replacing existing content)
- Context block includes: project type, phase, experience level, scale tier

### T9: Settings.json hook installation
**Precondition:** Project has existing `.claude/settings.json` with other settings
**Action:** Run `/shipwise` scaffold
**Expected:**
- Existing settings are preserved
- Four hooks are added: SessionStart, PostToolUse, PreToolUse, Stop
- PostToolUse hook has toolNames filter for Write, Edit, MultiEdit
- PreToolUse hook has toolNames filter for Bash
- No duplicate hooks if run multiple times

### T10: Empty project scaffold
**Precondition:** Empty directory with only `git init`
**Action:** Run `/shipwise` scaffold
**Expected:**
- Scaffold completes without errors
- Codebase scan finds zero completed items
- Readiness percentage starts at 0%
- All items are marked "todo"
- Design phase items are highlighted as starting point

### T11: Existing mature project scaffold
**Precondition:** Project with CI/CD, tests, auth, error tracking already set up
**Action:** Run `/shipwise` scaffold
**Expected:**
- Codebase scan correctly identifies existing implementations
- Readiness percentage reflects actual state (not 0%)
- Completed items marked as "done"
- Only remaining gaps shown as priorities

## Validation checklist
- [ ] State file conforms to JSON schema
- [ ] Experience level correctly mapped from interview answer
- [ ] Phase correctly mapped from interview answer
- [ ] Scale tier correctly mapped from interview answer
- [ ] Scale-dependent priorities are correct (CDN, load testing, status page, auto-scaling)
- [ ] Monetization-dependent items correct (billing items for paid apps)
- [ ] Team-dependent items correct (owner fields for team projects)
- [ ] History entry recorded with timestamp
- [ ] CLAUDE.md injection present and non-destructive
- [ ] Settings.json hooks installed and non-destructive
- [ ] Post-scaffold behavior matches experience level
