import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Acme Project Hub',
    template: '%s | Acme Project Hub',
  },
  description:
    'The project management platform built for high-velocity engineering teams. Track tasks, collaborate in real-time, and ship faster.',
  keywords: ['project management', 'task tracking', 'team collaboration', 'saas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen bg-secondary-50 font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
