# Cookie Consent Implementation Guide

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide when implementing cookie consent for the first time, migrating from a basic banner to a compliant CMP (Consent Management Platform), adding new third-party scripts that set cookies, or preparing for GDPR/ePrivacy audits. Use the cookie audit template to inventory your cookies and the copy-paste templates to implement consent-aware loading.

## Decision framework

```
Do you need cookie consent?
├── Do you set ANY cookies beyond strictly necessary?
│   ├── Yes → You need a consent mechanism
│   └── No (only session/auth/CSRF cookies) → Banner recommended but not legally required
│
├── Do you have EU/EEA/UK users?
│   ├── Yes → Full GDPR + ePrivacy compliance required
│   │   ├── Opt-IN required before setting non-essential cookies
│   │   ├── Granular category controls required
│   │   └── Consent proof must be stored
│   └── No → Check applicable local laws
│
├── Do you have California users?
│   ├── Yes → CCPA: "Do Not Sell/Share" mechanism
│   │   └── GPC (Global Privacy Control) signal must be honored
│   └── No → Check other US state laws
│
└── Implementation approach?
    ├── Low traffic / simple site → Lightweight custom banner
    ├── Medium complexity → Open-source CMP (cookie-consent, tarteaucitron)
    └── Enterprise / ads / TCF required → Commercial CMP (OneTrust, CookieYes, Osano)
```

---

## Cookie Categories

| Category | Examples | Consent needed? | Can be blocked? |
|----------|---------|-----------------|-----------------|
| **Strictly necessary** | Session cookies, CSRF tokens, auth tokens, load balancer cookies | No | No (must always function) |
| **Analytics / Performance** | Google Analytics, Mixpanel, Hotjar, Plausible | Yes (EU) | Yes |
| **Functional / Preferences** | Language preference, theme, recently viewed | Yes (EU) | Yes |
| **Marketing / Advertising** | Google Ads, Facebook Pixel, retargeting, affiliate tracking | Yes (all major jurisdictions) | Yes |

---

## GDPR vs ePrivacy Requirements

| Requirement | GDPR | ePrivacy Directive | Practical impact |
|-------------|------|-------------------|-----------------|
| **Consent standard** | Freely given, specific, informed, unambiguous | Prior consent for non-essential cookies | Opt-in before any tracking |
| **Pre-ticked boxes** | Not valid consent | Not valid consent | All categories must default to OFF |
| **Cookie wall** | Generally not allowed (EDPB guidance) | Varies by country | Do not block content behind consent |
| **Granular control** | Required per purpose | Required per category | Separate toggles per category |
| **Withdraw consent** | Must be as easy as giving it | Must be easy | Persistent settings link in footer |
| **Consent proof** | Must demonstrate consent was given | Must be able to prove consent | Store timestamp, categories, version |
| **Consent duration** | Reasonable period | Varies (6-12 months typical) | Re-ask consent every 12 months |
| **DNT / GPC signal** | Not legally binding (but recommended) | Not legally binding | Honor GPC under CCPA |

---

## Cookie Audit Template

Complete this audit for every cookie your site sets. Run it quarterly or when adding new third-party scripts.

```markdown
## Cookie Audit — [CUSTOMIZE: PROJECT_NAME]

**Audit date:** [CUSTOMIZE: DATE]
**Audited by:** [CUSTOMIZE: NAME]
**Method:** Browser DevTools > Application > Cookies + network inspection

### Cookies Found

| Cookie name | Domain | Category | Set by | Purpose | Duration | Contains PII? |
|-------------|--------|----------|--------|---------|----------|---------------|
| `session_id` | .yoursite.com | Necessary | Server | Session management | Session | No |
| `csrf_token` | .yoursite.com | Necessary | Server | CSRF protection | Session | No |
| `_ga` | .yoursite.com | Analytics | Google Analytics | User identification | 2 years | Yes (client ID) |
| `_gid` | .yoursite.com | Analytics | Google Analytics | Session identification | 24 hours | Yes (client ID) |
| `_fbp` | .yoursite.com | Marketing | Facebook Pixel | Ad targeting | 3 months | Yes |
| [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |

### Third-Party Scripts That Set Cookies

| Script | Loaded from | Cookies set | Category | Consent required? |
|--------|-------------|-------------|----------|-------------------|
| Google Analytics | googletagmanager.com | _ga, _gid, _gat | Analytics | Yes |
| [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |

### Action Items

- [ ] All cookies documented above
- [ ] Each cookie assigned to a category
- [ ] Non-essential cookies blocked until consent
- [ ] Cookie policy updated to reflect current cookies
- [ ] No unknown or undocumented cookies found
```

---

## Copy-paste templates

### Cookie consent banner component (React + TypeScript)

```tsx
// components/CookieConsent.tsx
// [CUSTOMIZE] Adapt styling, categories, and persistence to your stack

import { useState, useEffect, useCallback } from 'react';

// [CUSTOMIZE] Define your cookie categories
const COOKIE_CATEGORIES = {
  necessary: {
    label: 'Strictly Necessary',
    description: 'Required for the site to function. Cannot be disabled.',
    required: true,
  },
  analytics: {
    label: 'Analytics',
    description: 'Help us understand how visitors interact with the site.',
    required: false,
  },
  marketing: {
    label: 'Marketing',
    description: 'Used to deliver relevant advertisements.',
    required: false,
  },
  preferences: {
    label: 'Preferences',
    description: 'Remember your settings and preferences.',
    required: false,
  },
} as const;

type CategoryKey = keyof typeof COOKIE_CATEGORIES;

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface ConsentRecord {
  categories: ConsentState;
  timestamp: string;
  version: string; // [CUSTOMIZE] Increment when cookie policy changes
}

const CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = '1.0'; // [CUSTOMIZE] Update when policy changes

function getStoredConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const record: ConsentRecord = JSON.parse(raw);
    // Re-ask if consent version has changed
    if (record.version !== CONSENT_VERSION) return null;
    return record;
  } catch {
    return null;
  }
}

function storeConsent(categories: ConsentState): void {
  const record: ConsentRecord = {
    categories,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));

  // [CUSTOMIZE] Also send to server for audit trail
  // fetch('/api/consent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(record),
  // });
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored.categories);
      applyConsent(stored.categories);
    } else {
      setVisible(true);
    }
  }, []);

  const applyConsent = useCallback((categories: ConsentState) => {
    // [CUSTOMIZE] Enable/disable scripts based on consent
    if (categories.analytics) {
      // Load analytics scripts
      loadAnalytics();
    }
    if (categories.marketing) {
      // Load marketing scripts
      loadMarketing();
    }

    // Dispatch event for other scripts to react to
    window.dispatchEvent(
      new CustomEvent('cookie-consent-update', { detail: categories })
    );
  }, []);

  const handleAcceptAll = () => {
    const all: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setConsent(all);
    storeConsent(all);
    applyConsent(all);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const minimal: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setConsent(minimal);
    storeConsent(minimal);
    applyConsent(minimal);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    storeConsent(consent);
    applyConsent(consent);
    setVisible(false);
  };

  const toggleCategory = (key: CategoryKey) => {
    if (COOKIE_CATEGORIES[key].required) return;
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  // [CUSTOMIZE] Replace with your design system components and styles
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '1rem',
        zIndex: 9999,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 0.75rem' }}>
          We use cookies to improve your experience. You can choose which
          categories to allow.{' '}
          <a href="/cookie-policy">{/* [CUSTOMIZE] Link to your cookie policy */}
            Learn more
          </a>
        </p>

        {showDetails && (
          <div style={{ margin: '0.75rem 0' }}>
            {(Object.entries(COOKIE_CATEGORIES) as [CategoryKey, typeof COOKIE_CATEGORIES[CategoryKey]][]).map(
              ([key, cat]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: '0.5rem 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consent[key]}
                    disabled={cat.required}
                    onChange={() => toggleCategory(key)}
                  />
                  <span>
                    <strong>{cat.label}</strong> — {cat.description}
                  </span>
                </label>
              )
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleAcceptAll}>Accept All</button>
          <button onClick={handleRejectAll}>Reject All</button>
          {!showDetails ? (
            <button onClick={() => setShowDetails(true)}>
              Manage Preferences
            </button>
          ) : (
            <button onClick={handleSavePreferences}>Save Preferences</button>
          )}
        </div>
      </div>
    </div>
  );
}

// [CUSTOMIZE] Replace with your actual script loaders
function loadAnalytics() {
  // Example: Google Analytics 4
  // if (document.getElementById('ga-script')) return;
  // const script = document.createElement('script');
  // script.id = 'ga-script';
  // script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  // document.head.appendChild(script);
}

function loadMarketing() {
  // Example: Facebook Pixel
  // Load only after marketing consent is given
}
```

### Consent storage utility

```ts
// lib/consent.ts
// [CUSTOMIZE] Server-side consent record for audit trail

export interface ConsentRecord {
  userId?: string;        // [CUSTOMIZE] Your user ID, if authenticated
  sessionId: string;      // Anonymous session identifier
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  timestamp: string;      // ISO 8601
  version: string;        // Cookie policy version
  gpcSignal: boolean;     // Was GPC header present?
  userAgent: string;      // For audit (not for tracking)
  ip?: string;            // For jurisdiction detection, hash or discard after
}

// [CUSTOMIZE] API route — Express/Next.js example
// POST /api/consent
export async function handleConsentRecord(req: Request): Promise<Response> {
  const body = await req.json();

  // Check for GPC signal (Global Privacy Control)
  const gpcSignal =
    req.headers.get('Sec-GPC') === '1' ||
    req.headers.get('DNT') === '1';

  const record: ConsentRecord = {
    sessionId: body.sessionId || generateSessionId(),
    categories: {
      necessary: true, // Always true
      analytics: gpcSignal ? false : body.categories?.analytics ?? false,
      marketing: gpcSignal ? false : body.categories?.marketing ?? false,
      preferences: body.categories?.preferences ?? false,
    },
    timestamp: new Date().toISOString(),
    version: body.version || '1.0',
    gpcSignal,
    userAgent: req.headers.get('user-agent') || '',
  };

  // [CUSTOMIZE] Store in your database
  // await db.consentRecords.create({ data: record });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

function generateSessionId(): string {
  return crypto.randomUUID();
}
```

### GTM Consent Mode v2 integration

```html
<!-- [CUSTOMIZE] Place in <head> BEFORE the GTM container snippet -->
<script>
  // Default: deny all non-essential until user consents
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  // [CUSTOMIZE] Set defaults based on user's region
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',  // Always granted (necessary)
    'wait_for_update': 500,         // Wait 500ms for consent before firing tags
  });

  // Listen for consent updates from your CMP
  window.addEventListener('cookie-consent-update', function(e) {
    var categories = e.detail;

    gtag('consent', 'update', {
      'analytics_storage': categories.analytics ? 'granted' : 'denied',
      'ad_storage': categories.marketing ? 'granted' : 'denied',
      'ad_user_data': categories.marketing ? 'granted' : 'denied',
      'ad_personalization': categories.marketing ? 'granted' : 'denied',
      'functionality_storage': categories.preferences ? 'granted' : 'denied',
      'personalization_storage': categories.preferences ? 'granted' : 'denied',
    });
  });
</script>

<!-- [CUSTOMIZE] Your GTM container snippet goes AFTER the consent defaults -->
<!-- <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script> -->
```

### GPC / DNT signal detection (middleware)

```ts
// middleware/gpc.ts
// [CUSTOMIZE] Add to your middleware chain (Express, Next.js, etc.)

import { NextRequest, NextResponse } from 'next/server';

export function gpcMiddleware(req: NextRequest): NextResponse {
  const gpc = req.headers.get('Sec-GPC');
  const dnt = req.headers.get('DNT');

  const response = NextResponse.next();

  // Pass GPC signal to client for consent banner default state
  if (gpc === '1' || dnt === '1') {
    response.headers.set('X-GPC-Signal', '1');
    // Under CCPA, GPC signal must be treated as opt-out of sale/sharing
    // Under some EU DPAs, treat as withdrawal of consent for marketing
  }

  return response;
}
```

---

## Customization notes

1. **Server-side consent storage** — Client-side storage (localStorage/cookies) can be cleared by users. For GDPR audit trail, always send a copy to your server.
2. **Consent re-prompting** — Re-ask consent every 12 months or when your cookie policy version changes. Increment `CONSENT_VERSION` to trigger re-prompting.
3. **GPC signal** — Under CCPA, the Global Privacy Control signal must be honored as an opt-out of sale/sharing. Under GDPR, it is not legally binding but treating it as consent withdrawal is recommended by some DPAs.
4. **Cookie walls** — Do not block access to your site if users reject cookies. The EDPB considers cookie walls generally non-compliant. Offer a degraded experience if needed, but core functionality must remain accessible.
5. **Third-party script management** — The biggest compliance risk is third-party scripts that set cookies before consent. Use GTM Consent Mode or load scripts programmatically after consent is recorded.
6. **Testing** — Test in incognito mode. Verify that no analytics/marketing cookies are set before consent. Use browser DevTools > Application > Cookies to check.
7. **TCF 2.2** — If you run programmatic advertising (Google Ads, prebid), you need IAB Transparency & Consent Framework (TCF) support. Use a certified CMP (OneTrust, Didomi, Sourcepoint).

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
- CookieYes, Osano, OneTrust — commercial CMPs
- Cookiebot, tarteaucitron.js — open-source / freemium alternatives
- Google Tag Manager Consent Mode — consent-aware tag management
