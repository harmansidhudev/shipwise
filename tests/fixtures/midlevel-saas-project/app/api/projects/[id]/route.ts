import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { updateProjectSchema } from '@/lib/validations';
import { ZodError } from 'zod';

type RouteContext = { params: { id: string } };

async function getProjectOrFail(projectId: string, orgId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: orgId },
  });
  return project;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await db.project.findFirst({
      where: { id: params.id, organizationId: orgId },
      include: {
        tasks: {
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          include: {
            assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
            _count: { select: { comments: true, attachments: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(`[GET /api/projects/${params.id}]`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getProjectOrFail(params.id, orgId);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check user has admin or owner role to edit
    const user = await db.user.findFirst({
      where: { id: userId, organizationId: orgId },
    });

    if (!user || (user.role === 'member' && existing.organizationId !== orgId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    const updated = await db.project.update({
      where: { id: params.id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.status !== undefined && { status: validated.status }),
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    await db.auditLog.create({
      data: {
        action: 'project.updated',
        entityType: 'Project',
        entityId: params.id,
        userId,
        metadata: validated,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error(`[PATCH /api/projects/${params.id}]`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getProjectOrFail(params.id, orgId);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Only admins and owners can delete projects
    const user = await db.user.findFirst({
      where: { id: userId, organizationId: orgId },
    });

    if (!user || user.role === 'member') {
      return NextResponse.json({ error: 'Forbidden: only admins can delete projects' }, { status: 403 });
    }

    await db.project.delete({ where: { id: params.id } });

    await db.auditLog.create({
      data: {
        action: 'project.deleted',
        entityType: 'Project',
        entityId: params.id,
        userId,
        metadata: { name: existing.name },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE /api/projects/${params.id}]`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
