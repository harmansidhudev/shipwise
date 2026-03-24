#!/bin/bash
# G5: Intent-matching suppression
# If the user's prompt mentions the same topic as the whisper category, suppress it

should_suppress() {
  local category="$1"
  local user_prompt="$2"

  case "$category" in
    auth)
      echo "$user_prompt" | grep -qiE 'auth|login|signup|session|rate.limit|csrf|cookie' && return 0 ;;
    billing)
      echo "$user_prompt" | grep -qiE 'stripe|payment|billing|checkout|webhook|subscription' && return 0 ;;
    cicd)
      echo "$user_prompt" | grep -qiE 'ci.?cd|pipeline|deploy|github.action|workflow' && return 0 ;;
    api)
      echo "$user_prompt" | grep -qiE 'api|endpoint|route|middleware|validation' && return 0 ;;
    secrets)
      # Never suppress secrets warnings
      return 1 ;;
    observability)
      echo "$user_prompt" | grep -qiE 'monitor|health|logging|alert|sentry|observ' && return 0 ;;
  esac

  return 1
}
