# UI/UX Coverage Gap Analysis

> Shipwise v1.0 vs bencium-marketplace | March 2026
> Audience: Shipwise maintainers planning Tier 2 improvements

---

## Section 1: What Shipwise Covers Today (Inventory)

### Skill 02 — Product Design

| Topic | File | Depth | Lines |
|-------|------|-------|-------|
| MVP scoping (MoSCoW + RICE) | `02/SKILL.md`, `02/refs/mvp-scoping-rice.md` | Framework + copy-paste templates (spreadsheet, MoSCoW table, scope doc) | ~237 |
| User stories & acceptance criteria | `02/SKILL.md`, `02/refs/user-story-template.md` | Framework + copy-paste templates (epic, 5 stories with Given/When/Then) | ~243 |
| Product roadmap | `02/SKILL.md`, `02/refs/mvp-scoping-rice.md` | Guide (roadmap section in scope template) | ~30 |
| Pricing model design | `02/SKILL.md` | Guide (Van Westendorp, tiers, trials, feature gates) | ~12 |
| Information architecture | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Template (screen inventory, nav model, route hierarchy) | ~90 |
| User flow mapping | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Template (happy path + error paths + edge cases) | ~30 |
| Wireframe methodology | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Framework + decision tree (low-fi / mid-fi / high-fi pipeline) | ~50 |
| State inventory (empty/loading/populated/error/offline) | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Template (state matrix + design principles per state) | ~50 |
| Design system foundation (color tokens, type scale, spacing, component inventory) | `02/SKILL.md` | Checklist (semantic naming, CSS custom props / Tailwind config) | ~12 |
| Design handoff | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Checklist (30-item handoff template) | ~60 |
| Responsive strategy (breakpoints, mobile-first, touch targets) | `02/SKILL.md`, `02/refs/wireframe-checklist.md` | Checklist + template (layout behavior per breakpoint) | ~50 |
| WCAG 2.2 AA accessibility at design stage | `02/SKILL.md`, `02/refs/accessibility-design-checklist.md` | Checklist (50-item) + decision tree + audit template + common failures table | ~282 |

### Skill 05 — Fullstack Development (component-level UX)

| Topic | File | Depth | Lines |
|-------|------|-------|-------|
| Atomic design component architecture | `05/refs/component-architecture.md` | Framework + copy-paste code (Button atom, FormField molecule, DataTable organism, Tabs compound) | ~423 |
| Empty state component pattern | `05/refs/component-architecture.md` | Copy-paste code (EmptyState component + usage variants) | ~60 |
| Interactive table accessibility (ARIA sort, selection, live regions) | `05/refs/component-architecture.md` | Copy-paste code (SortableHeader, SelectableRow, AccessibleTable) | ~90 |
| Responsive layout patterns | `05/refs/responsive-design-checklist.md` | Copy-paste code (AppLayout with sidebar, card grid, responsive table, typography, touch targets) | ~286 |
| Pre-launch responsive checklist | `05/refs/responsive-design-checklist.md` | Checklist (mobile/tablet/desktop/cross-cutting) | ~30 |

### Skill 10 — SEO & Performance (landing page + conversion UX)

| Topic | File | Depth | Lines |
|-------|------|-------|-------|
| Visitor archetype analysis | `10/refs/landing-page-ux-guide.md` | Framework + template (archetype card with source, scanning pattern, conversion trigger) | ~30 |
| Scanning patterns (skimmers/scanners/readers) | `10/refs/landing-page-ux-guide.md` | Guide (design rules per archetype) | ~20 |
| Proof-before-explanation principle | `10/refs/landing-page-ux-guide.md` | Guide (what counts as proof, where to place it) | ~25 |
| Hero section formula | `10/refs/landing-page-ux-guide.md` | Framework (structure, 5 rules, anti-patterns) | ~25 |
| Social proof placement | `10/refs/landing-page-ux-guide.md` | Guide (metrics, testimonials, logo bars, case studies) | ~25 |
| CTA psychology | `10/refs/landing-page-ux-guide.md` | Guide (friction reduction, urgency principles) | ~20 |
| Landing page section ordering | `10/refs/landing-page-ux-guide.md` | Framework (9-section recommended order with rationale) | ~20 |
| Mobile landing page considerations | `10/refs/landing-page-ux-guide.md` | Checklist (thumb zones, fold behavior, tap targets, performance) | ~25 |
| Landing page anti-patterns | `10/refs/landing-page-ux-guide.md` | Table (8 anti-patterns with fixes) | ~10 |
| Core Web Vitals (LCP/CLS/INP) | `10/refs/lighthouse-targets.md` | Guide + copy-paste code (preload, priority images, font loading, task splitting) | ~150 |
| Image optimization | `10/refs/lighthouse-targets.md` | Copy-paste code (Next.js Image, native HTML picture) | ~50 |
| Bundle analysis & budgets | `10/refs/lighthouse-targets.md` | Copy-paste code (analyzer, budget JSON) | ~50 |
| Lighthouse CI (GitHub Actions) | `10/refs/lighthouse-targets.md` | Copy-paste template (workflow YAML, assertion config, budget config) | ~90 |

### Summary of Current Coverage

**Strengths:**
- Deep on product scoping methodology (MoSCoW/RICE/roadmap) with excellent copy-paste templates
- Strong accessibility coverage (50-item WCAG 2.2 AA checklist, decision tree, audit template)
- Good state inventory system (empty/loading/populated/error/offline matrix)
- Solid component architecture with real React/Tailwind code
- Practical landing page conversion psychology
- Lighthouse CI with budget enforcement

**Weaknesses:**
- No visual design direction (no color palettes, no aesthetic guidance, no anti-generic-AI rules)
- No motion/animation design patterns (only mentions prefers-reduced-motion)
- No dark mode implementation guide (mentioned as a token, never explored)
- Design system section is a brief checklist, not a deep guide
- No typography depth beyond "pick one font, define 6-8 sizes"
- No form UX patterns (just FormField component, no multi-step/validation/autosave guidance)
- No onboarding UX patterns (user story template has onboarding example, but no UX methodology)
- No dashboard UX patterns
- No search UX patterns
- No design audit/review workflow
- No micro-interaction guidance (button states mentioned but not systematized)

---

## Section 2: What Bencium Covers That Shipwise Doesn't

| Topic | Bencium Skill | Depth | Shipwise Recommendation |
|-------|---------------|-------|------------------------|
| **Anti-generic-AI visual design** — explicit rules to avoid "Claude style" (Inter + blue + glassmorphism), banned font lists, unique color pair suggestions | controlled-ux, innovative-ux, impact-designer | Deep (700+ lines each in SKILL.md with code templates) | **Reference as companion** — this is bencium's core differentiator, competing here adds no value |
| **Aesthetic direction catalog** — 11 tones (controlled), 11 tones (innovative), ~40 tones (impact) including brutalist, retro-futuristic, organic, editorial, vaporwave, etc. | innovative-ux, impact-designer | Framework (tone options with visual direction per tone) | **Reference as companion** — creative direction requires interactive exploration, not a reference doc |
| **Motion/animation spec** — easing curves, duration tables by interaction type (micro 100-150ms, state 200-300ms, page 300-500ms), state-specific animations | controlled-ux (544 lines), innovative-ux (72 lines), impact-designer (72 lines) | Guide + implementation patterns (controlled is deep, others condensed) | **Add to Shipwise** — motion is a gap we should fill; adapt controlled-ux's approach |
| **Design system meta-framework** — fixed tokens vs. project-specific vs. adaptable tokens, decision framework for token scoping | controlled-ux, innovative-ux (577 lines each) | Template (token categorization framework) | **Add to Shipwise** — our design system section is too thin; this framework fills it |
| **Typographic correctness** — curly quotes, proper dashes, ellipsis entities, letterspacing rules for ALL CAPS, line length 45-90 chars, CSS templates | typography (345 + 476 lines) | Framework + CSS templates + entity reference table | **Reference as companion** — highly specialized micro-concern, better as a companion skill |
| **Design audit workflow** — 14-dimension audit table, 3-phase output (critical / refinement / polish), reduction filter | design-audit (124 + 130 lines) | Framework + audit template | **Add to Shipwise** — we have no audit/review workflow; this is a natural fit for our checkpoint gate system |
| **Agentic/relationship UX** — memory-aware interfaces, trust evolution (transparency → selective disclosure → autonomous), planning canvas, preference maps | relationship-design (333 + 1882 lines) | Deep research + examples + checklists | **Skip** — forward-looking agentic UX, not aligned with Shipwise's launch lifecycle for traditional webapps |
| **Communication style adaptation** — high-context vs. low-context user detection, response calibration | adaptive-communication (93 lines) | Guide (concise detection signals + response rules) | **Skip** — meta-skill about how Claude communicates, not about UI/UX design content |
| **First-principles architecture thinking** — framework decision matrix, simplicity-first defaults with upgrade triggers, UI/UX philosophy (immediate feedback, visible state, spatial consistency, undo/recovery, respect attention) | renaissance-architecture (425 lines) | Framework (defaults + triggers + philosophy) | **Add selectively** — the 5 UX principles (immediate feedback, visible state, spatial consistency, undo/recovery, respect attention) are excellent and should inform our skill 02 |
| **Anti-sameness protocol** — randomized design dice for color temperature, layout direction, type personality, motion philosophy, density | impact-designer | Framework (dice-roll system) | **Reference as companion** — creative tool, not a launch lifecycle concern |
| **Creative reframing prompts** — "What would Sagmeister/Neville Brody/David Carson do?", era lens, context shift | impact-designer | Guide (prompt library) | **Skip** — requires design literacy that solo founders lack |
| **Domain modeling / systems thinking** — 20 pre-architecture questions, AI task boundary design, role clarity matrix | human-architect-mindset (802 + 2185 lines) | Deep research + examples + checklists | **Skip** — architecture skill, tangentially related to UX |
| **Spec Driven Development** — constitution → blueprint → execution methodology for AI-assisted development | human-architect-mindset | Framework | **Skip** — development methodology, not UX |

### Coverage Depth Comparison

| Dimension | Shipwise Depth | Bencium Depth | Winner |
|-----------|---------------|---------------|--------|
| Product scoping (MVP/RICE/roadmap) | Deep (templates, calibration examples) | Not covered | Shipwise |
| User stories / acceptance criteria | Deep (epic template, anti-patterns) | Not covered | Shipwise |
| Pricing model design | Moderate (Van Westendorp, tiers) | Not covered | Shipwise |
| Information architecture | Moderate (screen inventory, nav model) | Light (renaissance-architecture mentions it) | Shipwise |
| Wireframe methodology | Moderate (fidelity pipeline, state matrix) | Not covered | Shipwise |
| Visual design direction | None | Deep (3 skills, 40+ aesthetic tones, code templates) | Bencium |
| Accessibility | Deep (50-item WCAG 2.2 AA checklist) | Moderate (condensed checklists in 3 skills) | Shipwise |
| Design system | Light (brief checklist in SKILL.md) | Deep (577-line meta-framework) | Bencium |
| Motion/animation | Absent (only prefers-reduced-motion mention) | Deep (544-line spec in controlled-ux) | Bencium |
| Typography | Light ("pick one font, 6-8 sizes") | Deep (345-line correctness rules + 476-line CSS) | Bencium |
| Component architecture | Deep (atomic design + code templates) | Not covered explicitly | Shipwise |
| Responsive design | Deep (checklist + code templates) | Deep (604-line guide in controlled-ux) | Tie |
| Landing page / conversion UX | Deep (psychology-driven guide) | Not covered | Shipwise |
| Performance / Lighthouse | Deep (CI pipeline + budgets) | Not covered | Shipwise |
| Design audit workflow | Deep (14-dimension audit + 3-phase plan + automated checks) | Moderate (14-dimension audit + 3-phase plan) | Shipwise |

---

## Section 3: What NEITHER Covers (Net-New Opportunities)

These are topics a senior UI/UX designer building a SaaS product would expect guidance on that neither Shipwise nor bencium-marketplace addresses.

| # | Topic | What's Needed | Pain Level for Solo Founder |
|---|-------|--------------|----------------------------|
| 1 | **User research synthesis** | Not just interview scripts — affinity mapping, insight extraction, "jobs to be done" clustering, research repository patterns | Medium — founders do interviews but don't know how to synthesize findings into actionable insights |
| 2 | **Usability testing protocols** | 5-second test, task completion rate, moderated vs unmoderated, think-aloud methodology, screener templates, sample size guidance | High — founders build without testing, ship features that confuse users |
| 3 | **Form UX patterns** | Multi-step vs single-page decision framework, inline validation timing (on blur vs on submit vs debounced), error recovery, autosave, conditional logic, address autocomplete, file upload UX | Very High — every SaaS has forms; bad form UX kills conversion directly |
| 4 | **Onboarding UX patterns** | Progressive disclosure, tooltip tours, contextual education, empty-state-as-onboarding, activation metric definition, checklists, time-to-value optimization | Very High — first-run experience determines retention; most founders get it wrong |
| 5 | **Dashboard UX patterns** | Data density, progressive disclosure, zero-data states, widget layout (bento grid), personalization, KPI hierarchy, date range selectors, comparison views | High — dashboards are the most common SaaS screen type |
| 6 | **Color system design** | Palette generation methodology (60-30-10 rule), semantic color tokens for data visualization, dark mode color mapping, accessible palette constraints, brand color to UI palette derivation | High — founders pick colors arbitrarily; inconsistent color systems look amateur |
| 7 | **Dark mode design** | Not just "add a dark theme" — contrast adjustments, elevation through luminance not shadow, image treatment (reduced brightness), transparent component adaptation, system preference detection, manual toggle UX | Medium — increasingly expected by users, poorly implemented by most |
| 8 | **Micro-interactions and feedback** | Button state machines (idle → hover → active → loading → success/error), toast notification patterns, skeleton screens vs spinners decision tree, optimistic UI pattern, progress indicators (determinate vs indeterminate) | High — the difference between "functional" and "polished" |
| 9 | **Pricing page UX** | Tier comparison layouts, plan toggle (monthly/annual with savings callout), feature comparison matrix, social proof placement on pricing, FAQ patterns, enterprise CTA vs self-serve | High — pricing page is the highest-intent page on any SaaS site |
| 10 | **Search UX** | Faceted search, autocomplete/typeahead, zero-results state, search analytics integration, recent searches, popular searches, search result ranking UX | Medium — critical for content-heavy apps, less so for simple SaaS |
| 11 | **Empty states as UX** | Beyond the EmptyState component — when to use illustration vs text-only, progressive empty states (first time vs returning empty), empty state as onboarding, empty state copywriting patterns | Medium — Shipwise has the component but not the strategy |
| 12 | **Error states as UX** | Error hierarchy (field-level, form-level, page-level, system-level), recovery patterns, error copywriting (blame the system, not the user), graceful degradation strategy | Medium — most apps have generic "something went wrong" pages |
| 13 | **Loading states as UX** | Skeleton screen design methodology, perceived performance optimization, content-aware loading (show structure before data), staggered loading, lazy loading UX (not just the technique — the user experience of it) | Medium — Shipwise mentions skeletons but doesn't guide implementation decisions |
| 14 | **Mobile-first responsive strategy** | Beyond breakpoints — thumb zone mapping, bottom navigation patterns, gesture handling (swipe, pull-to-refresh), mobile sheet patterns (bottom sheets vs modals), notch/safe-area handling, landscape orientation | Medium — Shipwise covers breakpoints but not mobile interaction patterns |
| 15 | **Conversion-focused UX** | CTA hierarchy across pages, friction audit methodology, trust signal catalog (badges, guarantees, testimonials, security indicators), cognitive load reduction techniques, Fogg Behavior Model application | High — landing page guide covers hero/CTA but not full-funnel conversion |
| 16 | **Design system governance** | Versioning (semver for components), deprecation workflow, contribution model (who can add components), documentation standards, visual regression testing strategy | Low — only relevant at scale; solo founders don't need this yet |
| 17 | **Information architecture methodology** | Card sorting protocol, tree testing, navigation pattern catalog (hub-and-spoke, nested doll, bento, tabbed, filtered), breadcrumb strategy | Medium — Shipwise has screen inventory but not the research methodology |
| 18 | **Design handoff standards** | Beyond the checklist — Figma dev mode setup, design token export (Style Dictionary, Tokens Studio), responsive behavior documentation, interaction specification format | Low — the 30-item checklist is sufficient for solo founders |
| 19 | **Notification UX patterns** | In-app notifications (bell icon, sidebar, inline), email notification strategy, push notification UX, notification preferences architecture, unread/read state, batch vs individual | Medium — every SaaS needs notifications; most implement them poorly |
| 20 | **Table/data UX patterns** | Sorting, filtering, pagination vs infinite scroll, column customization, bulk actions, row expansion, inline editing, export, responsive table strategies | Medium — Shipwise has a responsive table but not the UX decision framework |

---

## Section 4: Prioritized Recommendations

Ordered by pain level for a solo founder building a SaaS without a designer.

### Priority 1 — High Pain, Directly Impacts Conversion/Retention

| # | Gap | Recommendation | Location | Rationale |
|---|-----|---------------|----------|-----------|
| 1 | **Form UX patterns** | A) Add as new reference doc | `02/refs/form-ux-patterns.md` | Every SaaS has forms. Multi-step vs single-page, validation timing, error recovery, autosave. Most direct impact on conversion. |
| 2 | **Onboarding UX patterns** | A) Add as new reference doc | `02/refs/onboarding-ux-patterns.md` | First-run experience determines D7 retention. Progressive disclosure, tooltip tours, activation metrics, time-to-value. |
| 3 | **Dashboard UX patterns** | B) Add as new reference doc | `05/refs/dashboard-ux-patterns.md` | Most common SaaS screen. Data density, zero-data states, widget layout, KPI hierarchy. Component-level guidance fits skill 05. |
| 4 | **Pricing page UX** | C) Add as new reference doc | `10/refs/pricing-page-ux-guide.md` | Highest-intent page. Tier comparison layouts, annual/monthly toggle, feature matrix, social proof. Natural extension of landing page guide. |
| 5 | **Micro-interactions & feedback** | E) Cross-cutting reference doc | `02/refs/micro-interaction-patterns.md` | Button state machines, toast patterns, skeleton vs spinner decision tree, optimistic UI. Referenced by both skill 02 (design) and skill 05 (implementation). |

### Priority 2 — Medium-High Pain, Design Quality Gap

| # | Gap | Recommendation | Location | Rationale |
|---|-----|---------------|----------|-----------|
| 6 | **Color system design** | A) Add as new reference doc | `02/refs/color-system-design.md` | 60-30-10 rule, semantic tokens, dark mode mapping, brand-to-UI derivation. Current coverage is one bullet point. |
| 7 | **Motion/animation design** | A) Add as new reference doc | `02/refs/motion-design-patterns.md` | Duration tables, easing curves, meaningful motion principles, loading transitions. Adapt bencium controlled-ux's MOTION-SPEC.md approach for our audience. |
| 8 | **Design audit workflow** | ✅ DONE | `02/refs/design-audit-workflow.md` + auditor UX checks | 14-dimension self-review framework with 3-phase audit process, copy-paste template, contrast reference, and experience-level guidance. Automated code-level checks (contrast, skip nav, focus, labels, headings, landmarks, touch targets, empty/loading states, reduced motion) added to launch-readiness-auditor. |
| 9 | **Usability testing protocols** | A) Add as new reference doc | `02/refs/usability-testing-guide.md` | 5-second test, task completion, think-aloud. Solo founders need lightweight protocols, not full UXR methodology. |
| 10 | **Design system depth** | A) Expand existing or add reference doc | `02/refs/design-system-guide.md` | Token categorization (fixed vs project vs adaptable), component governance, living style guide setup. Current coverage is too thin. |

### Priority 3 — Medium Pain, Polishes the Experience

| # | Gap | Recommendation | Location | Rationale |
|---|-----|---------------|----------|-----------|
| 11 | **Dark mode design** | B) Add as new reference doc | `05/refs/dark-mode-implementation.md` | Elevation through luminance, image treatment, system preference detection, toggle UX. Implementation-focused, fits skill 05. |
| 12 | **Conversion-focused UX** | C) Add as new reference doc | `10/refs/conversion-ux-patterns.md` | Friction audit, trust signals, CTA hierarchy, cognitive load. Extends the landing page guide to full-funnel conversion. |
| 13 | **Empty/error/loading state UX strategy** | A) Add as new reference doc | `02/refs/state-ux-strategy.md` | Beyond the state matrix — when to use illustration vs text, empty-state-as-onboarding, error copywriting, perceived performance. |
| 14 | **Notification UX patterns** | B) Add as new reference doc | `05/refs/notification-ux-patterns.md` | In-app notifications, email strategy, preferences architecture. Component-level, fits skill 05. |
| 15 | **Table/data UX patterns** | B) Add as new reference doc | `05/refs/data-table-ux-patterns.md` | Sort/filter/paginate decisions, bulk actions, inline editing, responsive strategies. Extends existing DataTable component. |

### Priority 4 — Lower Pain, Skip or Defer

| # | Gap | Recommendation | Rationale |
|---|-----|---------------|-----------|
| 16 | Visual design direction / anti-generic-AI | D) Reference bencium as companion | Bencium's core differentiator — 3 dedicated skills with 40+ aesthetic directions. Competing adds no value. |
| 17 | Typography correctness | D) Reference bencium as companion | Micro-level concern (curly quotes, dashes). Important but specialized. |
| 18 | Agentic/relationship UX | F) Skip | Not aligned with traditional webapp launch lifecycle. |
| 19 | Communication style adaptation | F) Skip | Meta-skill about Claude's communication, not UI/UX content. |
| 20 | Anti-sameness protocol / creative reframing | D) Reference bencium as companion | Creative exploration tool; solo founders need guardrails, not creative dice. |
| 21 | User research synthesis | F) Skip | Important but too research-heavy for launch lifecycle scope. Founders need to ship, not synthesize. |
| 22 | Design system governance | F) Skip | Only relevant at scale with multiple contributors. |
| 23 | Design handoff standards | F) Skip | Current 30-item checklist is sufficient for solo founders. |
| 24 | IA methodology (card sorting, tree testing) | F) Skip | Research methodology; current screen inventory template is sufficient for launch. |
| 25 | Search UX | F) Skip | Only critical for content-heavy apps; not universal enough for the launch lifecycle. |
| 26 | Mobile gesture patterns | F) Skip | Too specialized for a cross-cutting launch lifecycle plugin. |

### Implementation Roadmap

**Tier 2A (do first — 5 reference docs):**
1. `02/refs/form-ux-patterns.md`
2. `02/refs/onboarding-ux-patterns.md`
3. `05/refs/dashboard-ux-patterns.md`
4. `10/refs/pricing-page-ux-guide.md`
5. `02/refs/micro-interaction-patterns.md`

**Tier 2B (do second — 5 reference docs):**
6. `02/refs/color-system-design.md`
7. `02/refs/motion-design-patterns.md`
8. `02/refs/design-audit-workflow.md`
9. `02/refs/usability-testing-guide.md`
10. `02/refs/design-system-guide.md`

**Tier 2C (do third — 5 reference docs):**
11. `05/refs/dark-mode-implementation.md`
12. `10/refs/conversion-ux-patterns.md`
13. `02/refs/state-ux-strategy.md`
14. `05/refs/notification-ux-patterns.md`
15. `05/refs/data-table-ux-patterns.md`

---

## Section 5: Companion Skill Recommendation

**Yes — Shipwise should recommend bencium-marketplace as a design companion.**

Bencium and Shipwise are complementary, not competitive. Shipwise guides the **what** and **when** of product design (scope, prioritize, wireframe, launch). Bencium guides the **how it looks** (visual direction, aesthetic tone, creative execution). A solo founder needs both: Shipwise to avoid building the wrong thing, bencium to avoid building something that looks like every other AI-generated app.

### Recommended companion paragraph for Skill 02

Add the following to the `## Companion tools` section of `skills/02-product-design/SKILL.md`:

```markdown
### Visual design direction

Shipwise covers product design methodology — what to build, how to scope it, and how to
structure it for accessibility and responsiveness. For **visual design direction** —
choosing an aesthetic tone, avoiding generic AI aesthetics, color palette generation, and
creative typography — use bencium-marketplace alongside Shipwise:

- **bencium-controlled-ux-designer** — Best for developers who want to stay in control.
  Asks before every design decision. Deep accessibility, motion spec, and responsive
  design references (2,553 lines of companion docs). Start here if you want guidance
  with guardrails.

- **bencium-innovative-ux-designer** — Best for developers ready to commit to a bold
  direction. 11 aesthetic tones from brutally minimal to maximalist. Allows shadows
  and gradients intentionally. Start here if you want distinctive but production-safe
  design.

- **bencium-impact-designer** — Best for developers targeting award-level visual quality.
  40+ aesthetic directions, anti-sameness protocols, creative reframing prompts.
  Start here if your product's visual identity is a competitive advantage.

- **bencium typography** — Professional typographic correctness (curly quotes, proper
  dashes, letterspacing, line length). Use alongside any designer skill to catch
  micro-level typography errors.

- **bencium design-audit** — Systematic 14-dimension visual audit of existing interfaces.
  Use after building to identify visual refinement opportunities in three phases
  (critical, refinement, polish).

Install: `git clone https://github.com/bencium/bencium-marketplace` and add the
desired skill directories to your project.
```

---

## Appendix: File-Level Coverage Map

```
skills/
  02-product-design/
    SKILL.md                                    → MVP scope, user stories, roadmap, pricing,
                                                  IA, wireframes, states, design system,
                                                  handoff, responsive, WCAG 2.2 AA
    references/
      accessibility-design-checklist.md         → 50-item WCAG checklist + audit template
      mvp-scoping-rice.md                       → RICE framework + MoSCoW + scope doc template
      user-story-template.md                    → Epic + story + AC template
      wireframe-checklist.md                    → IA template, user flows, state matrix,
                                                  responsive planning, 30-item handoff checklist
      [GAP] form-ux-patterns.md                 → Multi-step, validation, autosave
      [GAP] onboarding-ux-patterns.md           → Progressive disclosure, activation metrics
      [GAP] color-system-design.md              → Palette generation, semantic tokens, dark mode
      [GAP] motion-design-patterns.md           → Duration, easing, meaningful motion
      design-audit-workflow.md                  → 14-dimension self-review, 3-phase
                                                  audit process, contrast reference,
                                                  copy-paste audit template
      [GAP] usability-testing-guide.md          → Lightweight testing protocols
      [GAP] design-system-guide.md              → Token framework, governance basics
      [GAP] micro-interaction-patterns.md       → Button states, toasts, skeletons, optimistic UI
      [GAP] state-ux-strategy.md                → Empty/error/loading UX strategy

  05-fullstack-development/
    references/
      component-architecture.md                 → Atomic design, EmptyState, table a11y
      responsive-design-checklist.md            → Layout patterns, touch targets, pre-launch
      [GAP] dashboard-ux-patterns.md            → Data density, zero-data, widgets, KPIs
      [GAP] dark-mode-implementation.md         → Luminance elevation, image treatment, toggle
      [GAP] notification-ux-patterns.md         → In-app, email, preferences, batch/individual
      [GAP] data-table-ux-patterns.md           → Sort/filter/paginate, bulk actions, inline edit

  10-seo-performance/
    references/
      landing-page-ux-guide.md                  → Visitor archetypes, hero formula, CTA, proof
      lighthouse-targets.md                     → Core Web Vitals, Lighthouse CI, budgets
      pricing-page-ux-guide.md                  → Tier layouts, toggle, feature matrix, proof,
                                                  paywall strategy patterns (soft/hard/grace),
                                                  post-upgrade reward, limit messaging framework
      [GAP] conversion-ux-patterns.md           → Friction audit, trust signals, CTA hierarchy
```

---

## Additional Items (Real-World Validation)

Items identified from real audits of harmansidhudev.com and strxp.

| # | Item | Location | Status |
|---|------|----------|--------|
| A1 | UI/UX Review Brief template | `templates/ui-ux-review-brief.md` | Done |
| A2 | Pre-ship state verification | `13/refs/pre-ship-state-verification.md` | Done |
| A3 | Conversion funnel audit | `14/refs/conversion-funnel-audit.md` | Done |
| A4 | Paywall UX patterns | `10/refs/pricing-page-ux-guide.md` (extended section 8) | Done |
| A5 | Brand personality check | `02/refs/design-audit-workflow.md` (new section) | Done |
| A6 | First-use walkthrough audit | `02/refs/onboarding-ux-patterns.md` (new section) | Done |
