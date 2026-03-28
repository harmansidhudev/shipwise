# SaaS Boilerplate Comparison

## When to use

Reference this document when a developer is starting a new SaaS project and deciding whether to build from scratch or start with a production-ready boilerplate. Boilerplates can save 2-6 weeks of setup time by providing auth, billing, email, CI/CD, and admin dashboards out of the box.

## Decision framework

```
Are you building a SaaS product?
├── Yes → Do you have specific stack requirements locked in?
│   ├── Yes → Check if a boilerplate matches your stack below
│   │   ├── Match found → Evaluate checklist coverage
│   │   └── No match → Build from scratch using Shipwise skill guides
│   └── No → Pick a boilerplate first, let it guide your stack
└── No → Build from scratch (boilerplates are SaaS-optimized)
```

---

## The 5 boilerplates compared

### 1. wasp-lang/open-saas

| Attribute | Details |
|-----------|---------|
| **Stack** | React, Node.js, Prisma, PostgreSQL |
| **Auth** | Username/password, Google, GitHub (built into Wasp) |
| **Payments** | Stripe + Lemon Squeezy |
| **GitHub stars** | ~9K |
| **Last updated** | Actively maintained (2025) |
| **Best for** | Solo founders who want the fastest path to a deployed SaaS |

**Shipwise checklist items already covered:**
- [x] Auth (built-in, multiple providers)
- [x] Billing (Stripe + Lemon Squeezy integration)
- [x] Email (SendGrid/Mailgun integration)
- [x] Admin dashboard (built-in admin UI)
- [ ] CI/CD (not included — set up yourself)

**Trade-offs:** Wasp is its own framework with a DSL — you write `.wasp` config files that generate React + Node code. Great productivity but less flexibility if you need to deviate from Wasp conventions. Smaller ecosystem than Next.js.

---

### 2. ixartz/SaaS-Boilerplate

| Attribute | Details |
|-----------|---------|
| **Stack** | Next.js (App Router), Tailwind CSS, Clerk, Drizzle ORM, PostgreSQL |
| **Auth** | Clerk (managed) |
| **Payments** | Stripe |
| **GitHub stars** | ~5K |
| **Last updated** | Actively maintained (2025) |
| **Best for** | Solo founders / small teams who want a modern Next.js stack with managed auth |

**Shipwise checklist items already covered:**
- [x] Auth (Clerk with organizations)
- [x] Billing (Stripe subscriptions)
- [x] CI/CD (GitHub Actions included)
- [x] Email (Resend integration)
- [ ] Admin dashboard (basic, needs extension)

**Trade-offs:** Tightly coupled to Clerk for auth — great DX but vendor lock-in. Drizzle ORM is performant but has a smaller community than Prisma. Well-structured codebase for learning modern Next.js patterns.

---

### 3. boxyhq/saas-starter-kit

| Attribute | Details |
|-----------|---------|
| **Stack** | Next.js, Prisma, PostgreSQL, Tailwind CSS |
| **Auth** | NextAuth.js with SAML SSO (via BoxyHQ) |
| **Payments** | Stripe |
| **GitHub stars** | ~5K |
| **Last updated** | Actively maintained (2025) |
| **Best for** | Teams building B2B SaaS that needs enterprise SSO and audit logs |

**Shipwise checklist items already covered:**
- [x] Auth (NextAuth + SAML SSO + SCIM directory sync)
- [x] Billing (Stripe)
- [x] Admin dashboard (team management, audit logs)
- [ ] CI/CD (not included)
- [ ] Email (basic — needs enhancement)

**Trade-offs:** Enterprise-focused features (SSO, audit logs, SCIM) that most early-stage SaaS products don't need yet. Heavier setup than simpler boilerplates. Excellent if you're selling to enterprises from day one.

---

### 4. apptension/saas-boilerplate

| Attribute | Details |
|-----------|---------|
| **Stack** | React (CRA/Vite), Django (Python), PostgreSQL, AWS |
| **Auth** | Django auth with social login |
| **Payments** | Stripe |
| **GitHub stars** | ~4K |
| **Last updated** | Actively maintained (2025) |
| **Best for** | Teams with Python/Django expertise who want AWS-native infrastructure |

**Shipwise checklist items already covered:**
- [x] Auth (Django auth + social providers)
- [x] Billing (Stripe subscriptions)
- [x] CI/CD (AWS CodePipeline, Docker Compose)
- [x] Email (AWS SES integration)
- [x] Admin dashboard (Django admin)

**Trade-offs:** Python/Django stack — not TypeScript end-to-end. AWS-specific deployment (CDK, ECS, CloudFront). Most complete infrastructure setup of all options but requires AWS knowledge. Heavier operational overhead.

---

### 5. paralect/ship

| Attribute | Details |
|-----------|---------|
| **Stack** | Next.js, React Query, MongoDB, Turborepo |
| **Auth** | Custom (email/password + Google OAuth) |
| **Payments** | Stripe |
| **GitHub stars** | ~4K |
| **Last updated** | Actively maintained (2025) |
| **Best for** | Teams who prefer MongoDB and want a monorepo architecture |

**Shipwise checklist items already covered:**
- [x] Auth (custom with email verification)
- [x] Billing (Stripe integration)
- [x] CI/CD (GitHub Actions + Docker)
- [x] Email (Resend/Mailgun)
- [ ] Admin dashboard (basic)

**Trade-offs:** MongoDB instead of PostgreSQL — flexible schema but no built-in RLS for multi-tenancy. Turborepo monorepo is well-structured but adds complexity. React Query for state management is modern but opinionated. Custom auth means more maintenance than managed providers.

---

## Quick comparison matrix

| Feature | open-saas | SaaS-Boilerplate | saas-starter-kit | apptension | ship |
|---------|-----------|-------------------|-------------------|------------|------|
| **Language** | TypeScript | TypeScript | TypeScript | Python + TS | TypeScript |
| **Frontend** | React | Next.js | Next.js | React | Next.js |
| **Backend** | Node.js (Wasp) | Next.js API | Next.js API | Django | Next.js API |
| **Database** | PostgreSQL | PostgreSQL | PostgreSQL | PostgreSQL | MongoDB |
| **ORM** | Prisma | Drizzle | Prisma | Django ORM | Mongoose |
| **Auth** | Built-in | Clerk | NextAuth + SSO | Django auth | Custom |
| **Payments** | Stripe + LS | Stripe | Stripe | Stripe | Stripe |
| **SSO/SAML** | No | Via Clerk | Yes (built-in) | No | No |
| **Audit logs** | No | No | Yes | No | No |
| **CI/CD** | No | Yes | No | Yes (AWS) | Yes |
| **Email** | Yes | Yes | Basic | Yes (SES) | Yes |
| **Admin panel** | Yes | Basic | Yes | Yes (Django) | Basic |
| **Monorepo** | No | No | No | No | Yes (Turbo) |
| **Stars** | ~9K | ~5K | ~5K | ~4K | ~4K |

---

## Decision matrix: if you need X, start with Y

| If you need... | Start with... | Why |
|----------------|---------------|-----|
| Fastest time to launch as a solo founder | **open-saas** | Most batteries-included, Wasp handles boilerplate |
| Modern Next.js + managed auth (Clerk) | **SaaS-Boilerplate** | Matches the Shipwise default stack recommendation |
| Enterprise SSO (SAML), audit logs, SCIM | **saas-starter-kit** | Only option with built-in enterprise features |
| Python/Django backend with AWS deployment | **apptension** | Only Python option, comprehensive AWS infra |
| MongoDB with monorepo architecture | **ship** | Only MongoDB option, Turborepo structure |
| TypeScript end-to-end with maximum control | **SaaS-Boilerplate** | Clean Next.js codebase, easy to customize |
| Selling to enterprises from day one | **saas-starter-kit** | SSO + audit logs + directory sync ready |

---

## What a boilerplate does NOT give you

Even with a boilerplate, you still need Shipwise for:

- **Idea validation** (Skill 01) — No boilerplate validates whether your product should exist
- **Product design** (Skill 02) — MVP scoping, user stories, wireframes
- **Security hardening** (Skill 08) — Boilerplate auth is a starting point, not a security audit
- **SEO & performance** (Skill 10) — Meta tags, structured data, Core Web Vitals
- **Legal compliance** (Skill 12) — Privacy policy, terms of service, GDPR
- **Launch execution** (Skill 13) — Go-live planning, rollback strategy
- **Growth ops** (Skill 14) — Analytics, A/B testing, retention

A boilerplate accelerates the BUILD phase. Shipwise covers the full lifecycle: Design → Build → Ship → Grow.

---

## Customization notes

- **Evaluating a boilerplate not listed here**: Check (1) last commit date, (2) open issue count, (3) does it handle auth + billing + email, (4) is the license permissive (MIT/Apache), (5) can you eject or customize without forking.
- **Mixing boilerplate + custom**: It's common to start with a boilerplate for auth/billing and replace other parts. Evaluate how modular the boilerplate is before committing.
- **When NOT to use a boilerplate**: If your core product IS the infrastructure (e.g., a developer tool, a database product), boilerplates add unnecessary abstraction. Build from scratch.
