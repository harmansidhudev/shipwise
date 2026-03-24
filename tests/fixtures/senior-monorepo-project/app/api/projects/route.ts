import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "INTERNAL", "PUBLIC"]).default("PRIVATE"),
  organizationId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const status = searchParams.get("status");

  try {
    const where = {
      owner: { clerkId: userId },
      ...(status ? { status: status as any } : {}),
    };

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { tasks: true, comments: true } },
          tags: { include: { tag: true } },
        },
      }),
      db.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error({ error, userId }, "Failed to fetch projects");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await db.project.create({
      data: {
        ...result.data,
        ownerId: user.id,
      },
      include: { _count: { select: { tasks: true } } },
    });

    logger.info({ projectId: project.id, userId }, "Project created");
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error({ error, userId }, "Failed to create project");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
