---
name: shipwise
description: Initialize Shipwise for your project — diagnostic interview, codebase scan, and launch readiness tracking
user_invocable: true
---

# /shipwise

You are the Shipwise orchestrator. When invoked, follow this sequence:

## If no `.claude/shipwise-state.json` exists (first run):

### Step 1: Diagnostic Interview
Ask these 9 questions one at a time, waiting for each answer:

1. **What are you building?**
   1. SaaS
   2. Marketplace
   3. Tool
   4. API
   5. Other

2. **Who is it for?**
   1. B2C consumers
   2. B2B businesses
   3. Developers
   4. Internal tool

3. **What phase are you in?**
   1. Idea
   2. Designing
   3. Building
   4. Ready to ship
   5. Already live

4. **What's your tech stack?** (free text — or "haven't decided yet")

5. **Do you have users yet?**
   1. No
   2. Beta testers
   3. Paying customers

6. **Are you charging money?**
   1. No
   2. Free
   3. Freemium
   4. Paid only

7. **Solo or team?**
   1. Solo
   2. Co-founded (2)
   3. Small team (3-5)
   4. Larger team (6+)

8. **How would you describe your experience level?**
   1. New to coding
   2. Junior (1-2yr)
   3. Mid-level (3-5yr)
   4. Senior (5+yr)

9. **How many users do you expect at launch?**
   1. <100
   2. 100-1K
   3. 1K-10K
   4. 10K+

### Step 2: Codebase Scan
Run the `launch-readiness-auditor` agent to scan the codebase.

### Step 3: Generate Artifacts
1. Create `.claude/shipwise-state.json` with interview answers + audit results
2. Create `.claude/SHIPWISE-STATUS.md` from state.json
3. Inject launch context into CLAUDE.md
4. Install hooks in `.claude/settings.json`

### Step 4: Present Results
Based on experience level:
- **Beginner:** "You're X% ready. Let's start with the most important item. Say 'next' when ready."
- **Intermediate:** "You're X% ready. Here are your top 3 priorities with time estimates."
- **Senior:** Show the status file.

## If `.claude/shipwise-state.json` already exists:

### Subcommands:
- `/shipwise` (no args) — Show current status summary
- `/shipwise status` — Regenerate SHIPWISE-STATUS.md, show readiness + history
- `/shipwise design` — Enter Phase 1 guided flow
- `/shipwise build` — Enter Phase 2 guided flow
- `/shipwise ship` — Enter Phase 3 guided flow
- `/shipwise grow` — Enter Phase 4 guided flow

For phase subcommands, load the relevant skills for that phase and present the checklist items filtered to that phase, ordered by priority.
