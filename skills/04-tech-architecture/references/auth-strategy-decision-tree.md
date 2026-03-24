# Auth Strategy Decision Tree

## When to use
Consult this tree when choosing an authentication and authorization strategy for your application.

## Decision framework

### Primary decision flowchart

```
START: What kind of app are you building?
│
├─ B2B SaaS (organizations, roles, SSO)
│  │
│  ├─ Need enterprise SSO (SAML/SCIM)?
│  │  │
│  │  ├─ YES, core requirement ──→ ✅ Auth0
│  │  │   (Most complete enterprise features, SAML, SCIM, orgs, MFA)
│  │  │
│  │  └─ NICE-TO-HAVE ──→ ✅ Clerk
│  │      (SSO available on paid plans, better DX, pre-built components)
│  │
│  └─ No enterprise SSO needed
│     └─ ✅ Clerk (best DX, org management, pre-built UI)
│
├─ B2C app (consumers, social login)
│  │
│  ├─ Using Supabase for database?
│  │  └─ YES ──→ ✅ Supabase Auth (built-in, RLS integration, free)
│  │
│  ├─ Using Next.js?
│  │  │
│  │  ├─ Want pre-built UI components ──→ ✅ Clerk
│  │  └─ Just need social + email login ──→ ✅ Auth.js (NextAuth)
│  │
│  ├─ Using Firebase/Google Cloud?
│  │  └─ ✅ Firebase Auth (tight integration, generous free tier)
│  │
│  └─ Other framework / want full control
│     └─ ✅ Lucia (lightweight, any framework, self-hosted)
│
├─ API-only (no frontend)
│  │
│  ├─ Microservices / service-to-service
│  │  └─ ✅ Custom JWT (RS256, short-lived tokens, API keys for services)
│  │
│  └─ Developer-facing API
│     └─ ✅ Custom JWT + API keys (standard for developer APIs)
│
└─ Legacy / specific requirements
   └─ ✅ Custom session (server-side sessions, full control, no dependencies)
```

### The 8 options compared

| Provider | Type | Free tier | Best for | SSO | Pre-built UI | Framework lock-in | Complexity |
|----------|------|-----------|----------|-----|-------------|-------------------|------------|
| **Auth0** | Managed | 7,500 MAU | Enterprise B2B | SAML, SCIM, OIDC | Universal Login | None | High |
| **Clerk** | Managed | 10,000 MAU | B2B/B2C with UI | SAML (paid) | Full component library | None (best with React) | Low |
| **Supabase Auth** | Managed | 50,000 MAU | Supabase projects | SAML (paid) | Minimal | Supabase | Low |
| **Auth.js** | Self-hosted | Unlimited | Next.js social login | Via providers | None (DIY) | Next.js (best), others via adapters | Medium |
| **Firebase Auth** | Managed | 50,000 MAU | Google ecosystem | SAML (Blaze plan) | FirebaseUI | Firebase | Low |
| **Lucia** | Self-hosted | Unlimited | Full control, any framework | DIY | None (DIY) | None | Medium |
| **Custom JWT** | Self-built | Unlimited | APIs, microservices | DIY | None | None | High |
| **Custom session** | Self-built | Unlimited | Legacy, specific needs | DIY | None | None | High |

### Cost scaling comparison

| MAU | Auth0 | Clerk | Supabase Auth | Auth.js | Firebase Auth |
|-----|-------|-------|--------------|---------|---------------|
| 1K | Free | Free | Free | Free | Free |
| 10K | Free | Free | Free | Free | Free |
| 25K | ~$240/mo | ~$75/mo | Free | Free | Free |
| 50K | ~$480/mo | ~$200/mo | Free | Free | Free |
| 100K | ~$960/mo | ~$400/mo | ~$25/mo (Pro) | Free | ~$55/mo |
| 500K | Custom | Custom | ~$25/mo (Pro) | Free | ~$275/mo |

> Note: Prices are approximate and vary based on features used. Auth.js and Lucia are free but you pay for infrastructure.

### Security checklist (applies to all options)

- [ ] HTTPS everywhere (no exceptions)
- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Password requirements enforced (if email/password)
- [ ] MFA available and encouraged
- [ ] Session invalidation on password change
- [ ] Brute-force protection (account lockout or exponential backoff)
- [ ] Secure password reset flow (time-limited, single-use tokens)
- [ ] OAuth state parameter validated (prevent CSRF in OAuth flow)

## Copy-paste template

### Clerk (Next.js App Router)

```typescript
// middleware.ts — Clerk middleware for Next.js
// ---- CUSTOMIZE: Update public routes ----
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",   // ← CUSTOMIZE: Add your public routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

```typescript
// src/app/layout.tsx — Wrap app with ClerkProvider
// ---- CUSTOMIZE: Update appearance ----
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

```typescript
// src/app/dashboard/page.tsx — Protected page with user data
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      {/* Your dashboard content */}
    </div>
  );
}
```

```bash
# Install
npm install @clerk/nextjs

# .env.local — CUSTOMIZE: Add your Clerk keys
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Auth.js v5 (NextAuth) with GitHub + Google

```typescript
// auth.ts — Auth.js configuration
// ---- CUSTOMIZE: Add/remove providers, update adapter ----
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),  // ← CUSTOMIZE: Use your DB adapter
  providers: [
    GitHub,   // ← Uses GITHUB_ID and GITHUB_SECRET env vars
    Google,   // ← Uses GOOGLE_ID and GOOGLE_SECRET env vars
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

```typescript
// app/api/auth/[...nextauth]/route.ts — API route handler
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

```typescript
// middleware.ts — Protect routes
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/") {
    const newUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"], // ← CUSTOMIZE
};
```

```bash
# Install
npm install next-auth@beta @auth/drizzle-adapter

# .env.local — CUSTOMIZE: Add your provider credentials
# AUTH_SECRET=... (run: npx auth secret)
# AUTH_GITHUB_ID=...
# AUTH_GITHUB_SECRET=...
# AUTH_GOOGLE_ID=...
# AUTH_GOOGLE_SECRET=...
```

### Supabase Auth (with RLS)

```typescript
// src/lib/supabase/server.ts — Server client
// ---- CUSTOMIZE: This works with Next.js App Router ----
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}
```

```typescript
// src/app/auth/login/route.ts — Login with email/password
// ---- CUSTOMIZE: Add your redirect URL ----
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
```

```sql
-- Supabase RLS policy example
-- ---- CUSTOMIZE: Apply to your tables ----
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can read all published posts
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

-- Users can only edit their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can only insert posts as themselves
CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

```bash
# Install
npm install @supabase/supabase-js @supabase/ssr
```

### Custom JWT (API-only)

```typescript
// src/lib/auth/jwt.ts — JWT utilities
// ---- CUSTOMIZE: Update secret and claims ----
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const ISSUER = "my-app";           // ← CUSTOMIZE
const AUDIENCE = "my-app-api";     // ← CUSTOMIZE
const ACCESS_TOKEN_TTL = "15m";    // ← CUSTOMIZE: Short-lived
const REFRESH_TOKEN_TTL = "7d";    // ← CUSTOMIZE: Longer-lived

interface TokenPayload extends JWTPayload {
  sub: string;    // user ID
  email: string;
  role: string;
}

export async function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload as TokenPayload;
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(JWT_SECRET);
}
```

```bash
# Install
npm install jose
# Generate a secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Customization notes

- **Clerk vs Auth0:** Clerk has better DX, lower cost, and pre-built components. Auth0 has deeper enterprise features (SCIM provisioning, Breached Password Detection, extensibility with Actions). For most startups, Clerk is the better starting point.
- **Auth.js caveats:** v5 is a significant rewrite. Session strategy (JWT vs database) affects behavior. Database sessions are more secure but slower. JWT sessions are faster but harder to invalidate.
- **Supabase Auth + RLS:** This is the most secure pattern because authorization happens at the database level. No application code can bypass RLS policies. Use this for multi-tenant apps on Supabase.
- **Custom JWT: when it makes sense:** Only for API-only services, microservice-to-microservice auth, or when you have a dedicated security team. For web apps, use a managed provider.
- **Custom sessions: when it makes sense:** Legacy systems, very specific compliance requirements, or when you need complete control over session storage and invalidation. Not recommended for new projects.
- **Token storage:** Always use httpOnly cookies. Never store JWTs in localStorage (XSS vulnerable). For mobile apps, use secure storage (Keychain on iOS, Keystore on Android).
- **MFA:** All managed providers support MFA. Enable it. At minimum, offer TOTP (authenticator app). SMS-based MFA is better than nothing but vulnerable to SIM swapping.

## Companion tools

- **`alirezarezvani/claude-skills` → `senior-architect`** — Use for auth architecture review: token rotation strategies, multi-tenant auth patterns, zero-trust architecture design.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Validates auth middleware implementation, checks for common security misconfigurations (missing CSRF, token in localStorage, etc.).
