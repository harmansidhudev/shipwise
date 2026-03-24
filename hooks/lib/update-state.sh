#!/bin/bash
# Update shipwise-state.json with scan results
# Usage: update-state.sh <state-file> <scan-results-json>

STATE_FILE="${1:-.claude/shipwise-state.json}"
SCAN_RESULTS="$2"

if [ ! -f "$STATE_FILE" ] || [ -z "$SCAN_RESULTS" ]; then
  exit 1
fi

# Update each found item to done
echo "$SCAN_RESULTS" | jq -c '.[] | select(.found == true)' | while read -r item; do
  ID=$(echo "$item" | jq -r '.id')
  CURRENT=$(jq -r --arg id "$ID" '.items[] | select(.id == $id) | .status' "$STATE_FILE" 2>/dev/null)
  if [ "$CURRENT" = "todo" ]; then
    jq --arg id "$ID" '(.items[] | select(.id == $id)).status = "done"' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  fi
done

# Update timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
jq --arg ts "$TIMESTAMP" '.updated_at = $ts' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
