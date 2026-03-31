# Conversion Funnel Audit

Analyze your existing conversion paths to find where users drop off and why. This is not about adding tracking (see `funnel-instrumentation.md`) — this is about looking at your product with fresh eyes and scoring every step for friction.

## When to use

Run a funnel audit when your conversion rates are below benchmarks, when you've launched but signups aren't converting to paid, or before a major redesign. Repeat quarterly for established products.

## How this differs from funnel instrumentation

| Doc | Purpose |
|-----|---------|
| `funnel-instrumentation.md` | Add tracking events at each step (PostHog/Mixpanel code) |
| **This doc** | Analyze your existing flow — find friction, missing persuasion, and drop-off causes |

---

## 1. The 5 SaaS funnels to audit

Every SaaS product has these conversion paths. Map each one in your product, then score each step.

```
Funnel 1: Visitor → First Value
  "Can they experience the product before committing?"

Funnel 2: First Value → Signup
  "What triggers the signup prompt? Gate or invitation?"

Funnel 3: Free → Paid
  "Where is upgrade prompted? Is paid value clear at decision point?"

Funnel 4: User → Sharer
  "Can users share output? Is sharing frictionless?"

Funnel 5: Referral → Signup
  "Does referral UI exist? Is there an incentive?"
```

---

## 2. Friction scoring system

Score each step across 4 dimensions. Each dimension is 1-5 (1 = worst, 5 = best).

| Dimension | What it measures | Score 1 (bad) | Score 5 (good) |
|-----------|-----------------|---------------|----------------|
| **Clarity** | Does the user know what to do next? | Ambiguous — multiple CTAs, unclear labels | One obvious next action, clear copy |
| **Confidence** | Does the user trust this step? | No social proof, no security signals | Testimonials, trust badges, clear privacy |
| **Effort** | How much work does the user need to do? | 10+ fields, multiple pages, slow load | 1-2 fields, instant, pre-filled |
| **Reward** | Does the user get something for completing this step? | Nothing visible happens | Immediate value shown (preview, result, confirmation) |

**Step score** = Clarity + Confidence + Effort + Reward (max 20)

- 16-20: Strong step — leave it alone
- 11-15: Adequate — optimize when you have time
- 6-10: Weak — this is likely where users drop off
- 1-5: Broken — fix immediately, this step is killing conversion

---

## 3. Funnel-by-funnel audit guide

### Funnel 1: Visitor → First Value

**What to check:** Can a visitor experience your product's core value without creating an account?

| Step | What to look for |
|------|-----------------|
| Landing page load | Does it load in <2s? Is the value proposition immediately clear? |
| First CTA found | Can a visitor find the primary action in <5 seconds? |
| First interaction | Can they try the product (demo, playground, sample data) or is signup required first? |
| First result | Do they see a meaningful output from the product within 60 seconds? |

**Common friction points:**
- Signup required before any interaction (kills 50-70% of visitors)
- Landing page talks about features instead of outcomes
- CTA says "Sign Up" instead of describing the action ("Extract data", "Create project")
- No demo or sample data — user has to bring their own content to evaluate

**Missing persuasion checklist:**
- [ ] Social proof above the fold (logos, user count, testimonials)
- [ ] Specificity in hero copy (numbers, outcomes, not vague claims)
- [ ] Visual preview of the product (screenshot, video, interactive demo)
- [ ] Risk reducer (free tier, no credit card, cancel anytime)

---

### Funnel 2: First Value → Signup

**What to check:** At what point does signup appear, and does it feel like a gate or an invitation?

| Step | What to look for |
|------|-----------------|
| Signup trigger | What action triggers the signup prompt? Is it after value delivery or before? |
| Signup form | How many fields? Email only? Social auth? |
| Post-signup | Where does the user land? Is it the same context they were in? |
| Activation | Do they complete the action they were trying to do before signup interrupted? |

**Common friction points:**
- Signup appears BEFORE the user has seen any value
- Too many fields (anything beyond email + password reduces conversion)
- No social auth (Google/GitHub SSO can double conversion)
- Post-signup lands on empty dashboard instead of continuing the flow
- Email verification required before accessing the product

**Missing persuasion checklist:**
- [ ] Value reminder at signup ("Sign up to save your [result]")
- [ ] Social proof on signup page (user count, testimonials)
- [ ] Guarantee ("Free forever" / "No credit card required")
- [ ] Progress indicator if multi-step

---

### Funnel 3: Free → Paid

**What to check:** Where are upgrade prompts, and is the value of paid clear at the decision point?

| Step | What to look for |
|------|-----------------|
| Limit encounter | How does the user discover they've hit a limit? Error? Soft wall? |
| Value visibility | Can the user see what they'd get with paid? (Preview, partial result, comparison) |
| Upgrade path | How many clicks from limit encounter to checkout? |
| Checkout | Is pricing clear? Is the billing interval obvious? Tax included? |

**Common friction points:**
- Hard limit with no preview of paid value ("Upgrade to continue" — continue WHAT?)
- Upgrade CTA is only on the pricing page, not at the point of need
- Checkout requires too many steps (address, phone, company info before payment)
- No trial — user must commit before experiencing paid features
- Annual-only pricing (feels risky for new users)

**Missing persuasion checklist:**
- [ ] Show what they're missing (partial result, blurred preview, feature comparison)
- [ ] Upgrade prompt at the point of need (not just on pricing page)
- [ ] Risk reducer at checkout (cancel anytime, refund policy, trial)
- [ ] Urgency if genuine (trial expiry countdown, limited offer)

---

### Funnel 4: User → Sharer

**What to check:** Can users share their results or invite others with minimal friction?

| Step | What to look for |
|------|-----------------|
| Share trigger | Is there an obvious share button/link on output pages? |
| Share mechanism | Copy link? Email? Social? How many clicks? |
| Shared page | Does the shared link work for non-users? Is it a good first impression? |
| Share → signup | Does the shared page have a signup CTA for viewers? |

**Common friction points:**
- No share button anywhere in the product
- Share requires recipients to have an account to view
- Shared link shows ugly/generic preview (no Open Graph tags)
- Shared page has no CTA for the viewer to try the product

---

### Funnel 5: Referral → Signup

**What to check:** Is there a built-in mechanism for existing users to bring new users?

| Step | What to look for |
|------|-----------------|
| Referral UI | Is there a referral/invite feature in the product? |
| Incentive | Is there a reward for referring? (Credits, extended trial, features) |
| Referral link | Is it easy to copy/share the referral link? |
| Attribution | Can you track which signups came from referrals? |

**Common friction points:**
- No referral feature at all (most common)
- Referral exists but is buried in settings (not prompted at moments of delight)
- No incentive for either party
- Referral link goes to generic homepage instead of personalized landing

---

## 4. Audit template

Copy this template for each funnel you audit.

```markdown
## Funnel Audit: [Funnel name]
**Date:** YYYY-MM-DD
**Auditor:** [Your name]
**Product:** [Product name]

### Step-by-step scoring

| Step | Page/Action | Clarity (1-5) | Confidence (1-5) | Effort (1-5) | Reward (1-5) | Score (/20) |
|------|-------------|---------------|-------------------|---------------|---------------|-------------|
| 1 | [e.g., Landing page] | | | | | |
| 2 | [e.g., Click "Try it"] | | | | | |
| 3 | [e.g., Input data] | | | | | |
| 4 | [e.g., See result] | | | | | |
| 5 | [e.g., Signup prompt] | | | | | |

### Analysis

**Weakest step:** Step [#] — [page/action] (score: [X]/20)
**Why it's weak:** [Describe the specific friction]
**Missing persuasion:** [What's absent — social proof, specificity, risk reducer, urgency]

### Recommended fix

**Fix:** [Specific change to make]
**Expected impact:** [e.g., "Removing signup gate before first result should increase visitor→value conversion by 40-60%"]
**Effort:** [Time estimate]
```

---

## 5. Prioritization framework

After auditing all 5 funnels, prioritize fixes by:

```
Impact = (users affected) × (conversion lift estimate)

Priority order:
1. Funnel 1 (Visitor → First Value) — highest traffic, biggest absolute impact
2. Funnel 3 (Free → Paid) — direct revenue impact
3. Funnel 2 (First Value → Signup) — conversion to registered user
4. Funnel 5 (Referral → Signup) — compounding growth
5. Funnel 4 (User → Sharer) — organic reach
```

**Rule of thumb:** Fix the lowest-scoring step in Funnel 1 first. That's where you lose the most people with the least effort.

---

## 6. Experience-level guidance

<!-- beginner -->
**Start with Funnel 1 only.** Open your site in incognito, pretend you've never seen it, and ask: can I get value in under 60 seconds without signing up? If the answer is no, that's your first fix. Everything else is secondary.

<!-- intermediate -->
**Map all 5 funnels. Score each step.** Fix the lowest-scoring step in your most important funnel first. Use the template above to document findings — it helps you stay objective and makes it easy to share with co-founders or advisors.

<!-- senior -->
**You know funnel optimization.** Use the scoring framework to get alignment with stakeholders on where to invest. The template creates a shared language for prioritization discussions that bypasses opinion-based arguments.
