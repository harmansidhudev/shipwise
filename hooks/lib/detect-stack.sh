#!/bin/bash
# Detect tech stack from project files
# Usage: source hooks/lib/detect-stack.sh; detect_stack

detect_stack() {
  local stack=""

  # Frontend framework
  if [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
    stack="$stack,nextjs"
  elif [ -f "nuxt.config.ts" ] || [ -f "nuxt.config.js" ]; then
    stack="$stack,nuxt"
  elif [ -f "svelte.config.js" ]; then
    stack="$stack,sveltekit"
  elif [ -f "astro.config.mjs" ] || [ -f "astro.config.ts" ]; then
    stack="$stack,astro"
  fi

  # Package manager
  if [ -f "pnpm-lock.yaml" ]; then
    stack="$stack,pnpm"
  elif [ -f "yarn.lock" ]; then
    stack="$stack,yarn"
  elif [ -f "bun.lockb" ]; then
    stack="$stack,bun"
  elif [ -f "package-lock.json" ]; then
    stack="$stack,npm"
  fi

  # Backend / language
  if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    stack="$stack,python"
  fi
  if [ -f "go.mod" ]; then
    stack="$stack,go"
  fi
  if [ -f "Cargo.toml" ]; then
    stack="$stack,rust"
  fi

  # Database
  if [ -f "prisma/schema.prisma" ]; then
    stack="$stack,prisma"
  elif [ -f "drizzle.config.ts" ] || [ -f "drizzle.config.js" ]; then
    stack="$stack,drizzle"
  fi
  if grep -rql "mongodb" package.json 2>/dev/null; then
    stack="$stack,mongodb"
  fi

  # Infrastructure
  if [ -f "Dockerfile" ]; then
    stack="$stack,docker"
  fi
  if [ -f "vercel.json" ] || [ -f ".vercel/project.json" ]; then
    stack="$stack,vercel"
  fi
  if [ -f "fly.toml" ]; then
    stack="$stack,fly"
  fi
  if [ -f "railway.json" ] || [ -f "railway.toml" ]; then
    stack="$stack,railway"
  fi

  # Testing
  if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    stack="$stack,playwright"
  fi
  if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    stack="$stack,vitest"
  fi
  if [ -f "jest.config.ts" ] || [ -f "jest.config.js" ]; then
    stack="$stack,jest"
  fi

  # Auth
  if grep -rql "next-auth\|@auth/" package.json 2>/dev/null; then
    stack="$stack,nextauth"
  elif grep -rql "@clerk" package.json 2>/dev/null; then
    stack="$stack,clerk"
  elif grep -rql "@supabase" package.json 2>/dev/null; then
    stack="$stack,supabase"
  fi

  # Monitoring
  if grep -rql "@sentry" package.json 2>/dev/null; then
    stack="$stack,sentry"
  fi

  # Payments
  if grep -rql "stripe" package.json 2>/dev/null; then
    stack="$stack,stripe"
  fi

  # Remove leading comma
  echo "$stack" | sed 's/^,//'
}
