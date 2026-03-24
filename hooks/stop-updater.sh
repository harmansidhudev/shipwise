#!/bin/bash
# Shipwise — Stop hook
# Scans for newly created files that match checklist gaps. Updates state.json.
# Fixes applied: G8 (JSON state), G10 (phase transition), G15 (time-series)
HOOK_INPUT=$(cat)

# Prevent infinite loop
ACTIVE=$(echo "$HOOK_INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
[ "$ACTIVE" = "true" ] && exit 0

STATE_FILE=".claude/shipwise-state.json"
[ ! -f "$STATE_FILE" ] && exit 0

if ! command -v jq &> /dev/null; then
  exit 0
fi

UPDATED=false

# Scan for evidence of completed items
check_file() {
  local pattern="$1"
  local item_id="$2"
  if find . -path "./.git" -prune -o -path "./node_modules" -prune -o -name "$pattern" -print 2>/dev/null | grep -q .; then
    local status=$(jq -r --arg id "$item_id" '.items[] | select(.id == $id) | .status' "$STATE_FILE" 2>/dev/null)
    if [ "$status" = "todo" ]; then
      jq --arg id "$item_id" '(.items[] | select(.id == $id)).status = "done"' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      UPDATED=true
    fi
  fi
}

# Check common patterns
check_file "ci.yml" "cicd-pipeline"
check_file "Dockerfile" "containerization"
check_file "*.tf" "iac"
check_file "sentry*" "error-tracking"
check_file "health*route*" "health-endpoints"
check_file "robots.txt" "robots-txt"
check_file "sitemap*" "sitemap"
check_file "privacy*" "privacy-policy"
check_file "terms*" "terms-of-service"

if [ "$UPDATED" = true ]; then
  # G15: Log readiness over time
  TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null)
  DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
  PCT=$((DONE * 100 / (TOTAL > 0 ? TOTAL : 1)))
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  jq --arg ts "$TIMESTAMP" --arg pct "$PCT" \
    '.history += [{"timestamp": $ts, "readiness_pct": ($pct | tonumber)}]' \
    "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

  # G10: Phase transition detection
  CURRENT_PHASE=$(jq -r '.current_phase' "$STATE_FILE" 2>/dev/null)
  PHASE_REMAINING=$(jq --arg phase "$CURRENT_PHASE" \
    '[.items[] | select(.phase == $phase and .status == "todo")] | length' \
    "$STATE_FILE" 2>/dev/null)

  if [ "$PHASE_REMAINING" -eq 0 ]; then
    NEXT_PHASE=""
    case "$CURRENT_PHASE" in
      "design") NEXT_PHASE="build" ;;
      "build") NEXT_PHASE="ship" ;;
      "ship") NEXT_PHASE="grow" ;;
    esac

    if [ -n "$NEXT_PHASE" ]; then
      jq --arg np "$NEXT_PHASE" '.current_phase = $np' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      MSG="$CURRENT_PHASE phase complete! Transitioning to $NEXT_PHASE. Run /shipwise status to see your new priorities."
      jq -n --arg reason "$MSG" '{"decision": "block", "reason": $reason}'
      exit 0
    fi
  fi
fi

exit 0
