# Frontend Framework Decision Matrix

## When to use
Consult this matrix when a developer is choosing between React/Next.js, Vue/Nuxt, SvelteKit, and Astro for a new project or major rewrite.

## Decision framework

### 12-Criteria Comparison Table

| # | Criteria | Next.js (React) | Nuxt (Vue) | SvelteKit | Astro |
|---|----------|-----------------|------------|-----------|-------|
| 1 | **Developer experience** | Good — JSX is polarizing, hooks require mental model | Great — template syntax feels natural, Composition API is clean | Excellent — least boilerplate, reactive by default | Great — HTML-first, familiar feel, island architecture |
| 2 | **Performance (runtime)** | Good — Virtual DOM overhead, but RSC helps | Good — Virtual DOM, slightly lighter than React | Excellent — No virtual DOM, compiled to vanilla JS | Excellent — Zero JS by default, partial hydration |
| 3 | **Ecosystem & packages** | Massive — Largest ecosystem, most third-party packages | Large — Vuetify, PrimeVue, strong ecosystem | Growing — Smaller but quality libraries, can use some JS libs | Moderate — Integrations for React/Vue/Svelte components |
| 4 | **Learning curve** | Steep — JSX, hooks, server components, suspense | Moderate — Template syntax is approachable, docs are excellent | Low — Closest to vanilla HTML/CSS/JS | Low — HTML-first, progressive enhancement |
| 5 | **SSR / SSG support** | Excellent — App Router, RSC, ISR, static export | Excellent — Hybrid rendering, ISR, SWR | Good — SSR/SSG built-in, adapters for platforms | Excellent — Static-first, SSR optional, hybrid |
| 6 | **TypeScript support** | Excellent — First-class, strict mode, generics | Excellent — Auto-imports, type inference, Volar | Excellent — Built-in, typed templates | Excellent — Built-in, typed frontmatter |
| 7 | **Testing ecosystem** | Excellent — Vitest, Testing Library, Playwright, Cypress | Good — Vitest, Vue Testing Library, Cypress | Good — Vitest, Testing Library, Playwright | Good — Vitest, Playwright, limited component testing |
| 8 | **Mobile story** | Good — React Native shares knowledge | Moderate — Capacitor, NativeScript | Moderate — Capacitor, Tauri for desktop | N/A — Not designed for app-like experiences |
| 9 | **Deployment options** | Excellent — Vercel (optimal), any Node host, Docker | Excellent — Any Node host, Vercel, Netlify, Docker | Good — Adapters for Vercel, Netlify, Node, Cloudflare | Excellent — Any static host, Cloudflare, Vercel |
| 10 | **Community & support** | Massive — Stack Overflow, Discord, GitHub, conferences | Large — Strong global community, Vue core team is responsive | Growing — Enthusiastic community, smaller but helpful | Growing — Fast-growing, Astro team is very responsive |
| 11 | **Hiring & talent pool** | Largest — Most React developers available | Moderate — Strong in EU/Asia, growing in US | Small — Hard to hire for, but easy to learn | Small — New framework, few specialists |
| 12 | **Bundle size** | Large — React (40KB) + Next runtime | Medium — Vue (33KB) + Nuxt runtime | Small — Compiled output, typically 5-15KB | Minimal — Zero JS default, only islands ship JS |

### Scoring summary (out of 5)

| Criteria | Next.js | Nuxt | SvelteKit | Astro |
|----------|---------|------|-----------|-------|
| DX | 3.5 | 4 | 5 | 4 |
| Performance | 3.5 | 3.5 | 5 | 5 |
| Ecosystem | 5 | 4 | 3 | 3 |
| Learning curve | 2.5 | 3.5 | 4.5 | 4.5 |
| SSR/SSG | 5 | 5 | 4 | 5 |
| TypeScript | 5 | 5 | 5 | 5 |
| Testing | 5 | 4 | 4 | 3.5 |
| Mobile | 4 | 3 | 3 | 1 |
| Deployment | 5 | 5 | 4 | 5 |
| Community | 5 | 4 | 3 | 3 |
| Hiring | 5 | 3 | 2 | 2 |
| Bundle size | 2.5 | 3 | 5 | 5 |
| **Total** | **51** | **47** | **48** | **46** |

> Scores are context-dependent. A content site weights performance/bundle higher; a SaaS weights ecosystem/hiring higher.

### Quick-pick flowchart

```
What are you building?
├── SaaS / Dashboard / CRUD app
│   ├── Team has React experience → Next.js
│   ├── Team prefers Vue → Nuxt
│   └── Solo dev, want least boilerplate → SvelteKit
├── Content site / Blog / Docs / Marketing
│   └── Astro (add React/Vue/Svelte islands if needed)
├── E-commerce
│   ├── Need maximum SEO control → Next.js or Nuxt
│   └── Mostly static catalog → Astro
├── Real-time / Collaborative app
│   └── SvelteKit (reactive state is a natural fit)
└── Mobile + Web
    └── Next.js (React Native knowledge transfer)
```

## Copy-paste template

### Next.js project scaffold

```bash
# ---- CUSTOMIZE: Replace "my-app" with your project name ----
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd my-app
```

```typescript
// src/app/layout.tsx — Root layout with metadata
// ---- CUSTOMIZE: Update metadata for your project ----
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",           // ← CUSTOMIZE
  description: "Description", // ← CUSTOMIZE
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Nuxt project scaffold

```bash
# ---- CUSTOMIZE: Replace "my-app" with your project name ----
npx nuxi@latest init my-app
cd my-app
npm install
```

```typescript
// nuxt.config.ts — Base configuration
// ---- CUSTOMIZE: Add modules you need ----
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",  // ← OPTIONAL: Remove if not using Tailwind
    "@pinia/nuxt",           // ← OPTIONAL: Remove if not using Pinia
  ],
  typescript: {
    strict: true,
  },
});
```

### SvelteKit project scaffold

```bash
# ---- CUSTOMIZE: Replace "my-app" with your project name ----
npx sv create my-app
cd my-app
npm install
```

```typescript
// svelte.config.js — Base configuration
// ---- CUSTOMIZE: Change adapter for your deploy target ----
import adapter from "@sveltejs/adapter-auto"; // ← auto-detects platform
// import adapter from "@sveltejs/adapter-vercel";
// import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

### Astro project scaffold

```bash
# ---- CUSTOMIZE: Replace "my-app" with your project name ----
npm create astro@latest my-app
cd my-app
```

```typescript
// astro.config.mjs — Base configuration
// ---- CUSTOMIZE: Add integrations you need ----
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind"; // ← OPTIONAL
import react from "@astrojs/react";       // ← OPTIONAL: For React islands
// import vue from "@astrojs/vue";         // ← OPTIONAL: For Vue islands
// import svelte from "@astrojs/svelte";   // ← OPTIONAL: For Svelte islands

export default defineConfig({
  integrations: [tailwind(), react()],
  output: "static", // ← CUSTOMIZE: "server" for SSR, "hybrid" for mixed
});
```

## Customization notes

- **If you need both static pages AND dynamic app:** Use Next.js or Nuxt with hybrid rendering. Astro can also do this with `output: "hybrid"`.
- **If you want to use multiple frameworks:** Astro is the only one that natively supports mixing React, Vue, and Svelte components on the same page.
- **If performance is your top priority:** Astro for content sites, SvelteKit for interactive apps.
- **If you need to hire developers:** Next.js has the largest talent pool by a wide margin.
- **If your team is small and wants fast iteration:** SvelteKit has the least boilerplate and fastest dev feedback loop.
- **If migrating from an existing React app:** Next.js is the obvious path — most React code ports directly.

## Companion tools

- **`alirezarezvani/claude-skills` → `senior-architect`** — Use for deeper architecture validation after framework selection. Covers patterns like micro-frontends, module federation, and monorepo strategies.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Run after scaffolding to validate project structure follows framework best practices.
