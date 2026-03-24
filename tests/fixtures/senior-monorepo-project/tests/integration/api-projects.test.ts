import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => ({ userId: "user_test123" }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { GET, POST } from "@/app/api/projects/route";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const mockProjects = [
  {
    id: "proj_1",
    name: "Alpha Project",
    description: "First project",
    status: "ACTIVE",
    ownerId: "user_1",
    organizationId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
    _count: { tasks: 5, comments: 2 },
    tags: [],
  },
];

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns projects list with pagination", async () => {
    vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as any);
    vi.mocked(db.project.count).mockResolvedValue(1);

    const request = new NextRequest("http://localhost:3000/api/projects");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("applies status filter from search params", async () => {
    vi.mocked(db.project.findMany).mockResolvedValue([]);
    vi.mocked(db.project.count).mockResolvedValue(0);

    const request = new NextRequest(
      "http://localhost:3000/api/projects?status=ACTIVE"
    );
    await GET(request);

    expect(db.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
      })
    );
  });
});

describe("POST /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a project with valid data", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user_1",
    } as any);
    vi.mocked(db.project.create).mockResolvedValue({
      ...mockProjects[0],
      id: "proj_new",
    } as any);

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "New Project", visibility: "PRIVATE" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(db.project.create).toHaveBeenCalledOnce();
  });

  it("returns 422 when name is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ description: "No name given" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: "not json{{{",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
