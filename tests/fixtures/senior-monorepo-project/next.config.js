const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS — tell browsers to always use HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // NOTE: X-Frame-Options is missing — clickjacking protection not set
          // NOTE: Content-Security-Policy is missing — XSS protection incomplete
          // NOTE: Referrer-Policy is missing — referrer leakage possible
          // TODO: Add CSP header once inline styles are migrated to CSS modules
          // TODO: Add X-Frame-Options: DENY
          // TODO: Add Referrer-Policy: strict-origin-when-cross-origin
        ],
      },
    ];
  },

  experimental: {
    serverComponentsExternalPackages: ["pino", "@prisma/client"],
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
