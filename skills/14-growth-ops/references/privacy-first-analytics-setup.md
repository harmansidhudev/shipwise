# Privacy-First Analytics Setup

Set up web analytics that respect user privacy, comply with GDPR/CCPA, and actually capture accurate data in a world of ad blockers and cookie restrictions.

## When to use

Reference this guide when choosing and implementing an analytics platform, deciding whether you need consent banners, setting up server-side tracking to avoid ad-blocker data loss, or configuring consent-aware script loading. Start here before adding any analytics to your project.

---

## 1. Decision framework

```
Do I need a cookie consent banner?
│
├── Using cookie-free analytics only (Plausible, Umami, OpenPanel)?
│   ├── No personal data collected, no cookies set
│   └── NO CONSENT BANNER NEEDED (in most jurisdictions)
│
├── Using product analytics (PostHog, Amplitude, Mixpanel)?
│   ├── Default mode uses cookies for user identification
│   ├── YES — consent banner required (GDPR, ePrivacy)
│   └── Alternative: configure cookieless mode (reduced accuracy)
│
└── Using Google Analytics?
    ├── Sets cookies, transfers data to US
    ├── YES — consent banner required
    └── Google Consent Mode v2+ required for EU (since March 2024)
```

```
Which analytics platform should I use?
│
├── Simple site / landing page / blog?
│   └── Plausible or Umami (cookie-free, lightweight, no consent needed)
│
├── SaaS product with < 1K users?
│   ├── Need product analytics (funnels, retention, feature usage)?
│   │   └── PostHog (self-host or cloud, generous free tier)
│   └── Only need pageview + referrer data?
│       └── Plausible or Umami
│
├── SaaS product with 1K-10K users?
│   └── PostHog or Amplitude (product analytics + experimentation)
│
└── SaaS product with 10K+ users?
    └── PostHog (self-host for cost control) or Amplitude/Mixpanel (managed)
```

---

## 2. Platform comparison

| Platform | Type | Cookies | Self-host | Free tier | Script size | Best for |
|----------|------|---------|-----------|-----------|-------------|----------|
| **Plausible** | Web analytics | None | Yes (Docker) | 30-day trial | ~1 KB | Simple sites, landing pages |
| **Umami** | Web analytics | None | Yes (Docker/Vercel) | Unlimited (self-host) | ~2 KB | Self-hosters, ad-blocker bypass |
| **OpenPanel** | Web + product | None (default) | Yes (Docker) | Unlimited (self-host) | ~2.3 KB | Rising alternative to PostHog |
| **PostHog** | Product analytics | Yes (default) | Yes (heavy: 4+ vCPU, 16GB) | 1M events/mo | ~25 KB | SaaS product analytics |
| **Amplitude** | Product analytics | Yes | No | 100K MTU | ~35 KB | Enterprise product analytics |

---

## 3. Cookie-free analytics setup

### Umami (self-hosted)

```bash
# Deploy on Vercel (easiest)
git clone https://github.com/umami-software/umami.git
cd umami
# Set DATABASE_URL in Vercel environment variables
# Deploy via Vercel CLI or dashboard
```

```html
<!-- Add to your layout — no consent needed -->
<!-- [CUSTOMIZE] Replace src and data-website-id with your Umami instance -->
<script defer src="https://your-umami-instance.vercel.app/script.js"
        data-website-id="your-website-id"></script>
```

**Ad-blocker bypass:** Umami lets you rename the script and API endpoint:

```javascript
// next.config.js — proxy Umami through your own domain
// [CUSTOMIZE] Replace target URL with your Umami instance
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/stats/:path*',
        destination: 'https://your-umami-instance.vercel.app/:path*',
      },
    ];
  },
};
module.exports = nextConfig;
```

```html
<!-- Now load from your own domain — ad blockers won't catch it -->
<script defer src="/stats/script.js" data-website-id="your-website-id"></script>
```

### Plausible (cloud or self-hosted)

```html
<!-- Cloud (plausible.io) — no consent needed -->
<!-- [CUSTOMIZE] Replace data-domain with your site -->
<script defer data-domain="yoursite.com"
        src="https://plausible.io/js/script.js"></script>
```

```bash
# Self-host with Docker
# [CUSTOMIZE] Set your domain and email in plausible-conf.env
docker compose -f docker-compose.yml up -d
```

---

## 4. Product analytics with consent

When using cookie-based analytics (PostHog, Amplitude), you must get consent first.

### Consent-aware loading pattern (Next.js)

```tsx
// [CUSTOMIZE] Replace PostHog key and host with your values
'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

// Only initialize PostHog after user grants analytics consent
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  const consent = localStorage.getItem('analytics-consent');
  if (consent !== 'granted') return;

  posthog.init('phc_YOUR_KEY', {
    api_host: 'https://us.i.posthog.com', // or your self-hosted URL
    persistence: 'localStorage', // avoid cookies entirely
    capture_pageview: true,
    capture_pageleave: true,
  });
}

// Call this when user clicks "Accept" on your consent banner
export function grantAnalyticsConsent() {
  localStorage.setItem('analytics-consent', 'granted');
  initAnalytics();
}

// Call this when user clicks "Decline"
export function revokeAnalyticsConsent() {
  localStorage.setItem('analytics-consent', 'declined');
  posthog.opt_out_capturing();
}
```

### PostHog cookieless mode

```typescript
// [CUSTOMIZE] Replace key and host
// Cookieless mode: reduced accuracy (no cross-session identity) but no consent needed
posthog.init('phc_YOUR_KEY', {
  api_host: 'https://us.i.posthog.com',
  persistence: 'memory',            // no cookies, no localStorage
  disable_persistence: true,         // no persistent user ID
  autocapture: false,                // only capture explicit events
  capture_pageview: true,
});
```

Trade-off: cookieless PostHog can't track returning users across sessions. Funnel and retention analysis will be inaccurate. Use this only if you can't implement consent banners.

---

## 5. Server-side tracking proxy

Ad blockers block 30-40% of analytics requests. A server-side proxy routes analytics through your own domain, making it invisible to blockers.

### Next.js API route proxy

```typescript
// app/api/analytics/route.ts
// [CUSTOMIZE] Replace POSTHOG_HOST with your PostHog instance
import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_HOST = 'https://us.i.posthog.com';

export async function POST(req: NextRequest) {
  const body = await req.text();

  const response = await fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  return NextResponse.json(await response.json());
}
```

```typescript
// Then configure PostHog to use your proxy
// [CUSTOMIZE] Update api_host to your proxy route
posthog.init('phc_YOUR_KEY', {
  api_host: '/api/analytics', // goes through your domain
});
```

### Nginx reverse proxy (for non-Next.js apps)

```nginx
# [CUSTOMIZE] Replace proxy_pass URL with your analytics endpoint
location /analytics/ {
    proxy_pass https://us.i.posthog.com/;
    proxy_set_header Host us.i.posthog.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_ssl_server_name on;
}
```

---

## 6. Do I need consent? Quick reference

| Setup | Cookies | Personal data | Consent needed | Notes |
|-------|---------|--------------|----------------|-------|
| Plausible/Umami (default) | No | No | No | Aggregate data only |
| OpenPanel (default) | No | No | No | Cookie-free by default |
| PostHog (cookieless mode) | No | Minimal | Possibly no | Depends on jurisdiction; get legal advice |
| PostHog (default) | Yes | Yes (user ID, IP) | Yes | Standard consent banner |
| Google Analytics 4 | Yes | Yes | Yes | Google Consent Mode v2+ required in EU |
| Amplitude | Yes | Yes | Yes | Standard consent banner |
| Hotjar/Contentsquare | Yes | Yes (session replay) | Yes | Extra care: session replay may capture PII |

**Rule of thumb:** If your analytics tool sets cookies OR stores a persistent user identifier, you need consent in the EU. In the US, CCPA requires a "Do Not Sell" opt-out but not pre-consent.

---

## 7. Data loss comparison

| Threat | Impact without mitigation | Mitigation |
|--------|--------------------------|------------|
| Ad blockers | 30-40% of sessions lost | Server-side proxy (Section 5) |
| Safari ITP | JS cookies expire after 7 days | Server-set first-party cookies |
| Consent decline | 20-40% decline analytics (EU) | Cookie-free analytics (no consent needed) |
| Chrome 3P cookie deprecation | Breaks cross-site tracking | First-party only (PostHog/Plausible already) |

**Best accuracy setup:** Cookie-free analytics (Umami/Plausible) + server-side proxy = ~95% session capture with zero consent requirements.

---

## 8. Implementation checklist

- [ ] Choose analytics platform (use decision framework in Section 1)
- [ ] If cookie-free: add script tag, done — no consent banner needed
- [ ] If cookie-based: implement consent banner (see `cookie-consent-guide.md` in skill 12)
- [ ] If cookie-based: implement consent-aware loading (Section 4)
- [ ] Set up server-side proxy to avoid ad-blocker data loss (Section 5)
- [ ] Verify tracking works with ad blocker enabled (test in browser)
- [ ] Add analytics to your event taxonomy (see `event-taxonomy-template.md`)
- [ ] Document your analytics setup in your privacy policy
