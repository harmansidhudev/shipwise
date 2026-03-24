# Technical SEO Checklist

## When to use
Reference this checklist when preparing a site for launch, auditing an existing site's SEO, or setting up foundational SEO infrastructure. Covers meta tags per page type, robots.txt, sitemap generation, Search Console, canonical URLs, redirects, and caching.

## Decision framework

```
What stage is your SEO setup?
├── No SEO at all?
│   ├── Start here: meta tags on every page (title + description + OG)
│   ├── Generate sitemap.xml and robots.txt
│   ├── Set up Google Search Console
│   └── Add canonical URLs
│
├── Basic SEO in place?
│   ├── Audit meta tags per page type (see templates below)
│   ├── Add structured data (JSON-LD)
│   ├── Fix canonical URL inconsistencies
│   ├── Set up redirect strategy
│   └── Configure caching headers
│
└── SEO is mature, optimizing further?
    ├── Programmatic SEO for scalable pages
    ├── Hreflang for internationalization
    ├── Advanced sitemap (index, images, video)
    └── Log file analysis for crawl optimization
```

---

## Copy-paste template

### Meta tags per page type

```html
<!-- ==================== HOMEPAGE ==================== -->
<!-- [CUSTOMIZE] Replace all bracketed values -->
<head>
  <title>[PRODUCT_NAME] — [Primary Benefit in 6-8 Words]</title>
  <meta name="description" content="[PRODUCT_NAME] helps [TARGET_AUDIENCE] [achieve OUTCOME]. [Secondary benefit]. Start free today." />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="[PRODUCT_NAME] — [Primary Benefit]" />
  <meta property="og:description" content="[Same as meta description or slightly shorter]" />
  <meta property="og:image" content="https://[YOUR_DOMAIN]/og/home.png" /> <!-- 1200x630 -->
  <meta property="og:url" content="https://[YOUR_DOMAIN]/" />
  <meta property="og:site_name" content="[PRODUCT_NAME]" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@[TWITTER_HANDLE]" />
  <meta name="twitter:title" content="[PRODUCT_NAME] — [Primary Benefit]" />
  <meta name="twitter:description" content="[Same as meta description]" />
  <meta name="twitter:image" content="https://[YOUR_DOMAIN]/og/home.png" />

  <!-- Canonical -->
  <link rel="canonical" href="https://[YOUR_DOMAIN]/" />
</head>

<!-- ==================== PRODUCT / FEATURES PAGE ==================== -->
<head>
  <title>[Feature Name] — [PRODUCT_NAME]</title>
  <meta name="description" content="[Feature] lets you [specific benefit]. [How it works in one sentence]. Part of [PRODUCT_NAME]." />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="[Feature Name] — [PRODUCT_NAME]" />
  <meta property="og:description" content="[Feature description, 100-150 chars]" />
  <meta property="og:image" content="https://[YOUR_DOMAIN]/og/features/[feature-slug].png" />
  <meta property="og:url" content="https://[YOUR_DOMAIN]/features/[feature-slug]" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="[Feature Name] — [PRODUCT_NAME]" />
  <meta name="twitter:description" content="[Feature description]" />
  <meta name="twitter:image" content="https://[YOUR_DOMAIN]/og/features/[feature-slug].png" />

  <link rel="canonical" href="https://[YOUR_DOMAIN]/features/[feature-slug]" />
</head>

<!-- ==================== BLOG POST ==================== -->
<head>
  <title>[Post Title] | [PRODUCT_NAME] Blog</title>
  <meta name="description" content="[Compelling summary of the post, 150-160 chars. Include primary keyword naturally.]" />
  <meta name="author" content="[AUTHOR_NAME]" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="[Post Title]" />
  <meta property="og:description" content="[Post summary]" />
  <meta property="og:image" content="https://[YOUR_DOMAIN]/og/blog/[post-slug].png" />
  <meta property="og:url" content="https://[YOUR_DOMAIN]/blog/[post-slug]" />
  <meta property="article:published_time" content="[ISO_DATE]" />
  <meta property="article:author" content="[AUTHOR_URL]" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="[Post Title]" />
  <meta name="twitter:description" content="[Post summary]" />
  <meta name="twitter:image" content="https://[YOUR_DOMAIN]/og/blog/[post-slug].png" />

  <link rel="canonical" href="https://[YOUR_DOMAIN]/blog/[post-slug]" />
</head>

<!-- ==================== PRICING PAGE ==================== -->
<head>
  <title>Pricing — [PRODUCT_NAME]</title>
  <meta name="description" content="[PRODUCT_NAME] pricing starts at $[PRICE]/mo. [Free tier or trial info]. Compare plans: [Plan1], [Plan2], [Plan3]." />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="[PRODUCT_NAME] Pricing — Plans for Every Team" />
  <meta property="og:description" content="Start free. Upgrade as you grow. Plans from $[PRICE]/mo." />
  <meta property="og:image" content="https://[YOUR_DOMAIN]/og/pricing.png" />
  <meta property="og:url" content="https://[YOUR_DOMAIN]/pricing" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="[PRODUCT_NAME] Pricing" />
  <meta name="twitter:description" content="Start free. Upgrade as you grow." />
  <meta name="twitter:image" content="https://[YOUR_DOMAIN]/og/pricing.png" />

  <link rel="canonical" href="https://[YOUR_DOMAIN]/pricing" />
</head>
```

---

### robots.txt template

```txt
# robots.txt — [CUSTOMIZE] Replace [YOUR_DOMAIN]
# Docs: https://developers.google.com/search/docs/crawling-indexing/robots/intro

User-agent: *
Allow: /

# [CUSTOMIZE] Block routes that should not be indexed
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /app/
Disallow: /_next/
Disallow: /auth/
Disallow: /internal/

# Block query parameter variations from being crawled
Disallow: /*?ref=
Disallow: /*?utm_

# Sitemap location
Sitemap: https://[YOUR_DOMAIN]/sitemap.xml
```

---

### Sitemap generation

#### Next.js (App Router — `app/sitemap.ts`)

```ts
// app/sitemap.ts
// [CUSTOMIZE] Replace with your actual routes and domain
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://[YOUR_DOMAIN]'; // [CUSTOMIZE]

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    // [CUSTOMIZE] Add your static pages
  ];

  // Dynamic pages (e.g., blog posts from CMS or database)
  // [CUSTOMIZE] Replace with your data source
  // const posts = await getBlogPosts();
  // const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));

  return [
    ...staticPages,
    // ...blogPages,
  ];
}
```

#### Nuxt 3 (`nuxt.config.ts` + `@nuxtjs/sitemap`)

```ts
// nuxt.config.ts
// [CUSTOMIZE] Replace domain and add dynamic routes
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://[YOUR_DOMAIN]', // [CUSTOMIZE]
  },
  sitemap: {
    // Dynamic routes from API
    // [CUSTOMIZE] Add your data source
    // sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/app/**', '/auth/**'],
  },
});
```

#### Astro (`astro.config.mjs` + `@astrojs/sitemap`)

```js
// astro.config.mjs
// [CUSTOMIZE] Replace domain
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://[YOUR_DOMAIN]', // [CUSTOMIZE]
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/app/') &&
        !page.includes('/auth/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
```

---

### Google Search Console setup steps

```
1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Choose "Domain" (recommended — covers all subdomains and protocols)
4. Copy the DNS TXT record provided by Google
5. Add it to your domain's DNS settings:
   - Cloudflare: DNS > Add record > TXT > Name: @ > Content: [paste]
   - Vercel: Settings > Domains > DNS Records > Add > TXT
   - Route 53: Hosted Zone > Create Record > TXT
   [CUSTOMIZE] Follow your DNS provider's instructions
6. Wait 5-10 minutes, then click "Verify" in Search Console
7. Once verified:
   a. Go to Sitemaps > Add sitemap > Enter "sitemap.xml" > Submit
   b. Wait 24-48 hours for initial crawl data
   c. Check Coverage report for errors
   d. Check Core Web Vitals report
   e. Check Mobile Usability report
8. Set up email notifications: Settings > Email preferences > Enable
9. (Optional) Link to Google Analytics: GA4 > Admin > Search Console links
```

---

### Canonical URL patterns

```ts
// middleware.ts (Next.js) — Enforce trailing slash consistency
// [CUSTOMIZE] Choose ONE convention: with or without trailing slash
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Option A: Remove trailing slashes (recommended for most apps)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308); // 308 = permanent redirect (preserves method)
  }

  // Option B: Add trailing slashes (common for static sites)
  // if (pathname !== '/' && !pathname.includes('.') && !pathname.endsWith('/')) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = `${pathname}/`;
  //   return NextResponse.redirect(url, 308);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip API routes, static files, and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
```

---

### Redirect strategy (301 vs 308)

```
When to use which redirect:
├── 301 (Moved Permanently)
│   ├── Old URL structure → new URL structure
│   ├── Domain migration (old-domain.com → new-domain.com)
│   ├── HTTP → HTTPS upgrade
│   └── Note: May change POST to GET (browsers convert method)
│
├── 308 (Permanent Redirect)
│   ├── Same as 301 but preserves HTTP method
│   ├── Use for API endpoints that moved
│   ├── Use for trailing slash enforcement
│   └── Preferred over 301 when method preservation matters
│
├── 302 (Found / Temporary)
│   ├── A/B tests
│   ├── Geo-based redirects
│   ├── Maintenance mode
│   └── Temporary feature flag routing
│
└── 307 (Temporary Redirect)
    ├── Same as 302 but preserves HTTP method
    └── Use for temporary API endpoint changes
```

```ts
// next.config.js — Static redirect rules
// [CUSTOMIZE] Add your redirect rules
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old blog URL structure -> new
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true, // 308
      },
      // Old feature page -> new
      {
        source: '/features/old-feature',
        destination: '/features/new-feature',
        permanent: true,
      },
      // www -> non-www (handle at DNS/CDN level for best performance)
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.[YOUR_DOMAIN]' }],
      //   destination: 'https://[YOUR_DOMAIN]/:path*',
      //   permanent: true,
      // },
      // [CUSTOMIZE] Add project-specific redirects
    ];
  },
};

module.exports = nextConfig;
```

---

### Caching headers

```ts
// next.config.js — Caching headers
// [CUSTOMIZE] Adjust paths and durations for your project
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Static assets with content hash: cache forever
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images: cache for 1 year (content-addressed)
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts: cache for 1 year
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public assets (favicon, logos): cache 1 day, revalidate
      {
        source: '/(favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200',
          },
        ],
      },
      // HTML pages: no browser cache, CDN handles it
      {
        source: '/((?!api|_next).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // API routes: private, short cache or no cache
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

### Landing page copy framework

```
[CUSTOMIZE] Fill in each section for your product

HERO SECTION
├── Headline (6-12 words, benefit-driven):
│   "[OUTCOME] for [AUDIENCE]"
│   Example: "Ship faster with automated deploy previews"
│
├── Subheadline (1-2 sentences):
│   "[PAIN POINT] is slowing you down. [PRODUCT] [SOLUTION]."
│   Example: "Manual deployments waste hours every week.
│             Shipwise gives you one-click previews for every PR."
│
├── Primary CTA button:
│   "[Action Verb] + [Value]" — e.g., "Start shipping faster" / "Try free"
│
├── Secondary CTA (lower commitment):
│   "See how it works" / "Watch demo" / "View docs"
│
└── Hero visual: product screenshot, short demo GIF, or illustration

SOCIAL PROOF SECTION
├── Company logos (3-6): "[LOGO_1] [LOGO_2] [LOGO_3]"
├── Metric: "Trusted by [NUMBER]+ teams" / "[NUMBER]+ deploys per month"
└── Testimonial: "[QUOTE]" — [NAME], [TITLE] at [COMPANY]

FEATURES/BENEFITS SECTION (3-4 items)
├── Feature 1: [BENEFIT_HEADLINE] — [2-sentence description of outcome, not mechanism]
├── Feature 2: [BENEFIT_HEADLINE] — [2-sentence description]
├── Feature 3: [BENEFIT_HEADLINE] — [2-sentence description]
└── (Optional) Feature 4: [BENEFIT_HEADLINE] — [2-sentence description]

HOW IT WORKS (3 steps max)
├── Step 1: [ACTION] — [Brief description]
├── Step 2: [ACTION] — [Brief description]
└── Step 3: [ACTION] — [Brief description]

FAQ SECTION (4-6 questions)
├── Q: [Common objection as a question]?  A: [Direct answer]
├── Q: [Pricing/trial question]?  A: [Direct answer]
├── Q: [Integration/compatibility question]?  A: [Direct answer]
└── Q: [Security/data question]?  A: [Direct answer]

FINAL CTA SECTION
├── Headline: "Ready to [OUTCOME]?"
├── CTA button: [Same as primary CTA]
└── Trust signal: "Free plan available" / "No credit card required" / "14-day free trial"
```

---

## Customization notes

- **Meta tag lengths**: Google may truncate titles >60 chars and descriptions >160 chars. Test with SERP preview tools.
- **OG images**: Must be exactly 1200x630px for optimal display. Use a template tool like Vercel OG or Satori for dynamic generation.
- **robots.txt**: Be careful not to block resources needed to render your pages (CSS/JS). Google needs these to evaluate page quality.
- **Sitemap limits**: A single sitemap.xml can contain max 50,000 URLs. Use a sitemap index file for larger sites.
- **Redirect chains**: Avoid redirect chains (A -> B -> C). Each redirect should go directly to the final destination.
- **Caching**: Never cache HTML with `immutable` — you need the ability to push updates without users clearing their cache.

## Companion tools

- `coreyhaines31/marketingskills` -> `seo-audit` — Automated SEO audit with actionable recommendations
- `coreyhaines31/marketingskills` -> `site-arch` — Site architecture and internal linking analysis
- `coreyhaines31/marketingskills` -> `page-cro` — Landing page conversion rate optimization
