// health-endpoint-templates/express-health-route.ts
//
// Express.js health endpoints with configurable checks
// Place in: src/routes/health.ts (or similar)
//
// Provides three levels:
//   GET /health/live     — liveness (always 200, proves process is running)
//   GET /health/ready    — readiness (DB + critical dependencies available)
//   GET /health/detailed — full dependency-by-dependency status
//
// [CUSTOMIZE] Import your actual DB pool, Redis client, and external service URLs

import { Router, Request, Response } from 'express';

// ============================================================
// [CUSTOMIZE] Replace these imports with your actual clients
// ============================================================
// import { pool } from '../lib/db';         // pg Pool / knex / TypeORM DataSource
// import { redis } from '../lib/redis';     // ioredis instance
// ============================================================

// [CUSTOMIZE] Set your app version — pull from package.json or env
const APP_VERSION = process.env.APP_VERSION || '0.0.0';

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

type HealthCheck = () => Promise<CheckResult>;

const startTime = Date.now();

// ============================================================
// Individual health checks
// [CUSTOMIZE] Add, remove, or modify checks for your stack
// ============================================================

const checkDatabase: HealthCheck = async () => {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your actual database query
    // --- pg Pool ---
    // const client = await pool.connect();
    // await client.query('SELECT 1');
    // client.release();
    // --- Knex ---
    // await knex.raw('SELECT 1');
    // --- TypeORM ---
    // await dataSource.query('SELECT 1');

    // Placeholder — remove once you wire up your DB client
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy' as HealthStatus,
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy' as HealthStatus,
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
};

const checkRedis: HealthCheck = async () => {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your actual Redis ping
    // --- ioredis ---
    // const pong = await redis.ping();
    // if (pong !== 'PONG') throw new Error(`Unexpected response: ${pong}`);

    // Placeholder — remove once you wire up your Redis client
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy' as HealthStatus,
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy' as HealthStatus,
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
};

const checkExternalAPI: HealthCheck = async () => {
  const start = Date.now();
  try {
    // [CUSTOMIZE] Replace with your critical external dependency
    // const controller = new AbortController();
    // const timeout = setTimeout(() => controller.abort(), 5000);
    // const response = await fetch('https://api.stripe.com/v1/balance', {
    //   headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    //   signal: controller.signal,
    // });
    // clearTimeout(timeout);
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Placeholder — remove once you wire up your external API check
    await new Promise((resolve) => setTimeout(resolve, 1));

    return {
      status: 'healthy' as HealthStatus,
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'degraded' as HealthStatus, // External API down = degraded, not unhealthy
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : 'External API check failed',
    };
  }
};

// ============================================================
// Configurable check registry
// [CUSTOMIZE] Add or remove entries to match your dependencies
// ============================================================

const CHECK_REGISTRY: Record<string, HealthCheck> = {
  db: checkDatabase,
  redis: checkRedis,
  external_api: checkExternalAPI, // [CUSTOMIZE] rename to match your dependency
};

// Checks required for readiness (if any fail, pod is not ready)
// [CUSTOMIZE] List only checks that must pass for the app to serve traffic
const READINESS_CHECKS: string[] = ['db'];

// ============================================================
// Aggregate status logic
// ============================================================

function aggregateStatus(checks: Record<string, CheckResult>): HealthStatus {
  const statuses = Object.values(checks).map((c) => c.status);

  if (statuses.includes('unhealthy')) return 'unhealthy';
  if (statuses.includes('degraded')) return 'degraded';
  return 'healthy';
}

async function runChecks(checkNames: string[]): Promise<Record<string, CheckResult>> {
  const entries = await Promise.all(
    checkNames.map(async (name) => {
      const check = CHECK_REGISTRY[name];
      if (!check) {
        return [name, { status: 'unhealthy' as HealthStatus, latency_ms: 0, message: 'Check not registered' }] as const;
      }
      const result = await check();
      return [name, result] as const;
    })
  );

  return Object.fromEntries(entries);
}

// ============================================================
// Router
// ============================================================

const healthRouter = Router();

// ----- GET /health/live -----
// Simple liveness probe — if the process can respond, it's alive
healthRouter.get('/live', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  };

  res.status(200).json(response);
});

// ----- GET /health/ready -----
// Readiness probe — can the app serve real traffic?
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  const checks = await runChecks(READINESS_CHECKS);
  const status = aggregateStatus(checks);

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    checks,
  };

  res.status(status === 'healthy' ? 200 : 503).json(response);
});

// ----- GET /health/detailed -----
// Full status — check every dependency individually
healthRouter.get('/detailed', async (_req: Request, res: Response) => {
  const allCheckNames = Object.keys(CHECK_REGISTRY);
  const checks = await runChecks(allCheckNames);
  const status = aggregateStatus(checks);

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  res.status(status === 'unhealthy' ? 503 : 200).json(response);
});

export { healthRouter };

// ============================================================
// Usage in your main app file:
//
//   import express from 'express';
//   import { healthRouter } from './routes/health';
//
//   const app = express();
//   app.use('/health', healthRouter);
//
//   // Kubernetes / Docker / ALB probe config:
//   //   livenessProbe:  GET /health/live
//   //   readinessProbe: GET /health/ready
//   //   Load balancer:  GET /health/ready (target group health check)
// ============================================================
