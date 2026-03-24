# Launch Day Sequence (G14)

## When to use
Print this timeline, pin it in your war room channel, and follow it step-by-step on launch day — it coordinates engineering and marketing so deploys happen before announcements and nothing fires out of order.

## Decision framework

```
What kind of launch is this?
├── Soft launch (no marketing push)?
│   → Use the Engineering Track only. Skip the Marketing Track.
│   → Feature flag on, monitor for 24h, then announce.
│
├── Public launch (PH + social + email)?
│   → Use the FULL sequence below. Engineering and Marketing in parallel.
│   → Engineering deploys first. Marketing posts only after green light.
│
├── Enterprise / B2B launch?
│   → Modify Marketing Track: replace PH/HN with direct outreach, webinar, changelog.
│   → Add a Customer Success track for white-glove onboarding.
│
└── Gradual rollout (% of users)?
    → Feature flag at 10% → 25% → 50% → 100% over hours/days.
    → Marketing posts only after 100% rollout confirmed stable.
    → Each % increase is its own mini-launch with a metrics check.
```

---

## Copy-paste template

```markdown
# Launch Day Sequence
**Launch date:** [CUSTOMIZE: YYYY-MM-DD]
**T-0 time:** [CUSTOMIZE: HH:MM timezone] (when marketing posts go live)
**War room channel:** [CUSTOMIZE: #launch-war-room]

## Roles
| Code | Role | Person | Contact |
|------|------|--------|---------|
| IC | Incident Commander | @[CUSTOMIZE] | [CUSTOMIZE: phone/Slack] |
| ENG | Engineering Lead | @[CUSTOMIZE] | [CUSTOMIZE: phone/Slack] |
| COMMS | Comms Lead | @[CUSTOMIZE] | [CUSTOMIZE: phone/Slack] |
| SUP | Support Lead | @[CUSTOMIZE] | [CUSTOMIZE: phone/Slack] |

---

## T-2h: Final Staging Check
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T-2:00 | ENG | Run abbreviated staging regression: auth + core flow + payment |
| [ ] | T-2:00 | ENG | Verify automated test suite is green |
| [ ] | T-2:00 | ENG | Check Sentry — zero new errors on staging |
| [ ] | T-1:50 | ENG | Confirm monitoring dashboards are open and showing data |
| [ ] | T-1:50 | ENG | Confirm rollback plan is up-to-date and accessible |
| [ ] | T-1:45 | SUP | Confirm support channels are live (chat widget, support email) |
| [ ] | T-1:45 | COMMS | Confirm all marketing assets are staged and ready (not published) |
| [ ] | T-1:40 | IC | Collect status from all roles |
| [ ] | T-1:40 | IC | **GO/NO-GO decision for production deploy** |

**Gate**: IC confirms GO before proceeding. If any P0 issue exists, STOP and fix.

Post in war room:
```
[IC] T-2h check complete. All green. Proceeding to production deploy.
```

---

## T-1h: Production Deploy
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T-1:00 | ENG | Deploy release to production |
| [ ] | T-0:55 | ENG | Verify health endpoint returns 200: `curl [CUSTOMIZE: URL]/api/health` |
| [ ] | T-0:55 | ENG | Verify production logs are flowing |
| [ ] | T-0:50 | ENG | Verify error tracking is active (Sentry shows production environment) |
| [ ] | T-0:50 | ENG | Verify uptime monitor is checking production |
| [ ] | T-0:45 | ENG | Smoke test: sign up with test account on production |
| [ ] | T-0:45 | ENG | Smoke test: complete core flow on production |
| [ ] | T-0:40 | ENG | Smoke test: process test payment on production (if feature-flagged on) |
| [ ] | T-0:40 | ENG | Warm caches: hit key pages to prime CDN and any application caches |
| [ ] | T-0:35 | ENG | Record baseline metrics (error rate, p95 latency, CPU, memory) |
| [ ] | T-0:35 | ENG | Post metrics baseline in war room |

Post in war room:
```
[ENG] Production deploy complete. Health check passing. Baseline metrics:
- Error rate: X.X%
- p95 latency: Xms
- CPU: X%
- Memory: X%
Smoke test: PASSED. Ready for feature flag activation.
```

---

## T-30m: Final Sync
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T-0:30 | IC | Final team sync — everyone confirms ready in war room |
| [ ] | T-0:30 | ENG | Confirm production is stable (no error spikes since deploy) |
| [ ] | T-0:25 | ENG | Feature flags set to launch state (ON, or ready to turn ON at T-0) |
| [ ] | T-0:25 | COMMS | Confirm PH listing is ready to go live |
| [ ] | T-0:25 | COMMS | Confirm social media posts are queued |
| [ ] | T-0:25 | COMMS | Confirm waitlist email is loaded and ready to send |
| [ ] | T-0:20 | SUP | Confirm support team is online and monitoring channels |
| [ ] | T-0:20 | SUP | Confirm canned responses are loaded for common questions |
| [ ] | T-0:15 | IC | **FINAL GO/NO-GO decision** |

**Gate**: IC confirms FINAL GO. Everyone stays in the war room channel from this point.

Post in war room:
```
[IC] Final GO confirmed. All stations ready. Feature flags will activate at T-0. No deploys without IC approval from this point forward.
```

---

## T-0: LAUNCH
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+0:00 | ENG | **Activate feature flags** — new features live for all users |
| [ ] | T+0:00 | ENG | Verify feature is accessible (open production in incognito, confirm new features visible) |
| [ ] | T+0:01 | ENG | First metrics check — error rate, first requests flowing |
| [ ] | T+0:02 | COMMS | **Product Hunt post goes live** [CUSTOMIZE: URL] |
| [ ] | T+0:03 | COMMS | **Hacker News post** [CUSTOMIZE: Show HN title and URL] |
| [ ] | T+0:04 | COMMS | **Reddit post(s)** [CUSTOMIZE: subreddit(s) and URL(s)] |
| [ ] | T+0:05 | COMMS | **First social media post** (Twitter/X, LinkedIn, etc.) |
| [ ] | T+0:05 | COMMS | Update status page: "All Systems Operational" (if not already) |
| [ ] | T+0:10 | ENG | Metrics check: error rate, signups, latency |
| [ ] | T+0:10 | SUP | Check support channels for first user reports |

Post in war room:
```
[IC] 🚀 WE ARE LIVE. Feature flags activated. Marketing posts published. Monitoring.
```

---

## T+15m: First Metrics Check
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+0:15 | ENG | **Full metrics check** — post in war room using status template |
| [ ] | T+0:15 | ENG | Error rate: ___% (threshold: <1% green, 1-5% yellow, >5% red) |
| [ ] | T+0:15 | ENG | p95 latency: ___ms (threshold: <2x baseline green, 2-5x yellow, >5x red) |
| [ ] | T+0:15 | ENG | Signups since T-0: ___ |
| [ ] | T+0:15 | ENG | Payment success rate: ___% (threshold: >95% green, 90-95% yellow, <90% red) |
| [ ] | T+0:15 | ENG | CPU/Memory: ___% / ___% (threshold: <60% green, 60-80% yellow, >80% red) |
| [ ] | T+0:15 | SUP | User reports summary: ___ tickets, top issue: ___ |
| [ ] | T+0:15 | COMMS | PH engagement: ___ upvotes, ___ comments |

**Decision point**: If any metric is RED, IC decides on rollback (see rollback-plan-template.md).

---

## T+30m: Waitlist Email + Second Check
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+0:30 | IC | Confirm metrics are stable before sending waitlist email |
| [ ] | T+0:30 | COMMS | **Send waitlist email** [CUSTOMIZE: email tool and list size] |
| [ ] | T+0:30 | ENG | **Metrics check** — post status update in war room |
| [ ] | T+0:30 | COMMS | Respond to first PH comments and questions |
| [ ] | T+0:30 | COMMS | Monitor HN/Reddit threads, respond where appropriate |
| [ ] | T+0:30 | SUP | Triage any incoming support tickets — escalate P0/P1 to ENG |

**Note**: Do NOT send the waitlist email if metrics are yellow or red. Wait until stable.

---

## T+1h: Deep Metrics Review
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+1:00 | ENG | **Full metrics check** with trends (are numbers improving, stable, or degrading?) |
| [ ] | T+1:00 | ENG | Check Sentry: any new error types since launch? |
| [ ] | T+1:00 | ENG | Check database: query performance, connection count, slow queries |
| [ ] | T+1:00 | ENG | Check signup funnel: landing → signup → onboarding → core action → payment |
| [ ] | T+1:00 | ENG | Identify any conversion drop-offs and potential causes |
| [ ] | T+1:00 | SUP | Report: total tickets, breakdown by type, any patterns |
| [ ] | T+1:00 | COMMS | Respond to PH comments — maintain presence |
| [ ] | T+1:00 | COMMS | Check social media mentions and respond |
| [ ] | T+1:00 | IC | Post 1-hour summary in war room |

Post in war room:
```
[IC] T+1h SUMMARY
Signups: [N] | Paid: [N] | Error rate: [X%] | p95: [Xms]
Top issue: [describe or "none"]
Support tickets: [N]
PH: [N] upvotes | HN: [N] points
Status: [GREEN / YELLOW / RED]
Next check: T+2h
```

---

## T+2h: Engagement + Stability
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+2:00 | ENG | Metrics check — post status update |
| [ ] | T+2:00 | ENG | If any hotfixes deployed: verify they resolved the issue |
| [ ] | T+2:00 | COMMS | **Second social media post** (share early traction, user quotes, screenshots) |
| [ ] | T+2:00 | COMMS | Continue PH/HN comment engagement |
| [ ] | T+2:00 | COMMS | Post in relevant communities [CUSTOMIZE: Discord, Slack groups, forums] |
| [ ] | T+2:00 | SUP | Update canned responses if new common questions emerged |
| [ ] | T+2:00 | IC | Assess: can we move from crisis-mode to monitoring-mode? |

**Transition**: If all metrics green for 1+ hour, move to 15-min check cadence.

---

## T+4h: Daily Summary
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+4:00 | ENG | Comprehensive metrics report — post in war room |
| [ ] | T+4:00 | ENG | List all incidents and resolutions |
| [ ] | T+4:00 | ENG | Assess: any scaling needed before overnight? |
| [ ] | T+4:00 | COMMS | Channel performance summary (PH rank, HN position, social engagement) |
| [ ] | T+4:00 | SUP | Support summary: total tickets, resolution rate, top issues |
| [ ] | T+4:00 | IC | **Team debrief** (15-min sync: what worked, what didn't, overnight plan) |
| [ ] | T+4:00 | IC | Confirm overnight monitoring owner: @[CUSTOMIZE] |
| [ ] | T+4:00 | IC | Set monitoring to 1-hour check cadence |

Post in war room:
```
[IC] T+4h DEBRIEF COMPLETE
Day so far: [N] signups, [N] paid, $[N] revenue
Incidents: [N] (all resolved / [describe open items])
PH: #[N] of the day, [N] upvotes
Status: STABLE
Overnight owner: @[CUSTOMIZE]
Monitoring cadence: hourly until T+24h
Next major check: T+24h retrospective
```

---

## T+24h: Day-One Retrospective
| Status | Time | Owner | Action |
|--------|------|-------|--------|
| [ ] | T+24:00 | IC | Schedule 30-min retrospective with all role holders |
| [ ] | T+24:00 | ENG | Prepare metrics report (see launch-day-protocol.md Day 1 Review) |
| [ ] | T+24:00 | COMMS | Prepare channel performance summary |
| [ ] | T+24:00 | SUP | Prepare support summary with categorized issues |
| [ ] | T+24:00 | IC | Run retrospective: what worked, what broke, what to change |
| [ ] | T+24:00 | IC | Prioritize Day 2 action items (bug fixes, quick wins) |
| [ ] | T+24:00 | IC | Decide: maintain heightened monitoring or return to normal? |
| [ ] | T+24:00 | COMMS | Publish Day 1 results (blog post, tweet, PH update) |
| [ ] | T+24:00 | IC | Archive or keep war room channel based on team needs |

---

## Quick Reference — What to Do When Things Go Wrong

| Situation | Action | Owner |
|-----------|--------|-------|
| Error rate > 5% | Rollback immediately | ENG → IC approves |
| Payment processing broken | Kill feature flag or rollback | ENG → IC approves |
| Cannot sign up / log in | Rollback immediately | ENG → IC approves |
| PH post not showing | Check PH guidelines, contact PH support | COMMS |
| Traffic spike overwhelming servers | Scale up instances, enable rate limiting | ENG |
| Negative comments on PH/HN | Respond thoughtfully, do not argue | COMMS → IC reviews |
| Support queue overflowing | Prioritize P0, use canned responses, call for backup | SUP |
| Team member unreachable | IC reassigns their tasks | IC |
| Unsure if it is a real issue | Assume it is. Investigate. When in doubt, rollback. | ENG + IC |
```

---

## Customization notes

- **Adjust T-0 time for your timezone and platform**: Product Hunt resets at midnight PT. Many teams launch at 12:01 AM PT for maximum PH runway. If you are in a different timezone, set T-0 accordingly and make sure your team can cover the US morning window (when most PH traffic occurs).
- **Solo founders**: You are IC, ENG, COMMS, and SUP. The sequence still applies — just do each action yourself. The value is in the ORDER, not the delegation. Deploy before you announce. Check metrics before you send the email. Do not skip steps because you are one person.
- **Skip what does not apply**: No Product Hunt launch? Remove PH lines. No waitlist? Remove the waitlist email step. No payment flow? Remove payment metrics. The template is meant to be trimmed, not padded.
- **Print it**: Having a physical printout next to your laptop (or a pinned message you can scroll without switching tabs) reduces the cognitive load when things get hectic.

## Companion tools

- Product Hunt — coordinate with ship page launch time
- Buffer / Typefully — schedule social media posts in advance
- ConvertKit / Resend / Loops — waitlist email tool
- Slack — war room coordination
- Sentry + Better Uptime — monitoring dashboards to keep open during launch
