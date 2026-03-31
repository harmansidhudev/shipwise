#!/bin/bash
# Shipwise status line script for Claude Code
# Shows readiness percentage and current phase in the CLI status bar
#
# Setup: Add to your Claude Code settings (project or user level):
#   "statusLine": {
#     "type": "command",
#     "command": ".claude/shipwise-statusline.sh"
#   }
#
# Or run: /statusline and paste the command path

STATE_FILE=".claude/shipwise-state.json"

# Read session data from stdin (provided by Claude Code)
SESSION_DATA=$(cat)

# Extract session info from stdin
MODEL=$(echo "$SESSION_DATA" | jq -r '.display_name // .model // .id // "claude"' 2>/dev/null)
# Shorten model name for display
case "$MODEL" in
  *"Opus"*) MODEL="Opus" ;;
  *"Sonnet"*) MODEL="Sonnet" ;;
  *"Haiku"*) MODEL="Haiku" ;;
esac
CONTEXT_PCT=$(echo "$SESSION_DATA" | jq -r '.context.percentUsed // 0' 2>/dev/null)

# If no shipwise state, show model + context only
if [ ! -f "$STATE_FILE" ]; then
  echo "${MODEL} · ${CONTEXT_PCT}% ctx"
  exit 0
fi

# Extract shipwise data
PHASE=$(jq -r '.current_phase // "—"' "$STATE_FILE" 2>/dev/null)
TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null || echo "0")
DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null || echo "0")
P0=$(jq '[.items[] | select(.status == "todo" and .priority == "P0")] | length' "$STATE_FILE" 2>/dev/null || echo "0")
PCT=$((TOTAL > 0 ? DONE * 100 / TOTAL : 0))

# Build progress bar (10 chars)
FILLED=$((PCT / 10))
EMPTY=$((10 - FILLED))
BAR=""
i=0; while [ $i -lt $FILLED ]; do BAR="${BAR}█"; i=$((i+1)); done
i=0; while [ $i -lt $EMPTY ]; do BAR="${BAR}░"; i=$((i+1)); done

# Output
if [ "$P0" -gt 0 ]; then
  echo "${MODEL} · ${CONTEXT_PCT}% ctx | ⛵ ${PHASE} ${BAR} ${PCT}% · ${P0} P0"
else
  echo "${MODEL} · ${CONTEXT_PCT}% ctx | ⛵ ${PHASE} ${BAR} ${PCT}%"
fi
