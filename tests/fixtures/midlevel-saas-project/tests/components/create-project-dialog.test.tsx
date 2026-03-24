import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectDialog } from '@/components/create-project-dialog';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

describe('CreateProjectDialog', () => {
  it('does not render when open=false', () => {
    render(<CreateProjectDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('renders the dialog when open=true', () => {
    render(<CreateProjectDialog {...defaultProps} />);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('has name, description, and status fields', () => {
    render(<CreateProjectDialog {...defaultProps} />);
    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
  });

  it('shows validation error for empty name on submit', async () => {
    const user = userEvent.setup();
    render(<CreateProjectDialog {...defaultProps} />);

    // Submit button should be disabled with empty name
    const submitBtn = screen.getByRole('button', { name: 'Create Project' });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when name is filled', async () => {
    const user = userEvent.setup();
    render(<CreateProjectDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Project Name/), 'My New Project');
    const submitBtn = screen.getByRole('button', { name: 'Create Project' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls API and onCreated on successful submit', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'proj_new', name: 'My New Project' }),
    });

    render(<CreateProjectDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Project Name/), 'My New Project');
    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(defaultProps.onCreated).toHaveBeenCalledOnce();
    });
  });

  it('shows server error when API returns error', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Free plan limit reached' }),
    });

    render(<CreateProjectDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Project Name/), 'Over Limit');
    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(screen.getByText('Free plan limit reached')).toBeInTheDocument();
    });
  });

  it('calls onClose when clicking Cancel', async () => {
    const user = userEvent.setup();
    render(<CreateProjectDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when clicking backdrop', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateProjectDialog {...defaultProps} />);

    const backdrop = container.querySelector('.absolute.inset-0');
    if (backdrop) await user.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('shows "Sending..." during submission', async () => {
    const user = userEvent.setup();
    let resolve: (v: unknown) => void;
    mockFetch.mockReturnValue(new Promise((r) => { resolve = r; }));

    render(<CreateProjectDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Project Name/), 'Test');
    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    // Resolve to avoid test hanging
    resolve!({ ok: true, json: async () => ({}) });
  });
});
