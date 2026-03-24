import { BarChart3, CheckSquare, Bell } from "lucide-react";

interface Stats {
  totalProjects: number;
  activeTasks: number;
  unreadNotifications: number;
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Projects",
      value: stats.totalProjects,
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Open Tasks",
      value: stats.activeTasks,
      icon: CheckSquare,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Notifications",
      value: stats.unreadNotifications,
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm"
        >
          <div className={`rounded-lg p-2.5 ${item.bg}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
