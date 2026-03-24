#!/bin/bash
# Scan project for evidence of completed checklist items
# Returns JSON array of {id, found: true/false}

scan_gaps() {
  local results="[]"

  check() {
    local id="$1"
    local found="$2"
    if [ "$found" = "true" ]; then
      results=$(echo "$results" | jq --arg id "$id" '. += [{"id": $id, "found": true}]')
    else
      results=$(echo "$results" | jq --arg id "$id" '. += [{"id": $id, "found": false}]')
    fi
  }

  # CI/CD
  if [ -f ".github/workflows/ci.yml" ] || [ -f ".github/workflows/deploy.yml" ] || ls .github/workflows/*.yml 2>/dev/null | grep -q .; then
    check "cicd-pipeline" "true"
  else
    check "cicd-pipeline" "false"
  fi

  # Containerization
  if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
    check "containerization" "true"
  else
    check "containerization" "false"
  fi

  # Tests
  if find . -path ./node_modules -prune -o -name "*.test.*" -print -o -name "*.spec.*" -print 2>/dev/null | grep -q .; then
    check "unit-tests" "true"
  else
    check "unit-tests" "false"
  fi

  # E2E tests
  if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ] || [ -f "cypress.config.ts" ]; then
    check "e2e-tests" "true"
  else
    check "e2e-tests" "false"
  fi

  # Error tracking
  if grep -rq 'sentry\|@sentry' package.json 2>/dev/null; then
    check "error-tracking" "true"
  else
    check "error-tracking" "false"
  fi

  # Health endpoints
  if find . -path ./node_modules -prune -o -name "*health*" -print 2>/dev/null | grep -q .; then
    check "health-endpoints" "true"
  else
    check "health-endpoints" "false"
  fi

  # SEO basics
  if [ -f "public/robots.txt" ] || find . -path ./node_modules -prune -o -name "robots.txt" -print 2>/dev/null | grep -q .; then
    check "robots-txt" "true"
  else
    check "robots-txt" "false"
  fi

  if find . -path ./node_modules -prune -o -name "sitemap*" -print 2>/dev/null | grep -q .; then
    check "sitemap" "true"
  else
    check "sitemap" "false"
  fi

  # Legal
  if find . -path ./node_modules -prune -o -name "privacy*" -print 2>/dev/null | grep -q .; then
    check "privacy-policy" "true"
  else
    check "privacy-policy" "false"
  fi

  if find . -path ./node_modules -prune -o -name "terms*" -print 2>/dev/null | grep -q .; then
    check "terms-of-service" "true"
  else
    check "terms-of-service" "false"
  fi

  # Security headers
  if grep -rq 'helmet\|Content-Security-Policy\|X-Frame-Options' . --include="*.ts" --include="*.js" --include="*.conf" 2>/dev/null; then
    check "security-headers" "true"
  else
    check "security-headers" "false"
  fi

  # Env example
  if [ -f ".env.example" ] || [ -f ".env.sample" ]; then
    check "env-example" "true"
  else
    check "env-example" "false"
  fi

  echo "$results"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  scan_gaps
fi
