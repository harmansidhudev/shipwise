/**
 * Meta Tags + Open Graph + Twitter Cards Template
 *
 * When to use:
 * Add this to your Next.js App Router project for dynamic per-page metadata
 * with sensible defaults. Includes both the modern `generateMetadata` approach
 * (App Router) and a traditional `<Head>` component version (Pages Router / other React).
 *
 * Decision framework:
 * - Next.js App Router (app/ directory) → Use `generateMetadata` (Option A)
 * - Next.js Pages Router (pages/ directory) → Use `<MetaTags>` component (Option B)
 * - Other React frameworks (Remix, Vite, CRA) → Use `<MetaTags>` component (Option B)
 *   with react-helmet-async or your framework's head management
 *
 * [CUSTOMIZE] markers indicate values you must replace with your own.
 *
 * Companion tools:
 * - coreyhaines31/marketingskills -> seo-audit — Validate meta tags across pages
 * - coreyhaines31/marketingskills -> page-cro — Optimize meta for click-through rate
 */

// =============================================================================
// SHARED CONSTANTS — [CUSTOMIZE] these for your project
// =============================================================================

const SITE_NAME = "[CUSTOMIZE] Your Product Name";
const SITE_URL = "https://[CUSTOMIZE_DOMAIN]";
const DEFAULT_DESCRIPTION =
  "[CUSTOMIZE] Brief description of your product (150-160 chars). Include primary keyword naturally.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`; // [CUSTOMIZE] 1200x630px
const TWITTER_HANDLE = "@[CUSTOMIZE_HANDLE]"; // [CUSTOMIZE] Your Twitter/X handle
const LOCALE = "en_US"; // [CUSTOMIZE] Your primary locale

// =============================================================================
// OPTION A: Next.js App Router — generateMetadata
// =============================================================================

import type { Metadata } from "next";

/**
 * Site-wide metadata defaults. Use in app/layout.tsx.
 *
 * Usage:
 * ```ts
 * // app/layout.tsx
 * import { siteMetadata } from '@/lib/metadata';
 * export const metadata = siteMetadata;
 * ```
 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`, // Page titles render as "Page Title | Site Name"
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    // [CUSTOMIZE] Add 5-10 relevant keywords
    "keyword1",
    "keyword2",
    "keyword3",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    type: "website",
    locale: LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${DEFAULT_DESCRIPTION.slice(0, 60)}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    // [CUSTOMIZE] Add additional icon sizes if needed
  },
};

/**
 * Generate per-page metadata. Use in individual page files.
 *
 * Usage:
 * ```ts
 * // app/pricing/page.tsx
 * import { createPageMetadata } from '@/lib/metadata';
 *
 * export const metadata = createPageMetadata({
 *   title: 'Pricing',
 *   description: 'Simple, transparent pricing. Start free, upgrade as you grow.',
 *   path: '/pricing',
 *   ogImage: '/og/pricing.png', // Optional — falls back to default
 * });
 * ```
 */
export function createPageMetadata({
  title,
  description,
  path = "",
  ogImage,
  ogType = "website",
  publishedTime,
  author,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string; // ISO date for blog posts
  author?: string; // Author name for blog posts
  noIndex?: boolean; // Set true for pages like /app/*, /auth/*
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage ? `${SITE_URL}${ogImage}` : DEFAULT_OG_IMAGE;

  return {
    title,
    description,

    openGraph: {
      type: ogType,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: LOCALE,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} | ${SITE_NAME}`,
        },
      ],
      ...(ogType === "article" && publishedTime
        ? {
            publishedTime,
            authors: author ? [author] : undefined,
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [image],
    },

    alternates: {
      canonical: url,
    },

    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}

/**
 * Generate metadata for blog posts with article-specific OG tags.
 *
 * Usage:
 * ```ts
 * // app/blog/[slug]/page.tsx
 * import { createBlogMetadata } from '@/lib/metadata';
 *
 * export async function generateMetadata({ params }) {
 *   const post = await getPost(params.slug);
 *   return createBlogMetadata({
 *     title: post.title,
 *     description: post.excerpt,
 *     slug: post.slug,
 *     publishedTime: post.publishedAt,
 *     author: post.author.name,
 *     ogImage: post.coverImage, // Optional
 *   });
 * }
 * ```
 */
export function createBlogMetadata({
  title,
  description,
  slug,
  publishedTime,
  author,
  ogImage,
}: {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  author: string;
  ogImage?: string;
}): Metadata {
  return createPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    ogImage,
    ogType: "article",
    publishedTime,
    author,
  });
}

// =============================================================================
// OPTION B: Traditional Head Component (Pages Router / Other React Frameworks)
// =============================================================================

import React from "react";
import Head from "next/head"; // [CUSTOMIZE] Replace with react-helmet-async if not using Next.js

interface MetaTagsProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  author?: string;
  noIndex?: boolean;
}

/**
 * Traditional `<Head>` component for meta tags.
 *
 * Usage:
 * ```tsx
 * // pages/pricing.tsx (Next.js Pages Router)
 * import { MetaTags } from '@/components/MetaTags';
 *
 * export default function PricingPage() {
 *   return (
 *     <>
 *       <MetaTags
 *         title="Pricing"
 *         description="Simple, transparent pricing. Start free."
 *         path="/pricing"
 *       />
 *       <main>...</main>
 *     </>
 *   );
 * }
 * ```
 */
export function MetaTags({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  ogImage,
  ogType = "website",
  publishedTime,
  author,
  noIndex = false,
}: MetaTagsProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${path}`;
  const image = ogImage ? `${SITE_URL}${ogImage}` : DEFAULT_OG_IMAGE;

  return (
    <Head>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={LOCALE} />

      {/* Article-specific (blog posts) */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}

// =============================================================================
// JSON-LD HELPER — Embed structured data alongside meta tags
// =============================================================================

/**
 * Render a JSON-LD script tag for structured data.
 *
 * Usage:
 * ```tsx
 * import { JsonLd } from '@/components/MetaTags';
 * import orgSchema from '@/data/organization.json';
 *
 * // In your layout:
 * <JsonLd data={orgSchema} />
 * ```
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Strip _comment fields used for documentation
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([key]) => key !== "_comment"),
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanData) }}
    />
  );
}

// =============================================================================
// CUSTOMIZATION NOTES
// =============================================================================
//
// 1. OG Images: Must be 1200x630px for optimal display on all platforms.
//    Use Vercel OG (@vercel/og) or Satori for dynamic OG image generation.
//    Create an API route: app/api/og/route.tsx
//
// 2. Title length: Keep under 60 characters. Google truncates longer titles.
//    The template "%s | Site Name" adds to the length, so page titles should
//    be shorter (e.g., "Pricing" not "Pricing Plans and Options").
//
// 3. Description length: 150-160 characters. Include primary keyword naturally.
//    Each page MUST have a unique description. Never duplicate descriptions.
//
// 4. Validation: After deploying, test your meta tags with:
//    - Facebook: https://developers.facebook.com/tools/debug/
//    - Twitter: https://cards-dev.twitter.com/validator
//    - LinkedIn: https://www.linkedin.com/post-inspector/
//    - Google: https://search.google.com/test/rich-results
//
// 5. noIndex: Use for authenticated pages (/app/*, /dashboard/*), auth flows
//    (/auth/*), and internal pages. Never noIndex your marketing pages.
//
// 6. Canonical URLs: Always include. Strip tracking params (utm_*, ref, fbclid).
//    Pick one trailing-slash convention and enforce it via middleware.
//
// 7. Multiple locales: Add hreflang alternates for internationalized sites:
//    alternates: { languages: { 'en': '/en/page', 'es': '/es/page' } }
