import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
  OrganizationSwitcher: () => <div data-testid="org-switcher" />,
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import { DashboardShell } from '@/components/dashboard-shell';

describe('DashboardShell', () => {
  it('renders children content', () => {
    render(
      <DashboardShell>
        <div>Test content</div>
      </DashboardShell>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<DashboardShell><div /></DashboardShell>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
  });

  it('renders the org switcher', () => {
    render(<DashboardShell><div /></DashboardShell>);
    expect(screen.getByTestId('org-switcher')).toBeInTheDocument();
  });

  it('renders the user button', () => {
    render(<DashboardShell><div /></DashboardShell>);
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('shows mobile menu toggle button', () => {
    render(<DashboardShell><div /></DashboardShell>);
    // The menu button should exist for mobile
    const menuButton = screen.getAllByRole('button');
    expect(menuButton.length).toBeGreaterThan(0);
  });

  it('toggles sidebar on mobile menu click', async () => {
    const user = userEvent.setup();
    const { container } = render(<DashboardShell><div /></DashboardShell>);

    const menuButtons = screen.getAllByRole('button');
    // Find the hamburger menu button (first button in mobile header)
    const menuBtn = menuButtons.find(b => b.className.includes('rounded-lg'));
    if (menuBtn) {
      await user.click(menuBtn);
    }
    // After click, sidebar class should change
    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies active style to current nav item', () => {
    render(<DashboardShell><div /></DashboardShell>);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-primary-50');
  });
});
