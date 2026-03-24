# Content Strategy Template

## When to use
Reference this guide when planning a content marketing strategy, building an editorial calendar, researching keywords, or establishing a publish cadence. Use the templates to create a repeatable content pipeline from keyword research to publication.

## Decision framework

```
Where should I start with content?
├── Do I know what my audience searches for?
│   ├── No → Start with keyword research (see below)
│   └── Yes → Build editorial calendar
├── What type of content should I create first?
│   ├── Want traffic? → SEO blog posts targeting long-tail keywords
│   ├── Want conversions? → Comparison pages ("us vs competitor")
│   ├── Want trust? → Case studies from real customers
│   ├── Want activation? → Tutorials and getting-started guides
│   └── Want retention? → Changelog and product updates
├── How often should I publish?
│   ├── Solo founder → 1 post/week minimum
│   ├── Small team → 2-3 posts/week
│   └── Growth stage → Daily, with freelance writers
└── Where should I distribute?
    ├── SEO (Google) → blog on your domain
    ├── Social → Twitter/X, LinkedIn, relevant subreddits
    ├── Email → weekly newsletter to subscriber list
    └── Communities → Indie Hackers, Hacker News, niche Discords
```

---

## SEO keyword research methodology

### Step 1: Seed keyword generation

```
Where to find seed keywords:
├── Your product's core problem (what do users search before finding you?)
├── Competitor blogs (what topics do they rank for?)
├── Customer support tickets (what questions do users ask?)
├── Reddit / community forums (what language do people use?)
├── Google autocomplete (type your topic, see suggestions)
├── Google Search Console (what queries bring impressions?)
└── ChatGPT / Claude (brainstorm topic clusters)

Example for a project management SaaS:
Seeds: "project management", "task tracking", "team collaboration",
       "agile sprint planning", "project timeline", "kanban board"
```

### Step 2: Keyword expansion and evaluation

```
For each seed keyword, evaluate:
├── Search volume: How many people search this monthly?
│   Tools: Google Keyword Planner (free), Ubersuggest (freemium), Ahrefs (paid)
├── Keyword difficulty: How hard to rank on page 1?
│   Low (KD < 30): Target these first
│   Medium (KD 30-60): Target after building domain authority
│   High (KD > 60): Long-term targets, create pillar content
├── Search intent: What does the searcher want?
│   Informational: "how to manage projects" → blog post
│   Commercial: "best project management tools" → comparison page
│   Transactional: "trello pricing" → pricing page
│   Navigational: "asana login" → not relevant for content
└── Relevance: Can you naturally connect this to your product?
    High: directly related to your product's use case
    Medium: tangentially related (your audience cares about this)
    Low: skip it
```

### Step 3: Keyword prioritization matrix

```markdown
# Keyword Prioritization — [CUSTOMIZE: Product Name]

| Priority | Keyword | Volume | Difficulty | Intent | Relevance | Status |
|----------|---------|--------|-----------|--------|-----------|--------|
| 1 | [CUSTOMIZE] | XXX/mo | Low | Informational | High | To write |
| 2 | [CUSTOMIZE] | XXX/mo | Low | Commercial | High | To write |
| 3 | [CUSTOMIZE] | XXX/mo | Medium | Informational | High | To write |
| 4 | [CUSTOMIZE] | XXX/mo | Low | Informational | Medium | Backlog |

Sweet spot: Low difficulty + high relevance + informational or commercial intent
```

---

## Content types by funnel stage

### Awareness (top of funnel)

```
Goal: Attract new visitors via search
Format: Blog posts, guides, listicles
Examples:
├── "How to [solve problem your product solves]"
├── "X tips for [relevant skill]"
├── "The complete guide to [topic]"
├── "What is [concept]? A beginner's guide"
└── "[Year] guide to [topic]"

SEO target: Long-tail informational keywords
Success metric: Organic traffic, time on page
```

### Consideration (middle of funnel)

```
Goal: Help evaluators compare options
Format: Comparison pages, alternative pages
Examples:
├── "[Your Product] vs [Competitor]: Which is right for you?"
├── "Top 10 [category] tools in [year]" (include yourself)
├── "Best alternatives to [popular competitor]"
├── "[Competitor] pricing breakdown (and alternatives)"
└── "How to migrate from [competitor] to [your product]"

SEO target: Commercial intent keywords
Success metric: Signups from content, time on page
```

### Decision (bottom of funnel)

```
Goal: Build trust and social proof
Format: Case studies, testimonials, ROI calculators
Examples:
├── "How [Customer] increased [metric] by X% with [Product]"
├── "Customer story: [Company] — from [problem] to [outcome]"
├── "[Product] ROI calculator"
└── "Why [Company] chose [Product] over [competitors]"

SEO target: Brand keywords, case study keywords
Success metric: Trial signups, demo requests
```

### Activation (post-signup)

```
Goal: Help users get value faster
Format: Tutorials, getting-started guides, video walkthroughs
Examples:
├── "Getting started with [Product] in 5 minutes"
├── "How to [core action] with [Product]"
├── "[Product] best practices for [use case]"
├── "X [Product] tips you didn't know about"
└── "[Product] integrations guide"

Distribution: In-app help, knowledge base, onboarding emails
Success metric: Activation rate, support ticket reduction
```

### Retention (post-activation)

```
Goal: Keep users engaged and informed
Format: Changelog, product updates, advanced tutorials
Examples:
├── "What's new: [Feature] is now available"
├── "Monthly product update — [Month Year]"
├── "Advanced: [power user technique]"
├── "Customer spotlight: how [user] uses [advanced feature]"
└── "Behind the scenes: building [feature]"

Distribution: In-app notifications, email newsletter, blog
Success metric: Feature adoption, retention rate
```

---

## Copy-paste: editorial calendar spreadsheet

```markdown
# Editorial Calendar — [CUSTOMIZE: Product Name]
# [CUSTOMIZE: Month Year]

## Monthly Goals
- Publish: X blog posts, X case study, X changelog update
- Target keywords: [list primary keywords for this month]
- Traffic goal: [X organic sessions]
- Signup goal from content: [X signups]

## Calendar

| Week | Publish Date | Title | Type | Target Keyword | Funnel Stage | Author | Status |
|------|-------------|-------|------|----------------|-------------|--------|--------|
| W1 | Mon [date] | [CUSTOMIZE] | Blog | [keyword] | Awareness | [name] | Draft |
| W1 | Thu [date] | [CUSTOMIZE] | Changelog | — | Retention | [name] | Draft |
| W2 | Mon [date] | [CUSTOMIZE] | Blog | [keyword] | Awareness | [name] | Idea |
| W2 | Wed [date] | [CUSTOMIZE] | Comparison | [keyword] | Consideration | [name] | Idea |
| W3 | Mon [date] | [CUSTOMIZE] | Blog | [keyword] | Awareness | [name] | Idea |
| W3 | Fri [date] | [CUSTOMIZE] | Case Study | [keyword] | Decision | [name] | Outreach |
| W4 | Mon [date] | [CUSTOMIZE] | Blog | [keyword] | Awareness | [name] | Idea |
| W4 | Thu [date] | [CUSTOMIZE] | Tutorial | — | Activation | [name] | Idea |

## Content Pipeline Stages
| Stage | Description | Timeline |
|-------|-----------|----------|
| Idea | Topic identified, keyword researched | — |
| Outline | Structure and key points drafted | 1 day |
| Draft | First draft written | 2-3 days |
| Edit | Reviewed for quality, SEO, accuracy | 1 day |
| Design | Images, diagrams, screenshots added | 1 day |
| Ready | Final review, scheduled for publish | — |
| Published | Live on site | Publish date |
| Promoted | Shared on social, email, communities | Publish day + 3 days |
```

---

## Copy-paste: blog post template with SEO checklist

```markdown
# [TITLE: Include primary keyword naturally]

<!-- SEO metadata -->
<!-- title tag: [Primary keyword] — [Benefit or hook] (< 60 chars) -->
<!-- meta description: [Compelling summary with keyword] (< 155 chars) -->
<!-- URL slug: /blog/[primary-keyword-as-slug] -->
<!-- canonical: https://yourdomain.com/blog/[slug] -->

## [Opening paragraph]
<!-- Hook the reader with the problem or question they searched for -->
<!-- Include primary keyword in first 100 words -->
<!-- Keep it to 2-3 sentences -->

## [H2: Main section — use keyword variation]

### [H3: Subsection]
<!-- Break content into scannable sections -->
<!-- Use bullet points and numbered lists -->
<!-- Include images/diagrams where they add value -->

### [H3: Subsection]

## [H2: Second major section]
<!-- Internal link to related blog posts or product pages -->
<!-- Add code examples, templates, or actionable advice -->

## [H2: Third major section]

## Conclusion
<!-- Summarize key takeaways (3-5 bullet points) -->
<!-- Natural CTA: link to product, related post, or newsletter -->

---

## SEO Checklist (before publishing)

### On-page SEO
- [ ] Title tag includes primary keyword (< 60 characters)
- [ ] Meta description is compelling with keyword (< 155 characters)
- [ ] URL slug is short and includes keyword
- [ ] H1 tag matches title (only one H1 per page)
- [ ] Primary keyword appears in first 100 words
- [ ] Primary keyword appears in at least one H2
- [ ] 2-3 internal links to other pages on your site
- [ ] 1-2 external links to authoritative sources
- [ ] All images have descriptive alt text
- [ ] Images are compressed (< 200KB each)

### Content quality
- [ ] Answers the search intent (what the searcher actually wants)
- [ ] Provides actionable value (not just theory)
- [ ] Is better/more thorough than competing pages for this keyword
- [ ] Includes original data, examples, or perspective
- [ ] Has a clear structure (scannable with headers and lists)
- [ ] Length is appropriate (aim for 1500-2500 words for SEO posts)
- [ ] Proofread for grammar and clarity

### Technical
- [ ] Open Graph tags set (og:title, og:description, og:image)
- [ ] Twitter Card tags set (twitter:card, twitter:title, twitter:image)
- [ ] Canonical URL set
- [ ] Schema markup if applicable (FAQ, HowTo, Article)
- [ ] Page loads in < 3 seconds
- [ ] Mobile-responsive layout

### Distribution plan
- [ ] Share on Twitter/X with thread or key insight
- [ ] Share on LinkedIn (personal profile, not just company page)
- [ ] Post to relevant subreddit or community (provide value, not just link)
- [ ] Include in next email newsletter
- [ ] Cross-post or syndicate if appropriate (dev.to, Medium, Hashnode)
```

---

## Content distribution channels

### Organic channels (free)

```
High impact:
├── SEO (Google) — long-term compounding traffic
├── Twitter/X — developer and startup audience
├── LinkedIn — B2B audience, personal posts perform best
├── Reddit — niche subreddits, provide value first
├── Hacker News — tech audience, submit thoughtful posts
└── Email newsletter — direct line to engaged users

Medium impact:
├── Dev.to / Hashnode — developer audience, cross-post blog content
├── Indie Hackers — founder audience, share building journey
├── Product Hunt discussions — product-adjacent audience
├── Quora — answer questions, link to detailed blog posts
└── YouTube — video versions of tutorials (SEO benefits)
```

### Distribution cadence

```
On publish day:
├── Share on Twitter/X (personal + company account)
├── Share on LinkedIn (personal account, longer-form post)
└── Post to 1-2 relevant communities (Reddit, HN, Discord)

Day 2-3:
├── Email newsletter (batch with other content)
├── Cross-post to Dev.to / Hashnode (with canonical tag)
└── Engage with comments on all channels

Week 2:
├── Repurpose as Twitter/X thread
├── Create short-form clips if video content
└── Internal link from other blog posts
```

---

## Content performance tracking

```markdown
# Monthly Content Report — [CUSTOMIZE: Month Year]

## Summary
| Metric | This Month | Last Month | Change |
|--------|-----------|------------|--------|
| Total organic sessions | X,XXX | X,XXX | +XX% |
| Blog sessions | X,XXX | X,XXX | +XX% |
| Signups from content | XXX | XXX | +XX% |
| Email subscribers gained | XXX | XXX | +XX% |
| Top-performing post | [title] | [title] | — |

## Per-Post Performance
| Post | Publish Date | Sessions | Avg Time | Signups | Top Keyword |
|------|-------------|----------|----------|---------|-------------|
| [title] | [date] | X,XXX | X:XX | XX | [keyword] |
| [title] | [date] | X,XXX | X:XX | XX | [keyword] |

## Keyword Rankings
| Keyword | Position | Change | Target Post |
|---------|----------|--------|-------------|
| [keyword] | #X | +/- X | [post title] |

## Next Month Plan
- [ ] [Topic 1] — targeting [keyword]
- [ ] [Topic 2] — targeting [keyword]
- [ ] Update [old post] with new data
```

---

## Customization notes

- **Solo founder with no content experience**: Start with one post per week. Write about problems you solve, mistakes you made building, or comparisons your users ask about. Quality over quantity.
- **Limited time**: Repurpose aggressively. A blog post becomes a Twitter thread, a LinkedIn post, a newsletter section, and a community answer. One piece of content, 5+ distributions.
- **AI-assisted writing**: Use Claude or similar tools to generate outlines, first drafts, and SEO suggestions. Always edit for voice, accuracy, and original perspective. Never publish AI-generated content unedited.
- **Measuring ROI**: Track "signups from content" using UTM parameters on CTAs within blog posts. If a post generates signups that convert to paid, that post's LTV contribution justifies the writing time.

## Companion tools

- Google Search Console — free keyword data and ranking tracking
- Ubersuggest — freemium keyword research
- Ahrefs — comprehensive SEO toolkit (paid)
- Clearscope — content optimization for target keywords
- Beehiiv / Buttondown — newsletter platforms for content distribution
