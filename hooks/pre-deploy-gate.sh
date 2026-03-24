#!/bin/bash
HOOK_INPUT=$(cat)
CMD=$(echo "$HOOK_INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$CMD" ] && exit 0

# Only trigger on deploy-like commands
if ! echo "$CMD" | grep -qiE 'deploy|vercel|fly deploy|push.*prod|release|railway up'; then
  exit 0
fi

STATE_FILE=".claude/shipwise-state.json"
[ ! -f "$STATE_FILE" ] && exit 0

EXP=$(jq -r '.experience_level // "intermediate"' "$STATE_FILE" 2>/dev/null)
P0_ITEMS=$(jq -r '[.items[] | select(.status == "todo" and .priority == "P0")] | length' "$STATE_FILE" 2>/dev/null)

if [ "$P0_ITEMS" -gt 0 ]; then
  GAPS=$(jq -r '
    [.items[] | select(.status == "todo" and .priority == "P0")]
    | .[0:5]
    | .[]
    | "  - \(.name) (~\(.time_estimate // "? min"))"
  ' "$STATE_FILE" 2>/dev/null)

  MSG="⚠ DEPLOY GATE: $P0_ITEMS P0 items incomplete:\n$GAPS"

  if [ "$EXP" = "beginner" ] || [ "$EXP" = "intermediate" ]; then
    MSG="$MSG\n\nWant me to fix these in priority order? Say 'fix shipwise gaps' to start with the quickest one."
  fi

  MSG="$MSG\n\nAfter deploying, say 'verify deploy' and I'll check your production health endpoint."

  jq -n --arg ctx "[Shipwise] $MSG" \
    '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":$ctx}}'
fi
exit 0
