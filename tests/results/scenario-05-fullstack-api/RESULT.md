# Scenario 5: Fullstack Development — API Design

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 05-fullstack-development
- **User archetype:** mid-level developer (3 years)
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the fullstack-development skill auto-triggers on an API design prompt, that the generated API follows the skill's prescribed conventions (REST, Zod validation, auth middleware, structured error handling, rate limiting, pagination), and that all reference docs are correctly consulted.

## Test Prompt
```
Build me a REST API for user management. I need endpoints for: Create user
(signup), Get user profile, Update user profile, Delete account, List all
users (admin only). Use proper conventions and error handling.
```

## Expected Behavior
- Skill 05 auto-triggers on trigger words present in prompt.
- Generated code follows REST conventions from SKILL.md backend section and `api-design-patterns.md`.
- Zod schemas used for input validation on all write endpoints.
- Auth middleware (`requireAuth`) applied to all protected routes.
- Admin-only guard applied to the list endpoint.
- Error handling uses structured `AppError` / `{ error: { code, message, details } }` format.
- Rate limiting applied (sliding window, 429 + Retry-After).
- List endpoint includes cursor-based or offset-based pagination.
- Soft delete used on the delete endpoint (not hard delete).

## Actual Behavior

### Trigger analysis

Cross-referencing the prompt against skill 05's frontmatter trigger list:

| Phrase in prompt | Skill 05 trigger | Match? |
|-----------------|-----------------|--------|
| "REST API" | "API route" / "API design" | YES — "API design" is a literal trigger |
| "endpoints" | "API route" | YES (semantic) |
| "Create user (signup)" | "backend" (implied) | YES — "backend" is a literal trigger |
| "error handling" | "error handling" | YES — exact literal match |
| (none) | "React", "component", "form handling" etc. | No match |

**Skill 05 fires.** The prompt contains three independent direct trigger matches ("API design", "backend", "error handling"). Any one of them would be sufficient. Trigger coverage is reliable.

**Skill 04 co-trigger check:** Cross-referencing against skill 04 (tech-architecture) triggers: "framework selection", "which framework", "database choice", "tech stack", "architecture decisions", "hosting", "auth strategy", "REST vs GraphQL", "API architecture", "stack recommendations". The prompt contains "REST API" — this could weakly match "REST vs GraphQL" or "API architecture", but neither is a literal phrase match and the prompt is not asking for a selection decision. Skill 04 should NOT co-trigger. No concern here.

### REST conventions check

The SKILL.md backend section specifies these conventions:
- `GET /api/v1/resources` — list (with pagination + filtering)
- `GET /api/v1/resources/:id` — single item
- `POST /api/v1/resources` — create
- `PATCH /api/v1/resources/:id` — partial update
- `DELETE /api/v1/resources/:id` — soft delete

The test prompt maps onto these conventions cleanly:

| Requested endpoint | Correct REST mapping |
|-------------------|---------------------|
| Create user (signup) | `POST /api/v1/users` |
| Get user profile | `GET /api/v1/users/:id` |
| Update user profile | `PATCH /api/v1/users/:id` |
| Delete account | `DELETE /api/v1/users/:id` (soft delete via `deletedAt`) |
| List all users (admin only) | `GET /api/v1/users` with admin guard |

The `api-design-patterns.md` reference confirms the exact same conventions and provides a copy-paste template using Next.js App Router (`app/api/v1/projects/route.ts`). The template uses `/api/v1/` URL versioning, `{ data: ... }` response envelope for success, and `{ error: { code, message, details } }` envelope for errors. The skill would apply these directly to the user resource.

**URL versioning:** SKILL.md and the reference both specify `/api/v1/` prefix. The skill would generate versioned routes.

**Response envelope:** `api-design-patterns.md` defines:
```
// Success
{ data: T, pagination?: { nextCursor, hasMore, limit } }
// Error
{ error: { code: string, message: string, details?: Record<string, unknown> } }
```
Note: the error envelope does NOT include a `requestId` field. The scenario validation question asks "does it follow `{ error: { code, message, details, requestId } }`?" — the skill's prescribed format does not include `requestId`. The actual prescribed format is `{ error: { code, message, details? } }` — three fields, not four. This is a gap between what the scenario expected and what the skill actually specifies.

### Zod validation check

SKILL.md's "Form handling" section uses Zod explicitly:
```ts
const schema = z.object({ email: z.string().email(...), name: z.string().min(2, ...) });
```

The `api-design-patterns.md` template uses Zod for both list query params and create/update bodies:
```ts
const listQuerySchema = z.object({ cursor, limit, sort, status, search });
const createBodySchema = z.object({ name, description, status });
const updateBodySchema = z.object({ name, description, status }); // all optional
```

For the user management API, the skill would generate:
- `createUserSchema`: `z.object({ email: z.string().email(), name: z.string().min(2), password: ... })`
- `updateUserSchema`: all fields optional
- `listUsersQuerySchema`: cursor, limit, sort params

**Zod is definitively present in the skill's patterns.** The error-handling reference also shows that `ZodError` is caught by the global handler and auto-formatted as a `VALIDATION_ERROR` response with field-level details. No extra try/catch needed in route code.

### Auth middleware check

The `api-design-patterns.md` template calls `requireAuth(req)` at the top of every route handler:
```ts
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  ...
}
```

The fixture project at `tests/fixtures/midlevel-saas-project/lib/auth.ts` already has an auth module. The template imports from `@/lib/auth`, which aligns with the fixture's file structure.

The skill would apply `requireAuth` to:
- `GET /api/v1/users/:id` (own profile) — auth required
- `PATCH /api/v1/users/:id` — auth required
- `DELETE /api/v1/users/:id` — auth required
- `GET /api/v1/users` (admin list) — auth required

**Admin-only guard on list endpoint:** The SKILL.md and reference do not provide a dedicated admin-guard utility. The reference shows `userId: user.id` ownership scoping, but not role-based access. For the admin list endpoint, the skill would need to check `user.role === 'admin'` — this is a pattern not explicitly covered in the reference template. The skill would likely generate this inline rather than via a dedicated middleware. Whether it throws `Errors.forbidden()` vs returns early is up to the model's inference from the `AppError` patterns.

**Gap:** The skill has no explicit admin role-check pattern in its references. The generated code would work but would be improvised rather than drawn from a defined template.

### Error handling check

The `error-handling-patterns.md` reference defines the error structure precisely:

```ts
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  details?: Record<string, unknown>;
}
```

Factory functions: `Errors.unauthorized()`, `Errors.forbidden()`, `Errors.notFound(resource)`, `Errors.conflict(message)`, `Errors.validationError(details)`, `Errors.rateLimited(retryAfterSeconds)`, `Errors.internal()`.

The global handler (`withErrorHandler`) catches:
1. `ZodError` → 422, code `VALIDATION_ERROR`, field-level details
2. `AppError` → appropriate HTTP status, structured `{ error: { code, message, details? } }`
3. Unknown errors → 500, code `INTERNAL_ERROR`, generic message (no stack trace leaked)

**Prescribed error format:**
```json
{ "error": { "code": "NOT_FOUND", "message": "User not found" } }
```
or with details:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": { "fields": { "email": ["Invalid email"] } } } }
```

**Critically: there is no `requestId` field in the error response.** The scenario asked whether error handling includes `requestId`. It does not — this is not in the skill's prescribed pattern. The `error-handling-patterns.md` reference makes no mention of request IDs or correlation IDs. This is a gap in the skill's error handling coverage for production-grade debugging.

For the user management API, relevant errors would be:
- `Errors.conflict('Email already in use')` on duplicate signup → 409
- `Errors.notFound('User')` on missing profile → 404
- `Errors.forbidden()` on non-admin accessing list → 403
- `Errors.unauthorized()` on unauthenticated request → 401
- ZodError auto-caught on bad input → 422

**The structured error pattern is present and complete for these cases.** The missing `requestId` is a legitimate coverage gap.

### Rate limiting check

SKILL.md backend section under "API design patterns" explicitly states:
> **Rate limiting:** Apply per-endpoint. Return `429 Too Many Requests` with `Retry-After` header. Use sliding window algorithm.

The `api-design-patterns.md` reference provides a complete copy-paste template:
```ts
// middleware/rate-limit.ts
// Sliding window: 60 requests per 60 seconds
export const rateLimiter = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(60, '60 s'), analytics: true,
});
```

The template returns 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. The error body follows the standard envelope: `{ error: { code: 'RATE_LIMITED', message: '...' } }`.

**Rate limiting is definitively covered.** The skill would reference this template directly. The `@upstash/ratelimit` package is used (requires Upstash Redis), which is called out in the Companion tools section of the reference.

**Important nuance:** The template shows rate limiting as a standalone utility to be called inside route handlers. It is not a Next.js middleware that automatically wraps all routes. The developer must explicitly call `rateLimit(identifier)` in each route. For the user management API, the skill would need to apply this to the signup endpoint especially (most abuse-prone).

### Pagination check

SKILL.md states:
> **Pagination:** Cursor-based for feeds/timelines, offset-based for admin tables.

The test prompt requests "List all users (admin only)" — this is an admin table scenario. Per the SKILL.md guidance, **offset-based pagination is appropriate** for admin tables. However, the `api-design-patterns.md` template uses cursor-based pagination as its copy-paste example (fetching N+1, `nextCursor` in response). The skill's SKILL.md says to use offset for admin tables, but the only template in the reference is cursor-based.

This creates an inconsistency:
- SKILL.md says: offset-based for admin tables
- The copy-paste template in `api-design-patterns.md`: cursor-based only

The skill would likely apply the cursor-based template (the only template available) rather than generating offset-based pagination from scratch. The scenario expects pagination to be present — it is, in the template. But the pagination type may not match the guidance for the admin-table use case.

**Pagination IS present in the skill's templates.** The list endpoint would include `{ pagination: { nextCursor, hasMore, limit } }`. The inconsistency between cursor vs. offset for admin tables is a minor documentation gap, not a missing feature.

### Soft delete check

SKILL.md database conventions specify:
> **Soft deletes:** `deleted_at` nullable timestamp (never hard-delete user data)

The `api-design-patterns.md` DELETE template implements soft delete:
```ts
await db.project.update({ where: { id }, data: { deletedAt: new Date() } });
return NextResponse.json({ data: null }, { status: 200 });
```

All queries filter by `deletedAt: null`. **Soft delete is present and consistently applied in the skill's templates.**

### Fixture compatibility

The `tests/fixtures/midlevel-saas-project/` has:
- `lib/auth.ts` — auth module (aligns with `requireAuth` import in templates)
- `lib/db.ts` — database client (aligns with `db` import in templates)
- `lib/validations.ts` — existing Zod schemas (aligns with Zod pattern)
- `prisma/schema.prisma` — has a User model
- `app/api/projects/` — existing API routes following a similar pattern

The fixture already follows the skill's conventions (feature-based structure, Prisma, Zod), meaning the generated user management API would be consistent with the existing codebase. The fixture is well-matched to this skill.

## Verdict: PASS with gaps

### Validation Checklist

- [x] **Skill 05 auto-triggers** — "API design", "error handling", and "backend" are all literal trigger words present in the prompt. Triple-matched, will fire reliably.
- [x] **Skill 04 does NOT co-trigger** — No trigger words from skill 04 are present. "REST API" does not match skill 04's "REST vs GraphQL" or "API architecture" triggers as a literal phrase match for a design-decision question.
- [x] **REST conventions followed** — POST/GET/PATCH/DELETE mapped correctly, `/api/v1/` versioning, all specified by SKILL.md and `api-design-patterns.md`.
- [x] **Zod validation included** — Zod is the prescribed validation tool. Templates show per-endpoint schemas for both query params and request bodies. ZodError auto-caught by global handler.
- [x] **Auth middleware present** — `requireAuth(req)` appears at the top of every route handler in the templates. All five endpoints would be gated.
- [ ] **Admin-only guard pattern** — No explicit admin role-check template exists in any reference doc. The skill would improvise `user.role === 'admin'` or similar inline. Pattern is not formally prescribed.
- [x] **Error handling structured format** — `{ error: { code, message, details? } }` is the prescribed format across both SKILL.md and `error-handling-patterns.md`. Global handler covers Zod, AppError, and unknown errors.
- [ ] **requestId in error responses** — NOT present. The skill's error format is `{ error: { code, message, details? } }` — no `requestId` field. The scenario's expectation of `requestId` is not met by the skill's prescribed pattern. This is a gap in the skill, not a test configuration issue.
- [x] **Rate limiting included** — Explicitly specified in SKILL.md. Full template with sliding window, 429 status, `Retry-After` header provided in `api-design-patterns.md`.
- [x] **Pagination on list endpoint** — Cursor-based pagination template is present in `api-design-patterns.md`. List endpoint would return `{ data, pagination: { nextCursor, hasMore, limit } }`.
- [ ] **Correct pagination type for admin table** — SKILL.md says use offset-based for admin tables, but the only template is cursor-based. Skill would likely generate cursor-based for the admin list, which contradicts its own guidance.
- [x] **Soft delete on delete endpoint** — Template explicitly sets `deletedAt: new Date()`. All queries filter by `deletedAt: null`. "Never hard-delete user data" is stated in SKILL.md.

## Findings

### Positive
- The skill has excellent coverage of the core API design scenario. Triggers match reliably and specifically — no over-triggering concern.
- Zod validation is deeply integrated: schema-per-endpoint, auto-catch by global handler, field-level error details. No boilerplate burden on the developer.
- The error handling pattern is comprehensive and production-ready: three error classes (Zod, AppError, unknown), appropriate HTTP status codes, no stack trace leakage in production.
- Rate limiting is not an afterthought — it has a dedicated template with all production headers (`Retry-After`, `X-RateLimit-*`), sliding window algorithm, and Redis backing. Better than many frameworks provide out of the box.
- The fixture project is already structured to match the skill's conventions (Prisma, Zod, auth module, Next.js App Router). Generated code would slot in without friction.
- Soft delete is enforced consistently across templates (create, read, update, delete all reference `deletedAt`).

### Negative
- **No requestId in error responses:** The skill's error format lacks request IDs or correlation IDs. For production debugging (matching a client error to a server log line), `requestId` is essential. This is a meaningful omission for a mid-level developer building a production API.
- **No admin role-check template:** The skill has no prescribed pattern for role-based access control (RBAC). The admin-only list endpoint is a common pattern, but the developer must implement the guard themselves without reference guidance.
- **Pagination type inconsistency:** SKILL.md prescribes offset-based pagination for admin tables. The `api-design-patterns.md` reference only provides a cursor-based template. The developer is told one thing and given templates for another. The skill would likely generate cursor-based (following the template), contradicting its own guidance.
- **Rate limiting requires explicit call-site integration:** The rate limiting utility must be manually called inside each route. There is no automatic middleware that wraps all routes. A mid-level developer could easily forget to apply it to specific endpoints.
- **Signup endpoint has no password hashing guidance:** The prompt requests a signup endpoint. The skill has no template or guidance for password hashing (bcrypt/argon2) or token generation for credentials-based auth. The skill's auth coverage defers entirely to external providers (Clerk, Supabase Auth, etc.) — it does not cover building a password-based signup yourself.

### Marketing-Worthy Outputs
- [x] The combined Zod + global error handler pattern ("validation errors auto-format as field-level JSON — zero extra code in your routes") is a strong demo story.
- [x] The rate limiting template is production-ready out of the box and would impress a mid-level developer who hasn't implemented it before.

## Bugs / Issues to File
- [ ] **BUG-05-A: requestId missing from error format** — `error-handling-patterns.md` does not include `requestId` in the error response envelope. Add a `requestId` field (generated per-request via `crypto.randomUUID()` or passed via header) to enable log correlation. This is a standard production requirement.
- [ ] **BUG-05-B: No admin/role-based access control template** — Neither SKILL.md nor any reference doc provides an `requireRole('admin')` or similar guard. A common use case (admin endpoints) has no prescribed pattern.
- [ ] **BUG-05-C: Pagination type inconsistency** — SKILL.md says "offset-based for admin tables" but `api-design-patterns.md` only provides a cursor-based template. Either add an offset-based template to the reference doc, or update the SKILL.md guidance to be consistent with the template provided.
- [ ] **BUG-05-D: No password/credentials auth guidance** — The skill has no coverage for password hashing, credentials-based signup, or JWT issuance. Any prompt asking to build a signup endpoint requiring username/password auth falls outside the skill's templates.
