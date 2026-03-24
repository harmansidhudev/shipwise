#!/bin/bash
# Shipwise installer
# Installs hooks into the user's .claude/settings.json
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "Installing Shipwise hooks..."

# Ensure .claude directory exists
mkdir -p .claude

SETTINGS_FILE=".claude/settings.json"

# Create settings.json if it doesn't exist
if [ ! -f "$SETTINGS_FILE" ]; then
  echo '{}' > "$SETTINGS_FILE"
fi

# Add hooks using jq if available, otherwise provide manual instructions
if command -v jq &> /dev/null; then
  HOOKS=$(jq -n \
    --arg session "$PLUGIN_DIR/hooks/session-context.sh" \
    --arg postedit "$PLUGIN_DIR/hooks/post-edit-check.sh" \
    --arg predeploy "$PLUGIN_DIR/hooks/pre-deploy-gate.sh" \
    --arg stop "$PLUGIN_DIR/hooks/stop-updater.sh" \
    '{
      "hooks": {
        "SessionStart": [{"type": "command", "command": $session}],
        "PostToolUse": [{"type": "command", "command": $postedit, "matcher": "Write|Edit|MultiEdit"}],
        "PreToolUse": [{"type": "command", "command": $predeploy, "matcher": "Bash"}],
        "Stop": [{"type": "command", "command": $stop}]
      }
    }')

  # Merge with existing settings
  jq -s '.[0] * .[1]' "$SETTINGS_FILE" <(echo "$HOOKS") > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"

  echo "Hooks installed in $SETTINGS_FILE"
else
  echo "jq not found. Please manually add hooks to $SETTINGS_FILE."
  echo "See: $PLUGIN_DIR/hooks/ for the hook scripts."
fi

echo ""
echo "Shipwise installed! Run /shipwise to get started."
