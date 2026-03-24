# User Story Template

## When to use

Reference this guide when writing user stories for new features, breaking down epics into implementable work, or reviewing existing stories for completeness. Use the templates to ensure every story has clear acceptance criteria and appropriate sizing.

## Decision framework

```
How should I write this feature requirement?
├── Is it a user-facing feature?
│   └── Yes → Write as user story: "As a [role], I want [action] so that [benefit]"
│   └── No → Is it a technical requirement with indirect user impact?
│       ├── Yes → Write as user story but frame the benefit from user perspective
│       │   Example: "As a user, I want pages to load in <2s so that I don't abandon the app"
│       └── No → Write as a technical task, not a story (e.g., "Set up CI pipeline")
│
├── How big is this story?
│   ├── XS (< 1 hour) — Single function or config change
│   ├── S  (half day)  — One screen or one API endpoint
│   ├── M  (1-2 days)  — Feature with 2-3 screens or endpoints
│   ├── L  (3-5 days)  — Complex feature, multiple integrations
│   └── XL (> 5 days)  — TOO BIG. Break it into smaller stories.
│
└── Does each story have acceptance criteria?
    ├── Yes (Given/When/Then format) → Ready for development
    └── No → Not ready. Add acceptance criteria before starting work.
```

---

## Story sizing guide

| Size | Time estimate | Complexity | Example |
|------|---------------|------------|---------|
| **XS** | < 1 hour | Single change, no new UI | Add tooltip to existing button |
| **S** | Half day | One screen or endpoint | Create "forgot password" form |
| **M** | 1-2 days | Multi-part feature, 2-3 screens | User profile page with edit mode |
| **L** | 3-5 days | Complex feature, multiple integrations | Stripe payment integration |
| **XL** | > 5 days | **Too large — split it** | "Build dashboard" is XL — break into individual widgets |

**Rule**: If a story is XL, it is an epic in disguise. Split it into 3-8 smaller stories, each M or smaller.

---

## Anti-patterns to avoid

### 1. Stories too large
**Bad**: "As a user, I want a dashboard so that I can see my data."
**Problem**: "Dashboard" could mean 20 different things. This will take weeks and no one agrees on scope.
**Fix**: Break into specific stories: "As a user, I want to see my weekly activity chart so that I can track my progress."

### 2. Missing benefit clause
**Bad**: "As a user, I want to filter by date."
**Problem**: Without "so that," you do not know why the user needs this. Maybe they need to find recent items (show newest first instead?) or export a date range (different UI entirely).
**Fix**: "As a user, I want to filter transactions by date range so that I can reconcile my monthly expenses."

### 3. Technical stories without user value
**Bad**: "As a developer, I want to refactor the database schema."
**Problem**: This is a technical task, not a user story. Stakeholders cannot prioritize it against features.
**Fix**: Frame the user benefit: "As a user, I want search results in under 1 second so that I can find items quickly" (then the tech task of schema optimization serves this story). Or keep it as a technical task separate from the story backlog.

### 4. Missing acceptance criteria
**Bad**: "As a user, I want to upload a profile picture." (no criteria)
**Problem**: What file types? Max size? Crop tool? What happens on failure? Nobody knows when this is "done."
**Fix**: Add Given/When/Then criteria for happy path, edge cases, and error states.

### 5. Acceptance criteria too vague
**Bad**: "The page should load fast."
**Problem**: "Fast" is not measurable.
**Fix**: "Given the user is on a 4G connection, When they load the dashboard, Then the page is interactive within 2 seconds."

---

## Copy-paste template

### Epic template

```markdown
# Epic: [CUSTOMIZE] User Onboarding

## Description
[CUSTOMIZE] First-time users need a guided experience that helps them understand the
product value and complete initial setup within 5 minutes.

## Success metric
[CUSTOMIZE] 80% of new signups complete onboarding within the first session.

## User stories

---

### Story 1: Account creation
**As a** new visitor,
**I want** to create an account with my email or Google SSO,
**So that** I can access the product without friction.

**Size**: S (half day)

**Acceptance criteria**:

- **AC 1.1** — Happy path: email signup
  - Given I am on the signup page
  - When I enter a valid email and password (≥8 chars, 1 uppercase, 1 number)
  - Then my account is created and I am redirected to the onboarding flow

- **AC 1.2** — Happy path: Google SSO
  - Given I am on the signup page
  - When I click "Continue with Google" and authorize
  - Then my account is created using my Google profile and I am redirected to onboarding

- **AC 1.3** — Error: duplicate email
  - Given I enter an email that already has an account
  - When I click "Sign up"
  - Then I see an error message: "An account with this email already exists. Log in instead?"

- **AC 1.4** — Error: weak password
  - Given I enter a password that does not meet requirements
  - When I click "Sign up"
  - Then I see inline validation explaining which requirements are not met

---

### Story 2: Welcome questionnaire
**As a** new user who just signed up,
**I want** to answer 3-4 questions about my goals,
**So that** the product can personalize my experience.

**Size**: M (1-2 days)

**Acceptance criteria**:

- **AC 2.1** — Happy path
  - Given I have just created my account
  - When the onboarding flow starts
  - Then I see a multi-step questionnaire (max 4 questions, progress indicator visible)

- **AC 2.2** — Skippable
  - Given I am on any questionnaire step
  - When I click "Skip for now"
  - Then I am taken to the next step (or the dashboard if on the last step) with default settings applied

- **AC 2.3** — Answers persist
  - Given I have completed the questionnaire
  - When I visit my settings page later
  - Then I can see and edit my questionnaire answers

---

### Story 3: First-run guided tour
**As a** new user who completed the questionnaire,
**I want** a brief guided tour highlighting key features,
**So that** I understand how to accomplish my main task.

**Size**: M (1-2 days)

**Acceptance criteria**:

- **AC 3.1** — Tour starts automatically
  - Given I completed the questionnaire (or skipped it)
  - When the dashboard loads for the first time
  - Then a tooltip-based guided tour highlights 3-5 key UI elements sequentially

- **AC 3.2** — Tour is dismissible
  - Given the guided tour is active
  - When I click "Skip tour" or press Escape
  - Then the tour ends and does not show again

- **AC 3.3** — Tour does not repeat
  - Given I have completed or dismissed the tour
  - When I return to the dashboard on subsequent visits
  - Then the tour does not restart (flag stored in user preferences)

---

### Story 4: Sample data seeding
**As a** new user on the dashboard for the first time,
**I want** to see sample data pre-populated,
**So that** I understand what the product looks like with real content.

**Size**: S (half day)

**Acceptance criteria**:

- **AC 4.1** — Sample data displayed
  - Given I am a new user with no data
  - When I reach the dashboard after onboarding
  - Then I see clearly-labeled sample data ([CUSTOMIZE] e.g., 3 sample projects, 5 sample tasks)

- **AC 4.2** — Sample data is deletable
  - Given sample data is displayed
  - When I click "Clear sample data" or create my first real item
  - Then all sample data is removed and replaced with my content

- **AC 4.3** — Empty state without sample data
  - Given I have cleared sample data and have no real data
  - When I view the dashboard
  - Then I see an empty state with a clear CTA: "[CUSTOMIZE] Create your first project"

---

### Story 5: Onboarding completion tracking
**As a** product manager,
**I want** to track onboarding completion rates per step,
**So that** I can identify where users drop off and improve the flow.

**Size**: S (half day)

**Acceptance criteria**:

- **AC 5.1** — Events tracked
  - Given a user progresses through onboarding
  - When they complete each step (signup, questionnaire, tour, first action)
  - Then an analytics event fires: `onboarding_step_completed { step, userId, timestamp }`

- **AC 5.2** — Drop-off tracked
  - Given a user abandons onboarding
  - When they close the browser or navigate away without completing
  - Then an analytics event fires: `onboarding_abandoned { lastStep, userId, timestamp }`

- **AC 5.3** — Dashboard metric
  - Given onboarding events are being tracked
  - When I view the analytics dashboard
  - Then I see a funnel visualization showing completion rate per step
```

---

## Customization notes

- **[CUSTOMIZE] markers**: Replace all bracketed items with your specific product context.
- **Story count**: The template shows 5 stories per epic. Real epics typically have 3-8 stories. If you have more than 10, your epic is too broad — split it.
- **Acceptance criteria count**: 2-4 criteria per story is the sweet spot. Fewer means undertested. More than 5 usually means the story should be split.
- **Size calibration**: The time estimates assume one developer working solo. Adjust based on team familiarity with the domain and tech stack.
- **Persona roles**: Replace "user" with specific personas when you have multiple user types (e.g., "As an admin," "As a free-tier user," "As an API consumer").

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill — Generate UI from user stories
- `google-labs-code/design-md` — Design specification documents from user stories
