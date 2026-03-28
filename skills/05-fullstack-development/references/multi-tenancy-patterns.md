# Multi-Tenancy Patterns

## When to use

Reference this document when building a B2B SaaS where multiple organizations (tenants) share the same application. Multi-tenancy is the architecture that lets one codebase serve multiple customers with data isolation between them. Choose your pattern before writing any database schema — retrofitting multi-tenancy is painful and error-prone.

---

## Decision framework

```
Do you need multi-tenancy?
├── B2B SaaS (teams, organizations, workspaces) → Yes
├── B2C SaaS (individual users only) → Usually no
├── Marketplace (multiple sellers) → Yes (sellers are tenants)
└── Internal tool (one company) → No

Which pattern?
├── Starting out, < 100 tenants, shared infrastructure
│   └── Shared database + tenant_id column (Pattern 1)
├── Need strong data isolation, compliance requirements
│   └── Postgres Row Level Security (Pattern 2)
├── Enterprise customers demand physical isolation
│   └── Schema-per-tenant (Pattern 3)
└── Unsure → Start with Pattern 1, migrate to Pattern 2 when needed
```

---

## Pattern 1: Shared Database + tenant_id Column

**When to use:** Starting out, < 1000 tenants, standard SaaS. Simplest pattern with lowest operational overhead.

**Tradeoffs:**
- Pros: Simple schema, easy migrations, shared connection pool, works with any ORM
- Cons: No database-level isolation (application must enforce), risk of data leaks if you forget a WHERE clause, harder to comply with data residency requirements

### Prisma example

```prisma
// schema.prisma

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  members   Member[]
  projects  Project[]
  createdAt DateTime @default(now())
}

model Member {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           MemberRole   @default(MEMBER)
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId])
  @@index([organizationId])
}

model Project {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

### Middleware to enforce tenant scoping

```typescript
// lib/tenant-middleware.ts
import { prisma } from './db';

// CRITICAL: Every query for tenant-scoped data MUST include organizationId.
// This middleware automatically injects it for findMany/findFirst/update/delete.

export function getTenantPrisma(organizationId: string) {
  return prisma.$extends({
    query: {
      project: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where, organizationId } as any;
          return query(args);
        },
        async delete({ args, query }) {
          args.where = { ...args.where, organizationId } as any;
          return query(args);
        },
      },
      // Repeat for every tenant-scoped model
    },
  });
}
```

### Usage in API route

```typescript
// app/api/projects/route.ts
import { auth } from '@/lib/auth';
import { getTenantPrisma } from '@/lib/tenant-middleware';

export async function GET() {
  const session = await auth();
  if (!session?.organizationId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getTenantPrisma(session.organizationId);
  const projects = await db.project.findMany(); // automatically scoped

  return Response.json(projects);
}
```

---

## Pattern 2: Postgres Row Level Security (RLS)

**When to use:** Need database-level isolation guarantees, compliance requirements, or defense-in-depth beyond application code. Most secure shared-database approach.

**Tradeoffs:**
- Pros: Database enforces isolation (even raw SQL can't leak), works with any client, auditable policies
- Cons: More complex setup, need to set session variables on every connection, debugging RLS policies can be tricky, some ORMs don't play well with RLS

### SQL setup

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_tenant_id', true);
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy: users can only see rows belonging to their tenant
CREATE POLICY tenant_isolation_select ON projects
  FOR SELECT
  USING (organization_id = current_tenant_id());

CREATE POLICY tenant_isolation_insert ON projects
  FOR INSERT
  WITH CHECK (organization_id = current_tenant_id());

CREATE POLICY tenant_isolation_update ON projects
  FOR UPDATE
  USING (organization_id = current_tenant_id())
  WITH CHECK (organization_id = current_tenant_id());

CREATE POLICY tenant_isolation_delete ON projects
  FOR DELETE
  USING (organization_id = current_tenant_id());

-- IMPORTANT: Create a separate role for the application (not superuser)
-- Superusers bypass RLS entirely
CREATE ROLE app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO app_user;
```

### Setting tenant context per request

```typescript
// lib/rls-middleware.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function withTenant<T>(
  tenantId: string,
  fn: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    // Set the tenant context for this connection
    await client.query("SET app.current_tenant_id = $1", [tenantId]);

    const result = await fn(client);
    return result;
  } finally {
    // Reset before returning to pool
    await client.query("RESET app.current_tenant_id");
    client.release();
  }
}
```

### Usage

```typescript
// app/api/projects/route.ts
import { withTenant } from '@/lib/rls-middleware';

export async function GET(req: Request) {
  const tenantId = await getTenantFromSession(req);

  const projects = await withTenant(tenantId, async (client) => {
    // RLS automatically filters — no WHERE clause needed
    const result = await client.query('SELECT * FROM projects');
    return result.rows;
  });

  return Response.json(projects);
}
```

---

## Pattern 3: Schema-per-Tenant

**When to use:** Enterprise customers demanding physical data isolation, data residency requirements, per-tenant backup/restore needs. Highest isolation but highest operational cost.

**Tradeoffs:**
- Pros: Complete data isolation, per-tenant backups, easy to migrate a tenant to their own server
- Cons: Schema migrations run N times (once per tenant), connection pooling is harder, more complex deployment, doesn't scale beyond ~100-500 tenants

### Setup

```sql
-- Create a schema for each tenant on signup
CREATE SCHEMA tenant_acme;
CREATE SCHEMA tenant_globex;

-- Create tables within the tenant schema
CREATE TABLE tenant_acme.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Set search_path per request to route queries
SET search_path TO tenant_acme, public;
```

### Connection routing

```typescript
// lib/tenant-schema.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function withTenantSchema<T>(
  tenantSlug: string,
  fn: (client: any) => Promise<T>
): Promise<T> {
  const schemaName = `tenant_${tenantSlug}`;
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schemaName}, public`);
    return await fn(client);
  } finally {
    await client.query('SET search_path TO public');
    client.release();
  }
}
```

### Migration script

```typescript
// scripts/migrate-all-tenants.ts
import { db } from '@/lib/db';

async function migrateAllTenants() {
  const tenants = await db.query("SELECT slug FROM organizations");

  for (const tenant of tenants.rows) {
    const schema = `tenant_${tenant.slug}`;
    console.log(`Migrating schema: ${schema}`);

    // Run migration SQL against each schema
    await db.query(`SET search_path TO ${schema}, public`);
    await db.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false`);
  }

  console.log(`Migrated ${tenants.rows.length} tenant schemas`);
}
```

---

## Organization Model Design: Org → Members → Roles

This pattern works with any of the three isolation strategies above.

### Data model

```
Organization (tenant)
├── Members (users who belong to this org)
│   ├── role: OWNER | ADMIN | MEMBER | VIEWER
│   └── userId → links to the auth provider's user
├── Invitations (pending invites)
│   ├── email, role, token, expiresAt
│   └── status: PENDING | ACCEPTED | EXPIRED
└── Resources (projects, documents, etc.)
    └── organizationId → scoped to this tenant
```

### Invitation flow

```typescript
// lib/invitations.ts
import { randomBytes } from 'crypto';
import { prisma } from './db';
import { sendEmail } from './email';

export async function createInvitation(
  organizationId: string,
  email: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER',
  invitedBy: string
) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      email,
      role,
      token,
      expiresAt,
      invitedBy,
    },
  });

  await sendEmail({
    to: email,
    subject: 'You've been invited to join a team',
    body: `Accept your invitation: ${process.env.APP_URL}/invite/${token}`,
  });

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation) throw new Error('Invalid invitation');
  if (invitation.expiresAt < new Date()) throw new Error('Invitation expired');
  if (invitation.status !== 'PENDING') throw new Error('Invitation already used');

  await prisma.$transaction([
    prisma.member.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { token },
      data: { status: 'ACCEPTED' },
    }),
  ]);
}
```

---

## Clerk Organizations Integration

If your project uses Clerk (check `project.stack.auth` in `shipwise-state.json`), Clerk provides built-in organization management.

### Setup

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

### Getting the active organization

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';

export default async function Dashboard() {
  const { orgId, orgRole } = await auth();

  if (!orgId) {
    // User hasn't selected an organization
    return <OrgSelector />;
  }

  // orgId is the tenant identifier — use it for all data queries
  const projects = await db.project.findMany({
    where: { organizationId: orgId },
  });

  return <ProjectList projects={projects} role={orgRole} />;
}
```

### Organization-scoped API routes

```typescript
// app/api/projects/route.ts
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return Response.json({ error: 'No org selected' }, { status: 403 });

  const projects = await prisma.project.findMany({
    where: { organizationId: orgId },
  });

  return Response.json(projects);
}
```

### Clerk organization roles

Clerk provides built-in roles: `org:admin` and `org:member`. Custom roles can be defined in the Clerk Dashboard under Organizations → Roles.

```typescript
// lib/permissions.ts
import { auth } from '@clerk/nextjs/server';

export async function requireAdmin() {
  const { orgRole } = await auth();
  if (orgRole !== 'org:admin') {
    throw new Error('Admin access required');
  }
}
```

---

## NextAuth/Auth.js with Custom Organization Model

If using Auth.js (NextAuth), you need to build the organization model yourself.

### Extended Prisma schema

```prisma
// Add to your existing Auth.js Prisma schema

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  members   Member[]
  createdAt DateTime @default(now())
}

model Member {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           MemberRole   @default(MEMBER)
  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId])
}
```

### Adding orgId to the session

```typescript
// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';

export const { auth, handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      // Load the user's active organization
      const membership = await prisma.member.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }, // default to most recent
      });

      session.organizationId = membership?.organizationId ?? null;
      session.organizationRole = membership?.role ?? null;
      return session;
    },
  },
});
```

### Organization switching

```typescript
// app/api/org/switch/route.ts
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const session = await auth();
  const { organizationId } = await req.json();

  // Verify user is a member of this org
  const membership = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  if (!membership) return Response.json({ error: 'Not a member' }, { status: 403 });

  // Store active org in a cookie (or in the user record)
  cookies().set('active-org', organizationId, { httpOnly: true, secure: true });

  return Response.json({ ok: true });
}
```

---

## Common Pitfalls

### 1. Data leaks between tenants

**The bug:** Forgetting to add `WHERE organization_id = ?` to a query, exposing one tenant's data to another.

**Prevention:**
- Use Prisma extensions or middleware to auto-inject tenant filtering (Pattern 1)
- Use RLS so the database enforces isolation (Pattern 2)
- Code review checklist: every query on a tenant-scoped table MUST include the tenant filter
- Write integration tests that create data in Org A and verify it's invisible from Org B

```typescript
// test/tenant-isolation.test.ts
test('tenant A cannot see tenant B data', async () => {
  const orgA = await createOrg('Org A');
  const orgB = await createOrg('Org B');

  await createProject(orgA.id, 'Project Alpha');

  const dbB = getTenantPrisma(orgB.id);
  const projects = await dbB.project.findMany();

  expect(projects).toHaveLength(0); // Org B sees nothing from Org A
});
```

### 2. N+1 queries across tenants

**The bug:** Admin dashboards or background jobs that iterate over tenants and run queries per tenant, causing N+1 query patterns.

**Prevention:**
- For admin/analytics queries, use a privileged connection that bypasses RLS and queries across tenants with explicit GROUP BY
- Batch operations: collect all tenant IDs, run one query with `WHERE organization_id IN (...)`
- For background jobs, process tenants in parallel with connection pooling limits

### 3. Migration complexity

**The bug:** Schema-per-tenant (Pattern 3) requires running every migration N times. One failure leaves tenants in inconsistent states.

**Prevention:**
- Wrap migrations in transactions
- Log success/failure per tenant
- Build a migration status dashboard
- Consider moving to Pattern 2 (RLS) if you have > 100 tenants — same isolation, single schema

### 4. Tenant context not set

**The bug:** A request handler forgets to set the tenant context, causing queries to return all data or no data.

**Prevention:**
- Set tenant context in middleware, not in individual route handlers
- Fail closed: if no tenant context is set, reject the request with 403
- Log warnings for any query that runs without tenant context

### 5. Superuser bypasses RLS

**The bug:** Your application connects as a Postgres superuser, which bypasses all RLS policies silently.

**Prevention:**
- Create a dedicated `app_user` role with limited privileges
- Never use the superuser role for application connections
- Test RLS policies by connecting as `app_user` explicitly

---

## Pattern selection summary

| Factor | Pattern 1 (tenant_id) | Pattern 2 (RLS) | Pattern 3 (schema) |
|--------|----------------------|------------------|---------------------|
| **Setup complexity** | Low | Medium | High |
| **Data isolation** | Application-level | Database-level | Physical |
| **Migration overhead** | One migration | One migration | N migrations |
| **Max tenants** | Unlimited | Unlimited | ~100-500 |
| **Per-tenant backup** | No | No | Yes |
| **Compliance** | Basic | Strong | Strongest |
| **Recommended for** | MVP, early stage | Growth stage, B2B | Enterprise contracts |
