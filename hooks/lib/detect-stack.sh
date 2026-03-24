#!/bin/bash
# Detect tech stack from project files
# Returns JSON with detected stack components

detect_stack() {
  local result='{"frontend":"unknown","backend":"unknown","database":"unknown","hosting":"unknown","auth":"unknown"}'

  # Frontend detection
  if [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
    result=$(echo "$result" | jq '.frontend = "nextjs"')
  elif [ -f "nuxt.config.ts" ] || [ -f "nuxt.config.js" ]; then
    result=$(echo "$result" | jq '.frontend = "nuxt"')
  elif [ -f "svelte.config.js" ]; then
    result=$(echo "$result" | jq '.frontend = "sveltekit"')
  elif [ -f "astro.config.mjs" ]; then
    result=$(echo "$result" | jq '.frontend = "astro"')
  elif [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    result=$(echo "$result" | jq '.frontend = "vite-react"')
  fi

  # Backend detection
  if [ -f "package.json" ]; then
    if grep -q '"express"' package.json 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "express"')
    elif grep -q '"fastify"' package.json 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "fastify"')
    elif grep -q '"hono"' package.json 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "hono"')
    fi
  elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    if grep -qiE 'fastapi' requirements.txt pyproject.toml 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "fastapi"')
    elif grep -qiE 'django' requirements.txt pyproject.toml 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "django"')
    elif grep -qiE 'flask' requirements.txt pyproject.toml 2>/dev/null; then
      result=$(echo "$result" | jq '.backend = "flask"')
    fi
  fi

  # Database detection
  if grep -rq 'prisma' prisma/ package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.database = "postgres-prisma"')
  elif grep -rq 'drizzle' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.database = "postgres-drizzle"')
  elif grep -rq 'mongoose' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.database = "mongodb"')
  elif grep -rq 'supabase' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.database = "supabase"')
  fi

  # Auth detection
  if grep -rq 'next-auth\|@auth/' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.auth = "nextauth"')
  elif grep -rq '@clerk' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.auth = "clerk"')
  elif grep -rq 'supabase' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.auth = "supabase-auth"')
  elif grep -rq 'firebase' package.json 2>/dev/null; then
    result=$(echo "$result" | jq '.auth = "firebase-auth"')
  fi

  # Hosting detection
  if [ -f "vercel.json" ] || [ -f ".vercel" ]; then
    result=$(echo "$result" | jq '.hosting = "vercel"')
  elif [ -f "fly.toml" ]; then
    result=$(echo "$result" | jq '.hosting = "fly"')
  elif [ -f "railway.json" ] || [ -f "railway.toml" ]; then
    result=$(echo "$result" | jq '.hosting = "railway"')
  elif [ -f "Dockerfile" ]; then
    result=$(echo "$result" | jq '.hosting = "docker"')
  fi

  echo "$result"
}

# Run if sourced or executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  detect_stack
fi
