# Testing Pyramid

## When to use

Reference this when deciding what types of tests to write for new features, setting up a test suite from scratch, or auditing an existing test suite for proper coverage distribution.

## Decision framework

```
What am I testing?
├── A pure function with inputs and outputs?
│   → Unit test (Vitest)
├── A calculation, validation, or data transformation?
│   → Unit test (Vitest)
├── An API route that touches the database?
│   → Integration test (Vitest + real DB)
├── An auth flow (login, signup, password reset)?
│   → Integration test (Vitest + real DB)
├── A service calling another service?
│   → Integration test (Vitest + real or stubbed service)
├── One of the 4 critical user paths?
│   → E2E test (Playwright)
│   Critical paths: signup, core action, payment, auth
└── A UI component rendering correctly?
    → Skip it. Test the logic behind the component instead.
```

### Target distribution

```
        ┌─────────┐
        │   E2E   │  10% — 4 critical paths only
        │  (slow) │  < 30s per test
        ├─────────┤
        │ Integr- │  20% — API routes, DB queries, auth
        │  ation  │  < 2s per test
        ├─────────┤
        │  Unit   │  70% — pure functions, business logic
        │ (fast)  │  < 10ms per test
        └─────────┘
```

## Copy-paste template

### Vitest configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e.ts', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/index.ts',
      ],
      thresholds: {
        // [CUSTOMIZE] Adjust thresholds as your project matures
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test setup file

```ts
// src/test/setup.ts
import { beforeAll, afterAll } from 'vitest';

// [CUSTOMIZE] Add global test setup here
// Example: connect to test DB, seed data, configure mocks

beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
});
```

### Unit test example — business logic

```ts
// src/features/billing/utils/calculate-discount.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './calculate-discount';

describe('calculateDiscount', () => {
  it('applies flat discount', () => {
    expect(calculateDiscount(100, { type: 'flat', value: 15 })).toBe(85);
  });

  it('applies percentage discount', () => {
    expect(calculateDiscount(200, { type: 'percent', value: 10 })).toBe(180);
  });

  it('never returns negative total', () => {
    expect(calculateDiscount(10, { type: 'flat', value: 50 })).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateDiscount(99.99, { type: 'percent', value: 33.33 })).toBe(66.66);
  });

  it('throws on invalid discount type', () => {
    expect(() =>
      calculateDiscount(100, { type: 'bogus' as any, value: 10 })
    ).toThrow('Invalid discount type');
  });
});
```

### Unit test example — permission check

```ts
// src/features/auth/utils/check-permission.test.ts
import { describe, it, expect } from 'vitest';
import { canUserAccess } from './check-permission';

describe('canUserAccess', () => {
  const adminUser = { id: '1', role: 'admin', orgId: 'org-1' };
  const memberUser = { id: '2', role: 'member', orgId: 'org-1' };
  const otherOrgUser = { id: '3', role: 'admin', orgId: 'org-2' };

  it('allows admin to access any resource in their org', () => {
    expect(canUserAccess(adminUser, { orgId: 'org-1', action: 'delete' })).toBe(true);
  });

  it('allows member to read resources in their org', () => {
    expect(canUserAccess(memberUser, { orgId: 'org-1', action: 'read' })).toBe(true);
  });

  it('denies member write access', () => {
    expect(canUserAccess(memberUser, { orgId: 'org-1', action: 'delete' })).toBe(false);
  });

  it('denies access to different org', () => {
    expect(canUserAccess(otherOrgUser, { orgId: 'org-1', action: 'read' })).toBe(false);
  });
});
```

### Integration test example — API route with DB

```ts
// src/features/invoices/api/create-invoice.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDb, teardownTestDb, cleanTables } from '@/test/helpers/db';
import { createTestUser } from '@/test/fixtures/users';
import { app } from '@/app';

describe('POST /api/v1/invoices', () => {
  let db: Awaited<ReturnType<typeof setupTestDb>>;
  let authToken: string;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await cleanTables(db);
    // Create a test user and get auth token
    const user = await createTestUser(db, {
      email: 'invoicer@example.com',
      password: 'SecureP@ss1',
    });
    authToken = user.token;
  });

  it('creates an invoice and returns 201', async () => {
    const res = await app.request('/api/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        customerEmail: 'client@example.com',
        items: [{ description: 'Consulting', quantity: 2, unitPrice: 150 }],
        dueDate: '2026-04-30',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.invoice).toMatchObject({
      customerEmail: 'client@example.com',
      status: 'draft',
      total: 300,
    });
    expect(body.invoice.id).toBeDefined();
  });

  it('returns 401 without auth token', async () => {
    const res = await app.request('/api/v1/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: 'client@example.com',
        items: [{ description: 'Consulting', quantity: 1, unitPrice: 100 }],
      }),
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await app.request('/api/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toBeDefined();
  });
});
```

### Database test helper

```ts
// src/test/helpers/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// [CUSTOMIZE] Replace with your ORM and connection details
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
  ?? 'postgresql://test:test@localhost:5433/testdb';

let pool: Pool;

export async function setupTestDb() {
  pool = new Pool({ connectionString: TEST_DATABASE_URL });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}

export async function teardownTestDb() {
  await pool.end();
}

export async function cleanTables(db: ReturnType<typeof drizzle>) {
  // [CUSTOMIZE] List tables in dependency order (children first)
  await db.execute(`TRUNCATE invoice_items, invoices, users CASCADE`);
}
```

### Test fixture factory

```ts
// src/test/fixtures/users.ts
import { hash } from 'bcrypt';

// [CUSTOMIZE] Adapt to your user model and ORM
export async function createTestUser(
  db: any,
  overrides: { email?: string; password?: string; role?: string } = {},
) {
  const defaults = {
    email: 'test@example.com',
    password: 'SecureP@ss1',
    role: 'member',
  };
  const data = { ...defaults, ...overrides };
  const passwordHash = await hash(data.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      role: data.role,
    })
    .returning();

  // Generate a real token for integration tests
  const token = generateTestToken(user.id);

  return { ...user, token };
}
```

## Customization notes

- **ORM**: Examples use Drizzle ORM. Adapt `setupTestDb` and `cleanTables` for Prisma, Knex, or your ORM of choice.
- **Test database**: Use Docker Compose to spin up a Postgres container on a non-standard port (5433) so it doesn't conflict with your dev database. Add `docker-compose.test.yml` to your project.
- **Coverage thresholds**: Start at 60% and ratchet up as you add tests. Never lower thresholds once set.
- **CI**: Run `vitest run --coverage` in your CI pipeline. Fail the build if coverage drops below thresholds.

## Companion tools

| Tool | Use for |
|------|---------|
| `anthropics/claude-code` -> `webapp-testing` | Generating test scaffolds and test data factories |
| `obra/superpowers` -> `test-driven-development` | TDD red-green-refactor workflow |
| Vitest UI (`vitest --ui`) | Visual test runner for local development |
