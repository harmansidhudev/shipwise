import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router by default
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Next.js Image to avoid optimization issues in tests
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock Next.js Link to a simple anchor for testing
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Suppress console.error for expected test errors
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  // Suppress known React testing warnings
  if (
    message.includes('Warning: ReactDOM.render') ||
    message.includes('Warning: An update to') ||
    message.includes('act(...)') ||
    message.includes('Not implemented: navigation')
  ) {
    return;
  }
  originalConsoleError(...args);
};
