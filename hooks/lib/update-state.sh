#!/bin/bash
# Update shipwise-state.json safely
# Usage: source hooks/lib/update-state.sh; update_item STATE_FILE ITEM_ID STATUS

update_item() {
  local STATE_FILE="$1"
  local ITEM_ID="$2"
  local NEW_STATUS="$3"

  if [ ! -f "$STATE_FILE" ]; then
    echo "Error: State file not found: $STATE_FILE" >&2
    return 1
  fi

  jq --arg id "$ITEM_ID" --arg status "$NEW_STATUS" \
    '(.items[] | select(.id == $id)).status = $status' \
    "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
}

update_readiness() {
  local STATE_FILE="$1"

  local TOTAL=$(jq '.items | length' "$STATE_FILE" 2>/dev/null)
  local DONE=$(jq '[.items[] | select(.status == "done")] | length' "$STATE_FILE" 2>/dev/null)
  local PCT=$((DONE * 100 / (TOTAL > 0 ? TOTAL : 1)))
  local TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  jq --arg ts "$TIMESTAMP" --arg pct "$PCT" \
    '.readiness_pct = ($pct | tonumber) | .last_updated = $ts | .history += [{"timestamp": $ts, "readiness_pct": ($pct | tonumber)}]' \
    "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

  echo "$PCT"
}

detect_phase_transition() {
  local STATE_FILE="$1"

  local CURRENT_PHASE=$(jq -r '.current_phase' "$STATE_FILE" 2>/dev/null)
  local PHASE_REMAINING=$(jq --arg phase "$CURRENT_PHASE" \
    '[.items[] | select(.phase == $phase and .status == "todo")] | length' \
    "$STATE_FILE" 2>/dev/null)

  if [ "$PHASE_REMAINING" -eq 0 ]; then
    local NEXT_PHASE=""
    case "$CURRENT_PHASE" in
      "design") NEXT_PHASE="build" ;;
      "build") NEXT_PHASE="ship" ;;
      "ship") NEXT_PHASE="grow" ;;
    esac

    if [ -n "$NEXT_PHASE" ]; then
      jq --arg np "$NEXT_PHASE" '.current_phase = $np' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
      echo "$NEXT_PHASE"
      return 0
    fi
  fi

  return 1
}
