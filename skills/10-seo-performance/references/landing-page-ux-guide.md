# Landing Page UX Guide

## When to use

Reference this guide when designing or reviewing a SaaS landing page. Use it during the SHIP phase to ensure your landing page converts visitors into users. This guide covers visitor psychology, layout principles, and common mistakes — not SEO mechanics (those are covered in the main skill and other references).

---

## Visitor Archetype Analysis Methodology

Before designing a landing page, identify who will visit it. Most SaaS products have 3-5 distinct visitor types with different motivations.

### How to identify your archetypes

1. **List your traffic sources** — Where do visitors come from? (Google search, Product Hunt, Twitter/X, direct, referrals)
2. **Map motivations to sources** — A Google searcher has a problem to solve. A Product Hunt browser is curious. A Twitter visitor was hooked by a specific claim.
3. **Define 3-5 archetypes** — Give each a label, estimated traffic share, and answer: What are they scanning for? What would convince them to try it?
4. **Weight your design** — The archetype with the highest traffic share should have the most influence on layout decisions. Don't design for edge cases.

### Template

```markdown
## Archetype: [Label] ([X]% of traffic)
- **Source:** [Where they come from]
- **Scanning for:** [What their eyes look for first]
- **Converts when:** [What tips them from browsing to acting]
- **Reading pattern:** [Skimmer? Reader? Scanner?]
- **Decision speed:** [Fast/Medium/Slow]
```

---

## Scanning Patterns by Archetype

Different visitors read differently. Design your visual hierarchy to serve the highest-traffic patterns.

### Skimmers (typically founders, executives)
- Read headlines only, skip body text
- Stop at numbers, bold text, and visual proof
- **Design for them:** Strong headlines, bold key phrases, numbers in large type, visual proof (screenshots, demos) early

### Scanners (typically technical users)
- Read selectively — skip marketing, read technical content
- Look for code examples, architecture diagrams, "how it works" sections
- **Design for them:** Clear section headers so they can jump to what matters, code snippets, technical depth available but not forced

### Readers (typically junior/new users)
- Read more thoroughly, need context before value propositions
- Look for step-by-step guidance, "who is this for" signals
- **Design for them:** Short paragraphs, clear language, a "getting started" section, reassurance signals ("no lock-in," "free tier")

---

## Proof-Before-Explanation Principle

Show that your product works before explaining how it works.

### Why it works
Visitors arrive skeptical. Claims ("we help you launch faster") trigger the "prove it" reflex. If proof comes after the explanation, many visitors bounce before reaching it. Flipping the order — proof first, then explanation — resolves skepticism early and makes the explanation land better.

### What counts as proof
- **Metrics:** "Used by 500+ teams" (specific > vague)
- **Demo output:** Real screenshots or output from the product
- **Test results:** Passing tests, benchmark numbers
- **Testimonials:** Quotes from identifiable people with titles
- **Logos:** Company logos of known customers
- **Before/after:** Show the state without and with the product

### Where to place proof
- At least one proof element above the fold (or immediately below)
- A dedicated proof section before the detailed feature explanation
- Reinforcement proof near the final CTA

---

## Hero Section Formula

The hero section must answer two questions in under 3 seconds: **What is this?** and **Why should I care?**

### Structure

```
[Headline: What outcome does it deliver?]
[Subheadline: How does it deliver that outcome?]
[Primary CTA button]
[Optional: visual proof — screenshot, demo, or metric]
```

### Rules
1. **Headline = outcome, not feature.** "Launch your SaaS in weeks, not months" beats "15 skills across 4 phases."
2. **Subheadline = mechanism.** One sentence on how it works, connecting the outcome to the product.
3. **One CTA.** Not two. Not three. One clear action.
4. **No jargon.** If your mom can't understand the headline, rewrite it.
5. **Visual proof optional but powerful.** A screenshot or demo video thumbnail next to the hero text increases conversion by anchoring the abstract promise to something concrete.

### Anti-patterns
- "The #1 platform for..." — unverifiable superlative
- "AI-powered [noun] [noun] platform" — buzzword soup
- Feature list in the hero — too much cognitive load for 3 seconds
- Multiple CTAs — splits attention, reduces conversion

---

## Social Proof Placement

### Metrics
- Place aggregate metrics ("500+ teams", "10K+ projects") near the hero or immediately after
- Use specific numbers, not rounded approximations ("1,247 teams" > "1,000+ teams")
- Only show metrics you can substantiate

### Testimonials
- Best placement: after the feature explanation, before the final CTA
- Include name, title, company, and photo when possible
- Short quotes (1-2 sentences) that address a specific benefit
- Avoid testimonials that praise the product generically ("great tool!") — use ones that describe a specific outcome

### Logo bars
- Place below the hero section
- 4-8 logos maximum (more looks cluttered)
- Grayscale logos to avoid visual competition with your content
- Only use logos you have permission to display

### Case studies
- Link to full case studies from the landing page, don't embed them
- Summarize in one line: "[Company] reduced [metric] by [amount] in [timeframe]"

---

## CTA Psychology

### One primary action
Every landing page should have exactly one primary CTA repeated 2-3 times (hero and bottom, optionally mid-page). Every CTA button should use the same label.

### Reduce friction
- "Start free" beats "Sign up" (implies no cost)
- "Try it now" beats "Request a demo" (implies no waiting)
- "No credit card required" removes the biggest objection
- Show what happens after clicking (e.g., "You'll be taken to the setup wizard")

### Urgency without manipulation
- Real urgency: "Beta spots are limited" (only if true)
- Fake urgency: Countdown timers, "Only 3 left" (destroys trust)
- Better than urgency: Remove risk ("Cancel anytime", "Free forever tier")

---

## Section Ordering Framework for SaaS Landing Pages

### Recommended order

1. **Hero** — 3-second value proposition + CTA
2. **Social proof bar** — Logos or aggregate metric (optional, high-impact)
3. **Proof section** — Demo, screenshots, test results, or video
4. **How it works** — 3-step explanation or feature walkthrough
5. **Feature depth** — Detailed capabilities for scanners/technical visitors
6. **Testimonials / case studies** — Specific outcome quotes
7. **Pricing** (if applicable) — Transparent tiers
8. **FAQ** — Address top 3-5 objections
9. **Final CTA** — Repeat the primary action with reinforcement copy

### Principles behind the order
- **Trust builds linearly.** Each section should increase confidence over the previous one.
- **Proof before features.** Resolves skepticism before asking for attention.
- **Pricing before FAQ.** Visitors who see pricing have objections — FAQ addresses them immediately.
- **Final CTA after objection-handling.** The visitor has the most context and fewest doubts at this point.

---

## Mobile-Specific Considerations

### Thumb zones
- Primary CTA should be in the natural thumb reach zone (center-bottom of screen)
- Navigation hamburger menu in top-right (right-handed majority)
- Avoid interactive elements in screen corners (hardest to reach)

### Fold behavior
- Mobile "fold" is ~600px from top
- Hero headline + CTA must be visible without scrolling on iPhone SE (375x667)
- Don't waste above-fold space on large hero images — they push the CTA below the fold on mobile

### Tap targets
- All tappable elements: minimum 44x44px (WCAG 2.5.8)
- Minimum 8px spacing between tap targets
- Full-width CTA buttons on mobile (easier to tap than narrow centered buttons)

### Performance
- Mobile visitors are less patient — target < 3s load time on 4G
- Lazy-load images below the fold
- Defer non-critical JavaScript
- Test on real mid-range Android devices (not just iPhone)

---

## Common Anti-Patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| Feature wall (grid of 12+ features) | Cognitive overload — visitor can't prioritize | Group into 3-4 categories, show top 2-3 per category |
| Jargon-heavy header | Excludes non-technical visitors, wastes 3-second window | Use outcome language a non-expert would understand |
| No proof above the fold | Visitor must scroll past claims to find evidence | Add one proof element (metric, logo bar, or screenshot) near the hero |
| Multiple competing CTAs | Choice paralysis, lower conversion on all CTAs | One primary CTA, repeated. Secondary actions in nav only |
| Auto-playing video with sound | Startles visitors, causes immediate bounce | Auto-play muted with captions, or static thumbnail with play button |
| Long-form text blocks | Nobody reads them — skimmers skip, readers get lost | Short paragraphs (2-3 sentences), bullet points, bold key phrases |
| Generic stock photos | Signals "we didn't invest in this page" | Use product screenshots, custom illustrations, or no images |
| "Request a demo" as only CTA | Adds friction — visitor must schedule a call before trying | Offer self-serve option alongside demo request |
| Hiding pricing | Creates suspicion — "if you have to ask, you can't afford it" | Show pricing transparently, or state "Free to start" clearly |
