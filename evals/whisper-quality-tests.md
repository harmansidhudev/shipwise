# Whisper Quality Tests

## Purpose
Verify that post-edit whispers are useful, not noisy. Whispers should surface relevant checklist items without becoming disruptive.

## Test Scenarios

### Should whisper (relevant file edits)
| # | File edited | Expected category | Expected whisper content |
|---|-------------|------------------|-------------------------|
| 1 | `src/auth/login.ts` | auth | Auth checklist: rate limiting, secure cookies, CSRF |
| 2 | `src/api/payments/webhook.ts` | billing | Payment security: signature verification, idempotency |
| 3 | `.github/workflows/ci.yml` | cicd | CI/CD checklist: test stage, lint stage, env secrets |
| 4 | `src/api/users/route.ts` | api | API checklist: input validation, error handling, auth middleware |
| 5 | `.env.production` | secrets | Secrets warning: ensure .gitignore includes .env* |
| 6 | `src/middleware/security-headers.ts` | security | Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| 7 | `src/lib/sentry.ts` | observability | Error tracking: source maps, environment tags, user context |
| 8 | `docker-compose.yml` | infrastructure | Container config: health checks, resource limits, restart policy |

### Should NOT whisper (irrelevant file edits)
| # | File edited | Reason |
|---|-------------|--------|
| 1 | `src/components/Button.tsx` | UI component, no matching category |
| 2 | `README.md` | Documentation, no matching category |
| 3 | `package.json` | Too generic, no specific category |
| 4 | `src/utils/format.ts` | Utility file, no category match |
| 5 | `src/styles/globals.css` | CSS file, no category match |
| 6 | `tsconfig.json` | Config file, no specific category |
| 7 | `src/components/Layout.tsx` | Layout component, no category match |

### Deduplication tests
| # | Sequence | Expected behavior |
|---|----------|-------------------|
| 1 | Edit `auth/login.ts` then edit `auth/signup.ts` | Whisper on login.ts, suppress on signup.ts (same auth category) |
| 2 | Edit `auth/login.ts` then edit `stripe/webhook.ts` | Whisper on both (different categories: auth vs billing) |
| 3 | Edit `api/users.ts` then edit `api/posts.ts` | Whisper on users.ts, suppress on posts.ts (same api category) |
| 4 | Edit `auth/login.ts`, start new session, edit `auth/login.ts` | Whisper both times (dedup resets per session) |
| 5 | Edit `.env` then edit `.env.local` | Whisper on .env, suppress on .env.local (same secrets category) |

### Intent suppression tests
| # | User prompt | File created/edited | Tool used | Expected behavior |
|---|-------------|--------------------|-----------|--------------------|
| 1 | "Create a login page" | `auth/login.tsx` | Write | Suppress (user explicitly asked for auth work) |
| 2 | "Fix the bug" | `auth/login.tsx` | Edit | Whisper (user may not be thinking about auth checklist) |
| 3 | "Add a .env file" | `.env` | Write | Whisper (always warn about secrets, never suppress) |
| 4 | "Set up Stripe integration" | `payments/stripe.ts` | Write | Suppress (user explicitly asked for payment work) |
| 5 | "Refactor the API handler" | `api/users/route.ts` | Edit | Whisper (refactoring, not intentional API design) |
| 6 | "Add rate limiting to auth" | `auth/middleware.ts` | Write | Suppress (user is intentionally working on auth) |
| 7 | "Fix CSS alignment" | `auth/login.tsx` | Edit | Whisper (user is fixing CSS, not thinking about auth) |

### Experience level adaptation
| # | Level | File edited | Expected output style |
|---|-------|-------------|----------------------|
| 1 | beginner | `auth/login.ts` | Full explanation: "When building login flows, consider: [list with descriptions]" |
| 2 | intermediate | `auth/login.ts` | Concise list: "Auth checklist: rate limiting, CSRF, secure cookies" |
| 3 | senior | `auth/login.ts` | Terse: "Auth: rate-limit, CSRF, httpOnly cookies" |
| 4 | beginner | `.env.production` | Full warning with steps: "This file may contain secrets. Here's how to protect it..." |
| 5 | senior | `.env.production` | Terse: ".env in .gitignore?" |

### Edge cases
| # | Scenario | Expected behavior |
|---|----------|-------------------|
| 1 | File path contains auth keyword but is unrelated (e.g., `docs/auth-diagram.md`) | No whisper (markdown file, not code) |
| 2 | Rapid successive edits to same file | Single whisper on first edit only |
| 3 | No shipwise-state.json exists | No whisper (shipwise not initialized) |
| 4 | State exists but experience_level is missing | Default to intermediate behavior |

## Success criteria
- Zero whispers on non-matching files (100% specificity)
- Deduplication works within sessions (same category suppressed)
- Intent suppression works for Write tool (new file creation matching user prompt)
- Secrets category (.env files) is NEVER suppressed regardless of intent
- Experience level correctly adjusts verbosity
- No whisper when shipwise is not initialized
- Target: <5% false positive rate, >90% true positive rate
