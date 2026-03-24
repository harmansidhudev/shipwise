import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "error";
    logger.error({ error }, "Health check: database connectivity failed");
  }

  const healthy = dbStatus === "ok";
  const status = healthy ? 200 : 503;

  const payload = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? "unknown",
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
    responseTimeMs: Date.now() - startTime,
  };

  return NextResponse.json(payload, { status });
}
