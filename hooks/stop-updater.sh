#!/bin/bash
HOOK_INPUT=$(cat)

ACTIVE=$(echo "$HOOK_INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
[ "$ACTIVE" = "true" ] && exit 0

STATE_FILE=".claude/shipwise-state.json"
[ ! -f "$STATE_FILE" ] && exit 0

UPDATED=false

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

check_file "ci.yml" "cicd-pipeline"
check_file "Dockerfile" "containerization"
check_file "*.tf" "iac"
check_file "sentry*" "error-tracking"
check_file "health*route*" "health-endpoints"
check_file "robots.txt" "robots-txt"
check_file "sitemap*" "sitemap"
check_file "privacy*" "privacy-policy"
check_file "terms*" "terms-of-service"

# --- Usage Journal (local-only, never sent externally) ---
USAGE_FILE=".claude/shipwise-usage.json"
if [ ! -f "$USAGE_FILE" ]; then
  echo '{"sessions":[]}' > "$USAGE_FILE"
fi
SESSION_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CURRENT_PCT=$(jq -r '
  (.items | length) as $total |
  ([.items[] | select(.status == "done")] | length) as $done |
  (if $total > 0 then ($done * 100 / $total) else 0 end)
' "$STATE_FILE" 2>/dev/null || echo "0")
jq --arg ts "$SESSION_TS" --arg pct "$CURRENT_PCT" \
  '.sessions += [{"timestamp": $ts, "readiness_pct": ($pct | tonumber)}]' \
  "$USAGE_FILE" > "${USAGE_FILE}.tmp" && mv "${USAGE_FILE}.tmp" "$USAGE_FILE"
# --- End Usage Journal ---

if [ "$UPDATED" = true ]; then
  TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null)
  DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
  PCT=$((DONE * 100 / (TOTAL > 0 ? TOTAL : 1)))
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  jq --arg ts "$TIMESTAMP" --arg pct "$PCT" \
    '.history += [{"timestamp": $ts, "readiness_pct": ($pct | tonumber)}]' \
    "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

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
      MSG="🎉 $CURRENT_PHASE phase complete! Transitioning to $NEXT_PHASE. Run /shipwise status to see your new priorities."
      jq -n --arg reason "$MSG" '{"decision": "block", "reason": $reason}'
      exit 0
    fi
  fi
fi

exit 0
