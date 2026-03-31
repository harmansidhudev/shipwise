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

# If no shipwise state, show nothing (don't clutter status bar)
if [ ! -f "$STATE_FILE" ]; then
  echo "$SESSION_DATA" | jq -r '
    "\(.model // "unknown") · \(.context.percentUsed // 0)% context"
  ' 2>/dev/null
  exit 0
fi

# Extract shipwise data
PHASE=$(jq -r '.current_phase // "—"' "$STATE_FILE" 2>/dev/null)
TOTAL=$(jq '[.items | length] | .[0] // 0' "$STATE_FILE" 2>/dev/null)
DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
P0=$(jq '[.items[] | select(.status == "todo" and .priority == "P0")] | length' "$STATE_FILE" 2>/dev/null)
PCT=$((TOTAL > 0 ? DONE * 100 / TOTAL : 0))

# Build progress bar (10 chars)
FILLED=$((PCT / 10))
EMPTY=$((10 - FILLED))
BAR=$(printf '█%.0s' $(seq 1 $FILLED 2>/dev/null) ; printf '░%.0s' $(seq 1 $EMPTY 2>/dev/null))

# Extract session info from stdin
MODEL=$(echo "$SESSION_DATA" | jq -r '.model // "unknown"' 2>/dev/null)
CONTEXT_PCT=$(echo "$SESSION_DATA" | jq -r '.context.percentUsed // 0' 2>/dev/null)

# Output: Model · Context% | Shipwise: Phase · Readiness% · P0 gaps
if [ "$P0" -gt 0 ]; then
  echo "${MODEL} · ${CONTEXT_PCT}% ctx | ⛵ ${PHASE} ${BAR} ${PCT}% · ${P0} P0 gaps"
else
  echo "${MODEL} · ${CONTEXT_PCT}% ctx | ⛵ ${PHASE} ${BAR} ${PCT}%"
fi
