# Web Vitals & Real User Monitoring (RUM)

Measure how your site performs for real users — not just in Lighthouse. Set up the `web-vitals` library, send metrics to your analytics platform, and fix the issues that actually affect your users.

## When to use

Reference this guide after you've optimized against Lighthouse targets (see `lighthouse-targets.md`) and want to measure real-world performance. Lab tests (Lighthouse) catch issues in controlled conditions; RUM catches issues on real devices, real networks, and real user behavior. Use both.

---

## 1. Lab data vs field data

```
Which performance data should I trust?
│
├── Lab data (Lighthouse, WebPageTest)
│   ├── Controlled environment, reproducible
│   ├── Catches regressions in CI/CD
│   └── Does NOT reflect real user experience
│       (no slow phones, no congested networks)
│
├── Field data (RUM, CrUX, web-vitals)
│   ├── Real devices, real networks, real users
│   ├── What Google uses for SEO ranking signals
│   └── Catches issues lab tests miss
│       (font loading on slow 4G, layout shifts from ads)
│
└── Best practice: Use BOTH
    ├── Lab: in CI/CD to prevent regressions (lighthouse-targets.md)
    └── Field: in production to measure actual user experience (this doc)
```

---

## 2. Core Web Vitals reference

| Metric | What it measures | Good | Needs improvement | Poor |
|--------|-----------------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | Loading speed — when the biggest visible element renders | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | Responsiveness — delay between user input and visual response | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability — how much the page layout shifts unexpectedly | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | Server speed — time until browser receives first byte | ≤ 800ms | 800ms – 1800ms | > 1800ms |

**SEO impact:** Google uses CrUX (Chrome User Experience Report) field data for page experience ranking signals. Passing Core Web Vitals in the field is what matters for SEO, not your Lighthouse score.

---

## 3. Setup: web-vitals library

```bash
npm install web-vitals
```

### Basic implementation (any framework)

```typescript
// lib/web-vitals.ts
// [CUSTOMIZE] Replace sendToAnalytics with your reporting endpoint
import { onCLS, onINP, onLCP, onTTFB, onFCP, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
  };

  // Use sendBeacon for reliability (works even during page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', JSON.stringify(body));
  } else {
    fetch('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      keepalive: true,
    });
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onFCP(sendToAnalytics);
}
```

### Next.js App Router

```typescript
// app/components/WebVitals.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitals() {
  useEffect(() => {
    reportWebVitals();
  }, []);
  return null;
}
```

```tsx
// app/layout.tsx
// [CUSTOMIZE] Add <WebVitals /> to your root layout
import { WebVitals } from './components/WebVitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
```

---

## 4. Send Web Vitals to PostHog

```typescript
// lib/web-vitals.ts
// [CUSTOMIZE] Ensure PostHog is initialized before this runs
import { onCLS, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import posthog from 'posthog-js';

function sendToPostHog(metric: Metric) {
  posthog.capture('web_vital_measured', {
    vital_name: metric.name,
    vital_value: Math.round(metric.value),
    vital_rating: metric.rating,
    vital_delta: Math.round(metric.delta),
    vital_id: metric.id,
    page_url: window.location.pathname,
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
    device_memory: (navigator as any).deviceMemory || 'unknown',
  });
}

export function reportWebVitals() {
  onCLS(sendToPostHog);
  onINP(sendToPostHog);
  onLCP(sendToPostHog);
  onTTFB(sendToPostHog);
}
```

**PostHog dashboard query:** Filter events by `web_vital_measured`, break down by `vital_name`, aggregate by p75 of `vital_value`. The p75 (75th percentile) is what Google uses for ranking — not the average.

---

## 5. Send Web Vitals to a custom API endpoint

```typescript
// app/api/vitals/route.ts
// [CUSTOMIZE] Replace database insert with your storage (Postgres, ClickHouse, etc.)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const vital = await req.json();

  // Store in your database for dashboarding
  await db.insert('web_vitals', {
    name: vital.name,
    value: vital.value,
    rating: vital.rating,
    url: vital.url,
    user_agent: req.headers.get('user-agent'),
    timestamp: new Date(),
  });

  return NextResponse.json({ ok: true });
}
```

```sql
-- Aggregate Web Vitals by page (p75 values)
-- [CUSTOMIZE] Adjust table name
SELECT
  url,
  name,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS p75_value,
  COUNT(*) AS sample_count,
  COUNT(*) FILTER (WHERE rating = 'good') * 100.0 / COUNT(*) AS pct_good
FROM web_vitals
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY url, name
ORDER BY url, name;
```

---

## 6. Diagnosing poor field metrics

### LCP is slow (> 2.5s)

```
Common causes:
├── Hero image not preloaded
│   Fix: <link rel="preload" as="image" href="/hero.webp" />
├── Web fonts blocking render
│   Fix: font-display: swap; + preload font files
├── Large JavaScript bundle delays rendering
│   Fix: Dynamic imports, code splitting, defer non-critical JS
├── Slow server response (TTFB > 800ms)
│   Fix: Edge caching, CDN, database query optimization
└── Third-party scripts blocking main thread
    Fix: Load with async/defer, or move to Web Worker
```

### INP is slow (> 200ms)

```
Common causes:
├── Heavy JavaScript running on click/input handlers
│   Fix: Break long tasks with requestIdleCallback or scheduler.yield()
├── State updates triggering expensive re-renders
│   Fix: React.memo, useMemo, virtualize long lists
├── Synchronous DOM manipulation after user input
│   Fix: Use requestAnimationFrame for visual updates
└── Third-party scripts competing for main thread
    Fix: Audit with Performance tab → Main Thread → Long Tasks
```

### CLS is high (> 0.1)

```
Common causes:
├── Images without width/height attributes
│   Fix: Always set width + height or aspect-ratio
├── Web fonts causing text reflow (FOUT)
│   Fix: font-display: optional; + size-adjust fallback
├── Dynamically injected content above the fold
│   Fix: Reserve space with min-height or skeleton
├── Ads or embeds loading without reserved space
│   Fix: Set explicit dimensions on ad containers
└── Cookie consent banner pushing content down
    Fix: Use position: fixed or overlay instead of pushing
```

---

## 7. Alerting on field regressions

```typescript
// Run weekly: check if p75 Web Vitals regressed
// [CUSTOMIZE] Adjust thresholds and notification channel
const THRESHOLDS = {
  LCP: 2500,  // ms
  INP: 200,   // ms
  CLS: 0.1,   // score
  TTFB: 800,  // ms
};

async function checkVitalsRegression() {
  const results = await db.query(`
    SELECT name, PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS p75
    FROM web_vitals
    WHERE timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY name
  `);

  const failures = results.filter(
    (r: any) => r.p75 > THRESHOLDS[r.name as keyof typeof THRESHOLDS]
  );

  if (failures.length > 0) {
    // [CUSTOMIZE] Send to Slack, email, or PagerDuty
    await notify(`Web Vitals regression: ${failures.map(
      f => `${f.name} p75=${Math.round(f.p75)} (threshold: ${THRESHOLDS[f.name as keyof typeof THRESHOLDS]})`
    ).join(', ')}`);
  }
}
```

---

## 8. Implementation checklist

- [ ] Install `web-vitals` package
- [ ] Add reporting to your root layout (Section 3)
- [ ] Send vitals to your analytics platform (Section 4) or custom endpoint (Section 5)
- [ ] Build a dashboard showing p75 values per page for LCP, INP, CLS, TTFB
- [ ] Compare field data to your Lighthouse scores — they will differ
- [ ] Set up weekly regression alerts (Section 7)
- [ ] Check Google Search Console → Core Web Vitals report for your CrUX data
- [ ] Fix the worst-performing pages first (highest traffic × worst scores)
