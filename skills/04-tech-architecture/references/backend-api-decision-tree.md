# Backend API Decision Tree

## When to use
Consult this tree when deciding between REST, GraphQL, tRPC, and gRPC for your API layer.

## Decision framework

### Primary decision flowchart

```
START: What is your setup?
│
├─ Q1: Is your frontend and backend in the same TypeScript monorepo?
│  │
│  ├─ YES ──→ Q2: Is your only client a web app you control?
│  │  │
│  │  ├─ YES ──→ ✅ tRPC
│  │  │   (Full type safety, zero API layer, fastest iteration)
│  │  │
│  │  └─ NO ──→ Q3: Do you also need a public API?
│  │     │
│  │     ├─ YES ──→ ✅ tRPC (internal) + REST/OpenAPI (public)
│  │     │   (Type safety internally, standard API externally)
│  │     │
│  │     └─ NO ──→ ✅ tRPC
│  │
│  └─ NO ──→ Q4: Will you have multiple client types?
│     │
│     ├─ YES (web + mobile + third-party)
│     │  │
│     │  └─ Q5: Do different clients need very different data shapes?
│     │     │
│     │     ├─ YES ──→ ✅ GraphQL
│     │     │   (Clients request exactly the data they need)
│     │     │
│     │     └─ NO ──→ ✅ REST + OpenAPI
│     │         (Universal compatibility, auto-generated SDKs)
│     │
│     └─ NO (single client or internal)
│        │
│        └─ Q6: Is this service-to-service communication?
│           │
│           ├─ YES ──→ Q7: Is low latency critical? (< 10ms)
│           │  │
│           │  ├─ YES ──→ ✅ gRPC
│           │  │   (Binary protocol, streaming, 10x faster than JSON)
│           │  │
│           │  └─ NO ──→ ✅ REST (internal)
│           │
│           └─ NO ──→ ✅ REST
│               (Simplest option, most tooling, easiest to debug)
```

### Comparison table

| Criteria | REST | GraphQL | tRPC | gRPC |
|----------|------|---------|------|------|
| **Type safety** | Manual (OpenAPI codegen) | Schema-based (codegen) | Full (inferred, zero codegen) | Schema-based (protobuf codegen) |
| **Learning curve** | Low | High | Low (if you know TS) | Medium-High |
| **Over/under-fetching** | Common problem | Solved (client chooses fields) | N/A (direct function calls) | N/A (defined messages) |
| **Caching** | Built-in (HTTP cache, CDN) | Complex (needs Apollo/urql) | SWR/React Query | Custom |
| **File uploads** | Simple (multipart) | Complex (needs spec extension) | Plugin-based | Streaming |
| **Real-time** | SSE / WebSocket addon | Subscriptions built-in | Subscriptions built-in | Bidirectional streaming |
| **Browser support** | Native fetch | Client library required | Client library required | Needs grpc-web proxy |
| **Debugging** | curl, browser, Postman | GraphQL playground | tRPC panel, dev tools | grpcurl, Postman |
| **API documentation** | OpenAPI/Swagger (auto) | Schema introspection | TypeScript types ARE the docs | Protobuf definitions |
| **Best for** | Public APIs, multi-platform | Complex data graphs, mobile | TS monorepos, full-stack | Microservices, high-perf |

### When to mix approaches

Mixing API styles is valid and common at scale:

- **tRPC + REST:** tRPC for your web app, REST/OpenAPI for public developer API
- **GraphQL + REST:** GraphQL for client-facing, REST for webhooks and simple integrations
- **REST + gRPC:** REST at the edge/API gateway, gRPC between internal services
- **GraphQL + gRPC:** GraphQL gateway federating multiple gRPC microservices

## Copy-paste template

### REST API with Hono (lightweight, edge-ready)

```typescript
// src/api/index.ts
// ---- CUSTOMIZE: Add your routes ----
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", logger());
app.use("*", cors());

// ---- CUSTOMIZE: Define your schemas ----
const createItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

// ---- CUSTOMIZE: Add your routes ----
app.get("/items", async (c) => {
  // const items = await db.query.items.findMany();
  return c.json({ items: [] });
});

app.post("/items", zValidator("json", createItemSchema), async (c) => {
  const data = c.req.valid("json");
  // const item = await db.insert(items).values(data).returning();
  return c.json({ item: data }, 201);
});

app.get("/items/:id", async (c) => {
  const id = c.req.param("id");
  // const item = await db.query.items.findFirst({ where: eq(items.id, id) });
  return c.json({ item: { id } });
});

export default app;
```

```bash
# Install dependencies
npm install hono @hono/zod-validator zod
```

### tRPC setup (Next.js App Router)

```typescript
// src/server/trpc.ts — tRPC initialization
// ---- CUSTOMIZE: Add your auth context ----
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.context<{ userId?: string }>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ---- CUSTOMIZE: Add your auth check ----
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { userId: ctx.userId } });
});
```

```typescript
// src/server/routers/items.ts — Example router
// ---- CUSTOMIZE: Replace with your domain ----
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const itemsRouter = router({
  list: publicProcedure.query(async () => {
    // return await db.query.items.findMany();
    return [];
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // return await db.insert(items).values({ ...input, userId: ctx.userId });
      return { ...input, id: "new-id" };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // return await db.query.items.findFirst({ where: eq(items.id, input.id) });
      return { id: input.id };
    }),
});
```

```bash
# Install dependencies
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next superjson zod
```

### GraphQL with Pothos (code-first, type-safe)

```typescript
// src/graphql/builder.ts
// ---- CUSTOMIZE: Add your context type ----
import SchemaBuilder from "@pothos/core";

interface Context {
  userId?: string;
}

export const builder = new SchemaBuilder<{ Context: Context }>({});
```

```typescript
// src/graphql/schema.ts
// ---- CUSTOMIZE: Define your types and resolvers ----
import { builder } from "./builder";

// Define types
const Item = builder.objectRef<{ id: string; name: string; description?: string }>("Item");

Item.implement({
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
  }),
});

// Define queries
builder.queryType({
  fields: (t) => ({
    items: t.field({
      type: [Item],
      resolve: async () => {
        // return await db.query.items.findMany();
        return [];
      },
    }),
    item: t.field({
      type: Item,
      nullable: true,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_, { id }) => {
        // return await db.query.items.findFirst({ where: eq(items.id, id) });
        return { id, name: "Example" };
      },
    }),
  }),
});

export const schema = builder.toSchema();
```

```bash
# Install dependencies
npm install @pothos/core graphql graphql-yoga
```

## Customization notes

- **If you start with REST and later need GraphQL:** This is a common migration path. Keep your REST endpoints as a data layer and put GraphQL resolvers on top.
- **If you pick tRPC and later need a public API:** Add a REST layer alongside tRPC. They can share the same business logic and database queries.
- **If you're unsure about scale:** Start with REST. It's the easiest to reason about, cache, and debug. You can always add complexity later.
- **For real-time features:** All four approaches support real-time. REST uses SSE/WebSocket; GraphQL has subscriptions; tRPC has subscriptions; gRPC has bidirectional streaming. Pick based on your primary API style, not the real-time need.

## Companion tools

- **`alirezarezvani/claude-skills` → `senior-architect`** — Use for API design review, especially around pagination strategies, error handling patterns, and versioning.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Validates API layer structure, checks for consistent error handling, and reviews middleware patterns.
