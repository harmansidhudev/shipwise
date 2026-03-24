#!/bin/bash
cat > /dev/null  # consume stdin

STATE_FILE=".claude/shipwise-state.json"
if [ ! -f "$STATE_FILE" ]; then
  jq -n '{"additionalContext":"[Shipwise] No project profile found. Run /shipwise to activate launch readiness tracking."}'
  exit 0
fi

# Extract metrics from state.json
PHASE=$(jq -r '.current_phase' "$STATE_FILE" 2>/dev/null)
TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null)
DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
P0_GAPS=$(jq '[.items[] | select(.status == "todo" and .priority == "P0")] | length' "$STATE_FILE" 2>/dev/null)
PCT=$((DONE * 100 / (TOTAL > 0 ? TOTAL : 1)))
EXP=$(jq -r '.experience_level // "intermediate"' "$STATE_FILE" 2>/dev/null)

# Top 3 gaps
GAPS=$(jq -r '[.items[] | select(.status == "todo" and .priority == "P0")] | .[0:3] | .[].name' "$STATE_FILE" 2>/dev/null | tr '\n' ', ' | sed 's/,$//')

CTX="[Shipwise] Phase: $PHASE | Ready: $PCT% ($DONE/$TOTAL) | P0 gaps: $P0_GAPS"
[ -n "$GAPS" ] && CTX="$CTX | Top: $GAPS"
CTX="$CTX | Mode: $EXP"

# G11: Detect active skills based on project stack
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ACTIVE_SKILLS=""
if [ -f "$SCRIPT_DIR/lib/detect-stack.sh" ]; then
  source "$SCRIPT_DIR/lib/detect-stack.sh"
  STACK=$(detect_stack)

  # Map detected stack to relevant skill names
  echo "$STACK" | grep -qiE 'nextjs|nuxt|sveltekit|astro|react|vue|svelte' && ACTIVE_SKILLS="$ACTIVE_SKILLS,fullstack-development"
  echo "$STACK" | grep -qiE 'prisma|drizzle|mongodb' && ACTIVE_SKILLS="$ACTIVE_SKILLS,fullstack-development"
  echo "$STACK" | grep -qiE 'docker|vercel|fly|railway' && ACTIVE_SKILLS="$ACTIVE_SKILLS,platform-infrastructure"
  echo "$STACK" | grep -qiE 'playwright|vitest|jest' && ACTIVE_SKILLS="$ACTIVE_SKILLS,quality-assurance"
  echo "$STACK" | grep -qiE 'sentry' && ACTIVE_SKILLS="$ACTIVE_SKILLS,observability-reliability"
  echo "$STACK" | grep -qiE 'stripe' && ACTIVE_SKILLS="$ACTIVE_SKILLS,billing-payments"
  echo "$STACK" | grep -qiE 'clerk|nextauth|supabase' && ACTIVE_SKILLS="$ACTIVE_SKILLS,security-compliance"

  # Always include tech-architecture for projects with a stack
  [ -n "$STACK" ] && ACTIVE_SKILLS="tech-architecture$ACTIVE_SKILLS"

  # Clean up: remove leading comma, deduplicate
  ACTIVE_SKILLS=$(echo "$ACTIVE_SKILLS" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/^,//;s/,$//')
fi

[ -n "$ACTIVE_SKILLS" ] && CTX="$CTX | Active skills: $ACTIVE_SKILLS"

jq -n --arg ctx "$CTX" '{"additionalContext": $ctx}'
exit 0
