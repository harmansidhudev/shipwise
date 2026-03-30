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
Before launching the scan, tell the user:
"Scanning your codebase for launch readiness (CI/CD, security, testing, UX, SEO, legal, observability)..."

Run the `launch-readiness-auditor` agent to scan the codebase.

After the scan completes, briefly confirm:
"Scan complete — [X] items checked, [Y] relevant to your project."

### Step 3: Generate Artifacts
1. Create `.claude/shipwise-state.json` with interview answers + audit results
2. Create `.claude/SHIPWISE-STATUS.md` from state.json
3. Inject launch context into CLAUDE.md
4. Install hooks in `.claude/settings.json`

### Step 3.5: Show Project Profile Card
After generating artifacts, ALWAYS show this summary regardless of experience level:

```
**[Project Name]** — [type] for [audience]

Stack: [detected stack summary]
Phase: [interview answer] → Shipwise phase: [mapped phase]
Scale: [expected users] | Experience: [level]

Scan: [X] items checked · [Y] done · [Z] gaps
Readiness: [X]% ██████░░░░

Top gaps (P0 = must fix before launch):
• [P0 item 1] (~time)
• [P0 item 2] (~time)
• [P0 item 3] (~time)

State saved to `.claude/shipwise-state.json`
```

Then continue with the experience-level-specific follow-up below.

### Step 4: Present Results
Based on experience level:
- **Beginner:** "You're X% ready. Let's start with the most important item. Say 'next' when ready."
- **Intermediate:** "You're X% ready. Here are your top 3 priorities with time estimates."
- **Senior:** Show the status file.

### Step 5: What Happens Next
After presenting results, tell the user (adapt tone to experience level):

"Shipwise is now active. Here's what happens as you work:
- **Edit auth, billing, or API code** → you'll see [Shipwise] tips in context (once per topic per session)
- **Deploy** → Shipwise checks for incomplete critical items first
- **End session** → auto-detects completed items and updates your score
- `/shipwise` — check status anytime
- `/launch-checklist [domain]` — deep-dive (e.g., `/launch-checklist security`)
- `/launch-audit` — full codebase re-scan"

## If `.claude/shipwise-state.json` already exists:

### Subcommands:
- `/shipwise` (no args) — Show current status summary
- `/shipwise status` — Regenerate SHIPWISE-STATUS.md, show readiness + history
- `/shipwise design` — Enter Phase 1 guided flow
- `/shipwise build` — Enter Phase 2 guided flow
- `/shipwise ship` — Enter Phase 3 guided flow
- `/shipwise grow` — Enter Phase 4 guided flow

- `/shipwise help` — Show available commands, current phase, relevant skills, and hook summary
- `/shipwise set-level [beginner|intermediate|senior]` — Change experience level

For phase subcommands, load the relevant skills for that phase and present the checklist items filtered to that phase, ordered by priority.

### /shipwise help
Show:
1. **Commands:** `/shipwise`, `/shipwise status`, `/shipwise [phase]`, `/launch-audit`, `/launch-checklist [domain]`
2. **Current phase** and which skill domains are relevant (from the routing table in the orchestrator skill)
3. **Available domains** for `/launch-checklist`: security, billing, seo, observability, legal, legal-setup, testing, infrastructure, architecture, design, growth, fullstack, launch, idea, business
4. **Hooks:** "4 hooks run automatically — session start (readiness context), post-edit (contextual tips), deploy gate (P0 check), session stop (auto-detect completed items)"
5. **Tip:** "Skills auto-trigger based on what you're working on. You don't need to invoke them manually."

### /shipwise set-level
1. Validate the argument is one of: beginner, intermediate, senior
2. Update `experience_level` in `.claude/shipwise-state.json`
3. Confirm: "Experience level updated to [level]. All future output will adapt accordingly."
