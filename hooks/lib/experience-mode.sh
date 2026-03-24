#!/bin/bash
# Experience level reader (Fixes G1, G2)
# Usage: source hooks/lib/experience-mode.sh

get_experience_level() {
  local STATE_FILE="${1:-.claude/shipwise-state.json}"

  if [ ! -f "$STATE_FILE" ]; then
    echo "intermediate"
    return
  fi

  local level=$(jq -r '.experience_level // "intermediate"' "$STATE_FILE" 2>/dev/null)

  # Normalize to valid values
  case "$level" in
    beginner|intermediate|senior|expert) echo "$level" ;;
    *) echo "intermediate" ;;
  esac
}

get_expected_scale() {
  local STATE_FILE="${1:-.claude/shipwise-state.json}"

  if [ ! -f "$STATE_FILE" ]; then
    echo "100-1000"
    return
  fi

  jq -r '.expected_scale // "100-1000"' "$STATE_FILE" 2>/dev/null
}

is_beginner() {
  local level=$(get_experience_level "$1")
  [ "$level" = "beginner" ]
}

is_senior() {
  local level=$(get_experience_level "$1")
  [ "$level" = "senior" ] || [ "$level" = "expert" ]
}
