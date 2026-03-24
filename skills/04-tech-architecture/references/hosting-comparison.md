# Hosting & Deployment Comparison

## When to use
Consult this guide when choosing where to deploy your application, comparing hosting costs, or evaluating whether to migrate platforms.

## Decision framework

### Primary decision flowchart

```
START: What are you deploying?
│
├─ Next.js app
│  │
│  ├─ Want zero-config, preview deploys, edge functions?
│  │  └─ ✅ Vercel (optimized for Next.js, built by the same team)
│  │
│  ├─ Need containers, background jobs, cron, or bundled database?
│  │  └─ ✅ Railway (simple Docker deploys, managed Postgres)
│  │
│  └─ Need multi-region, low-latency globally?
│     └─ ✅ Fly.io (edge deployment, global Postgres)
│
├─ Static site / Astro / SPA
│  └─ ✅ Cloudflare Pages (free, fastest CDN, edge functions via Workers)
│
├─ Node.js / Python / Go API (no frontend)
│  │
│  ├─ Simple deploy, managed database ──→ ✅ Railway
│  ├─ Need containers, GPUs, or custom infra ──→ ✅ Fly.io
│  └─ Need full AWS services ──→ ✅ AWS via SST
│
├─ Multi-service / Microservices
│  │
│  ├─ Want Kubernetes without managing it ──→ ✅ Fly.io Machines
│  └─ Need full control ──→ ✅ AWS ECS/EKS via SST or Pulumi
│
└─ Enterprise / Compliance requirements
   └─ ✅ AWS (SOC 2, HIPAA, FedRAMP available)
```

### Comparison table

| Criteria | Vercel | Railway | Fly.io | AWS (via SST) | Cloudflare Pages |
|----------|--------|---------|--------|---------------|-----------------|
| **Best for** | Next.js, frontend-first | Full-stack, databases included | Global edge, containers | Complex infra, enterprise | Static sites, edge functions |
| **Deploy method** | Git push | Git push or CLI | CLI (`fly deploy`) | CLI (`sst deploy`) | Git push |
| **Container support** | No (serverless only) | Yes (Nixpacks or Docker) | Yes (Docker) | Yes (ECS, Lambda, etc.) | No (Workers only) |
| **Managed database** | Via Neon (Postgres) | Postgres, MySQL, Redis | Postgres, Redis (LiteFS) | RDS, DynamoDB, Aurora | D1 (SQLite), KV, R2 |
| **Edge functions** | Yes (Edge Runtime) | No | Yes (Fly Machines) | Yes (Lambda@Edge, CloudFront) | Yes (Workers) |
| **Preview deploys** | Yes (per PR) | Yes (per PR) | No (manual) | No (manual) | Yes (per PR) |
| **Custom domains** | Yes (free) | Yes (free) | Yes (free) | Yes (Route 53) | Yes (free) |
| **SSL** | Auto | Auto | Auto | Auto (ACM) | Auto |
| **Cron jobs** | Vercel Cron | Yes (native) | Yes (Machines) | EventBridge / CloudWatch | Cron Triggers |
| **Background jobs** | Vercel Functions (limited) | Yes (worker processes) | Yes (Machines) | SQS + Lambda | Queues + Workers |
| **Websockets** | No (use third-party) | Yes | Yes | API Gateway WebSocket | Durable Objects |
| **Logs** | Basic (Runtime Logs) | Good (structured) | Good (structured) | CloudWatch (verbose) | Basic (Workers Logs) |
| **Monitoring** | Speed Insights, Analytics | Built-in metrics | Built-in metrics | CloudWatch, X-Ray | Analytics |
| **Team features** | Yes | Yes | Yes | IAM (complex) | Yes |
| **DX score** | 9/10 | 8/10 | 7/10 | 5/10 | 8/10 |

### Cost comparison

| Tier | Vercel | Railway | Fly.io | AWS | Cloudflare |
|------|--------|---------|--------|-----|------------|
| **Free** | 100GB bandwidth, 100K function invocations | $5 trial credit | $0 (pay as you go, free allowances) | Free tier (12 months) | Unlimited static, 100K Workers/day |
| **Hobby** ($5-25/mo) | Pro $20/mo: 1TB bandwidth, 1M invocations | Hobby $5/mo: 8GB RAM, 8 vCPU shared | ~$5-15/mo: 1 shared CPU, 256MB | ~$5-20/mo: t3.micro + S3 | Workers Paid $5/mo: 10M requests |
| **Startup** ($25-100/mo) | Pro $20/mo + overages | Pro $20/mo: usage-based | ~$30-80/mo: 2 CPUs, 1GB+, Postgres | ~$50-100/mo: t3.small + RDS | $5/mo + usage |
| **Growth** ($100-500/mo) | Enterprise (custom) | Pro + multiple services | ~$100-300/mo: multi-region | ~$200-500/mo: managed services | $5/mo + usage (scales well) |

### Detailed monthly cost breakdown examples

**Scenario A: Solo SaaS, 1K users, 50K pageviews/mo**

| Component | Vercel | Railway | Fly.io |
|-----------|--------|---------|--------|
| Compute | $20 (Pro plan) | $5 (Hobby) + ~$3 usage | ~$5 (shared-cpu-1x, 256MB) |
| Database | $0-19 (Neon free or Supabase) | ~$5 (Postgres plugin) | ~$7 (Postgres, 1GB) |
| Total | **~$20-39/mo** | **~$13/mo** | **~$12/mo** |

**Scenario B: Growing SaaS, 10K users, 500K pageviews/mo**

| Component | Vercel | Railway | Fly.io |
|-----------|--------|---------|--------|
| Compute | $20 + ~$20 overages | ~$20 (Pro) + ~$15 usage | ~$30 (dedicated-cpu-1x, 1GB) |
| Database | $25 (Supabase Pro or Neon) | ~$15 (Postgres 2GB) | ~$20 (Postgres, 2GB) |
| Redis | $10 (Upstash) | ~$5 (Redis plugin) | ~$7 (Upstash) |
| Total | **~$75/mo** | **~$55/mo** | **~$57/mo** |

**Scenario C: Scaling SaaS, 50K users, 2M pageviews/mo**

| Component | Vercel | Railway | Fly.io |
|-----------|--------|---------|--------|
| Compute | $20 + ~$100 overages | ~$20 + ~$60 usage | ~$80 (2x dedicated-cpu-2x, 2GB) |
| Database | $75 (Supabase/Neon Pro) | ~$40 (Postgres 4GB) | ~$50 (Postgres, 4GB, replica) |
| Redis | $20 (Upstash Pro) | ~$10 | ~$15 |
| CDN/bandwidth | Included | ~$10 | ~$15 |
| Total | **~$215/mo** | **~$140/mo** | **~$160/mo** |

## Copy-paste template

### Vercel deployment (Next.js)

```json
// vercel.json — Configuration
// ---- CUSTOMIZE: Update redirects, headers, and env ----
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/daily-cleanup",
      "schedule": "0 0 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/blog",
      "destination": "https://blog.example.com",
      "permanent": true
    }
  ]
}
```

```bash
# Deploy
npm i -g vercel
vercel            # Preview deploy
vercel --prod     # Production deploy

# Set environment variables
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
```

### Railway deployment

```json
// railway.json — Configuration (optional, Railway auto-detects)
// ---- CUSTOMIZE: Update start command and health check ----
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

```bash
# Deploy
npm i -g @railway/cli
railway login
railway init           # Link to project
railway up             # Deploy

# Add a Postgres database
railway add --plugin postgresql

# Set environment variables
railway variables set DATABASE_URL="..."
```

### Fly.io deployment

```toml
# fly.toml — Configuration
# ---- CUSTOMIZE: App name, region, VM size ----
app = "my-app"                    # ← CUSTOMIZE
primary_region = "iad"            # ← CUSTOMIZE: Nearest region to your users

[build]

[http_service]
  internal_port = 3000            # ← CUSTOMIZE: Your app's port
  force_https = true
  auto_stop_machines = "stop"     # Saves money: stops when no traffic
  auto_start_machines = true      # Starts on incoming request
  min_machines_running = 0        # ← CUSTOMIZE: Set to 1 for zero-downtime

[checks]
  [checks.health]
    type = "http"
    port = 3000
    path = "/api/health"          # ← CUSTOMIZE: Your health check path
    interval = "15s"
    timeout = "5s"

[[vm]]
  memory = "256mb"                # ← CUSTOMIZE: 256mb, 512mb, 1gb, 2gb, etc.
  cpu_kind = "shared"             # ← CUSTOMIZE: "shared" or "performance"
  cpus = 1
```

```dockerfile
# Dockerfile — Multi-stage build for Node.js
# ---- CUSTOMIZE: Node version, build commands ----
FROM node:20-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Deploy
curl -L https://fly.io/install.sh | sh
fly auth login
fly launch           # First time: creates app + fly.toml
fly deploy           # Subsequent deploys

# Add Postgres
fly postgres create
fly postgres attach my-app-db

# Set secrets
fly secrets set DATABASE_URL="..." CLERK_SECRET_KEY="..."

# Scale
fly scale count 2               # Run 2 instances
fly scale vm shared-cpu-1x      # Change VM size
```

### AWS via SST (Infrastructure as Code)

```typescript
// sst.config.ts — SST v3 configuration
// ---- CUSTOMIZE: App name, services, and resources ----
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "my-app",            // ← CUSTOMIZE
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: { region: "us-east-1" }, // ← CUSTOMIZE
      },
    };
  },
  async run() {
    // Database
    const database = new sst.aws.Postgres("Database", {
      scaling: {
        min: "0.5 ACU",           // ← CUSTOMIZE: Scales to zero
        max: "4 ACU",
      },
    });

    // Next.js app
    const web = new sst.aws.Nextjs("Web", {
      link: [database],
      environment: {
        DATABASE_URL: database.url,
        // ← CUSTOMIZE: Add your env vars
      },
    });

    return {
      url: web.url,
    };
  },
});
```

```bash
# Setup
npx sst@latest init
npx sst dev            # Local development with live Lambda
npx sst deploy --stage production
```

### Cost calculator template

```typescript
// scripts/estimate-hosting-cost.ts
// ---- CUSTOMIZE: Fill in your numbers ----
// Run with: npx tsx scripts/estimate-hosting-cost.ts

interface CostEstimate {
  provider: string;
  compute: number;
  database: number;
  cache: number;
  bandwidth: number;
  extras: number;
  total: number;
}

// ---- CUSTOMIZE: Your project's numbers ----
const PROJECT = {
  monthlyPageviews: 100_000,     // ← Your expected pageviews
  monthlyApiCalls: 500_000,      // ← Your expected API calls
  databaseSizeGB: 2,             // ← Expected database size
  needsRedis: true,              // ← Do you need caching?
  needsBackgroundJobs: false,    // ← Do you need workers?
  regions: 1,                    // ← How many regions?
};

function estimateVercel(): CostEstimate {
  const compute = 20; // Pro plan
  const functionOverage = Math.max(0, (PROJECT.monthlyApiCalls - 1_000_000) / 1_000_000) * 40;
  const database = PROJECT.databaseSizeGB <= 0.5 ? 0 : 25; // Neon free vs paid
  const cache = PROJECT.needsRedis ? 10 : 0; // Upstash
  const bandwidth = Math.max(0, (PROJECT.monthlyPageviews * 0.002 - 1000) / 1000) * 15; // ~2MB/page
  return {
    provider: "Vercel",
    compute: compute + functionOverage,
    database,
    cache,
    bandwidth,
    extras: 0,
    total: compute + functionOverage + database + cache + bandwidth,
  };
}

function estimateRailway(): CostEstimate {
  const basePlan = 5; // Hobby
  const computeUsage = (PROJECT.monthlyApiCalls / 1_000_000) * 5; // Rough estimate
  const database = PROJECT.databaseSizeGB * 5; // ~$5/GB
  const cache = PROJECT.needsRedis ? 5 : 0;
  return {
    provider: "Railway",
    compute: basePlan + computeUsage,
    database,
    cache,
    bandwidth: 0, // Included
    extras: 0,
    total: basePlan + computeUsage + database + cache,
  };
}

function estimateFlyio(): CostEstimate {
  const compute = 5 * PROJECT.regions; // shared-cpu-1x, 256MB per region
  const database = 7 + (PROJECT.databaseSizeGB - 1) * 5; // Base + storage
  const cache = PROJECT.needsRedis ? 7 : 0;
  const bandwidth = Math.max(0, (PROJECT.monthlyPageviews * 0.002 - 100) / 1000) * 0.02; // Outbound
  return {
    provider: "Fly.io",
    compute,
    database,
    cache,
    bandwidth,
    extras: 0,
    total: compute + database + cache + bandwidth,
  };
}

// Run estimates
const estimates = [estimateVercel(), estimateRailway(), estimateFlyio()];

console.log("\n--- Monthly Hosting Cost Estimate ---\n");
console.log(`Pageviews: ${PROJECT.monthlyPageviews.toLocaleString()}`);
console.log(`API calls: ${PROJECT.monthlyApiCalls.toLocaleString()}`);
console.log(`Database: ${PROJECT.databaseSizeGB}GB`);
console.log(`Redis: ${PROJECT.needsRedis ? "Yes" : "No"}`);
console.log(`Regions: ${PROJECT.regions}\n`);

estimates
  .sort((a, b) => a.total - b.total)
  .forEach((e) => {
    console.log(`${e.provider}: $${e.total.toFixed(0)}/mo`);
    console.log(`  Compute: $${e.compute.toFixed(0)} | DB: $${e.database.toFixed(0)} | Cache: $${e.cache.toFixed(0)} | BW: $${e.bandwidth.toFixed(0)}`);
    console.log();
  });
```

```bash
# Run the cost calculator
npm install -D tsx
npx tsx scripts/estimate-hosting-cost.ts
```

## Customization notes

- **Vercel is most expensive at scale** but has the best DX for Next.js. If cost matters above ~$100/mo, evaluate Railway or Fly.io.
- **Railway is the simplest** for full-stack apps with databases. Nixpacks auto-detects your runtime. Good middle ground between Vercel and AWS.
- **Fly.io is best for global deployment** and container-based apps. The auto-stop feature saves significant money for low-traffic apps.
- **AWS via SST** is for teams that need full infrastructure control or compliance requirements. The DX gap has narrowed significantly with SST v3, but it's still more complex than PaaS options.
- **Cloudflare Pages** is unbeatable for static sites and edge functions. The free tier is extremely generous. Pair with D1 (SQLite) or Workers KV for a full serverless stack.
- **Database hosting matters:** Hosting your database on the same platform as your compute reduces latency and simplifies networking. Supabase/Neon are good external options if your platform lacks managed Postgres.
- **Don't optimize prematurely:** Start with the simplest platform for your stack. You can always migrate later. The cost difference between $20/mo and $15/mo doesn't matter; shipping your product does.

## Companion tools

- **`alirezarezvani/claude-skills` → `senior-architect`** — Use for infrastructure architecture review: multi-region strategies, disaster recovery planning, and capacity planning.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Validates deployment configuration, checks for missing health checks, and reviews CI/CD pipeline completeness.
