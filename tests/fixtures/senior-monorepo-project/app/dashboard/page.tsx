import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/dashboard-stats";
import { RecentProjects } from "@/components/recent-projects";
import { ActivityFeed } from "@/components/activity-feed";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [projects, tasks, notifications] = await Promise.all([
    db.project.findMany({
      where: { owner: { clerkId: userId } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { tasks: true, _count: { select: { tasks: true } } },
    }),
    db.task.findMany({
      where: {
        project: { owner: { clerkId: userId } },
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.notification.findMany({
      where: { user: { clerkId: userId }, read: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const stats = {
    totalProjects: projects.length,
    activeTasks: tasks.length,
    unreadNotifications: notifications.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here's what's happening.
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentProjects projects={projects} />
        </div>
        <div>
          <ActivityFeed notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
