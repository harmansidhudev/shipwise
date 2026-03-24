import Link from 'next/link';
import { ArrowRight, CheckCircle, Layers, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Visual Project Tracking',
    description:
      'Kanban boards, list views, and timeline views give your team the flexibility to work the way they want. Drag and drop tasks across status columns in real time.',
  },
  {
    icon: Users,
    title: 'Built for Teams',
    description:
      'Invite your entire org, assign tasks, leave comments, and attach files. Role-based permissions keep the right people in the right places.',
  },
  {
    icon: Zap,
    title: 'Automate the Boring Stuff',
    description:
      'Set up webhooks, connect your CI/CD pipeline, and create custom automations that trigger on task status changes, assignments, and due dates.',
  },
];

const benefits = [
  'Unlimited projects on Pro',
  'Real-time collaboration',
  'Slack & GitHub integrations',
  'Advanced reporting',
  'SSO & SAML on Enterprise',
  'Priority support',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-secondary-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-secondary-900">Acme Project Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          Now in public beta — free for teams up to 5
        </div>
        <h1 className="text-5xl font-bold text-secondary-900 leading-tight mb-6 max-w-3xl mx-auto">
          Ship projects faster,{' '}
          <span className="text-primary-600">without the chaos</span>
        </h1>
        <p className="text-xl text-secondary-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Acme Project Hub gives engineering teams a single place to plan, track, and deliver
          software. No more Jira sprawl. No more missed deadlines.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            Get started for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 bg-white text-secondary-700 font-semibold px-6 py-3 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-4 text-sm text-secondary-400">No credit card required. 14-day free trial.</p>
      </section>

      {/* Features */}
      <section id="features" className="bg-secondary-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Everything your team needs to ship
            </h2>
            <p className="text-lg text-secondary-500 max-w-xl mx-auto">
              Built by engineers, for engineering teams. Every feature is designed to reduce friction
              and keep you in flow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 border border-secondary-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                  <p className="text-secondary-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof / benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              The plan you pick, we deliver
            </h2>
            <p className="text-secondary-500 mb-8 leading-relaxed">
              Whether you're a solo founder or a 200-person engineering org, Acme Project Hub grows
              with you. Upgrade or downgrade at any time — no lock-in.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="text-secondary-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-secondary-900 rounded-2xl p-8 text-white">
            <p className="text-lg font-medium mb-2">
              &ldquo;We replaced three tools with Acme Project Hub. Our sprint velocity went up 40% in
              the first month.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-bold text-sm">
                SR
              </div>
              <div>
                <p className="font-semibold text-sm">Sarah Ramirez</p>
                <p className="text-secondary-400 text-sm">VP Engineering, Helion Labs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to stop firefighting?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join 1,200+ engineering teams already shipping with Acme Project Hub.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors text-lg"
          >
            Start your free trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-secondary-400">
          <span>&copy; {new Date().getFullYear()} Acme Project Hub. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-secondary-600">
              Docs
            </Link>
            <Link href="#" className="hover:text-secondary-600">
              Status
            </Link>
            <Link href="#" className="hover:text-secondary-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
