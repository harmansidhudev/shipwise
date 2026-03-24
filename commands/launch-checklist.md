---
name: launch-checklist
description: "Deep-dive checklist for a specific domain. Usage: /launch-checklist <domain>"
user_invocable: true
arguments:
  - name: domain
    description: "Domain to deep-dive: security, billing, seo, observability, legal, testing, cicd, architecture, design, growth"
    required: true
---

# /launch-checklist Command

You are providing a deep-dive checklist for the specified domain.

## Behavior

1. **Read state.** Load `.claude/shipwise-state.json` for experience level and current item statuses. If no state file exists, tell the user to run `/shipwise` first.

2. **Load domain skill.** Based on the domain argument, load the corresponding skill's full knowledge:

   | Domain | Skill |
   |--------|-------|
   | security | 08-security-compliance |
   | billing | 11-billing-payments |
   | seo | 10-seo-performance |
   | observability | 09-observability-reliability |
   | legal | 12-legal-compliance-final |
   | testing | 07-quality-assurance |
   | cicd | 06-platform-infrastructure |
   | architecture | 04-tech-architecture |
   | design | 02-product-design |
   | growth | 14-growth-ops |
   | fullstack | 05-fullstack-development |
   | launch | 13-launch-execution |
   | idea | 01-validate-idea |
   | business | 03-business-legal-foundation |

3. **Generate checklist.** For the chosen domain:
   - Show all checklist items with current status (done/todo/in-progress)
   - Mark items already detected in the codebase
   - Adjust verbosity based on experience level
   - Include copy-paste templates from reference docs for todo items
   - Include time estimates

4. **Offer guided remediation.** For beginners and intermediates, offer to work through the todo items in priority order: "Want me to help you with [first P0 item]?"
