# Database Selection Guide

## When to use
Consult this guide when choosing a primary database, adding a caching layer, or evaluating whether to add a secondary datastore to your stack.

## Decision framework

### The default: PostgreSQL

PostgreSQL is the correct choice for ~80% of web applications. Start here and only deviate when you hit a clear signal.

```
START: Do you need a database?
│
├─ YES ──→ Q1: Is your data primarily relational (users, orders, products, etc.)?
│  │
│  ├─ YES ──→ ✅ PostgreSQL
│  │   (JSONB for semi-structured, full-text search built-in, scales to millions of rows)
│  │
│  └─ NO ──→ Q2: What does your data look like?
│     │
│     ├─ Deeply nested documents, no relations ──→ ✅ MongoDB
│     │   (CMS content, IoT events, catalogs with wildly different schemas)
│     │
│     ├─ Key-value, cache, sessions, queues ──→ ✅ Redis / Valkey
│     │   (Sub-ms reads, pub/sub, rate limiting, ephemeral data)
│     │
│     ├─ Edge / embedded / local-first ──→ ✅ SQLite via Turso
│     │   (Zero-config, edge replication, offline support)
│     │
│     └─ Time-series / analytics ──→ ✅ TimescaleDB (Postgres extension)
│         (Stay in Postgres ecosystem, hypertables for time data)
│
└─ Also need full-text search?
   │
   ├─ Basic (< 1M docs) ──→ Postgres pg_trgm + GIN indexes
   ├─ Advanced (facets, typo tolerance) ──→ Typesense or Meilisearch
   └─ Enterprise scale ──→ Elasticsearch (but consider the operational cost)
```

### Comparison table

| Criteria | PostgreSQL | MongoDB | SQLite/Turso | Redis |
|----------|-----------|---------|-------------|-------|
| **Data model** | Relational + JSON | Document | Relational | Key-value / structures |
| **Best for** | Everything except below | Schema-less docs, CMS | Edge, embedded, local-first | Cache, sessions, queues |
| **Scaling** | Vertical first, read replicas, partitioning | Horizontal sharding built-in | Edge replication (Turso) | Clustering, Redis Sentinel |
| **ACID transactions** | Full | Multi-document (since 4.0) | Full (per-connection) | Partial (Lua scripts) |
| **Query language** | SQL (powerful) | MQL / aggregation pipeline | SQL | Commands API |
| **JSON support** | JSONB (indexed, queryable) | Native (is JSON) | JSON functions | JSON module |
| **TypeScript ORM** | Drizzle, Prisma, Kysely | Prisma, Mongoose | Drizzle, Prisma, better-sqlite3 | ioredis, redis |
| **Managed options** | Supabase, Neon, RDS, Railway | Atlas | Turso, Cloudflare D1 | Upstash, Redis Cloud, ElastiCache |
| **Free tier** | Supabase (500MB), Neon (512MB) | Atlas (512MB) | Turso (9GB), D1 (5GB) | Upstash (10K cmds/day) |
| **Operational complexity** | Low-Medium | Medium-High | Very low | Low |

### ORM selection

| ORM | Best for | Trade-off |
|-----|----------|-----------|
| **Drizzle** | Production apps, performance-sensitive | SQL-like syntax (pro for some, con for others) |
| **Prisma** | Rapid prototyping, teams, schema visualization | Heavier runtime, slower raw queries, custom Rust engine |
| **Kysely** | SQL lovers who want type safety | No schema management, query-builder only |
| **better-sqlite3** | SQLite direct access | Node.js only, no edge runtime |

### Managed Postgres comparison

| Provider | Free tier | Paid from | Branching | Edge | Connection pooling |
|----------|-----------|-----------|-----------|------|-------------------|
| **Supabase** | 500 MB, 2 projects | $25/mo | No | No (direct) | Built-in (Supavisor) |
| **Neon** | 512 MB, branching | $19/mo | Yes (instant) | No | Built-in |
| **PlanetScale** | MySQL only | $39/mo | Yes | No | Built-in |
| **Railway** | Trial credits | ~$5/mo | No | No | Add PgBouncer |
| **Vercel Postgres** | 256 MB | $20/mo (Vercel Pro) | No | Via Neon | Via Neon |

## Copy-paste template

### PostgreSQL with Drizzle ORM (recommended)

```typescript
// drizzle.config.ts
// ---- CUSTOMIZE: Update your database connection ----
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ← Set in .env
  },
});
```

```typescript
// src/db/index.ts — Database client
// ---- CUSTOMIZE: Connection pooling for serverless ----
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For serverless (Vercel, Cloudflare): use connection pooling
const client = postgres(connectionString, {
  max: 1,           // ← CUSTOMIZE: 1 for serverless, 10-20 for long-running
  idle_timeout: 20, // ← CUSTOMIZE: seconds before closing idle connections
});

export const db = drizzle(client, { schema });
```

```typescript
// src/db/schema.ts — Example schema
// ---- CUSTOMIZE: Define your tables ----
import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations (for query builder)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

```typescript
// src/db/queries.ts — Common query patterns
// ---- CUSTOMIZE: Add your queries ----
import { eq, desc, and, ilike } from "drizzle-orm";
import { db } from "./index";
import { users, posts } from "./schema";

// Get user with posts
export async function getUserWithPosts(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { posts: { orderBy: [desc(posts.createdAt)] } },
  });
}

// Search posts
export async function searchPosts(query: string, limit = 20) {
  return db.query.posts.findMany({
    where: and(
      eq(posts.published, true),
      ilike(posts.title, `%${query}%`)
    ),
    limit,
    orderBy: [desc(posts.createdAt)],
  });
}
```

```bash
# Install dependencies
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Redis caching layer (via Upstash for serverless)

```typescript
// src/lib/cache.ts
// ---- CUSTOMIZE: Update URL and token ----
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,    // ← Set in .env
  token: process.env.UPSTASH_REDIS_REST_TOKEN!, // ← Set in .env
});

// Generic cache helper
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = await redis.get<T>(key);
  if (existing) return existing;

  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttlSeconds });
  return fresh;
}

// Usage example:
// const user = await cached(`user:${id}`, 300, () => getUserById(id));
```

```bash
# Install dependencies
npm install @upstash/redis
```

### SQLite via Turso (edge/local-first)

```typescript
// src/db/index.ts
// ---- CUSTOMIZE: Update your Turso credentials ----
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,     // ← Set in .env
  authToken: process.env.TURSO_AUTH_TOKEN!,  // ← Set in .env
});

export const db = drizzle(client, { schema });
```

```bash
# Install dependencies
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit

# Create Turso database
turso db create my-app
turso db tokens create my-app
```

## Customization notes

- **Connection pooling:** Essential for serverless. Supabase has Supavisor built-in; Neon has built-in pooling; for Railway or self-hosted, add PgBouncer.
- **Branching (Neon):** Use database branching for preview environments. Each PR gets its own database copy without extra cost.
- **Row-Level Security (Supabase):** If using Supabase, use RLS policies instead of application-level access control for multi-tenant apps.
- **Migrations in CI:** Always run `drizzle-kit migrate` in your CI/CD pipeline, never manually in production. Add a migration check step before deploy.
- **When to add Redis:** Add Redis when you need sub-millisecond reads for hot data, rate limiting, session storage, or pub/sub. Don't add it preemptively.
- **MongoDB is rarely the right choice** for a typical web app. If your data has relationships (users have orders, orders have items), PostgreSQL with JSONB columns handles it better.

## Companion tools

- **`alirezarezvani/claude-skills` → `senior-architect`** — Use for database scaling strategies, sharding decisions, and multi-database architecture review.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Validates schema design, checks for missing indexes, and reviews query patterns.
