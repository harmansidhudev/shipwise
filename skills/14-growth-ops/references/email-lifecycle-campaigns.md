# Email Lifecycle Campaigns

## When to use
Reference this guide when building email sequences for onboarding, re-engagement, upgrades, churn prevention, or win-back. Use the email templates with subject lines as starting points and customize for your product.

## Decision framework

```
Which email campaign do I need?
├── New user just signed up?
│   → Onboarding sequence (Day 0, 1, 3, 7)
├── User signed up but went inactive (14+ days)?
│   → Re-engagement sequence (Day 14, 30, 60)
├── Active free user hitting plan limits?
│   → Upgrade nudge sequence (on limit hit + Day 3)
├── User initiated cancellation?
│   → Churn prevention sequence (cancel flow + Day 3, 7)
├── User already churned (30+ days ago)?
│   → Win-back sequence (Day 30, 60, 90 post-churn)
└── Not sure where to start?
    → Start with onboarding (highest impact)
```

---

## Email delivery setup

### Provider selection

| Provider | Best for | Pricing | Key feature |
|----------|----------|---------|-------------|
| Resend | Developers, React email templates | Free to 3K/mo | React Email integration |
| Postmark | Highest deliverability | Free trial, then usage | 99%+ inbox placement |
| Loops | Lifecycle email (non-technical) | Free to 1K contacts | Visual builder + automations |
| Customer.io | Behavioral triggers at scale | From $150/mo | Advanced segmentation |

### Resend setup

```ts
// lib/email.ts
// [CUSTOMIZE] Replace API key and from address

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail({ to, subject, html, tags }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: 'Your Product <hello@yourdomain.com>', // [CUSTOMIZE]
    to,
    subject,
    html,
    tags,
  });

  if (error) {
    console.error('Email send failed:', error);
    throw error;
  }

  return data;
}
```

### Postmark setup

```ts
// lib/email-postmark.ts
// [CUSTOMIZE] Replace server token and from address

import * as postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

export async function sendEmail(params: {
  to: string;
  subject: string;
  htmlBody: string;
  tag?: string;
  messageStream?: string;
}) {
  return client.sendEmail({
    From: 'hello@yourdomain.com', // [CUSTOMIZE]
    To: params.to,
    Subject: params.subject,
    HtmlBody: params.htmlBody,
    Tag: params.tag,
    MessageStream: params.messageStream || 'outbound',
  });
}
```

### Deliverability checklist

```markdown
# Email Deliverability Setup

- [ ] SPF record: Add TXT record to DNS
      `v=spf1 include:_spf.resend.com ~all`
      [CUSTOMIZE] Replace with your provider's SPF include

- [ ] DKIM record: Add CNAME or TXT records (provided by email service)
      Follow provider setup wizard — typically 3 CNAME records

- [ ] DMARC record: Add TXT record to DNS
      `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`
      Start with p=none, move to p=quarantine after 2 weeks

- [ ] Custom sending domain configured (mail.yourdomain.com)

- [ ] Test email lands in inbox (not spam) for:
      - [ ] Gmail
      - [ ] Outlook
      - [ ] Apple Mail

- [ ] Unsubscribe header present (List-Unsubscribe)
- [ ] One-click unsubscribe link in email body
- [ ] Reply-to address monitored
```

---

## Campaign 1: Onboarding Sequence

Goal: Drive new users to activation (first core action).

### Email schedule

| Email | Timing | Subject | Goal |
|-------|--------|---------|------|
| Welcome | Immediately | Welcome to [Product]! | Set expectations |
| Getting started | Day 1 | Here's how to [core action] in 2 minutes | Drive first action |
| Value reminder | Day 3 | Did you try [feature]? | Re-engage if not activated |
| Social proof | Day 7 | How [Customer] uses [Product] to [outcome] | Build confidence |

### Copy-paste: email templates

```html
<!-- Email 1: Welcome (send immediately after signup) -->
<!-- Subject: Welcome to [Product]! Here's what to do first -->
<!-- [CUSTOMIZE] Replace all bracketed content -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 24px; color: #1a1a1a;">Welcome to [Product]!</h1>

  <p>Hey [First Name],</p>

  <p>Thanks for signing up. You made a great choice.</p>

  <p><strong>Here's the one thing I'd suggest doing right now:</strong></p>

  <p style="padding: 16px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #2563eb;">
    [CUSTOMIZE: Describe the first action in 1-2 sentences]<br/>
    <a href="[CUSTOMIZE: deep link to first action]" style="color: #2563eb; font-weight: 600;">
      Do it now (takes 2 minutes) &rarr;
    </a>
  </p>

  <p>If you have any questions, just reply to this email. I read every one.</p>

  <p>
    [CUSTOMIZE: Founder name]<br/>
    <span style="color: #666;">Founder, [Product]</span>
  </p>
</div>
```

```html
<!-- Email 2: Getting Started (Day 1) -->
<!-- Subject: [First Name], here's how to [core action] in 2 minutes -->
<!-- Only send if user has NOT activated yet -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hey [First Name],</p>

  <p>Most people get value from [Product] by [CUSTOMIZE: describing the core action]. Here's how:</p>

  <ol style="line-height: 1.8;">
    <li><strong>Step 1:</strong> [CUSTOMIZE: First step with screenshot or GIF link]</li>
    <li><strong>Step 2:</strong> [CUSTOMIZE: Second step]</li>
    <li><strong>Step 3:</strong> [CUSTOMIZE: Third step — the "aha moment"]</li>
  </ol>

  <p>
    <a href="[CUSTOMIZE: deep link]" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      Get started now &rarr;
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Takes about 2 minutes. If you get stuck, reply to this email and I'll help.
  </p>
</div>
```

```html
<!-- Email 3: Value Reminder (Day 3) -->
<!-- Subject: Did you try [feature]? -->
<!-- Only send if user has NOT activated yet -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hey [First Name],</p>

  <p>I noticed you haven't [CUSTOMIZE: completed core action] yet.</p>

  <p>Here's what our most successful users do in their first week:</p>

  <ul style="line-height: 1.8;">
    <li>[CUSTOMIZE: Quick win #1]</li>
    <li>[CUSTOMIZE: Quick win #2]</li>
    <li>[CUSTOMIZE: Quick win #3]</li>
  </ul>

  <p>
    <a href="[CUSTOMIZE: deep link]" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      Try it now &rarr;
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Need help getting set up? Reply to this email or
    <a href="[CUSTOMIZE: calendar link]">book a 15-min call</a>.
  </p>
</div>
```

```html
<!-- Email 4: Social Proof (Day 7) -->
<!-- Subject: How [Customer] uses [Product] to [outcome] -->
<!-- Send to all users regardless of activation status -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hey [First Name],</p>

  <p>Wanted to share how [CUSTOMIZE: customer name or role] uses [Product]:</p>

  <blockquote style="border-left: 3px solid #e5e7eb; padding-left: 16px; margin: 16px 0; color: #374151;">
    "[CUSTOMIZE: Short customer quote about the value they get]"
    <br/><strong>— [Customer Name], [Title] at [Company]</strong>
  </blockquote>

  <p>[CUSTOMIZE: 1-2 sentences expanding on the use case and outcome]</p>

  <p>
    <a href="[CUSTOMIZE: relevant feature or case study link]" style="color: #2563eb; font-weight: 600;">
      See how to get similar results &rarr;
    </a>
  </p>
</div>
```

---

## Campaign 2: Re-engagement Sequence

Goal: Bring back users who signed up but went dormant.

### Email schedule

| Email | Timing | Subject | Goal |
|-------|--------|---------|------|
| Miss you | Day 14 inactive | We've made some improvements | Re-spark interest |
| Value recap | Day 30 inactive | Here's what you're missing | FOMO / value reminder |
| Last chance | Day 60 inactive | Should we close your account? | Urgency to re-engage |

### Subject line options (A/B test these)

```
Day 14:
A: "We've made some improvements since you left"
B: "[First Name], quick update on [Product]"
C: "3 new things in [Product] this month"

Day 30:
A: "Here's what you're missing in [Product]"
B: "[First Name], your [Product] account is waiting"
C: "Your team is getting ahead with [Product]"

Day 60:
A: "Should we close your [Product] account?"
B: "We miss you, [First Name]"
C: "Last chance: your [Product] data"
```

---

## Campaign 3: Upgrade Nudge

Goal: Convert active free users to paid when they hit plan limits.

### Trigger events

```
Send upgrade email when user:
├── Hits usage limit (e.g., 3 projects on free plan)
├── Attempts premium feature (and sees paywall)
├── Has been active for 14+ days on free plan
├── Has invited team members (signals organizational use)
└── Downloads/exports data (power user signal)
```

### Email template

```html
<!-- Subject: You've outgrown the free plan (that's a good thing!) -->
<!-- Trigger: User hits usage limit -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hey [First Name],</p>

  <p>You just hit the [CUSTOMIZE: limit description] on your free plan. That means you're getting real value from [Product] — great!</p>

  <p>Upgrading to [Plan Name] gives you:</p>

  <ul style="line-height: 1.8;">
    <li>[CUSTOMIZE: Benefit 1 — the one that solves their limit]</li>
    <li>[CUSTOMIZE: Benefit 2]</li>
    <li>[CUSTOMIZE: Benefit 3]</li>
  </ul>

  <p>
    <a href="[CUSTOMIZE: upgrade link]" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      Upgrade to [Plan Name] &rarr;
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Plans start at $[CUSTOMIZE: price]/month. Cancel anytime.
  </p>
</div>
```

---

## Campaign 4: Churn Prevention

Goal: Save users who initiate cancellation.

### Cancel flow design

```
User clicks "Cancel subscription"
├── Step 1: "We're sorry to see you go. Mind telling us why?"
│   → [Multiple choice: too expensive, missing feature, etc.]
│   → Track: subscription_cancel_reason_selected
├── Step 2: Offer based on reason:
│   ├── "Too expensive" → Offer 30% discount for 3 months
│   ├── "Missing feature" → Show roadmap, ask which feature
│   ├── "Not using enough" → Offer pause (1-3 months) instead of cancel
│   ├── "Switching to competitor" → Offer free migration help
│   └── Other → Offer to schedule a call
├── Step 3: If still cancelling → Confirm cancellation
│   → Access continues until period end
│   → Track: subscription_cancelled
└── Post-cancel emails: Day 3 and Day 7
```

### Post-cancel email

```html
<!-- Subject: Your [Product] account — here's what changes -->
<!-- Send: Day 3 after cancellation -->

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hey [First Name],</p>

  <p>Your [Plan Name] subscription ends on [End Date]. After that:</p>

  <ul style="line-height: 1.8;">
    <li>Your account will switch to the free plan</li>
    <li>You'll keep access to [CUSTOMIZE: what they keep]</li>
    <li>You'll lose access to [CUSTOMIZE: what they lose]</li>
    <li>Your data will be preserved for [CUSTOMIZE: 90 days]</li>
  </ul>

  <p>Changed your mind? You can reactivate anytime before [End Date]:</p>

  <p>
    <a href="[CUSTOMIZE: reactivate link]" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      Keep my subscription &rarr;
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    If there's anything we can do differently, I'd love to hear it. Just reply.
  </p>
</div>
```

---

## Campaign 5: Win-back Sequence

Goal: Re-acquire users who churned 30+ days ago.

### Email schedule

| Email | Timing | Subject | Goal |
|-------|--------|---------|------|
| Update | Day 30 post-churn | A lot has changed since you left | Show improvements |
| Offer | Day 60 post-churn | Come back: [X]% off for 3 months | Financial incentive |
| Final | Day 90 post-churn | Last update from us | Clean break or return |

### Subject line options

```
Day 30:
A: "A lot has changed at [Product] since you left"
B: "[First Name], we've fixed [the thing they complained about]"
C: "We listened: here's what's new in [Product]"

Day 60:
A: "Come back to [Product]: 30% off for 3 months"
B: "[First Name], a special offer just for you"
C: "We'd love you back — here's an incentive"

Day 90:
A: "This is our last email (unless you say otherwise)"
B: "[First Name], one final update from [Product]"
C: "We'll stop emailing — but your account is still here"
```

---

## Email sequence orchestration

### Trigger logic

```ts
// lib/email-sequences.ts
// [CUSTOMIZE] Implement with your email provider and event system

interface UserEmailState {
  userId: string;
  signupDate: Date;
  activatedAt: Date | null;
  lastActiveAt: Date | null;
  cancelledAt: Date | null;
  plan: 'free' | 'starter' | 'pro';
  emailsSent: string[]; // track which emails already sent
}

export function getNextEmail(user: UserEmailState): string | null {
  const daysSinceSignup = daysBetween(user.signupDate, new Date());
  const daysSinceActive = user.lastActiveAt
    ? daysBetween(user.lastActiveAt, new Date())
    : daysSinceSignup;
  const daysSinceCancel = user.cancelledAt
    ? daysBetween(user.cancelledAt, new Date())
    : null;

  // Churn prevention (highest priority)
  if (daysSinceCancel !== null) {
    if (daysSinceCancel >= 90 && !user.emailsSent.includes('winback_90')) return 'winback_90';
    if (daysSinceCancel >= 60 && !user.emailsSent.includes('winback_60')) return 'winback_60';
    if (daysSinceCancel >= 30 && !user.emailsSent.includes('winback_30')) return 'winback_30';
    if (daysSinceCancel >= 3 && !user.emailsSent.includes('churn_followup')) return 'churn_followup';
    return null;
  }

  // Re-engagement (dormant users)
  if (daysSinceActive >= 60 && !user.emailsSent.includes('reengage_60')) return 'reengage_60';
  if (daysSinceActive >= 30 && !user.emailsSent.includes('reengage_30')) return 'reengage_30';
  if (daysSinceActive >= 14 && !user.emailsSent.includes('reengage_14')) return 'reengage_14';

  // Onboarding (new users, not yet activated)
  if (!user.activatedAt) {
    if (daysSinceSignup >= 7 && !user.emailsSent.includes('onboard_7')) return 'onboard_7';
    if (daysSinceSignup >= 3 && !user.emailsSent.includes('onboard_3')) return 'onboard_3';
    if (daysSinceSignup >= 1 && !user.emailsSent.includes('onboard_1')) return 'onboard_1';
  }

  // Onboarding social proof (all users)
  if (daysSinceSignup >= 7 && !user.emailsSent.includes('onboard_social_proof')) {
    return 'onboard_social_proof';
  }

  return null;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
```

---

## Metrics to track per email

```markdown
| Metric | How to measure | Good benchmark |
|--------|---------------|----------------|
| Delivery rate | Delivered / Sent | > 98% |
| Open rate | Opened / Delivered | 30-50% (transactional) |
| Click rate | Clicked / Delivered | 3-8% |
| Conversion rate | Completed goal / Delivered | 1-5% |
| Unsubscribe rate | Unsubscribed / Delivered | < 0.5% |
| Spam complaint rate | Complaints / Delivered | < 0.1% |
```

---

## Customization notes

- **Start with onboarding**: The onboarding sequence has the highest ROI because it targets users at their moment of highest intent. Get this right before building other sequences.
- **Personalize by activation status**: If a user activated before Day 3, skip the Day 3 "value reminder" email and send the Day 7 social proof email instead. Do not email people to do something they already did.
- **Subject line A/B testing**: Test 2-3 subject lines per email. Even small improvements (35% open vs 30% open) compound across thousands of emails.
- **Send time**: For B2B, send Tuesday-Thursday 9-11am in the user's timezone. For B2C, test evenings and weekends.
- **Frequency cap**: Never send more than 1 lifecycle email per 48 hours to the same user. Stack with a priority queue: churn prevention > re-engagement > onboarding > upgrade.

## Companion tools

- Resend — developer-friendly email API, React Email templates
- Postmark — highest deliverability, message streams
- Loops — visual lifecycle email builder
- React Email — open-source email component library
