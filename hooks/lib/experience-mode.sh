#!/bin/bash
# G1/G2: Read experience level from state.json

get_experience_level() {
  local state_file="${1:-.claude/shipwise-state.json}"
  if [ -f "$state_file" ] && command -v jq &> /dev/null; then
    jq -r '.experience_level // "intermediate"' "$state_file" 2>/dev/null
  else
    echo "intermediate"
  fi
}

get_expected_scale() {
  local state_file="${1:-.claude/shipwise-state.json}"
  if [ -f "$state_file" ] && command -v jq &> /dev/null; then
    jq -r '.expected_scale // "100-1000"' "$state_file" 2>/dev/null
  else
    echo "100-1000"
  fi
}
