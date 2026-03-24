# Database Migration Guide

## When to use
Reference this when creating new database tables, modifying existing schemas, writing migrations, or planning zero-downtime schema changes.

## Decision framework

```
What kind of schema change am I making?
├── Adding a new table → Standard migration, no downtime concern
├── Adding a nullable column → Safe, single migration
├── Adding a NOT NULL column → Add nullable first, backfill, then add constraint
├── Renaming a column → Expand-contract (3 migrations over 2+ deploys)
├── Dropping a column → Remove from code first, drop column in later migration
├── Changing column type → Expand-contract
└── Adding an index → Use CONCURRENTLY (Postgres) to avoid table locks
```

**Expand-contract pattern for zero-downtime changes:**
1. **Expand:** Add new column/table alongside the old one
2. **Migrate:** Backfill data, update code to write to both old and new
3. **Switch:** Update code to read from new, stop writing to old
4. **Contract:** Drop old column/table in a separate migration

## Copy-paste template

### Prisma — schema and migration

```prisma
// prisma/schema.prisma
// [CUSTOMIZE] Replace model names, fields, and relations with your domain

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  avatarUrl   String?  @map("avatar_url")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  projects         Project[]
  teamMemberships  TeamMember[]

  @@map("users")
  @@index([email])
  @@index([deletedAt])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("draft") // "draft" | "active" | "archived"
  userId      String   @map("user_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  user        User     @relation(fields: [userId], references: [id])
  tasks       Task[]
  teamMembers TeamMember[]

  @@map("projects")
  @@index([userId])
  @@index([status])
  @@index([deletedAt])
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("todo") // "todo" | "in_progress" | "done"
  priority    Int      @default(0)
  projectId   String   @map("project_id")
  assigneeId  String?  @map("assignee_id")
  dueDate     DateTime? @map("due_date")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  project     Project  @relation(fields: [projectId], references: [id])

  @@map("tasks")
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([deletedAt])
}

model TeamMember {
  id        String   @id @default(cuid())
  role      String   @default("member") // "owner" | "admin" | "member" | "viewer"
  userId    String   @map("user_id")
  projectId String   @map("project_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
  @@map("team_members")
  @@index([projectId])
}
```

**Create and run a Prisma migration:**

```bash
# Generate migration SQL from schema changes
npx prisma migrate dev --name add_projects_and_tasks

# Apply pending migrations in production
npx prisma migrate deploy

# Reset database (dev only — destroys data)
npx prisma migrate reset
```

**Prisma seed file:**

```ts
// prisma/seed.ts
// [CUSTOMIZE] Replace with your seed data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'dev@example.com' },
    update: {},
    create: {
      email: 'dev@example.com',
      name: 'Dev User',
      projects: {
        create: {
          name: 'My First Project',
          status: 'active',
          tasks: {
            create: [
              { title: 'Set up database', status: 'done' },
              { title: 'Build API routes', status: 'in_progress' },
              { title: 'Deploy to production', status: 'todo' },
            ],
          },
        },
      },
    },
  });
  console.log(`Seeded user: ${user.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
```

### Drizzle — schema and migration

```ts
// db/schema.ts
// [CUSTOMIZE] Replace table names and columns with your domain
import { pgTable, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  deletedAtIdx: index('users_deleted_at_idx').on(table.deletedAt),
}));

export const projects = pgTable('projects', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('draft').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('projects_user_id_idx').on(table.userId),
  statusIdx: index('projects_status_idx').on(table.status),
  deletedAtIdx: index('projects_deleted_at_idx').on(table.deletedAt),
}));

export const tasks = pgTable('tasks', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(),
  priority: integer('priority').default(0).notNull(),
  projectId: text('project_id').notNull().references(() => projects.id),
  assigneeId: text('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
  assigneeIdIdx: index('tasks_assignee_id_idx').on(table.assigneeId),
  statusIdx: index('tasks_status_idx').on(table.status),
  deletedAtIdx: index('tasks_deleted_at_idx').on(table.deletedAt),
}));
```

**Generate and run Drizzle migrations:**

```bash
# Generate migration SQL from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio for visual inspection
npx drizzle-kit studio
```

**Drizzle config:**

```ts
// drizzle.config.ts
// [CUSTOMIZE] Set your database connection and schema path
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Zero-downtime column rename (3-step expand-contract)

**Step 1 — Expand (Migration 1):**
```sql
-- Add new column alongside old one
ALTER TABLE projects ADD COLUMN display_name TEXT;

-- Backfill from old column
UPDATE projects SET display_name = name WHERE display_name IS NULL;

-- Add trigger to keep both in sync during transition
CREATE OR REPLACE FUNCTION sync_project_name() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.display_name IS NULL THEN
      NEW.display_name := NEW.name;
    END IF;
    IF NEW.name IS NULL THEN
      NEW.name := NEW.display_name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_name_sync
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION sync_project_name();
```

**Step 2 — Switch (deploy code changes):**
- Update all reads to use `display_name`
- Update all writes to write to `display_name`
- Deploy and verify

**Step 3 — Contract (Migration 2, deployed after Step 2 is stable):**
```sql
-- Remove sync trigger
DROP TRIGGER IF EXISTS project_name_sync ON projects;
DROP FUNCTION IF EXISTS sync_project_name();

-- Drop old column
ALTER TABLE projects DROP COLUMN name;
```

## Customization notes

- **CUID2 vs UUID v7:** CUID2 is shorter and URL-friendly. UUID v7 is time-sortable and native to Postgres 17+. Both are good choices for distributed systems. Avoid auto-increment IDs — they leak business information and cause issues in distributed setups.
- **Soft deletes:** Add `deleted_at` to every table that stores user data. Index it. Filter by `deleted_at IS NULL` in all queries. Add a scheduled job to hard-delete records older than your retention policy.
- **Index strategy:** Index every foreign key. Index columns used in WHERE and ORDER BY. For multi-column queries, create composite indexes with the most selective column first.
- **Migration naming:** Use descriptive names: `add_projects_table`, `add_display_name_to_projects`, `drop_legacy_name_column`.

## Companion tools

| Tool | Use for |
|------|---------|
| Prisma Migrate | Schema-first migrations with TypeScript client generation |
| Drizzle Kit | SQL-first migrations with lightweight TypeScript ORM |
| pgAdmin / Postico | Visual database inspection and query execution |
| `wshobson/claude-code-workflows` → `backend-development` | Generating schema definitions and migrations |
