#!/bin/bash
HOOK_INPUT=$(cat)
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE_PATH" ] && exit 0

STATE_FILE=".claude/shipwise-state.json"
[ ! -f "$STATE_FILE" ] && exit 0

# Read experience level
EXP=$(jq -r '.experience_level // "intermediate"' "$STATE_FILE" 2>/dev/null)

# Session dedup file (G4)
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // "default"' 2>/dev/null)
DEDUP_FILE="/tmp/shipwise-whispers-$SESSION_ID"
touch "$DEDUP_FILE"

# Determine whisper category from file path
CATEGORY=""
if echo "$FILE_PATH" | grep -qiE 'auth|login|signup|session|token|password'; then
  CATEGORY="auth"
elif echo "$FILE_PATH" | grep -qiE 'stripe|payment|billing|checkout|subscription|price'; then
  CATEGORY="billing"
elif echo "$FILE_PATH" | grep -qiE 'workflow|\.github|ci\.yml|deploy|Dockerfile|docker'; then
  CATEGORY="cicd"
elif echo "$FILE_PATH" | grep -qiE 'api/' && echo "$(basename "$FILE_PATH")" | grep -qiE 'route\.(ts|js)'; then
  CATEGORY="api"
elif echo "$FILE_PATH" | grep -qiE '\.env|secret|key|credential'; then
  CATEGORY="secrets"
elif echo "$FILE_PATH" | grep -qiE 'health|status|monitor'; then
  CATEGORY="observability"
fi

[ -z "$CATEGORY" ] && exit 0

# G4: Check if already whispered this category in this session
if grep -q "^$CATEGORY$" "$DEDUP_FILE" 2>/dev/null; then
  exit 0
fi

# G5: Intent suppression
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""' 2>/dev/null)
if [ "$TOOL_NAME" = "Write" ]; then
  if [ "$CATEGORY" != "secrets" ]; then
    echo "$CATEGORY" >> "$DEDUP_FILE"
    exit 0
  fi
fi

# Build whisper based on experience level (G2)
case "$CATEGORY:$EXP" in
  auth:beginner)
    MSG="Auth code detected. Important security items: rate limiting (prevents brute-force attacks), secure cookies (httpOnly+sameSite protect against theft), and CSRF protection (prevents attackers from acting as your users)." ;;
  auth:intermediate)
    MSG="Auth code detected. Checklist: rate limiting, secure cookies (httpOnly, sameSite=strict), CSRF, MFA consideration." ;;
  auth:senior|auth:expert)
    MSG="Auth gap items: rate limiting, session config, CSRF." ;;
  billing:beginner)
    MSG="Payment code detected. Critical: never handle raw card numbers (use Stripe Elements). Verify webhook signatures (HMAC) so attackers can't fake payment events. Make webhook handlers idempotent (safe to run twice)." ;;
  billing:*)
    MSG="Payment code detected. Checklist: webhook HMAC verification, idempotent handlers, PCI scope." ;;
  cicd:beginner)
    MSG="CI/CD config detected. A good pipeline runs in order: install dependencies → lint code → check types → run tests → build → deploy. Each step must pass before the next runs." ;;
  cicd:*)
    MSG="CI/CD config detected. Checklist: lint → typecheck → test → build → deploy gates." ;;
  api:beginner)
    MSG="API route detected. Every API endpoint needs: input validation (check the data is correct), auth middleware (verify the user is allowed), error handling (return helpful messages), and rate limiting (prevent abuse)." ;;
  api:*)
    MSG="API route detected. Checklist: input validation, auth middleware, error handling, rate limiting." ;;
  secrets:*)
    MSG="⚠ Sensitive file detected. Ensure this is in .gitignore. Secrets should be in a vault (not .env files committed to git)." ;;
  observability:beginner)
    MSG="Health/monitoring code detected. Good health endpoints check the app AND its dependencies (database, cache, external APIs). Return JSON with each dependency status." ;;
  observability:*)
    MSG="Observability code detected. Checklist: deep health checks (DB, Redis, external deps), structured logging, alerting." ;;
  *)
    exit 0 ;;
esac

# Record whisper (G4)
echo "$CATEGORY" >> "$DEDUP_FILE"

jq -n --arg ctx "[Shipwise] $MSG" \
  '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":$ctx}}'
exit 0
