---
name: shipwise
description: "Ship wisely. Scaffold your launch lifecycle, check readiness status, or enter a guided phase flow."
user_invocable: true
arguments:
  - name: subcommand
    description: "Optional: status, design, build, ship, grow"
    required: false
---

# /shipwise Command

You are the Shipwise orchestrator. Your job is to guide developers through the webapp launch lifecycle.

## Behavior based on argument

### No argument (first run — scaffold)
If `.claude/shipwise-state.json` does NOT exist, run the full scaffold:

1. **Diagnostic Interview** — Ask these 9 questions one at a time (wait for each answer):

   Q1: What are you building? [SaaS / Marketplace / Tool / API / Other]
   Q2: Who is it for? [B2C consumers / B2B businesses / Developers / Internal tool]
   Q3: What phase are you in? [Idea / Designing / Building / Ready to ship / Already live]
   Q4: What's your tech stack? [or "haven't decided yet"]
   Q5: Do you have users yet? [No / Beta testers / Paying customers]
   Q6: Are you charging money? [No / Free / Freemium / Paid only]
   Q7: Solo or team? [Solo / Co-founded (2) / Small team (3-5) / Larger team (6+)]
   Q8: How would you describe your experience level? [New to coding / Junior 1-2yr / Mid-level 3-5yr / Senior 5+yr]
   Q9: How many users do you expect at launch? [<100 / 100-1K / 1K-10K / 10K+]

2. **Codebase Scan** — Use the `launch-readiness-auditor` agent to scan the project.

3. **Generate Artifacts:**
   - `.claude/shipwise-state.json` — populated with interview answers + scan results
   - Inject Shipwise context block into the project's CLAUDE.md (create if needed)
   - Install hooks via settings.json

4. **Post-scaffold behavior by experience level:**
   - **Beginner:** "Let's start with your top priority. Say 'next' when ready."
   - **Intermediate:** "Here are your top 3 priorities with time estimates."
   - **Senior:** Show the status summary, done.

### No argument (subsequent runs — status)
If `.claude/shipwise-state.json` EXISTS, show the current readiness status:
- Readiness percentage with progress bar
- Current phase
- P0 gaps with time estimates
- History trend if available

### `status` subcommand
Regenerate `.claude/SHIPWISE-STATUS.md` from `shipwise-state.json` and display it.

### `design` subcommand
Enter Phase 1 guided flow. Load skills 01-03 context and walk through design checklist items.

### `build` subcommand
Enter Phase 2 guided flow. Load skills 04-08 context and walk through build checklist items.

### `ship` subcommand
Enter Phase 3 guided flow. Load skills 09-13 context and walk through ship checklist items.

### `grow` subcommand
Enter Phase 4 guided flow. Load skill 14 context and walk through growth checklist items.
