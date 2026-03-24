# Feedback Loop Design

## When to use
Reference this guide when setting up in-app feedback collection, implementing NPS surveys, designing churn surveys, or establishing a user interview cadence. Use the component code and templates to ship feedback collection quickly.

## Decision framework

```
Which feedback mechanism do I need?
├── Want to capture bugs and feature requests passively?
│   → In-app feedback widget (always visible)
├── Want to measure overall satisfaction over time?
│   → NPS survey (day 7, 30, 90)
├── Want to measure support quality?
│   → CSAT survey (after support interaction)
├── Want deep qualitative insights?
│   → Power user interviews (monthly, 30 min)
├── Want to understand why users leave?
│   → Churn survey (in cancel flow)
└── Not sure where to start?
    → Start with feedback widget + NPS day 7
```

---

## In-app feedback widget

### Design principles

```
Widget requirements:
├── Always visible (bottom-right corner or nav bar)
├── Minimal friction (2 clicks to submit: open → type → send)
├── Categorization (bug, feature request, general, praise)
├── Optional screenshot attachment
├── Anonymous option (some users prefer it)
├── Auto-attach context (current page URL, user ID, app version)
└── Confirmation message ("Thanks! We read every submission.")
```

### Copy-paste: feedback widget component

```tsx
// components/feedback-widget.tsx
// [CUSTOMIZE] Replace the submitFeedback function with your API

'use client';

import { useState } from 'react';

type FeedbackCategory = 'bug' | 'feature' | 'general' | 'praise';

interface FeedbackPayload {
  category: FeedbackCategory;
  message: string;
  email?: string;
  page_url: string;
  user_id?: string;
  app_version: string;
  timestamp: string;
}

export function FeedbackWidget({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: FeedbackPayload = {
      category,
      message,
      email: email || undefined,
      page_url: window.location.href,
      user_id: userId,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // [CUSTOMIZE] Replace with your feedback API endpoint
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // [CUSTOMIZE] Also track in analytics
    // posthog.capture('feedback_submitted', { category });

    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setMessage('');
      setCategory('general');
    }, 2000);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Send feedback"
      >
        Feedback
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Send Feedback</h3>
        <button onClick={() => setIsOpen(false)} aria-label="Close">
          &times;
        </button>
      </div>

      {submitted ? (
        <div className="p-6 text-center">
          <p className="text-green-600 font-medium">Thanks! We read every submission.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Category selector */}
          <div className="flex gap-2">
            {(['bug', 'feature', 'general', 'praise'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cat === 'bug' ? 'Bug' : cat === 'feature' ? 'Feature' : cat === 'praise' ? 'Praise' : 'General'}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            rows={4}
            required
            className="w-full border rounded-md p-2 text-sm"
          />

          {/* Optional email (for non-authenticated users) */}
          {!userId && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, for follow-up)"
              className="w-full border rounded-md p-2 text-sm"
            />
          )}

          <button
            type="submit"
            disabled={!message.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Send Feedback
          </button>
        </form>
      )}
    </div>
  );
}
```

### Feedback API endpoint

```ts
// app/api/feedback/route.ts
// [CUSTOMIZE] Replace storage with your preferred backend

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate required fields
  if (!body.category || !body.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // [CUSTOMIZE] Choose your storage:

  // Option 1: Database
  // await db.insert(feedbackTable).values(body);

  // Option 2: Slack notification
  // await fetch(process.env.SLACK_FEEDBACK_WEBHOOK!, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     text: `*${body.category.toUpperCase()}* from ${body.user_id || 'anonymous'}\n${body.message}\n_Page: ${body.page_url}_`,
  //   }),
  // });

  // Option 3: Linear/GitHub issue (for bugs)
  // if (body.category === 'bug') { /* create issue */ }

  // Option 4: Notion database
  // await notion.pages.create({ ... });

  return NextResponse.json({ success: true });
}
```

---

## NPS survey implementation

### NPS methodology

```
Net Promoter Score (NPS):
- Ask: "On a scale of 0-10, how likely are you to recommend [product] to a friend?"
- Follow up: "What's the main reason for your score?"

Scoring:
  0-6  = Detractors (unhappy, may churn)
  7-8  = Passives (satisfied but not enthusiastic)
  9-10 = Promoters (loyal, will refer others)

  NPS = % Promoters - % Detractors
  Range: -100 to +100

Benchmarks:
  < 0    = Serious product/market fit issues
  0-30   = Average — room for improvement
  30-50  = Good — strong product/market fit
  50-70  = Great — exceptional satisfaction
  70+    = World-class — rare, strong word-of-mouth
```

### Survey timing

| Survey | Trigger | Why this timing |
|--------|---------|-----------------|
| Day 7 NPS | 7 days after signup | First impression after onboarding |
| Day 30 NPS | 30 days after signup | Settled-in satisfaction |
| Day 90 NPS | 90 days after signup | Long-term value perception |
| Quarterly NPS | Every 90 days for active users | Track trend over time |

### Copy-paste: NPS calculation utility

```ts
// lib/nps.ts
// [CUSTOMIZE] Adjust survey trigger timing if needed

interface NPSResponse {
  score: number;      // 0-10
  reason?: string;    // Open-ended follow-up
  userId: string;
  surveyType: 'day_7' | 'day_30' | 'day_90' | 'quarterly';
  timestamp: string;
}

interface NPSResult {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  responseRate: number;
}

export function calculateNPS(
  responses: NPSResponse[],
  totalSurveyed: number,
): NPSResult {
  const promoters = responses.filter((r) => r.score >= 9).length;
  const passives = responses.filter((r) => r.score >= 7 && r.score <= 8).length;
  const detractors = responses.filter((r) => r.score <= 6).length;
  const total = responses.length;

  return {
    nps: total > 0
      ? Math.round(((promoters - detractors) / total) * 100)
      : 0,
    promoters,
    passives,
    detractors,
    totalResponses: total,
    responseRate: totalSurveyed > 0
      ? Math.round((total / totalSurveyed) * 100)
      : 0,
  };
}

// Check if a user should see an NPS survey
export function shouldShowNPS(
  userCreatedAt: Date,
  lastNPSResponseAt: Date | null,
): 'day_7' | 'day_30' | 'day_90' | null {
  const now = new Date();
  const daysSinceSignup = Math.floor(
    (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysSinceLastNPS = lastNPSResponseAt
    ? Math.floor(
        (now.getTime() - lastNPSResponseAt.getTime()) / (1000 * 60 * 60 * 24),
      )
    : Infinity;

  // Don't show NPS more than once per 30 days
  if (daysSinceLastNPS < 30) return null;

  if (daysSinceSignup >= 85 && daysSinceSignup <= 95) return 'day_90';
  if (daysSinceSignup >= 27 && daysSinceSignup <= 33) return 'day_30';
  if (daysSinceSignup >= 6 && daysSinceSignup <= 10) return 'day_7';

  return null;
}
```

### NPS survey component

```tsx
// components/nps-survey.tsx
// [CUSTOMIZE] Style to match your app's design system

'use client';

import { useState } from 'react';

interface NPSSurveyProps {
  userId: string;
  surveyType: 'day_7' | 'day_30' | 'day_90' | 'quarterly';
  onDismiss: () => void;
}

export function NPSSurvey({ userId, surveyType, onDismiss }: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'score' | 'reason' | 'thanks'>('score');

  async function handleScoreSelect(selectedScore: number) {
    setScore(selectedScore);
    setStep('reason');
  }

  async function handleSubmit() {
    // [CUSTOMIZE] Replace with your API endpoint
    await fetch('/api/nps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        reason,
        userId,
        surveyType,
        timestamp: new Date().toISOString(),
      }),
    });

    // [CUSTOMIZE] Track in analytics
    // posthog.capture('nps_submitted', { score, survey_type: surveyType });

    setStep('thanks');
    setTimeout(onDismiss, 2000);
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border p-6 z-50">
      <button onClick={onDismiss} className="absolute top-2 right-3 text-gray-400">
        &times;
      </button>

      {step === 'score' && (
        <>
          <p className="font-medium mb-4">
            How likely are you to recommend us to a friend or colleague?
          </p>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleScoreSelect(i)}
                className={`w-8 h-8 rounded text-sm font-medium border
                  ${i <= 6 ? 'hover:bg-red-100 hover:border-red-300' : ''}
                  ${i >= 7 && i <= 8 ? 'hover:bg-yellow-100 hover:border-yellow-300' : ''}
                  ${i >= 9 ? 'hover:bg-green-100 hover:border-green-300' : ''}
                `}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </>
      )}

      {step === 'reason' && (
        <>
          <p className="font-medium mb-3">
            {score !== null && score >= 9
              ? "Glad to hear it! What do you like most?"
              : score !== null && score >= 7
              ? "Thanks! What could we do better?"
              : "Sorry to hear that. What's the main issue?"}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Your feedback helps us improve..."
            rows={3}
            className="w-full border rounded-md p-2 text-sm mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              onClick={() => { setReason(''); handleSubmit(); }}
              className="text-gray-500 text-sm"
            >
              Skip
            </button>
          </div>
        </>
      )}

      {step === 'thanks' && (
        <p className="text-center text-green-600 font-medium py-4">
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
}
```

---

## CSAT survey

```
Customer Satisfaction Score (CSAT):
- Ask: "How satisfied were you with [specific interaction]?"
- Scale: 1-5 stars or "Very unsatisfied" to "Very satisfied"

CSAT = (Satisfied responses / Total responses) * 100

Trigger after:
├── Support ticket resolved
├── Onboarding completed
├── Feature tutorial finished
└── Any significant user interaction
```

---

## Power user interview cadence

### Interview schedule

```
Monthly:
├── Identify top 5 power users (highest engagement, longest tenure)
├── Send personal email inviting 30-min video call
├── Offer incentive: $25 gift card or 1 month free
├── Aim for 2-3 completed interviews per month
└── Record (with permission) and share key clips with team
```

### Interview question template

```markdown
# Power User Interview Guide — [CUSTOMIZE: Product Name]
# Duration: 30 minutes
# Recording: [Ask permission before recording]

## Warm-up (2 min)
1. "Tell me about your role and what you're working on."

## Usage patterns (8 min)
2. "Walk me through how you typically use [product] in a normal week."
3. "What's the first thing you do when you open [product]?"
4. "Is there anything you use [product] for that might surprise us?"

## Value & pain points (10 min)
5. "What's the biggest problem [product] solves for you?"
6. "What's the most frustrating thing about using [product]?"
7. "If you could change one thing about [product], what would it be?"
8. "Have you tried any alternatives? What brought you back to us?"

## Feature exploration (5 min)
9. "Are there features you know exist but don't use? Why not?"
10. "Is there something you wish [product] could do that it can't?"

## Growth signals (3 min)
11. "Have you recommended [product] to anyone? What did you tell them?"
12. "If a colleague asked you about [product], how would you describe it in one sentence?"

## Wrap-up (2 min)
13. "Anything else you'd like to share?"
14. "Would you be open to being featured in a case study?"
```

---

## Feedback triage template

Route feedback to the right team and track resolution.

```markdown
# Feedback Triage Board

## Columns
| New | Under Review | Planned | In Progress | Shipped | Won't Do |

## Triage rules (run daily, 15 min)
- Bug with 3+ reports → P1, assign to engineering
- Feature request with 10+ requests → Add to roadmap discussion
- Praise / testimonial → Share in #wins channel, ask for public review
- NPS detractor (0-6) → Personal follow-up within 24h
- NPS promoter (9-10) → Ask for public review or case study

## Tagging schema
| Tag | Meaning |
|-----|---------|
| bug | Something is broken |
| feature-request | User wants something new |
| ux-friction | Something works but is confusing |
| praise | Positive feedback |
| churn-risk | User expressing intent to leave |
| integration | Request for third-party integration |
```

---

## Churn survey

Add a short survey to your cancellation flow to understand why users leave.

```tsx
// components/churn-survey.tsx
// [CUSTOMIZE] Add/remove reasons based on your product

const CHURN_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'missing_feature', label: 'Missing a feature I need' },
  { id: 'switched_competitor', label: 'Switched to a different tool' },
  { id: 'no_longer_needed', label: "I don't need this anymore" },
  { id: 'too_complicated', label: 'Too complicated to use' },
  { id: 'poor_support', label: 'Poor customer support' },
  { id: 'bugs', label: 'Too many bugs or issues' },
  { id: 'other', label: 'Other' },
] as const;

// Show this in your cancel flow BEFORE confirming cancellation
// Track: posthog.capture('churn_reason_selected', { reason, details })
```

---

## Customization notes

- **Solo founder**: Start with the feedback widget + NPS day 7 only. Add more touchpoints as you grow.
- **SaaS tool integration**: Use Canny, Nolt, or UserVoice instead of a custom feedback widget if you want built-in voting and public roadmaps.
- **Response rate optimization**: NPS response rates are typically 10-30%. Higher for in-app surveys, lower for email. Show the survey at a non-intrusive moment (not during onboarding).
- **Privacy**: If collecting feedback anonymously, do not attempt to de-anonymize. Trust the user's choice.

## Companion tools

- Canny — feature request voting board with public roadmap
- Formbricks — open-source in-app surveys (NPS, CSAT, custom)
- Hotjar — feedback widget + session recordings + surveys
