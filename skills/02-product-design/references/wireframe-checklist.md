# Wireframe & Design Handoff Checklist

## When to use

Reference this guide when planning screen designs, creating wireframes at any fidelity level, mapping information architecture, documenting screen states, preparing designs for developer handoff, or planning responsive layouts.

## Decision framework

```
What fidelity do I need?
│
├── Exploring ideas / early stage?
│   └── Low-fi (paper/whiteboard, 5 min per screen)
│       ├── Sketch 2-3 layout alternatives per screen
│       ├── Focus on content hierarchy and flow, not aesthetics
│       └── Good enough for: stakeholder alignment, IA validation
│
├── Validating with users or starting development?
│   └── Mid-fi (Figma/Excalidraw, key screens)
│       ├── Real content (no lorem ipsum)
│       ├── Grid-based layout with actual spacing
│       ├── All interactive elements visible
│       ├── Complete state inventory per screen
│       └── Good enough for: user testing, MVP development
│
└── Final polish before launch?
    └── High-fi (pixel-perfect, design tokens applied)
        ├── Design tokens (colors, typography, spacing) applied
        ├── Micro-interactions and transitions specified
        ├── Responsive variants for each breakpoint
        └── Good enough for: marketing pages, premium experiences
```

**Rule for MVPs**: Mid-fi is sufficient for all screens. High-fi only for: landing page, signup/onboarding flow, and any screen shown in marketing materials.

---

## Information architecture template

### Screen inventory

Before wireframing, list every screen and organize into a hierarchy.

```markdown
# Information Architecture — [CUSTOMIZE] Product Name

## Primary navigation (always visible)
- [CUSTOMIZE] Dashboard (/)
- [CUSTOMIZE] Projects (/projects)
- [CUSTOMIZE] Messages (/messages)
- [CUSTOMIZE] Settings (/settings)

## Screen hierarchy

### [CUSTOMIZE] Dashboard
- / — Main dashboard (default landing after login)

### [CUSTOMIZE] Projects
- /projects — Project list
  - /projects/new — Create new project
  - /projects/:id — Project detail
    - /projects/:id/edit — Edit project
    - /projects/:id/settings — Project settings

### [CUSTOMIZE] Messages
- /messages — Message inbox
  - /messages/:id — Conversation thread
  - /messages/new — New message composer

### [CUSTOMIZE] User Account
- /settings — Account settings
  - /settings/profile — Profile editor
  - /settings/billing — Billing & subscription
  - /settings/notifications — Notification preferences
- /login — Login page
- /signup — Signup page
- /forgot-password — Password reset

### [CUSTOMIZE] Public pages
- /landing — Marketing landing page
- /pricing — Pricing page
- /docs — Documentation (if applicable)

## Navigation model
- **Primary nav**: [CUSTOMIZE] Top bar / sidebar with main sections
- **Secondary nav**: [CUSTOMIZE] Tabs within sections
- **Breadcrumbs**: [CUSTOMIZE] Yes/No — needed if >2 levels deep
- **Contextual links**: [CUSTOMIZE] Related items, recent activity
- **Mobile nav**: [CUSTOMIZE] Bottom tab bar / hamburger menu
```

---

## User flow mapping

For each critical path, map the step-by-step flow including decision points and error states.

```markdown
# User Flow: [CUSTOMIZE] Flow Name

## Happy path
1. [CUSTOMIZE] User lands on /landing
2. [CUSTOMIZE] Clicks "Get Started" → /signup
3. [CUSTOMIZE] Fills signup form → submits
4. [CUSTOMIZE] Email verification sent → /verify-email
5. [CUSTOMIZE] Clicks verification link → /onboarding
6. [CUSTOMIZE] Completes onboarding → /dashboard

## Error paths
- Step 3 error: Email already exists → Show inline error with "Log in instead?" link
- Step 3 error: Server error → Show retry message, do not lose form data
- Step 4 error: Email not received → Show "Resend" button after 60 seconds
- Step 5 error: Link expired → Show "Request new link" with explanation

## Edge cases
- User closes browser mid-onboarding → Resume where they left off on next visit
- User navigates directly to /dashboard without completing onboarding → Redirect to onboarding
```

---

## State inventory template (state matrix)

Every screen can be in multiple states. Design all of them, not just the happy path.

```markdown
# State Matrix — [CUSTOMIZE] Product Name

| Screen | Empty | Loading | Populated | Error | Offline |
|--------|-------|---------|-----------|-------|---------|
| [CUSTOMIZE] Dashboard | Onboarding CTA + sample data | Skeleton (3 card placeholders) | Charts + activity feed | "Failed to load" + retry | Show cached data with "offline" badge |
| [CUSTOMIZE] Project list | "Create your first project" CTA | Skeleton (5 list rows) | Project cards with status | "Could not load projects" + retry | Show cached list, disable create |
| [CUSTOMIZE] Project detail | N/A (404 if no project) | Skeleton (header + tabs) | Full project with tabs | "Project not found" or load error | Show cached detail, disable edits |
| [CUSTOMIZE] Messages | "No messages yet" illustration | Skeleton (conversation list) | Conversation list + preview | "Could not load messages" + retry | Show cached messages, queue sends |
| [CUSTOMIZE] Settings | Pre-filled with defaults | Skeleton (form fields) | Current settings editable | "Could not load settings" + retry | Show cached settings, disable save |
```

### State design principles

| State | Design principle | Common mistake |
|-------|-----------------|----------------|
| **Empty** | Guide the user to take action. Show a CTA, not a blank page. | Showing "No data" with no next step |
| **Loading** | Use skeleton screens over spinners. Match the layout of populated state. | Full-page spinner that gives no layout hint |
| **Populated** | Design for realistic data volumes (1 item AND 100 items). | Only designing for 5 perfectly-sized items |
| **Error** | Explain what happened, offer a retry, and preserve user input. | Generic "Something went wrong" with no action |
| **Offline** | Show cached data with a clear offline indicator. Disable destructive actions. | Showing nothing or a blocking error page |

---

## Responsive design planning

### Breakpoint reference

| Breakpoint | Width | Device class | Tailwind prefix |
|------------|-------|-------------|-----------------|
| Default | 0-639px | Mobile (portrait) | (none) |
| sm | 640px+ | Mobile (landscape) / small tablet | `sm:` |
| md | 768px+ | Tablet (portrait) | `md:` |
| lg | 1024px+ | Laptop / tablet (landscape) | `lg:` |
| xl | 1280px+ | Desktop | `xl:` |
| 2xl | 1536px+ | Wide desktop | `2xl:` |

### Layout behavior template

```markdown
# Responsive Layout — [CUSTOMIZE] Screen Name

| Element | Mobile (< 640px) | Tablet (768px+) | Desktop (1280px+) |
|---------|-------------------|------------------|--------------------|
| [CUSTOMIZE] Navigation | Bottom tab bar (5 icons) | Sidebar (collapsed) | Sidebar (expanded with labels) |
| [CUSTOMIZE] Main content | Full width, single column | 2-column grid | 3-column grid |
| [CUSTOMIZE] Sidebar/filters | Hidden, accessible via sheet | Visible left sidebar | Visible left sidebar |
| [CUSTOMIZE] Data tables | Card view (stacked fields) | Horizontal scroll | Full table |
| [CUSTOMIZE] Images | Full width | 2-up grid | 3-up grid |
| [CUSTOMIZE] Modals | Full screen (bottom sheet) | Centered overlay (480px) | Centered overlay (640px) |
| [CUSTOMIZE] Forms | Single column, full width | Single column, max-w-md | Two column where logical |
```

### Touch target rules

- Minimum touch target: **44 x 44 px** (WCAG 2.2 AA requirement)
- Recommended touch target: **48 x 48 px** (Material Design recommendation)
- Minimum spacing between targets: **8px** (prevents accidental taps)
- Interactive text links in running text: ensure surrounding padding brings the target to 44px height

---

## Copy-paste templates

### Screen inventory template

```markdown
# Screen Inventory — [CUSTOMIZE] Product Name

Total screens: [CUSTOMIZE] ##

| # | Screen name | Route | Fidelity needed | States to design | Priority | Status |
|---|-------------|-------|-----------------|------------------|----------|--------|
| 1 | [CUSTOMIZE] Landing page | / | High-fi | Populated | P0 | Not started |
| 2 | [CUSTOMIZE] Signup | /signup | Mid-fi | Populated, Error | P0 | Not started |
| 3 | [CUSTOMIZE] Login | /login | Mid-fi | Populated, Error | P0 | Not started |
| 4 | [CUSTOMIZE] Dashboard | /dashboard | Mid-fi | Empty, Loading, Populated, Error | P0 | Not started |
| 5 | [CUSTOMIZE] Core feature | /[feature] | Mid-fi | All 5 states | P0 | Not started |
| 6 | [CUSTOMIZE] Settings | /settings | Mid-fi | Loading, Populated, Error | P1 | Not started |
| 7 | [CUSTOMIZE] Profile | /profile | Low-fi | Populated | P2 | Not started |
| 8 | [CUSTOMIZE] 404 page | /404 | Low-fi | Populated (error) | P1 | Not started |
```

### Design handoff checklist (30 items)

Complete this checklist before handing designs to developers.

```markdown
# Design Handoff Checklist — [CUSTOMIZE] Screen/Feature Name

Handoff date: [CUSTOMIZE] YYYY-MM-DD
Designer: [CUSTOMIZE] Name
Developer: [CUSTOMIZE] Name

## Layout specifications (6 items)
- [ ] 1. Grid system defined (column count, gutter width, margins)
- [ ] 2. Spacing values use design tokens (not arbitrary pixel values)
- [ ] 3. Max content width specified (e.g., max-w-7xl / 1280px)
- [ ] 4. Alignment rules documented (left-aligned text, centered modals, etc.)
- [ ] 5. Overflow behavior specified (scroll, truncate, wrap)
- [ ] 6. Z-index layering documented (modals > dropdowns > tooltips > content)

## Visual specifications (6 items)
- [ ] 7. All colors reference design tokens (no hex codes in designs)
- [ ] 8. Typography uses defined scale (no one-off font sizes)
- [ ] 9. Border radius values use tokens (e.g., rounded-md = 6px)
- [ ] 10. Shadow/elevation values specified per component
- [ ] 11. Icon set identified with specific icon names per usage
- [ ] 12. Image aspect ratios and fallback/placeholder defined

## Interaction specifications (6 items)
- [ ] 13. Hover state designed for every interactive element
- [ ] 14. Active/pressed state designed
- [ ] 15. Focus state designed (visible focus ring per WCAG)
- [ ] 16. Disabled state designed with clear visual difference
- [ ] 17. Loading/pending state for async actions (button spinner, skeleton)
- [ ] 18. Transition/animation specs (duration, easing, properties that change)

## Responsive specifications (4 items)
- [ ] 19. Mobile layout (< 640px) designed or annotated
- [ ] 20. Tablet layout (768px+) designed or annotated (if significantly different)
- [ ] 21. Desktop layout (1280px+) designed
- [ ] 22. Elements that hide/show/reflow at breakpoints annotated

## Accessibility specifications (4 items)
- [ ] 23. Tab order annotated (numbered on the design)
- [ ] 24. ARIA labels specified for non-text interactive elements (icon buttons, etc.)
- [ ] 25. Color contrast verified (4.5:1 text, 3:1 UI components)
- [ ] 26. Touch targets verified (≥44x44px on mobile)

## Content specifications (4 items)
- [ ] 27. All copy finalized (no placeholder text remaining)
- [ ] 28. Error messages written for every error state
- [ ] 29. Empty state copy and CTA defined
- [ ] 30. Microcopy for tooltips, placeholders, and helper text finalized

## Approval
- [ ] Designer sign-off: __________ Date: __________
- [ ] Developer questions resolved: __________ Date: __________
```

---

## Customization notes

- **Fidelity selection**: The framework suggests mid-fi for MVP. If your product is design-heavy (e.g., creative tools, social media), invest in high-fi earlier. If your product is data-heavy (e.g., analytics, admin tools), mid-fi is sufficient through launch.
- **State inventory depth**: At minimum, design empty, populated, and error states for every screen. Loading and offline states can be handled with global patterns (skeleton loader component, offline banner) if you are short on time.
- **Responsive breakpoints**: The Tailwind defaults (640/768/1024/1280/1536) work for most projects. Only define custom breakpoints if you have specific device requirements (e.g., targeting iPad Pro at 1024px exactly).
- **Design handoff format**: If using Figma, enable Dev Mode / inspect mode and share the Figma link directly. If exporting, annotate with Zeplin or include a specs PDF alongside the handoff checklist.
- **Screen inventory updates**: Keep the screen inventory as a living document. Add new screens as features are added. Mark screens as "designed" and "implemented" to track progress.

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill — Implement wireframes as code
- `google-labs-code/design-md` — Design specification documents
