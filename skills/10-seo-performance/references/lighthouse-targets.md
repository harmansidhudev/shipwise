# Lighthouse Targets

## When to use
Reference this guide when optimizing your site to hit 90+ Lighthouse scores in all four categories, setting up Lighthouse CI in GitHub Actions, configuring performance budgets, or diagnosing specific Lighthouse failures.

## Decision framework

```
Which Lighthouse category needs work?
├── Performance (score < 90)?
│   ├── LCP > 2.5s? → Optimize largest image/text, preload fonts, server response time
│   ├── CLS > 0.1? → Add explicit width/height to images/embeds, avoid layout shifts
│   ├── INP > 200ms? → Reduce JS execution, break long tasks, use web workers
│   ├── Large JS bundle? → Code splitting, tree shaking, dynamic imports
│   └── Slow server? → CDN, caching, edge rendering
│
├── Accessibility (score < 90)?
│   ├── Missing alt text? → Add descriptive alt to all <img> tags
│   ├── Poor color contrast? → WCAG 2.1 AA requires 4.5:1 for text
│   ├── No keyboard navigation? → Ensure all interactive elements are focusable
│   └── Missing ARIA labels? → Add aria-label to icon buttons, landmarks
│
├── Best Practices (score < 90)?
│   ├── No HTTPS? → Enable SSL/TLS certificate
│   ├── Mixed content? → Ensure all resources load over HTTPS
│   ├── Deprecated APIs? → Replace document.write, unload listeners
│   └── Missing CSP? → Add Content-Security-Policy header
│
└── SEO (score < 90)?
    ├── Missing meta description? → Add unique description per page
    ├── No viewport meta? → Add <meta name="viewport" content="width=device-width, initial-scale=1">
    ├── Links not crawlable? → Use <a href> not onClick for navigation
    └── Missing structured data? → Add JSON-LD (see structured-data-templates/)
```

---

## Copy-paste template

### Core Web Vitals targets

```
Metric           | Good      | Needs Work | Poor     | What it measures
─────────────────|───────────|────────────|──────────|──────────────────────────
LCP (Largest     | ≤ 2.5s    | 2.5-4.0s   | > 4.0s   | Loading — time until the
Contentful Paint)|           |            |          | largest element is visible
─────────────────|───────────|────────────|──────────|──────────────────────────
CLS (Cumulative  | ≤ 0.1     | 0.1-0.25   | > 0.25   | Visual stability — how
Layout Shift)    |           |            |          | much the page layout shifts
─────────────────|───────────|────────────|──────────|──────────────────────────
INP (Interaction | ≤ 200ms   | 200-500ms  | > 500ms  | Responsiveness — delay
to Next Paint)   |           |            |          | between input and visual update
```

### Common performance fixes

```ts
// ===== FIX: LCP — Preload hero image =====
// Add to <head> or via Next.js metadata
// [CUSTOMIZE] Replace with your actual hero image path
// In next.config.js or layout.tsx:
export const metadata = {
  other: {
    'link': [
      { rel: 'preload', href: '/images/hero.webp', as: 'image', type: 'image/webp' },
    ],
  },
};

// Or in HTML <head>:
// <link rel="preload" href="/images/hero.webp" as="image" type="image/webp" />


// ===== FIX: LCP — Mark hero image as priority (Next.js) =====
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/images/hero.webp"
      alt="[CUSTOMIZE] Descriptive alt text"
      width={1200}
      height={630}
      priority  // Disables lazy loading, preloads the image
      sizes="100vw"
    />
  );
}


// ===== FIX: CLS — Explicit dimensions on images =====
// BAD: causes layout shift
// <img src="/photo.jpg" />

// GOOD: reserves space before image loads
// <img src="/photo.jpg" width="800" height="600" alt="Description" />

// GOOD: CSS aspect ratio box
// .image-container { aspect-ratio: 16/9; }


// ===== FIX: CLS — Font loading without layout shift =====
// next.config.js or CSS
// [CUSTOMIZE] Replace with your font
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Shows fallback font while loading, prevents invisible text
  variable: '--font-inter',
});

// Or in CSS:
// @font-face {
//   font-family: 'Inter';
//   font-display: swap;
//   src: url('/fonts/inter.woff2') format('woff2');
// }


// ===== FIX: INP — Break up long tasks =====
// BAD: long synchronous operation blocks the main thread
// function processData(items) { items.forEach(item => heavyComputation(item)); }

// GOOD: yield to the browser between chunks
async function processData(items: unknown[]) {
  const CHUNK_SIZE = 50;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    chunk.forEach((item) => heavyComputation(item));
    // Yield to browser so it can handle user input
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}


// ===== FIX: Bundle size — Dynamic imports for heavy components =====
import dynamic from 'next/dynamic';

// [CUSTOMIZE] Replace with your heavy components
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" />,
  ssr: false, // Skip SSR for client-only components
});

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded" />,
});

const CodeBlock = dynamic(() => import('@/components/CodeBlock'));
```

### Image optimization checklist

```tsx
// ===== RESPONSIVE IMAGES with srcset =====
// [CUSTOMIZE] Replace image paths and breakpoints

// Option A: Next.js Image (recommended — handles format, sizing, lazy loading)
import Image from 'next/image';

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={80}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
    />
  );
}

// Option B: Native HTML (when not using Next.js)
// <picture>
//   <source srcset="/images/hero.avif" type="image/avif" />
//   <source srcset="/images/hero.webp" type="image/webp" />
//   <img
//     src="/images/hero.jpg"
//     alt="[CUSTOMIZE]"
//     width="1200"
//     height="630"
//     loading="lazy"
//     decoding="async"
//     srcset="
//       /images/hero-640w.webp 640w,
//       /images/hero-750w.webp 750w,
//       /images/hero-1080w.webp 1080w,
//       /images/hero-1200w.webp 1200w,
//       /images/hero-1920w.webp 1920w
//     "
//     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//   />
// </picture>
```

### Bundle analysis and budgets

```ts
// ===== BUNDLE ANALYZER — Next.js =====
// Install: npm install @next/bundle-analyzer

// next.config.js
// [CUSTOMIZE] Add to your existing next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ...your existing config
});

// Run: ANALYZE=true npm run build
// This opens an interactive treemap showing every module's size


// ===== PERFORMANCE BUDGETS — next.config.js =====
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Warn when a page's JS exceeds these limits
    // [CUSTOMIZE] Adjust based on your performance targets
  },
};
```

### Lighthouse CI for GitHub Actions

```yaml
# .github/workflows/lighthouse.yml
# [CUSTOMIZE] Replace URL, thresholds, and build commands
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          # [CUSTOMIZE] Add required build env vars
          NEXT_PUBLIC_SITE_URL: https://example.com

      - name: Start server
        run: npm run start &
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/pricing
            http://localhost:3000/blog
          # [CUSTOMIZE] Adjust threshold scores
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Assert scores
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: http://localhost:3000/
          configPath: ./lighthouserc.json
```

```json5
// lighthouserc.json
// [CUSTOMIZE] Adjust thresholds for your project
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        // Core Web Vitals
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "interactive": ["warn", { "maxNumericValue": 3800 }],
        // Bundle size
        "total-byte-weight": ["warn", { "maxNumericValue": 500000 }],
        // Image optimization
        "uses-webp-images": "warn",
        "uses-responsive-images": "warn",
        "offscreen-images": "warn"
      }
    },
    "collect": {
      "numberOfRuns": 3
    }
  }
}
```

```json
// lighthouse-budget.json
// [CUSTOMIZE] Adjust budgets for your project
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "image", "budget": 300 },
      { "resourceType": "stylesheet", "budget": 50 },
      { "resourceType": "font", "budget": 100 },
      { "resourceType": "total", "budget": 700 },
      { "resourceType": "third-party", "budget": 150 }
    ],
    "resourceCounts": [
      { "resourceType": "script", "budget": 15 },
      { "resourceType": "image", "budget": 20 },
      { "resourceType": "third-party", "budget": 10 }
    ],
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "interactive", "budget": 3800 }
    ]
  }
]
```

---

## Customization notes

- **Run Lighthouse in Incognito**: Chrome extensions can skew Lighthouse scores. Always test in Incognito mode or use the CLI (`npx lighthouse <url>`).
- **Lighthouse CI numberOfRuns**: Lighthouse scores vary between runs. Set `numberOfRuns: 3` (or 5) and use the median for stable results.
- **Performance budgets**: Start with the budgets above, then tighten them as you optimize. The goal is to catch regressions in PRs before they reach production.
- **Mobile vs Desktop**: Lighthouse defaults to mobile throttling. Test both, but prioritize mobile scores since Google uses mobile-first indexing.
- **Third-party scripts**: Analytics, chat widgets, and ad trackers heavily impact Performance scores. Load them asynchronously or defer to after page load. Consider Partytown for worker-based third-party loading.
- **Image format support**: WebP has ~97% browser support. AVIF has ~93% and is 20-30% smaller. Use `<picture>` element with AVIF -> WebP -> JPEG fallback chain for maximum savings.
- **Bundle budgets in KB above are gzipped transfer sizes**, not raw file sizes. Check the Network tab in DevTools with "Use large request rows" enabled to see transfer vs actual size.

## Companion tools

- `coreyhaines31/marketingskills` -> `seo-audit` — Automated SEO scoring and fix recommendations
- `coreyhaines31/marketingskills` -> `page-cro` — Performance impact on conversion rate analysis
