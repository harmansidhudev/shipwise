# CORS Configuration

## When to use

Reference this document when your frontend and backend are on different origins (e.g., `app.example.com` calling `api.example.com`), when you see "has been blocked by CORS policy" errors, or when reviewing security configuration for API endpoints.

---

## What CORS Is and Why It Exists

<!-- beginner -->
**CORS (Cross-Origin Resource Sharing)** is a browser security feature. By default, browsers block web pages from making requests to a different domain than the one that served the page. This prevents malicious sites from making requests to your API using your users' cookies.

For example: if your user is logged into `your-bank.com`, a malicious site at `evil-site.com` cannot make a fetch request to `your-bank.com/api/transfer` — the browser blocks it because the origins are different. This is called the **Same-Origin Policy**.

CORS is the mechanism that lets you selectively relax this restriction. You tell the browser: "Requests from `my-app.com` are allowed to hit `my-api.com`." Without CORS headers, the browser rejects the response even if the server processed the request successfully.

**Key concept:** CORS is enforced by the **browser**, not the server. Your API still receives and processes the request — the browser just refuses to show the response to the JavaScript that made the request. This means CORS does NOT protect your API from non-browser clients (curl, Postman, server-to-server). It protects your users' browsers from malicious websites.
<!-- /beginner -->

---

## Allowed Origins Configuration

### Never use `*` in production

```
Access-Control-Allow-Origin: *
```

This header says "any website can make requests to this API." This is dangerous when your API uses cookies or authentication. A malicious site could make requests to your API as any logged-in user.

**When `*` is acceptable:**
- Truly public APIs with no auth (weather data, public datasets)
- Development/local testing only

**Production rule:** Always specify exact origins.

```typescript
// Correct: explicit allow list
const ALLOWED_ORIGINS = [
  'https://app.example.com',
  'https://www.example.com',
];

// In development, you might add:
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
}
```

---

## Credentials and Cookies with CORS

When your API uses cookies (session tokens, CSRF tokens), you need two things:

1. **Server:** Set `Access-Control-Allow-Credentials: true`
2. **Client:** Include `credentials: 'include'` in fetch requests

```typescript
// Client-side fetch
const response = await fetch('https://api.example.com/data', {
  credentials: 'include', // sends cookies with the request
});

// Server-side headers
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', 'https://app.example.com');
// IMPORTANT: When Allow-Credentials is true, Allow-Origin CANNOT be '*'
// You must specify the exact origin
```

---

## Preflight Requests (OPTIONS Handling)

Browsers send a **preflight request** (HTTP OPTIONS) before certain cross-origin requests to ask the server: "Is this request type allowed?" This happens when:

- The request uses methods other than GET, HEAD, or POST
- The request includes custom headers (e.g., `Authorization`, `Content-Type: application/json`)
- The request uses POST with a content type other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`

The server must respond to OPTIONS with the appropriate CORS headers:

```typescript
// Handle preflight
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight for 24h
  res.status(204).end();
  return;
}
```

**Performance tip:** Set `Access-Control-Max-Age` to cache preflight responses. Without it, the browser sends an OPTIONS request before every actual request, doubling your API traffic.

---

## Copy-Paste Configurations

### Next.js (next.config.js headers)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || 'https://app.example.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Next.js API Route Middleware

For more dynamic control (e.g., checking against an allow list):

```typescript
// lib/cors.ts
const ALLOWED_ORIGINS = [
  'https://app.example.com',
  'https://www.example.com',
];

if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
}

export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin') ?? '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

// app/api/[...route]/route.ts
import { corsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: Request) {
  const data = { message: 'Hello' };
  return Response.json(data, { headers: corsHeaders(req) });
}
```

### Express (cors package)

```typescript
// server.ts
import express from 'express';
import cors from 'cors';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.example.com',
      'https://www.example.com',
    ];

    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Your routes here
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello' });
});

app.listen(3001);
```

### Nginx

```nginx
# /etc/nginx/conf.d/cors.conf or within a server/location block

# Map to check allowed origins
map $http_origin $cors_origin {
    default "";
    "https://app.example.com" $http_origin;
    "https://www.example.com" $http_origin;
}

server {
    listen 443 ssl;
    server_name api.example.com;

    location /api/ {
        # CORS headers
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '86400' always;

        # Handle preflight
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        proxy_pass http://backend;
    }
}
```

---

## Common CORS Errors and Fixes

### "has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** Your server is not sending the `Access-Control-Allow-Origin` header.

**Fix:** Add the CORS headers to your server response. If using a framework, install the CORS middleware. If using Nginx as a reverse proxy, make sure the headers are added at the Nginx level, not just the application level.

---

### "has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*' when the request's credentials mode is 'include'"

**Cause:** You set `Access-Control-Allow-Origin: *` but also set `credentials: 'include'` on the client. These are incompatible.

**Fix:** Replace `*` with the specific origin:
```
Access-Control-Allow-Origin: https://app.example.com
```

---

### "Request header field content-type is not allowed by Access-Control-Allow-Headers"

**Cause:** Your preflight response doesn't list `Content-Type` in `Access-Control-Allow-Headers`, but your request sends `Content-Type: application/json`.

**Fix:** Add `Content-Type` to the allowed headers:
```
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

### "Method PUT is not allowed by Access-Control-Allow-Methods"

**Cause:** Your preflight response doesn't include `PUT` in the allowed methods.

**Fix:** Add all methods your API uses:
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

### CORS works in development but fails in production

**Common causes:**
1. **Different origins:** Development uses `http://localhost:3000`, production uses `https://app.example.com`. Your allow list needs both.
2. **Reverse proxy strips headers:** Nginx or a CDN sitting in front of your API may strip CORS headers. Add `always` to Nginx `add_header` directives.
3. **Redirect changes origin:** If your API redirects (e.g., HTTP → HTTPS), the redirect response may not include CORS headers. Fix: ensure CORS headers are on ALL responses, including redirects.
4. **CDN caches responses without Vary header:** Add `Vary: Origin` so the CDN caches different CORS responses per origin.

---

### Preflight succeeds but actual request fails

**Cause:** CORS headers are only set on the OPTIONS handler, not on the actual GET/POST/etc. handler.

**Fix:** Set CORS headers on ALL responses, not just preflight. Use middleware (Express `cors()`, Next.js headers config) to apply them globally.

---

## Security Implications of Misconfigured CORS

| Misconfiguration | Risk | Impact |
|-----------------|------|--------|
| `Allow-Origin: *` with credentials | Any site can make authenticated requests as your users | Account takeover, data theft |
| Reflecting the `Origin` header without validation | Attacker sets `Origin: evil.com`, your server echoes it back | Same as `*` — any origin is allowed |
| Overly broad regex for origin matching | `.*example.com` matches `evil-example.com` | Origin bypass |
| Missing `Vary: Origin` with CDN | CDN caches one origin's response and serves it to another | Either blocks legitimate requests or allows illegitimate ones |
| CORS on internal/admin APIs | If admin panel is on a different origin, CORS errors push devs toward `*` | Weakened admin security |

### Checklist

- [ ] Production `Allow-Origin` uses an explicit allow list (never `*` with auth)
- [ ] Origin validation uses exact string matching (not regex, not substring)
- [ ] `Allow-Credentials` is only set when cookies are actually needed
- [ ] `Vary: Origin` is set when behind a CDN
- [ ] Preflight `Max-Age` is set to reduce OPTIONS traffic
- [ ] CORS headers are on ALL responses (not just OPTIONS)
- [ ] Development origins (`localhost`) are excluded from production config
