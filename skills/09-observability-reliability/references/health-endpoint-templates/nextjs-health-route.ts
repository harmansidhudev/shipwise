// health-endpoint-templates/nextjs-health-route.ts
//
// Next.js App Router health endpoints
// Place in: app/api/health/[check]/route.ts
//
// Provides three levels:
//   GET /api/health/live     — liveness (always 200, proves process is running)
//   GET /api/health/ready    — readiness (DB + dependencies available)
//   GET /api/health/detailed — full dependency-by-dependency status
//
// [CUSTOMIZE] Import your actual DB client, Redis client, and external service URLs

import { NextResponse } from 'next/server';

// ============================================================
// [CUSTOMIZE] Replace these imports with your actual clients
// ============================================================
// import { db } from '@/lib/db';           // Drizzle / Prisma / pg Pool
// import { redis } from '@/lib/redis';     // ioredis / @upstash/redis
// ============================================================

// [CUSTOMIZE] Set your app version — pull from package.json or env
const APP_VERSION = process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';

// ============================================================
// Types
// ============================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface CheckResult {
  status: HealthStatus;
  latency_ms: number;
  message?: string;
}

interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime_seconds?: number;
  checks?: Record<string, CheckResult>;
}

const startTime = Date.now();

// ============================================================
// Individual health checks
// [CUSTOMIZE] Add, remove, or modify checks for your stack
// ============================================================

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your actual database query
    // --- Prisma ---
    // await db.$queryRaw`SELECT 1`;
    // --- Drizzle + pg ---
    // await db.execute(sql`SELECT 1`);
    // --- Raw pg Pool ---
    // const client = await pool.connect();
    // await client.query('SELECT 1');
    // client.release();

    // Placeholder — remove once you wire up your DB client
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy',
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your actual Redis ping
    // --- ioredis ---
    // const pong = await redis.ping();
    // if (pong !== 'PONG') throw new Error(`Unexpected response: ${pong}`);
    // --- @upstash/redis ---
    // await redis.ping();

    // Placeholder — remove once you wire up your Redis client
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy',
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
}

async function checkExternalAPI(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your critical external dependency
    // const response = await fetch('https://api.stripe.com/v1/balance', {
    //   headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    //   signal: AbortSignal.timeout(5000),
    // });
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Placeholder — remove once you wire up your external API check
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy',
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'degraded', // External API down = degraded, not unhealthy
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'External API check failed',
    };
  }
}

// ============================================================
// Aggregate status logic
// ============================================================

function aggregateStatus(checks: Record<string, CheckResult>): HealthStatus {
  const statuses = Object.values(checks).map((c) => c.status);

  if (statuses.includes('unhealthy')) return 'unhealthy';
  if (statuses.includes('degraded')) return 'degraded';
  return 'healthy';
}

// ============================================================
// Route handler
// ============================================================

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ check: string }> }
): Promise<NextResponse<HealthResponse>> {
  const { check } = await params;

  // ----- /api/health/live -----
  // Simple liveness probe — if the process can respond, it's alive
  if (check === 'live') {
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      },
      { status: 200 }
    );
  }

  // ----- /api/health/ready -----
  // Readiness probe — can the app serve real traffic?
  if (check === 'ready') {
    const dbCheck = await checkDatabase();

    const isReady = dbCheck.status === 'healthy';
    const status: HealthStatus = isReady ? 'healthy' : 'unhealthy';

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        checks: { db: dbCheck },
      },
      { status: isReady ? 200 : 503 }
    );
  }

  // ----- /api/health/detailed -----
  // Full status — check every dependency individually
  if (check === 'detailed') {
    // [CUSTOMIZE] Add or remove checks as needed
    const [dbCheck, redisCheck, externalCheck] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalAPI(),
    ]);

    const checks: Record<string, CheckResult> = {
      db: dbCheck,
      redis: redisCheck,
      external_api: externalCheck, // [CUSTOMIZE] rename to match your dependency
    };

    const status = aggregateStatus(checks);

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
        checks,
      },
      { status: status === 'unhealthy' ? 503 : 200 }
    );
  }

  // Unknown check type
  return NextResponse.json(
    {
      status: 'unhealthy' as HealthStatus,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    },
    { status: 404 }
  );
}
