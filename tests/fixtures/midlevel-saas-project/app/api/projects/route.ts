import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { createProjectSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? '';

    const where = {
      organizationId: orgId,
      ...(status ? { status: status as 'ACTIVE' | 'ARCHIVED' } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { tasks: true } },
        },
      }),
      db.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // Check org plan limits
    const org = await db.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { projects: true } } },
    });

    if (org?.plan === 'FREE' && org._count.projects >= 3) {
      return NextResponse.json(
        { error: 'Free plan is limited to 3 projects. Please upgrade to create more.' },
        { status: 403 }
      );
    }

    const project = await db.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        status: validated.status ?? 'ACTIVE',
        organizationId: orgId,
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'project.created',
        entityType: 'Project',
        entityId: project.id,
        userId,
        metadata: { name: project.name },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('[POST /api/projects]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
