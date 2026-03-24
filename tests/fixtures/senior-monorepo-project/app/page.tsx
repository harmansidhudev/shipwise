import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700">
          <Zap className="h-3.5 w-3.5" />
          <span>Now in GA — v1.2 is live</span>
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Ship projects faster with{" "}
          <span className="text-indigo-600">Acme Hub</span>
        </h1>

        <p className="max-w-xl text-lg text-gray-600">
          The project management platform built for engineering teams who care
          about quality, velocity, and visibility from day one.
        </p>

        <div className="flex gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Built for engineering velocity
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-indigo-600" />}
              title="Real-time dashboards"
              description="Track project health, deployment status, and team workload in real time."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-indigo-600" />}
              title="Enterprise security"
              description="SOC 2 Type II compliant with audit logs, SSO, and role-based access."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-indigo-600" />}
              title="CI/CD integrations"
              description="Connect GitHub, GitLab, and your deploy pipeline in minutes."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
