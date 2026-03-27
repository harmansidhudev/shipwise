# Onboarding UX Patterns

Great onboarding converts signups into active users by delivering value before asking for commitment. This reference covers the five core patterns, when to pick each one, and copy-paste React + Tailwind components.

## When to use

Reference this doc when designing the first-run experience for a new product, a major feature launch, or a re-engagement flow for dormant users. Return to it whenever your activation rate (signup-to-value) drops below target.

---

## 1. Onboarding strategy decision tree

```
Product complexity --> onboarding depth:
├── Simple tool (1 core action)
│   --> Empty state with single CTA, no tour
├── Medium SaaS (3-5 features)
│   --> Checklist + contextual tooltips
└── Complex platform (10+ features)
    --> Guided walkthrough + progressive disclosure
```

### Choosing a pattern

```
If product has 1 core action              --> empty-state-driven onboarding
If product has 3-5 features, standard UI  --> onboarding checklist
If product has complex spatial UI         --> tooltip tour (max 5 steps)
If product requires domain knowledge      --> short video (< 90s) + checklist
If users arrive with different goals      --> 1 segmentation question, then personalize checklist
```

### Pattern comparison

| Pattern | Best for | Example | Effort |
|---------|----------|---------|--------|
| Empty state | Single-action tools | Link shortener, todo app | Low (1-2 hrs) |
| Checklist | Multi-feature SaaS | Project management, CRM | Medium (4-8 hrs) |
| Tooltip tour | Spatial / complex UI | Design tools, dashboards | Medium (4-8 hrs) |
| Video + checklist | Domain-heavy products | Accounting software | High (1-2 days) |
| Interactive walkthrough | Complex platforms | IDE plugins, data pipelines | High (2-5 days) |

---

## 2. Empty state as onboarding

First-time users and returning users who cleared data need different messaging.

### Copywriting patterns

| Scenario | Title | Description | CTA label |
|----------|-------|-------------|-----------|
| First project | "Create your first project" | "Projects keep your work organized. Start with one." | "New project" |
| First team member | "You're flying solo" | "Invite a teammate to collaborate in real time." | "Invite teammate" |
| Empty dashboard | "No data yet" | "Connect a data source to see your first chart." | "Connect source" |
| Returning empty | "All caught up" | "Nothing here right now. Create something new." | "Create new" |

### Component

```tsx
// [CUSTOMIZE] Replace illustration, copy, and CTA targets for your product
interface EmptyStateOnboardingProps {
  variant: "first-time" | "returning";
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
}

const EmptyStateOnboarding: React.FC<EmptyStateOnboardingProps> = ({
  variant, title, description, ctaLabel, onCtaClick, secondaryLabel, onSecondaryClick,
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    {/* [CUSTOMIZE] Replace with your illustration or icon */}
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
      <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
    <button onClick={onCtaClick} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
      {ctaLabel}
    </button>
    {variant === "first-time" && secondaryLabel && (
      <button onClick={onSecondaryClick} className="mt-3 text-sm text-gray-500 underline hover:text-gray-700">{secondaryLabel}</button>
    )}
    {variant === "returning" && (
      <p className="mt-4 text-xs text-gray-400">
        Your previous items may have been archived.{" "}
        <button onClick={onSecondaryClick} className="underline hover:text-gray-600">View archive</button>
      </p>
    )}
  </div>
);
```

---

## 3. Onboarding checklist pattern

Checklists give users a visible progress indicator and clear next steps. Persist state to your database (not localStorage) so progress survives device switches.

### Checklist rules

- [ ] 3-5 items maximum (more feels overwhelming)
- [ ] Each item has: title, one-line description, CTA button
- [ ] Show progress visually (ring or bar)
- [ ] Allow manual dismiss ("Skip setup")
- [ ] Auto-dismiss when all items are complete
- [ ] Persist state to user profile via API

### Component

```tsx
// [CUSTOMIZE] Replace step definitions and API calls for your product
interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  completed: boolean;
  onAction: () => void;
}
interface OnboardingChecklistProps {
  steps: ChecklistStep[];
  onDismiss: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ steps, onDismiss }) => {
  const completedCount = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const pct = Math.round((completedCount / total) * 100);
  if (completedCount === total) return null; // auto-dismiss

  return (
    <div className="w-80 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Getting started</h3>
        <div className="relative h-10 w-10">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${pct} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">{completedCount}/{total}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.id} className={`rounded-lg border p-3 ${step.completed ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
            <div className="flex items-start gap-3">
              {step.completed ? <span className="mt-0.5 text-green-500">&#10003;</span> : <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-gray-300" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
                {!step.completed && <button onClick={step.onAction} className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">{step.ctaLabel} &rarr;</button>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onDismiss} className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600">Skip setup</button>
    </div>
  );
};
```

---

## 4. Tooltip tour pattern

### When to use

```
If UI has a spatial layout (canvas, editor, dashboard with panels)
  AND new users can't figure out where things are --> use a tooltip tour
If UI is a standard list/form layout              --> skip the tour, use a checklist
```

### Tour rules

- [ ] Maximum 5 steps (fewer is better)
- [ ] Allow skip at any point with visible "Skip tour" link
- [ ] Never cover the element being explained
- [ ] Show step count ("Step 2 of 5")
- [ ] Run only on first visit (check a `hasSeenTour` flag)

### Component

```tsx
// [CUSTOMIZE] Adjust positioning and step content for your UI
// Uses Radix Popover -- lightweight, no tour library needed
// npm install @radix-ui/react-popover
import * as Popover from "@radix-ui/react-popover";

interface TourStepConfig {
  targetRef: React.RefObject<HTMLElement>;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
}
interface TourStepProps {
  step: TourStepConfig;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const TourStep: React.FC<TourStepProps> = ({ step, currentStep, totalSteps, onNext, onSkip }) => (
  <Popover.Root open>
    <Popover.Anchor virtualRef={step.targetRef} />
    <Popover.Portal>
      <Popover.Content side={step.side ?? "bottom"} sideOffset={8} className="z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
        <p className="text-xs font-medium text-blue-600">Step {currentStep} of {totalSteps}</p>
        <h4 className="mt-1 text-sm font-semibold text-gray-900">{step.title}</h4>
        <p className="mt-1 text-xs text-gray-500">{step.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600">Skip tour</button>
          <button onClick={onNext} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            {currentStep === totalSteps ? "Done" : "Next"}
          </button>
        </div>
        <Popover.Arrow className="fill-white" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
```

### Tour anti-patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| Tour replays every session | Users feel trapped, churn increases | Store `hasSeenTour` in user profile |
| Tour covers the explained element | User can't see what you're describing | Position popover beside the element |
| Full-screen overlay blocking UI | Feels like an ad, users close immediately | Use focused highlight on target only |
| 10+ step tour | Nobody finishes, creates fatigue | Cut to 5 steps max, link to docs for rest |

---

## 5. Progressive disclosure

Show core features first. Reveal advanced features as users gain confidence or complete prerequisites.

### Decision framework

```
If feature used by >80% of users  --> show immediately (core UI)
If feature used by 20-80%         --> show behind "More" menu or secondary tab
If feature used by <20%           --> put in Settings or behind a feature gate
```

### Component: FeatureGate

```tsx
// [CUSTOMIZE] Replace prerequisite logic with your feature conditions
interface FeatureGateProps {
  isUnlocked: boolean;
  lockedMessage: string;
  children: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ isUnlocked, lockedMessage, children }) => {
  if (isUnlocked) return <>{children}</>;
  return (
    <div className="relative rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <div className="pointer-events-none opacity-30" aria-hidden="true">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">{lockedMessage}</p>
      </div>
    </div>
  );
};
```

### Component: NewBadge

```tsx
// [CUSTOMIZE] Adjust the daysSinceRelease source for your feature flag system
interface NewBadgeProps {
  releasedAt: string; // ISO date string
  children: React.ReactNode;
}

const NewBadge: React.FC<NewBadgeProps> = ({ releasedAt, children }) => {
  const daysOld = Math.floor((Date.now() - new Date(releasedAt).getTime()) / 86_400_000);
  return (
    <span className="relative inline-flex items-center gap-1.5">
      {children}
      {daysOld <= 7 && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">New</span>}
    </span>
  );
};
```

---

## 6. Activation metrics

Activation is the moment a user first gets real value -- not signup, not email verification, but the first meaningful action.

### Activation events by product type

| Product type | Activation event | Target time from signup |
|-------------|-----------------|------------------------|
| Project management | First task created | < 5 min |
| Analytics | First dashboard viewed | < 3 min |
| Communication | First message sent | < 2 min |
| E-commerce platform | First product listed | < 10 min |
| Design tool | First design exported | < 15 min |
| Developer tool | First successful API call | < 5 min |

### Activation metric definition template

```markdown
<!-- [CUSTOMIZE] Fill in for your product -->
## Activation metric
- **Product**: [CUSTOMIZE: your product name]
- **Activation event**: [CUSTOMIZE: e.g., "First report generated"]
- **Target time-to-value**: [CUSTOMIZE: e.g., "< 5 minutes from signup"]
- **Measurement**: Time from `user.created_at` to `activation_event.timestamp`
- **Current baseline**: [CUSTOMIZE: measure before optimizing]
- **Goal**: [CUSTOMIZE: e.g., "70% of signups activate within 5 minutes"]
```

### Analytics event tracking snippet

```tsx
// [CUSTOMIZE] Replace event names and properties for your analytics provider
type ActivationEvent = {
  event: string;
  userId: string;
  timestamp: string;
  properties: Record<string, string | number | boolean>;
};

function trackActivation(eventName: string, properties: Record<string, string | number | boolean> = {}): void {
  const payload: ActivationEvent = {
    event: eventName,
    userId: getCurrentUserId(), // [CUSTOMIZE] your auth helper
    timestamp: new Date().toISOString(),
    properties: { ...properties, time_since_signup_ms: Date.now() - getUserSignupTimestamp() }, // [CUSTOMIZE]
  };
  // [CUSTOMIZE] Replace with your analytics provider (Posthog, Mixpanel, Amplitude, etc.)
  fetch("/api/analytics/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
// Usage: trackActivation("first_task_created", { task_type: "personal" });
```

---

## 7. Re-engagement for dormant users

### Trigger logic

```
If user signed up AND never activated AND last login > 7 days ago
  --> start re-engagement sequence
If user activated AND last login > 14 days ago
  --> start win-back sequence (different copy)
```

### Email sequence

| Day | Subject line | Content focus |
|-----|-------------|---------------|
| 7 | "You haven't tried [core feature] yet" | One CTA to complete activation action |
| 14 | "Here's what you're missing" | Social proof + feature highlight |
| 30 | "We miss you -- here's 20% off" | Incentive to return (discount, extended trial) |

### Component: WelcomeBack

```tsx
// [CUSTOMIZE] Replace feature recap and CTA for your product
interface WelcomeBackProps {
  userName: string;
  lastActiveDate: string; // ISO string
  onDismiss: () => void;
  onResume: () => void;
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ userName, lastActiveDate, onDismiss, onResume }) => {
  const daysAway = Math.floor((Date.now() - new Date(lastActiveDate).getTime()) / 86_400_000);
  return (
    <div className="mx-auto max-w-md rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-gray-900">Welcome back, {userName}!</h2>
      <p className="mt-2 text-sm text-gray-600">It's been {daysAway} days since your last visit. Here's what's new:</p>
      {/* [CUSTOMIZE] Replace with actual feature updates */}
      <ul className="mt-4 space-y-2 text-left text-sm text-gray-700">
        <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">&#8226;</span><span>[CUSTOMIZE: Recent update #1]</span></li>
        <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">&#8226;</span><span>[CUSTOMIZE: Recent update #2]</span></li>
      </ul>
      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onResume} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Pick up where I left off</button>
        <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
      </div>
    </div>
  );
};
```

---

## 8. Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| Asking for info you don't need yet (company size at signup) | Adds friction before user sees value | Ask only email + password; collect profile data later |
| Tours that replay every session | Users feel trapped, negative association | Store `hasSeenTour` in user profile, check on load |
| Onboarding that blocks the core action | User came to DO something, not read a tutorial | Let users skip and access the product immediately |
| 10+ field forms before user sees value | High drop-off, low conversion | 2-3 fields max; defer rest to progressive profiling |
| No skip option on tours or checklists | Users feel forced, builds resentment | Always include "Skip" or "Dismiss" |
| Re-engagement emails too aggressively (daily) | Users unsubscribe or mark as spam | Space emails: Day 7, Day 14, Day 30 max |
| Showing ALL features in the tour | Information overload, nothing sticks | 3-5 core features; link to docs for the rest |
| Not tracking activation metrics | Can't improve what you don't measure | Define activation event on day one |
| Generic "Welcome!" with no next step | User stares at empty screen, leaves | Every welcome screen needs one clear CTA |
| Requiring phone for non-communication product | Signals distrust, kills signups | Only ask for phone if SMS is a core feature |

---

## Companion tools

- `anthropics/claude-code` -> `frontend-design` skill -- Implement onboarding components
- `bencium/bencium-marketplace` -> `controlled-ux-designer` -- Visual onboarding styling
