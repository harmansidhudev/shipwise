# Caching Strategy

## When to use
Reference this when adding cache headers to API responses, implementing Redis caching for expensive queries, or configuring CDN caching for static assets.

## Decision framework

```
What am I caching?
├── Static assets (JS, CSS, images, fonts)
│   → Long-lived immutable cache + CDN
│   → Cache-Control: public, max-age=31536000, immutable
│
├── HTML pages (SSR / SSG)
│   → Short stale-while-revalidate at CDN
│   → Cache-Control: public, s-maxage=60, stale-while-revalidate=300
│
├── API responses (public, same for all users)
│   → CDN cache with short TTL
│   → Cache-Control: public, s-maxage=30, stale-while-revalidate=60
│
├── API responses (per-user, authenticated)
│   → Redis application cache, NOT CDN
│   → Cache-Control: private, no-store
│
├── Expensive database queries / aggregations
│   → Redis with TTL + invalidation on writes
│
└── Session data / rate limit counters
    → Redis with TTL
```

## Copy-paste template

### HTTP cache headers configuration (Next.js)

```ts
// middleware.ts — set default cache headers
// [CUSTOMIZE] Adjust TTLs and paths to match your routes
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Static assets — immutable, cache forever (fingerprinted filenames handle busting)
  if (pathname.startsWith('/_next/static/') || pathname.match(/\.(ico|svg|png|jpg|webp|woff2?)$/)) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  }

  // Public API endpoints — short CDN cache with revalidation
  if (pathname.startsWith('/api/v1/public/')) {
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  }

  // Authenticated API endpoints — never cache at CDN
  if (pathname.startsWith('/api/v1/')) {
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

  // HTML pages — short CDN cache with stale-while-revalidate
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
```

### Redis caching utility

```ts
// lib/cache.ts
// [CUSTOMIZE] Adjust Redis connection and default TTL
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const DEFAULT_TTL = 300; // 5 minutes in seconds

interface CacheOptions {
  ttl?: number;        // TTL in seconds
  prefix?: string;     // Key prefix for namespace isolation
}

/**
 * Cache-aside pattern: check cache first, compute on miss, store result.
 */
export async function cacheable<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, prefix = 'app' } = options;
  const cacheKey = `${prefix}:${key}`;

  // 1. Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // 2. Cache miss — compute value
  const value = await fetcher();

  // 3. Store in cache (don't await — fire and forget)
  redis.set(cacheKey, JSON.stringify(value), 'EX', ttl).catch((err) => {
    console.warn('[Cache] Failed to set:', cacheKey, err);
  });

  return value;
}

/**
 * Invalidate cache keys matching a pattern.
 */
export async function invalidateCache(pattern: string, prefix = 'app'): Promise<void> {
  const fullPattern = `${prefix}:${pattern}`;
  const keys = await redis.keys(fullPattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Invalidate specific cache key.
 */
export async function invalidateKey(key: string, prefix = 'app'): Promise<void> {
  await redis.del(`${prefix}:${key}`);
}
```

**Usage in an API route:**

```ts
// app/api/v1/public/stats/route.ts
import { NextResponse } from 'next/server';
import { cacheable, invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';

export async function GET() {
  // [CUSTOMIZE] Replace with your expensive query
  const stats = await cacheable(
    'public:stats',
    async () => {
      const [userCount, projectCount, taskCount] = await Promise.all([
        db.user.count({ where: { deletedAt: null } }),
        db.project.count({ where: { deletedAt: null } }),
        db.task.count({ where: { deletedAt: null } }),
      ]);
      return { users: userCount, projects: projectCount, tasks: taskCount };
    },
    { ttl: 60 } // 1 minute
  );

  return NextResponse.json({ data: stats });
}
```

**Invalidation on write:**

```ts
// In your create/update/delete handlers:
import { invalidateCache } from '@/lib/cache';

// After creating a project:
await invalidateCache('public:stats');
await invalidateCache(`user:${userId}:projects:*`);
```

### Per-user caching pattern

```ts
// features/dashboard/api/get-dashboard.ts
// [CUSTOMIZE] Replace with your per-user data shape
import { cacheable, invalidateKey } from '@/lib/cache';

export async function getDashboardData(userId: string) {
  return cacheable(
    `user:${userId}:dashboard`,
    async () => {
      const [projects, recentTasks, notifications] = await Promise.all([
        db.project.findMany({
          where: { userId, deletedAt: null },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        }),
        db.task.findMany({
          where: { assigneeId: userId, deletedAt: null },
          take: 10,
          orderBy: { updatedAt: 'desc' },
        }),
        db.notification.findMany({
          where: { userId, readAt: null },
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      return { projects, recentTasks, notifications };
    },
    { ttl: 120 } // 2 minutes
  );
}

// Invalidate when user's data changes:
export async function onProjectUpdate(userId: string) {
  await invalidateKey(`user:${userId}:dashboard`);
}
```

### ETag-based caching for API responses

```ts
// lib/etag.ts
// [CUSTOMIZE] Use for API responses that rarely change
import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export function withETag(req: NextRequest, data: unknown): NextResponse {
  const body = JSON.stringify({ data });
  const etag = `"${createHash('md5').update(body).digest('hex')}"`;

  // Check If-None-Match header
  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: etag },
    });
  }

  return NextResponse.json({ data }, {
    headers: {
      ETag: etag,
      'Cache-Control': 'private, no-cache', // Always revalidate, but use ETag
    },
  });
}
```

## Customization notes

- **`s-maxage` vs `max-age`:** `s-maxage` controls CDN/proxy cache duration. `max-age` controls browser cache. Use `s-maxage` for CDN caching while keeping browser cache short or disabled.
- **`stale-while-revalidate`:** Serves stale content immediately while fetching fresh data in the background. Essential for good UX — users never see loading spinners for cached pages.
- **Redis key patterns:** Use colons as namespace separators (`user:123:dashboard`). This makes `KEYS` pattern matching and bulk invalidation predictable.
- **Fire-and-forget writes:** Cache SET operations should not block the response. If Redis is down, the app still works (just slower).
- **Cache stampede prevention:** For high-traffic endpoints, use a lock (Redis SETNX) to ensure only one request recomputes the value on cache miss. Others wait for the result.

## Companion tools

| Tool | Use for |
|------|---------|
| Redis / Upstash | Application-level caching, rate limiting, sessions |
| Vercel / Cloudflare | Edge CDN with automatic cache header handling |
| `wshobson/claude-code-workflows` → `backend-development` | Setting up caching infrastructure |
