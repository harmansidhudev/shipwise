# Referral Program Design

## When to use
Reference this guide when designing a referral program, choosing reward mechanics, building referral tracking, or calculating viral coefficient. Use the API endpoint template and tracking schema to implement referral functionality.

## Decision framework

```
Should I build a referral program?
├── Do I have users who love my product? (NPS promoters, 9-10)
│   ├── Yes → Build a referral program
│   └── No → Fix the product first (referral programs amplify sentiment)
├── Which reward type?
│   ├── Users pay money → Account credit or discount
│   ├── Users are on free plan → Feature unlock or extended trial
│   ├── High LTV product → Cash reward or generous credit
│   └── Not sure → Start with double-sided credit ($10 for both)
├── When to launch?
│   ├── After you have 100+ active users
│   ├── After NPS is > 30
│   └── After activation rate is > 30%
└── What is the viral coefficient target?
    ├── K < 0.5 → Referral is supplementary
    ├── K 0.5-1.0 → Good amplification
    └── K > 1.0 → Viral growth (rare, but possible)
```

---

## Double-sided referral mechanics

### How it works

```
Referrer (existing user)          Referee (new user)
  │                                   │
  ├── Gets unique referral link       │
  ├── Shares via email/link/social    │
  │                                   ├── Clicks referral link
  │                                   ├── Signs up
  │                                   ├── Activates (completes core action)
  │                                   │
  ├── Reward unlocked ◄──────────────┤── Reward unlocked
  │   (e.g., $10 credit)             │   (e.g., $10 credit)
  │                                   │
  └── Can refer more people           └── Can now refer others too
```

### Why double-sided works better

```
Single-sided (only referrer gets reward):
├── Feels selfish to share ("I get $10 if you sign up")
├── Lower conversion on referral link
└── Typical: 2-3% of users share

Double-sided (both get reward):
├── Feels generous ("We both get $10")
├── Higher conversion on referral link
├── Typical: 5-10% of users share
└── 2-3x more effective than single-sided
```

### Reward types comparison

| Reward type | Best for | Example | Pros | Cons |
|------------|----------|---------|------|------|
| Account credit | SaaS with clear $ value | "$10 credit for both" | Easy to understand, universally appealing | Costs real money |
| Feature unlock | Freemium products | "Both get premium for 1 month" | Zero marginal cost, drives feature adoption | Less motivating if features aren't desirable |
| Discount | Subscription products | "Both get 20% off next month" | Reduces churn for referrer | Lower perceived value than credit |
| Extended trial | Trial-based products | "Both get 14 extra days free" | Extends evaluation period | Only works pre-payment |
| Charitable donation | Mission-driven products | "We'll plant a tree for both of you" | Unique, shareable, feel-good | Not a personal incentive |

---

## Viral coefficient calculation

```
Viral Coefficient (K-factor):

  K = i * c

Where:
  i = average number of invitations sent per user
  c = conversion rate of invitations (% that sign up)

Examples:
  K = 3 invites * 0.10 conversion = 0.30 (supplementary growth)
  K = 5 invites * 0.20 conversion = 1.00 (each user brings 1 new user)
  K = 8 invites * 0.15 conversion = 1.20 (viral, organic growth exceeds churn)

To improve K:
├── Increase invitations (i):
│   ├── Make sharing easier (one-click copy link)
│   ├── Prompt at moments of delight (after success)
│   ├── Email reminder about referral program
│   └── Show referral status dashboard
└── Increase conversion (c):
    ├── Improve referral landing page
    ├── Pre-fill referred user's context
    ├── Make the reward more compelling
    └── Reduce signup friction for referred users

Viral cycle time:
  How long from referral sent to referee referring someone else.
  Shorter cycle time = faster viral growth.
  Target: < 7 days for consumer, < 30 days for B2B.
```

---

## Copy-paste: referral tracking schema

### Database schema

```sql
-- Referral tracking tables
-- [CUSTOMIZE] Adapt column types to your database

CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  code VARCHAR(20) UNIQUE NOT NULL,      -- e.g., "JOHN2024" or "a1b2c3"
  created_at TIMESTAMP DEFAULT NOW(),

  -- Tracking
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_activations INTEGER DEFAULT 0,
  total_rewards_earned INTEGER DEFAULT 0,

  -- Limits (anti-abuse)
  max_uses INTEGER DEFAULT 50,            -- [CUSTOMIZE] max referrals per user
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  referrer_user_id UUID NOT NULL REFERENCES users(id),
  referee_user_id UUID REFERENCES users(id),  -- NULL until signup
  event_type VARCHAR(20) NOT NULL,             -- click, signup, activated, rewarded
  created_at TIMESTAMP DEFAULT NOW(),

  -- Attribution
  referral_link_url TEXT,
  landing_page TEXT,
  utm_source VARCHAR(50),
  utm_medium VARCHAR(50)
);

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_event_id UUID NOT NULL REFERENCES referral_events(id),
  user_id UUID NOT NULL REFERENCES users(id),  -- Who gets the reward
  reward_type VARCHAR(20) NOT NULL,             -- credit, feature_unlock, discount
  reward_value INTEGER,                          -- Amount in cents (for credit/discount)
  reward_description TEXT,
  status VARCHAR(20) DEFAULT 'pending',          -- pending, granted, expired
  granted_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_events_code_id ON referral_events(referral_code_id);
CREATE INDEX idx_referral_events_referee ON referral_events(referee_user_id);
CREATE INDEX idx_referral_rewards_user_id ON referral_rewards(user_id);
```

---

## Copy-paste: referral API endpoint template

```ts
// app/api/referral/route.ts
// [CUSTOMIZE] Replace database calls with your ORM/query builder

import { NextRequest, NextResponse } from 'next/server';

// --- Generate referral code for authenticated user ---
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request); // [CUSTOMIZE]
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user already has a referral code
  let code = await db.referralCodes.findFirst({ where: { userId } }); // [CUSTOMIZE]

  if (!code) {
    // Generate unique code
    const codeString = generateReferralCode(userId); // [CUSTOMIZE]
    code = await db.referralCodes.create({
      data: {
        userId,
        code: codeString,
      },
    });
  }

  return NextResponse.json({
    code: code.code,
    referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/r/${code.code}`,
    stats: {
      clicks: code.totalClicks,
      signups: code.totalSignups,
      activations: code.totalActivations,
      rewardsEarned: code.totalRewardsEarned,
    },
  });
}

// --- Track referral link click ---
// app/r/[code]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = await db.referralCodes.findUnique({
    where: { code: params.code },
  });

  if (!code || !code.isActive) {
    // Redirect to normal signup even if code is invalid
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/signup`);
  }

  // Track click
  await db.referralEvents.create({
    data: {
      referralCodeId: code.id,
      referrerUserId: code.userId,
      eventType: 'click',
      referralLinkUrl: request.url,
      landingPage: '/signup',
    },
  });

  // Increment click count
  await db.referralCodes.update({
    where: { id: code.id },
    data: { totalClicks: { increment: 1 } },
  });

  // Redirect to signup with referral code in cookie/param
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${code.code}`,
  );

  // Store referral code in cookie (survives if user doesn't sign up immediately)
  response.cookies.set('referral_code', code.code, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}
```

### Referral reward granting

```ts
// lib/referral-rewards.ts
// [CUSTOMIZE] Call this when a referred user activates

interface GrantRewardParams {
  referralCodeId: string;
  referrerUserId: string;
  refereeUserId: string;
}

export async function grantReferralRewards({
  referralCodeId,
  referrerUserId,
  refereeUserId,
}: GrantRewardParams) {
  // Anti-abuse checks
  const code = await db.referralCodes.findUnique({ where: { id: referralCodeId } });
  if (!code || !code.isActive) return;
  if (code.totalRewardsEarned >= code.maxUses) return;

  // Check: referrer and referee are not the same person
  if (referrerUserId === refereeUserId) return;

  // Check: referee hasn't been referred before
  const existingReferral = await db.referralEvents.findFirst({
    where: { refereeUserId, eventType: 'rewarded' },
  });
  if (existingReferral) return;

  // Grant reward to referrer
  // [CUSTOMIZE] Adjust reward type and amount
  await db.referralRewards.create({
    data: {
      referralEventId: await getEventId(referralCodeId, refereeUserId),
      userId: referrerUserId,
      rewardType: 'credit',
      rewardValue: 1000, // $10.00 in cents [CUSTOMIZE]
      rewardDescription: 'Referral reward: $10 account credit',
      status: 'granted',
      grantedAt: new Date(),
    },
  });

  // Grant reward to referee
  await db.referralRewards.create({
    data: {
      referralEventId: await getEventId(referralCodeId, refereeUserId),
      userId: refereeUserId,
      rewardType: 'credit',
      rewardValue: 1000, // $10.00 in cents [CUSTOMIZE]
      rewardDescription: 'Welcome reward: $10 account credit',
      status: 'granted',
      grantedAt: new Date(),
    },
  });

  // Update referral code stats
  await db.referralCodes.update({
    where: { id: referralCodeId },
    data: {
      totalActivations: { increment: 1 },
      totalRewardsEarned: { increment: 1 },
    },
  });

  // Track in analytics
  // posthog.capture('referral_reward_granted', {
  //   referrer_user_id: referrerUserId,
  //   referee_user_id: refereeUserId,
  //   reward_value_cents: 1000,
  // });

  // [CUSTOMIZE] Send notification emails to both users
  // await sendReferralRewardEmail(referrerUserId, 'referrer');
  // await sendReferralRewardEmail(refereeUserId, 'referee');
}
```

---

## Anti-abuse controls

```
Referral fraud prevention:
├── Rate limiting: Max 10 referral invites per day per user
├── Delayed rewards: Reward only after referee ACTIVATES (not just signs up)
├── Max uses per code: Cap at 50 referrals per user (adjust based on product)
├── Self-referral detection: Same email domain, same IP, same device fingerprint
├── Duplicate detection: One referral reward per referee (ever)
├── Suspicious pattern flags:
│   ├── 10+ signups from same IP in 24h → flag for review
│   ├── Referee accounts with no activity → delay reward by 7 days
│   └── Referrer with >80% inactive referees → disable code
└── Manual review: Flag accounts earning >5 rewards per week
```

---

## Copy-paste: referral landing page copy

```html
<!-- /referral page — shown to logged-in users -->
<!-- [CUSTOMIZE] Replace all bracketed content -->

<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <h1>Give $10, Get $10</h1>
  <p style="font-size: 18px; color: #666;">
    Share [Product] with friends and colleagues.
    You both get $10 in account credit when they sign up and
    [CUSTOMIZE: activate / make their first purchase / start a project].
  </p>

  <!-- Referral link copy box -->
  <div style="background: #f8f9fa; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <label style="font-size: 14px; color: #666; display: block; margin-bottom: 8px;">
      Your referral link:
    </label>
    <div style="display: flex; gap: 8px;">
      <input
        type="text"
        value="https://yourproduct.com/r/YOUR_CODE"
        readonly
        style="flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;"
      />
      <button style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
        Copy
      </button>
    </div>
  </div>

  <!-- Share buttons -->
  <div style="display: flex; gap: 12px; margin-bottom: 32px;">
    <button>Share via Email</button>
    <button>Share on Twitter</button>
    <button>Share on LinkedIn</button>
  </div>

  <!-- Stats -->
  <h3>Your referral stats</h3>
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
    <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-size: 24px; font-weight: bold;">0</div>
      <div style="font-size: 14px; color: #666;">Clicks</div>
    </div>
    <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-size: 24px; font-weight: bold;">0</div>
      <div style="font-size: 14px; color: #666;">Signups</div>
    </div>
    <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-size: 24px; font-weight: bold;">0</div>
      <div style="font-size: 14px; color: #666;">Activated</div>
    </div>
    <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-size: 24px; font-weight: bold;">$0</div>
      <div style="font-size: 14px; color: #666;">Earned</div>
    </div>
  </div>

  <!-- How it works -->
  <h3 style="margin-top: 32px;">How it works</h3>
  <ol style="line-height: 2;">
    <li>Share your unique referral link with friends</li>
    <li>They sign up and [CUSTOMIZE: complete their first core action]</li>
    <li>You both get $10 in account credit</li>
  </ol>

  <p style="font-size: 14px; color: #999;">
    Credits are applied automatically to your next invoice.
    Max [CUSTOMIZE: 50] referrals. <a href="/terms/referral">Full terms</a>.
  </p>
</div>
```

---

## Referral program metrics

```markdown
| Metric | How to calculate | Good benchmark |
|--------|-----------------|----------------|
| Participation rate | Users who share / total active users | 5-10% |
| Viral coefficient (K) | Avg invites per user * invite conversion rate | > 0.5 |
| Referral conversion | Referred signups / referral link clicks | 10-25% |
| Activation rate (referred) | Referred activated / referred signups | Should be >= organic |
| Reward redemption | Rewards granted / rewards eligible | > 80% |
| CAC via referral | Total reward cost / referred paying customers | Should be < paid CAC |
| Viral cycle time | Median time from referral to referee's first referral | < 30 days |
```

---

## Customization notes

- **Pre-product-market fit**: Do not build a referral program. Focus on making the product good enough that people recommend it without incentives. If NPS is below 30, a referral program will amplify indifference.
- **B2B products**: Use credit or plan extensions. Discounts can devalue the product. Consider higher rewards ($25-50) since B2B LTV is higher.
- **B2C products**: Use feature unlocks or extended trials to drive engagement. Cash rewards work but cost more.
- **Legal considerations**: Check local regulations on referral incentives. Some jurisdictions restrict cash rewards for referrals. Consult a lawyer if offering significant monetary rewards.

## Companion tools

- Rewardful — referral and affiliate tracking for SaaS
- ReferralCandy — plug-and-play referral widget
- Viral Loops — referral campaign templates
