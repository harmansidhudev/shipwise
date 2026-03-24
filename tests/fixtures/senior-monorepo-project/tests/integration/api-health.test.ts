import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { GET } from "@/app/api/health/route";
import { db } from "@/lib/db";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when database is healthy", async () => {
    vi.mocked(db.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.checks.database.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeTypeOf("number");
  });

  it("returns 503 when database is down", async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error("Connection refused"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.checks.database.status).toBe("error");
  });

  it("includes latency for healthy db check", async () => {
    vi.mocked(db.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(data.checks.database.latencyMs).toBeTypeOf("number");
    expect(data.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
