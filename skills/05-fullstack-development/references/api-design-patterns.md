# API Design Patterns

## When to use
Reference this when designing new API endpoints, adding pagination/filtering, implementing validation, or reviewing existing API routes for consistency.

## Decision framework

```
What kind of endpoint am I building?
├── CRUD on a resource → REST (this doc)
├── Real-time data → WebSocket / Server-Sent Events
├── Complex queries across many entities → GraphQL
└── Internal service-to-service → gRPC / tRPC
```

**Pagination choice:**
- Cursor-based — for infinite scroll, feeds, timelines (stable under inserts/deletes)
- Offset-based — for admin tables, dashboards where users jump to page N

## Copy-paste template

### RESTful API route with pagination, filtering, validation

```ts
// app/api/v1/projects/route.ts (Next.js App Router)
// [CUSTOMIZE] Replace "Project" with your resource name and schema
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

// --- Validation schemas ---

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).default('-createdAt'),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  search: z.string().max(100).optional(),
});

const createBodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'draft']).default('draft'),
});

// --- GET /api/v1/projects ---

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);

  // Parse and validate query params
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const query = listQuerySchema.parse(params);

  // Build query
  const orderDir = query.sort.startsWith('-') ? 'desc' : 'asc';
  const orderField = query.sort.replace('-', '');

  const where = {
    userId: user.id,
    deletedAt: null, // soft delete filter
    ...(query.status && { status: query.status }),
    ...(query.search && {
      name: { contains: query.search, mode: 'insensitive' as const },
    }),
    ...(query.cursor && {
      id: { gt: query.cursor }, // [CUSTOMIZE] cursor field
    }),
  };

  const projects = await db.project.findMany({
    where,
    orderBy: { [orderField]: orderDir },
    take: query.limit + 1, // fetch one extra to detect next page
  });

  const hasMore = projects.length > query.limit;
  const data = hasMore ? projects.slice(0, -1) : projects;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
      limit: query.limit,
    },
  });
}

// --- POST /api/v1/projects ---

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);

  const body = await req.json();
  const validated = createBodySchema.parse(body);

  const project = await db.project.create({
    data: {
      ...validated,
      userId: user.id,
    },
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
```

### Single resource route with PATCH and soft DELETE

```ts
// app/api/v1/projects/[id]/route.ts
// [CUSTOMIZE] Replace "Project" with your resource
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

const updateBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
});

// --- GET /api/v1/projects/:id ---

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);

  const project = await db.project.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
  });

  if (!project) {
    throw new AppError(404, 'NOT_FOUND', 'Project not found');
  }

  return NextResponse.json({ data: project });
}

// --- PATCH /api/v1/projects/:id ---

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);

  const project = await db.project.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
  });
  if (!project) {
    throw new AppError(404, 'NOT_FOUND', 'Project not found');
  }

  const body = await req.json();
  const validated = updateBodySchema.parse(body);

  const updated = await db.project.update({
    where: { id: params.id },
    data: validated,
  });

  return NextResponse.json({ data: updated });
}

// --- DELETE /api/v1/projects/:id (soft delete) ---

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);

  const project = await db.project.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
  });
  if (!project) {
    throw new AppError(404, 'NOT_FOUND', 'Project not found');
  }

  await db.project.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ data: null }, { status: 200 });
}
```

### Standard API response envelope

```ts
// lib/api-response.ts

// Success response
interface ApiSuccessResponse<T> {
  data: T;
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// Error response
interface ApiErrorResponse {
  error: {
    code: string;       // Machine-readable: "VALIDATION_ERROR"
    message: string;    // Human-readable: "Email is required"
    details?: Record<string, unknown>;
  };
}
```

### Rate limiting middleware

```ts
// middleware/rate-limit.ts
// [CUSTOMIZE] Adjust limits per endpoint
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Sliding window: 60 requests per 60 seconds
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: true,
});

export async function rateLimit(identifier: string) {
  const result = await rateLimiter.limit(identifier);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(result.reset / 1000 - Date.now() / 1000)),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    );
  }

  return null; // No rate limit hit
}
```

## Customization notes

- **Response envelope:** Always wrap data in `{ data: ... }` and errors in `{ error: { code, message } }`. This makes client-side handling consistent.
- **Cursor pagination:** The "fetch N+1" pattern avoids a separate count query. The extra row is only used to determine `hasMore`, then sliced off before returning.
- **Soft deletes:** Always filter by `deletedAt: null` in queries. Add a database index on `deleted_at` for performance.
- **Versioning:** Put the version in the URL path (`/api/v1/`). Only bump the major version when you introduce breaking changes. Run old and new versions in parallel during migration.
- **Validation:** Zod schemas serve double duty — they validate input and generate TypeScript types via `z.infer<typeof schema>`.

## Companion tools

| Tool | Use for |
|------|---------|
| `wshobson/claude-code-workflows` → `backend-development` | Scaffolding API routes from schema definitions |
| Postman / Bruno | Manual API testing and documentation |
| Zod | Runtime validation + TypeScript type inference |
| @upstash/ratelimit | Redis-based rate limiting with sliding window |
