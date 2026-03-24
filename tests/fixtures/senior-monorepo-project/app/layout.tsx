import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Project Hub",
    default: "Acme Project Hub",
  },
  description:
    "Manage your projects, tasks, and team in one place. The project hub for modern engineering teams.",
  keywords: ["project management", "tasks", "team collaboration"],
  authors: [{ name: "Acme Corp" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.acme.com",
    siteName: "Acme Project Hub",
    title: "Acme Project Hub",
    description: "Manage your projects, tasks, and team in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acme Project Hub",
    description: "Manage your projects, tasks, and team in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div id="app-root">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
