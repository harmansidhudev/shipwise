#!/bin/bash
# Shipwise — SessionStart hook
# Injects readiness score, top gaps, and active skills into every session.
cat > /dev/null  # consume stdin

STATE_FILE=".claude/shipwise-state.json"
[ ! -f "$STATE_FILE" ] && exit 0

# Check jq availability
if ! command -v jq &> /dev/null; then
  exit 0
fi

# Extract metrics from state.json
PHASE=$(jq -r '.current_phase // "unknown"' "$STATE_FILE" 2>/dev/null)
TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null)
DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
P0_GAPS=$(jq '[.items[] | select(.status == "todo" and .priority == "P0")] | length' "$STATE_FILE" 2>/dev/null)
PCT=$((DONE * 100 / (TOTAL > 0 ? TOTAL : 1)))
EXP=$(jq -r '.experience_level // "intermediate"' "$STATE_FILE" 2>/dev/null)

# Top 3 P0 gaps
GAPS=$(jq -r '[.items[] | select(.status == "todo" and .priority == "P0")] | .[0:3] | .[].name' "$STATE_FILE" 2>/dev/null | tr '\n' ', ' | sed 's/,$//')

CTX="[Shipwise] Phase: $PHASE | Ready: $PCT% ($DONE/$TOTAL) | P0 gaps: $P0_GAPS"
[ -n "$GAPS" ] && CTX="$CTX | Top: $GAPS"
CTX="$CTX | Mode: $EXP"

jq -n --arg ctx "$CTX" '{"additionalContext": $ctx}'
exit 0
