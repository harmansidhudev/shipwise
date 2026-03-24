# Environment Management

## When to use
Reference this when setting up dev/staging/prod environments, managing environment variables, creating `.env.example` files, configuring preview deployments, or establishing environment parity.

## Decision framework

```
How should I manage this environment variable?
├── Public, safe to expose to browser (analytics ID, app URL)
│   → Prefix with NEXT_PUBLIC_ (Next.js) or VITE_ (Vite)
│   → Commit to .env.example with real or placeholder value
│
├── Private server-only secret (API key, DB password)
│   → .env locally, platform env vars in deployment
│   → Commit to .env.example with placeholder only
│
├── Build-time only (feature flags, API version)
│   → Set in CI/CD pipeline env vars
│   → Document in .env.example
│
└── Infrastructure (Terraform, cloud config)
    → Cloud secret manager (SSM, Secrets Manager)
    → Never in .env or source code
```

### Environment comparison

| Aspect | Development | Staging | Production |
|--------|------------|---------|------------|
| **URL** | `localhost:3000` | `staging.example.com` | `app.example.com` |
| **Database** | Local Postgres (Docker) | Cloud Postgres (small) | Cloud Postgres (production-sized) |
| **Data** | Seed/fixture data | Anonymized prod snapshot | Real user data |
| **Infra size** | Minimal / free tier | Matches prod architecture | Right-sized for load |
| **Deploy trigger** | Manual / hot reload | Merge to `staging` branch | Merge to `main` branch |
| **Auth** | Test/sandbox providers | Test/sandbox providers | Live credentials |
| **Error reporting** | Console output | Sentry (staging project) | Sentry (prod project) |
| **Email** | Mailpit / console | Resend (sandbox) | Resend (production) |
| **Payments** | Stripe test mode | Stripe test mode | Stripe live mode |
| **Feature flags** | All enabled | Selectively enabled | Controlled rollout |
| **Logging** | Verbose (debug) | Info level | Info level + structured |
| **SSL** | None or self-signed | Automated (Cloudflare) | Automated (Cloudflare) |

## Copy-paste template

### .env.example (Next.js + Postgres + Stripe)

```bash
# .env.example
# Copy this file to .env and fill in the values.
# NEVER commit .env — only .env.example is tracked in git.
#
# [CUSTOMIZE] Replace all placeholder values with your actual config.

# ============================================================
# App Configuration
# ============================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="My App"           # [CUSTOMIZE] Your app name

# ============================================================
# Database
# ============================================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev  # [CUSTOMIZE] DB name

# ============================================================
# Authentication
# ============================================================
# Generate with: openssl rand -base64 32
AUTH_SECRET=change-me-generate-a-real-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=

# ============================================================
# Email (Resend)
# ============================================================
RESEND_API_KEY=re_test_...              # [CUSTOMIZE] Get from resend.com
EMAIL_FROM="My App <noreply@example.com>"  # [CUSTOMIZE]

# ============================================================
# Payments (Stripe)
# ============================================================
STRIPE_SECRET_KEY=sk_test_...           # [CUSTOMIZE] Get from stripe.com
STRIPE_WEBHOOK_SECRET=whsec_...         # [CUSTOMIZE] Get from stripe CLI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # [CUSTOMIZE]

# ============================================================
# File Storage (S3-compatible)
# ============================================================
S3_BUCKET=myapp-dev                     # [CUSTOMIZE]
S3_REGION=us-east-1                     # [CUSTOMIZE]
S3_ENDPOINT=                            # Leave empty for AWS S3, set for R2/MinIO
AWS_ACCESS_KEY_ID=                      # [CUSTOMIZE]
AWS_SECRET_ACCESS_KEY=                  # [CUSTOMIZE]

# ============================================================
# Cache (Redis)
# ============================================================
REDIS_URL=redis://localhost:6379

# ============================================================
# Observability
# ============================================================
SENTRY_DSN=                             # [CUSTOMIZE] Get from sentry.io
NEXT_PUBLIC_SENTRY_DSN=                 # Same as SENTRY_DSN for client-side
# LOG_LEVEL=debug                       # Uncomment for verbose logging
```

### .env.example (Python FastAPI)

```bash
# .env.example
# Copy to .env and fill in values.
# [CUSTOMIZE] Replace all placeholder values.

# ============================================================
# App Configuration
# ============================================================
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_SECRET_KEY=change-me-generate-a-real-secret  # python -c "import secrets; print(secrets.token_urlsafe(32))"

# ============================================================
# Database
# ============================================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev  # [CUSTOMIZE]

# ============================================================
# Cache (Redis)
# ============================================================
REDIS_URL=redis://localhost:6379

# ============================================================
# Email
# ============================================================
RESEND_API_KEY=re_test_...              # [CUSTOMIZE]

# ============================================================
# External APIs
# ============================================================
# OPENAI_API_KEY=sk-...
# STRIPE_SECRET_KEY=sk_test_...
```

### Environment validation at startup (Next.js with t3-env)

```ts
// env.ts
// [CUSTOMIZE] Add/remove variables to match your .env.example
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(16),
    RESEND_API_KEY: z.string().startsWith("re_"),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    REDIS_URL: z.string().url().optional(),
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
```

### Environment validation at startup (Python with pydantic-settings)

```python
# config.py
# [CUSTOMIZE] Add/remove fields to match your .env.example
from pydantic_settings import BaseSettings
from pydantic import Field, PostgresDsn, RedisDsn


class Settings(BaseSettings):
    # App
    app_env: str = Field(default="development", pattern="^(development|staging|production)$")
    app_debug: bool = False
    app_url: str = "http://localhost:8000"
    app_secret_key: str = Field(min_length=16)

    # Database
    database_url: PostgresDsn

    # Cache
    redis_url: RedisDsn | None = None

    # Email
    resend_api_key: str | None = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

### .gitignore entries for environment files

```gitignore
# Environment files — NEVER commit real secrets
.env
.env.local
.env.development.local
.env.test.local
.env.staging.local
.env.production.local

# DO track these:
# .env.example (template with placeholders)
# .env.test (if it contains only non-secret test config)
```

### Preview environment setup (Vercel)

Vercel creates preview environments automatically for every PR. To configure environment variables for previews:

```bash
# Set an env var for preview environments via Vercel CLI
# [CUSTOMIZE] Variable name and value
vercel env add DATABASE_URL preview
# Paste the staging database URL when prompted

# Or set via vercel.json
```

```json
// vercel.json
// [CUSTOMIZE] Redirects, headers, and env var references
{
  "buildCommand": "pnpm build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Feature branch database strategy

For preview environments that need isolated databases, use one of these approaches:

```bash
# Option A: Shared staging database with schema prefix
# Each preview branch gets its own schema within the staging DB
DATABASE_URL=postgresql://user:pass@staging-db:5432/app?schema=preview_${BRANCH_NAME}

# Option B: Neon database branching (recommended for Postgres)
# Each PR gets a copy-on-write database branch — instant, free
# [CUSTOMIZE] Neon project ID
neon branches create --project-id [PROJECT_ID] --name "preview/${BRANCH_NAME}"

# Option C: PlanetScale database branching (for MySQL)
# Similar concept for MySQL users
pscale branch create mydb "preview/${BRANCH_NAME}"
```

## Customization notes

- **`t3-env` vs `envalid`:** `t3-env` is purpose-built for Next.js and separates server/client variables automatically. `envalid` is framework-agnostic and works with any Node.js app. Use `t3-env` for Next.js, `envalid` or `pydantic-settings` for everything else.
- **Public vs private variables:** In Next.js, only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. In Vite, the prefix is `VITE_`. All other variables are server-only. Never put secrets in public variables.
- **Staging data:** Never use production data directly in staging. Use an anonymized snapshot (tools: `postgresql_anonymizer`, custom seed scripts) or synthetic seed data.
- **Preview environment teardown:** Always configure automatic teardown of preview environments when the PR is closed or merged. Vercel and Netlify handle this automatically. For custom setups, add a GitHub Actions workflow triggered on `pull_request: closed`.
- **Database branching:** Neon (Postgres) and PlanetScale (MySQL) offer copy-on-write database branches that are instant and nearly free. This is the best approach for preview environments that need isolated data.

## Companion tools

| Tool | Use for |
|------|---------|
| `t3-oss/t3-env` | Type-safe environment variable validation for Next.js |
| Neon | Postgres database branching for preview environments |
| Vercel CLI | Managing preview environment variables |
| `alirezarezvani/claude-skills` -> `ci-cd-builder` | Setting up environment-aware CI/CD pipelines |
