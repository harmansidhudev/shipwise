---
name: launch-checklist
description: Deep-dive checklist for a specific domain (e.g., security, billing, seo)
user_invocable: true
---

# /launch-checklist [domain]

Show a detailed checklist for a specific launch domain.

## Usage:
`/launch-checklist security` — Show security compliance checklist
`/launch-checklist billing` — Show billing/payments checklist
`/launch-checklist seo` — Show SEO/performance checklist
`/launch-checklist legal` — Show legal compliance checklist
`/launch-checklist observability` — Show observability checklist
`/launch-checklist infrastructure` — Show platform infrastructure checklist
`/launch-checklist testing` — Show quality assurance checklist
`/launch-checklist launch` — Show launch execution checklist

## Procedure:
1. Map the domain argument to the corresponding skill (e.g., "security" -> skill 08)
2. Load that skill's full checklist
3. Cross-reference with `.claude/shipwise-state.json` to mark completed items
4. Present the checklist with:
   - Checkmark for completed items
   - Empty box for incomplete items with time estimates
   - Priority indicators (P0/P1/P2)
5. For each incomplete P0 item, offer: "Want me to implement this now?"

## Domain-to-skill mapping:
| Domain | Skill |
|--------|-------|
| security | 08-security-compliance |
| billing | 11-billing-payments |
| seo | 10-seo-performance |
| observability | 09-observability-reliability |
| legal | 12-legal-compliance-final |
| testing | 07-quality-assurance |
| infrastructure | 06-platform-infrastructure |
| architecture | 04-tech-architecture |
| design | 02-product-design |
| growth | 14-growth-ops |
| fullstack | 05-fullstack-development |
| launch | 13-launch-execution |
| idea | 01-validate-idea |
| business | 03-business-legal-foundation |

## If no domain specified:
Show the list of available domains with their completion percentages.

## If domain is not in the mapping table:
Respond: "Unknown domain: [domain]. Available domains: security, billing, seo, observability, legal, testing, infrastructure, architecture, design, growth, fullstack, launch, idea, business. Run `/launch-checklist` with no arguments to see completion percentages for each."
