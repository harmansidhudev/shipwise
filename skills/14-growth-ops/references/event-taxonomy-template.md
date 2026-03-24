# Event Taxonomy Template

## When to use
Reference this guide when setting up analytics for a new product, defining event naming conventions, or onboarding a new team member to your tracking plan. Use the core event catalog as a starting point and customize for your product.

## Decision framework

```
How should I name this event?
├── Is it a user action? → noun_verb (e.g., user_signed_up, item_purchased)
├── Is it a system event? → noun_verb (e.g., email_sent, payment_failed)
├── Is it a page/screen view? → page_viewed with url/screen_name property
├── Is it an experiment assignment? → experiment_assigned with variant property
└── Not sure? → Think "what object was acted on?" + "what action happened?"
```

---

## Naming conventions

### Rules

1. **Format**: `noun_verb` in `snake_case` (past tense for completed actions)
2. **Consistency**: Every event follows the same pattern, no exceptions
3. **Specificity**: `subscription_upgraded` not `subscription_changed`
4. **No abbreviations**: `user_signed_up` not `usr_su`
5. **No SDK-specific prefixes**: `page_viewed` not `$pageview` or `track_page_viewed`

### Examples

```
Good:                              Bad:
user_signed_up                     signUp
user_logged_in                     login
user_logged_out                    user-logout
page_viewed                        PageView
button_clicked                     btnClk
item_added_to_cart                 addToCart
item_purchased                     purchase completed
subscription_started               new_sub
subscription_upgraded              planChange
subscription_cancelled             cancel
payment_failed                     paymentError
experiment_assigned                ab_test
feature_flag_evaluated             ff_eval
email_opened                       Email Opened
referral_sent                      refer
search_performed                   search
```

---

## Standard property schema

Every event carries two layers of properties: standard (auto-attached by your SDK wrapper) and event-specific.

### Standard properties (auto-attached)

```ts
// analytics/standard-properties.ts
// [CUSTOMIZE] Adjust fields for your product

interface StandardProperties {
  // Identity
  user_id: string | null;        // Authenticated user ID (null if anonymous)
  anonymous_id: string;           // Pre-auth identifier (generated on first visit)
  session_id: string;             // Current session identifier

  // Context
  timestamp: string;              // ISO 8601 (e.g., "2026-03-24T14:30:00Z")
  platform: 'web' | 'ios' | 'android';
  app_version: string;            // Current release version (e.g., "1.2.3")
  environment: 'production' | 'staging' | 'development';

  // Attribution
  referrer: string | null;        // Document referrer URL
  utm_source: string | null;      // UTM source parameter
  utm_medium: string | null;      // UTM medium parameter
  utm_campaign: string | null;    // UTM campaign parameter

  // Device (auto-captured by most SDKs)
  browser: string;                // e.g., "Chrome 120"
  os: string;                     // e.g., "macOS 14.2"
  device_type: 'desktop' | 'tablet' | 'mobile';
  screen_resolution: string;      // e.g., "1920x1080"
  locale: string;                 // e.g., "en-US"
}
```

### SDK wrapper for auto-attaching standard properties

```ts
// analytics/tracker.ts
// [CUSTOMIZE] Replace posthog with your analytics SDK

import posthog from 'posthog-js';

interface TrackOptions {
  event: string;
  properties?: Record<string, unknown>;
}

export function track({ event, properties = {} }: TrackOptions) {
  const standardProps = {
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
    platform: 'web',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
  };

  posthog.capture(event, {
    ...standardProps,
    ...properties,
  });
}

// Helper: persistent session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
```

### Amplitude equivalent

```ts
// analytics/tracker-amplitude.ts
// [CUSTOMIZE] If using Amplitude instead of PostHog

import * as amplitude from '@amplitude/analytics-browser';

export function track(event: string, properties: Record<string, unknown> = {}) {
  amplitude.track(event, {
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
    platform: 'web',
    ...properties,
  });
}

// Amplitude auto-captures: user_id, device_id, session_id,
// platform, os, browser, language, and more.
// You only need to add app-specific properties.
```

---

## Core event catalog (20 essential SaaS events)

These 20 events cover the minimum instrumentation for any SaaS product. Implement all of them before adding product-specific events.

### Copy-paste: event tracking plan

```markdown
# Event Tracking Plan
# [CUSTOMIZE] Replace examples with your product-specific values

## Identity Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 1 | user_signed_up | method: "email"\|"google"\|"github", referral_code?, utm_source? | Account creation completed |
| 2 | user_logged_in | method: "email"\|"google"\|"github" | Successful authentication |
| 3 | user_logged_out | session_duration_seconds | Logout action |
| 4 | user_profile_updated | fields_changed: string[] | Profile save |

## Onboarding Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 5 | onboarding_step_completed | step_number, step_name, time_on_step_seconds | Each onboarding step |
| 6 | onboarding_completed | total_time_seconds, steps_completed, steps_skipped | Final onboarding step |
| 7 | activation_completed | time_to_activate_seconds, activation_action | [CUSTOMIZE] First core action |

## Core Product Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 8 | [resource]_created | resource_id, resource_type, properties_count | [CUSTOMIZE] Core create action |
| 9 | [resource]_updated | resource_id, fields_changed: string[] | [CUSTOMIZE] Core update action |
| 10 | [resource]_deleted | resource_id, resource_age_days | [CUSTOMIZE] Core delete action |
| 11 | feature_used | feature_name, context | Any significant feature interaction |
| 12 | search_performed | query, results_count, filters_applied | Search submission |

## Engagement Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 13 | page_viewed | url, title, referrer, time_on_page_seconds | Every page navigation |
| 14 | session_started | referrer, landing_page, utm_params | New session detected |
| 15 | session_ended | duration_seconds, pages_viewed, actions_taken | Session timeout or close |

## Revenue Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 16 | subscription_started | plan_id, plan_name, price_cents, interval, trial? | Successful checkout |
| 17 | subscription_upgraded | from_plan, to_plan, price_diff_cents | Plan upgrade |
| 18 | subscription_cancelled | plan_id, reason?, feedback? | Cancellation confirmed |
| 19 | payment_failed | plan_id, error_code, retry_count | Payment processor error |

## Growth Events

| # | Event | Properties | Trigger |
|---|-------|-----------|---------|
| 20 | referral_sent | channel: "email"\|"link"\|"social", referral_code | Referral invitation sent |
```

### Implementation: PostHog

```ts
// examples/posthog-implementation.ts
// [CUSTOMIZE] Adapt event names and properties to your product

import { track } from './tracker';

// 1. User signed up
export function trackSignup(method: string, referralCode?: string) {
  track({
    event: 'user_signed_up',
    properties: {
      method,                    // "email" | "google" | "github"
      referral_code: referralCode || null,
    },
  });
}

// 7. Activation completed
// [CUSTOMIZE] Define what "activation" means for YOUR product
export function trackActivation(activationAction: string, timeToActivateMs: number) {
  track({
    event: 'activation_completed',
    properties: {
      activation_action: activationAction,
      time_to_activate_seconds: Math.round(timeToActivateMs / 1000),
    },
  });
}

// 13. Page viewed
export function trackPageView(url: string, title: string) {
  track({
    event: 'page_viewed',
    properties: {
      url,
      title,
      referrer: document.referrer || null,
    },
  });
}

// 16. Subscription started
export function trackSubscriptionStarted(
  planId: string,
  planName: string,
  priceCents: number,
  interval: 'monthly' | 'yearly',
  isTrial: boolean,
) {
  track({
    event: 'subscription_started',
    properties: {
      plan_id: planId,
      plan_name: planName,
      price_cents: priceCents,
      interval,
      trial: isTrial,
    },
  });
}

// 20. Referral sent
export function trackReferralSent(channel: string, referralCode: string) {
  track({
    event: 'referral_sent',
    properties: {
      channel,               // "email" | "link" | "social"
      referral_code: referralCode,
    },
  });
}
```

### Implementation: Amplitude

```ts
// examples/amplitude-implementation.ts
// [CUSTOMIZE] Same events, Amplitude SDK

import * as amplitude from '@amplitude/analytics-browser';

// Initialize (call once on app load)
export function initAmplitude() {
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
    defaultTracking: {
      sessions: true,
      pageViews: true,    // Auto-tracks page_viewed
      formInteractions: false,
      fileDownloads: false,
    },
  });
}

// Set user identity after login/signup
export function identifyUser(userId: string, traits: Record<string, unknown>) {
  amplitude.setUserId(userId);
  const identify = new amplitude.Identify();
  Object.entries(traits).forEach(([key, value]) => {
    identify.set(key, value as string);
  });
  amplitude.identify(identify);
}

// Track events (same naming convention)
export function trackSignup(method: string) {
  amplitude.track('user_signed_up', { method });
}

export function trackActivation(action: string, timeSeconds: number) {
  amplitude.track('activation_completed', {
    activation_action: action,
    time_to_activate_seconds: timeSeconds,
  });
}

export function trackSubscriptionStarted(plan: {
  id: string; name: string; priceCents: number; interval: string; trial: boolean;
}) {
  amplitude.track('subscription_started', {
    plan_id: plan.id,
    plan_name: plan.name,
    price_cents: plan.priceCents,
    interval: plan.interval,
    trial: plan.trial,
  });

  // Also set user property for segmentation
  const identify = new amplitude.Identify();
  identify.set('plan', plan.name);
  identify.set('plan_interval', plan.interval);
  amplitude.identify(identify);
}
```

---

## Event tracking plan spreadsheet template

Use this format in Google Sheets or Notion to document your complete tracking plan.

```markdown
# Event Tracking Plan — [CUSTOMIZE: Product Name]
# Last updated: YYYY-MM-DD
# Owner: [CUSTOMIZE: name]

| Category | Event Name | Description | Properties | Trigger Location | Priority | Status |
|----------|-----------|-------------|-----------|-----------------|----------|--------|
| Identity | user_signed_up | User creates account | method, referral_code | /signup page | P0 | Implemented |
| Identity | user_logged_in | User authenticates | method | /login page | P0 | Implemented |
| Identity | user_logged_out | User ends session | session_duration_seconds | Nav menu | P1 | Pending |
| Onboarding | onboarding_step_completed | User completes setup step | step_number, step_name | /onboarding | P0 | Pending |
| Onboarding | activation_completed | User does core action first time | activation_action, time_to_activate | [CUSTOMIZE] | P0 | Pending |
| Product | [CUSTOMIZE]_created | Core resource created | resource_id | [CUSTOMIZE] | P0 | Pending |
| Product | feature_used | User interacts with feature | feature_name | Various | P1 | Pending |
| Product | search_performed | User searches | query, results_count | Search bar | P1 | Pending |
| Engagement | page_viewed | Page navigation | url, title, referrer | All pages | P0 | Implemented |
| Revenue | subscription_started | User subscribes | plan_id, price_cents | /checkout | P0 | Pending |
| Revenue | subscription_cancelled | User cancels | plan_id, reason | /settings | P0 | Pending |
| Revenue | payment_failed | Payment error | error_code | Webhook | P0 | Pending |
| Growth | referral_sent | User invites someone | channel, referral_code | /referral | P1 | Pending |
```

---

## Customization notes

- **Add product-specific events**: The 20 core events are a starting point. Add events for your unique features (e.g., `report_generated`, `integration_connected`, `team_member_invited`).
- **Property governance**: Require PR review for new event definitions to prevent naming drift. Store the tracking plan in a version-controlled file.
- **Testing events**: Before deploying, verify events fire correctly in staging using your analytics tool's debug mode (PostHog: enable debug, Amplitude: enable debug logging).
- **Privacy**: Never include PII (email, name, IP) in event properties unless your analytics tool is self-hosted and your privacy policy allows it.

## Companion tools

- PostHog — `posthog-js` SDK, debug mode for event verification
- Amplitude — `@amplitude/analytics-browser`, debug logging
- Avo — Schema-first analytics governance (validates event names and properties)
