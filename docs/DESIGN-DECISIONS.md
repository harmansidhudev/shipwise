# Design Decisions — Shipwise Landing Page

This document captures the design rationale behind the Shipwise landing page. It serves as a reference for future design iterations and as a case study for Skill 10 (SEO & Performance) landing page guidance.

---

## Visitor Archetypes

The landing page is designed for four distinct visitor types, weighted by expected traffic share:

### 1. Solo Founder (40% of traffic)
- **What they scan for:** Time savings, clear ROI, proof it works for someone like them
- **What converts them:** Specific numbers ("18 skills → 36 checks"), a demo or example output, low-friction CTA (free, no signup required)
- **Reading pattern:** Skims headlines, stops at numbers, scrolls to proof before reading explanations
- **Decision speed:** Fast — they're ready to try things now

### 2. Senior Engineer (30% of traffic)
- **What they scan for:** Technical credibility, what it actually does under the hood, whether it respects their expertise
- **What converts them:** Architecture details, seeing the skill/hook/agent model, knowing they can customize
- **Reading pattern:** Reads selectively — skips marketing copy, reads technical descriptions, inspects code examples
- **Decision speed:** Medium — wants to understand before committing

### 3. Startup CTO (20% of traffic)
- **What they scan for:** Coverage breadth, whether it replaces multiple tools, team scalability
- **What converts them:** The full lifecycle scope (Design → Build → Ship → Grow), integration with existing workflow, evidence of thoroughness
- **Reading pattern:** Scans structure first (section headings), then reads details on areas relevant to their current pain
- **Decision speed:** Slow — evaluating against alternatives

### 4. Junior Developer (10% of traffic)
- **What they scan for:** Whether they can understand it, step-by-step guidance, reassurance they won't break things
- **What converts them:** Beginner-friendly language, seeing experience-level adaptation, a clear starting point
- **Reading pattern:** Reads more thoroughly than other archetypes, needs context before value propositions
- **Decision speed:** Slow — needs confidence before trying

---

## Key Design Principles

### Proof Before Explanation

The test scenario carousel appears BEFORE the four-mode explanation section. This is intentional.

**Rationale:** Solo founders (40%) and senior engineers (30%) — representing 70% of traffic — are proof-seekers. They don't want to read what the product claims to do; they want to see that it works. Showing real test scenarios with pass/fail results establishes credibility before the visitor invests time reading how it works. This follows the "show, don't tell" principle: a passing test is more convincing than a feature description.

### Outcome-Focused Hero Copy

The hero section uses outcome-focused copy rather than feature descriptions.

**Rationale:** Visitors decide whether to stay within 3 seconds of landing. Feature descriptions ("15 skills across 4 phases") require the visitor to translate features into personal benefit. Outcome-focused copy ("go from idea to launched SaaS") communicates the benefit directly. The feature details come later — after the visitor has decided the page is relevant to them.

### Specific Numbers Over Vague Claims

The landing page uses specific numbers (18 skills → 36 checks, 24 improvements) rather than vague claims ("comprehensive," "thorough," "complete").

**Rationale:** Specific numbers perform better than adjectives for three reasons:
1. **Credibility** — Specificity implies measurement, which implies rigor
2. **Scannability** — Numbers stand out visually in a block of text; adjectives don't
3. **Comparability** — "24 improvements" can be compared against alternatives; "comprehensive" cannot

Vague superlatives ("best," "most complete," "ultimate") trigger skepticism. Numbers trigger curiosity ("what are the 24 improvements?").

### Section Ordering

The sections follow this order, with UX reasoning for each position:

1. **Hero** — 3-second value proposition. Outcome-focused. Primary CTA.
2. **Test scenario carousel** — Proof that it works. Builds credibility before asking for attention.
3. **Four interaction modes** — Explains HOW it works, now that the visitor believes it works.
4. **Lifecycle phases** — Expands scope (Design → Build → Ship → Grow). Shows breadth for CTOs evaluating coverage.
5. **Technical details** — Skills, hooks, agents. Satisfies senior engineers who want to understand the architecture.
6. **CTA section** — Reinforces the primary action after the visitor has context.

**Why this order works:** It follows the natural trust-building sequence: prove → explain → expand → deepen → convert. Moving the proof section earlier reduced bounce rate compared to the traditional feature → proof → CTA pattern.

---

## Anti-Patterns Deliberately Avoided

- **Feature wall** — Listing all 15 skills in a grid. Instead, grouped by lifecycle phase with progressive disclosure.
- **Jargon-heavy header** — "AI-powered launch lifecycle orchestration platform" communicates nothing to a solo founder. Avoided.
- **Multiple CTAs competing** — One primary CTA repeated at hero and bottom. No secondary CTAs competing for attention.
- **No proof above the fold** — Many landing pages put proof (testimonials, metrics) at the bottom. The carousel brings proof up early.
