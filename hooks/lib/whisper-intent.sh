#!/bin/bash
# Intent-matching suppression (Fix G5)
# Suppress whispers when the user's prompt already covers the topic
# Usage: source hooks/lib/whisper-intent.sh

should_suppress_whisper() {
  local category="$1"
  local tool_name="$2"
  local hook_input="$3"

  # If the user created a new file (Write tool), they likely asked for it
  # Exception: secrets/sensitive files always warn
  if [ "$tool_name" = "Write" ] && [ "$category" != "secrets" ]; then
    return 0  # suppress
  fi

  # Check if the user's recent prompt mentions the category topic
  local user_prompt=$(echo "$hook_input" | jq -r '.transcript[-1:][0].message // ""' 2>/dev/null)

  if [ -n "$user_prompt" ]; then
    case "$category" in
      auth)
        echo "$user_prompt" | grep -qiE 'rate.limit|csrf|secure.cookie|session.security|mfa|two.factor' && return 0 ;;
      billing)
        echo "$user_prompt" | grep -qiE 'webhook|idempoten|hmac|pci|stripe.element' && return 0 ;;
      cicd)
        echo "$user_prompt" | grep -qiE 'pipeline|ci.cd|github.action|deploy.gate|lint.*test' && return 0 ;;
      api)
        echo "$user_prompt" | grep -qiE 'validation|middleware|rate.limit|error.handl' && return 0 ;;
      observability)
        echo "$user_prompt" | grep -qiE 'health.check|monitoring|alerting|structured.log' && return 0 ;;
    esac
  fi

  return 1  # don't suppress
}
