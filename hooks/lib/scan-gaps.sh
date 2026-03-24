#!/bin/bash
# Scan for evidence of completed checklist items
# Usage: source hooks/lib/scan-gaps.sh; scan_gaps STATE_FILE

scan_gaps() {
  local STATE_FILE="$1"
  local UPDATED=false

  mark_done() {
    local item_id="$1"
    local current=$(jq -r --arg id "$item_id" '.items[] | select(.id == $id) | .status' "$STATE_FILE" 2>/dev/null)
    if [ "$current" = "todo" ]; then
      jq --arg id "$item_id" '(.items[] | select(.id == $id)).status = "done"' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      UPDATED=true
    fi
  }

  has_file() {
    find . -path "./.git" -prune -o -path "./node_modules" -prune -o -name "$1" -print 2>/dev/null | grep -q .
  }

  has_content() {
    grep -rql "$1" --include="$2" . 2>/dev/null
  }

  # CI/CD
  has_file "ci.yml" && mark_done "cicd-pipeline"
  has_file "*.yml" && [ -d ".github/workflows" ] && mark_done "cicd-pipeline"

  # Containerization
  has_file "Dockerfile" && mark_done "containerization"
  has_file "docker-compose*.yml" && mark_done "containerization"

  # IaC
  has_file "*.tf" && mark_done "iac"

  # Error tracking
  has_content "@sentry" "package.json" && mark_done "error-tracking"
  has_file "sentry.client.config.*" && mark_done "error-tracking"

  # Health endpoints
  has_file "*health*" && mark_done "health-endpoints"

  # SEO
  has_file "robots.txt" && mark_done "robots-txt"
  has_file "sitemap*" && mark_done "sitemap"

  # Legal
  has_file "privacy*" && mark_done "privacy-policy"
  has_file "terms*" && mark_done "terms-of-service"

  # Testing
  has_file "playwright.config.*" && mark_done "e2e-tests"
  has_file "vitest.config.*" && mark_done "unit-tests"
  has_file "jest.config.*" && mark_done "unit-tests"

  # Security
  has_file ".gitleaks.toml" && mark_done "secret-scanning"

  # Auth
  has_content "rate.limit\|rateLimit\|RateLimiter" "*.ts" && mark_done "rate-limiting"

  echo "$UPDATED"
}
