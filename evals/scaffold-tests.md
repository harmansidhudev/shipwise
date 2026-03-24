# Scaffold Tests

## Purpose
Verify that `/shipwise` scaffold generates correct artifacts.

## Test Scenarios

### Basic scaffold (solo SaaS, intermediate, building)
**Input:** SaaS, B2C, Building, Next.js+Postgres, No users, Freemium, Solo, Mid-level, 100-1K
**Expected artifacts:**
- `.claude/shipwise-state.json` exists and is valid JSON
- `experience_level` = "intermediate"
- `current_phase` = "build"
- `expected_scale` = "100-1000"
- Items array is non-empty
- All P0 items include: error tracking, backups, auth hardening, CI/CD, security headers
- CDN priority = P1 (100-1K scale)
- Load testing priority = P2 (100-1K scale)
- History array has one entry
- CLAUDE.md contains Shipwise context block

### Beginner scaffold
**Input:** Tool, Developers, Idea, "haven't decided", No users, Free, Solo, New to coding, <100
**Expected:**
- `experience_level` = "beginner"
- `current_phase` = "design"
- Post-scaffold enters guided mode
- CDN = P2, load testing = P2, auto-scaling = skip

### Senior scaffold (large scale)
**Input:** SaaS, B2B, Ready to ship, Python+FastAPI+Postgres, Beta testers, Paid, Small team, Senior, 10K+
**Expected:**
- `experience_level` = "senior"
- `current_phase` = "ship"
- CDN = P0, load testing = P0, status page = P0, incident response = P0
- Post-scaffold shows terse status only
- Team items have `owner: null` fields

### Re-run (state exists)
**Expected:** Shows status instead of re-running interview

## Validation checklist
- [ ] State file conforms to schema
- [ ] Experience level correctly mapped
- [ ] Phase correctly mapped
- [ ] Scale-dependent priorities correct
- [ ] History entry recorded
- [ ] CLAUDE.md injection present
