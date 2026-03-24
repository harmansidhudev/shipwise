#!/bin/bash
# Shipwise installer
# Usage: curl -fsSL https://raw.githubusercontent.com/harmansidhudev/shipwise/main/scripts/install.sh | bash

set -euo pipefail

REPO="harmansidhudev/shipwise"
INSTALL_DIR=".claude"

echo "Installing Shipwise..."

# Check if we're in a project directory
if [ ! -d ".git" ] && [ ! -f "package.json" ] && [ ! -f "pyproject.toml" ]; then
  echo "Warning: This doesn't look like a project directory."
  echo "Run this from your project root."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

# Create .claude directory if needed
mkdir -p "$INSTALL_DIR"

# Clone or update
if [ -d "$INSTALL_DIR/shipwise" ]; then
  echo "Updating existing installation..."
  cd "$INSTALL_DIR/shipwise" && git pull && cd -
else
  echo "Cloning shipwise..."
  git clone --depth 1 "https://github.com/$REPO.git" "$INSTALL_DIR/shipwise"
fi

# Install hooks into settings.json
SETTINGS_FILE="$INSTALL_DIR/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
  echo "Merging hooks into existing settings.json..."
  # Use jq to merge if available, otherwise warn
  if command -v jq &> /dev/null; then
    jq '.hooks = (.hooks // {}) |
      .hooks.SessionStart = [{ "type": "command", "command": "bash .claude/shipwise/hooks/session-context.sh" }] |
      .hooks.PostToolUse = (.hooks.PostToolUse // []) + [{ "type": "command", "command": "bash .claude/shipwise/hooks/post-edit-check.sh", "toolNames": ["Write", "Edit", "MultiEdit"] }] |
      .hooks.PreToolUse = (.hooks.PreToolUse // []) + [{ "type": "command", "command": "bash .claude/shipwise/hooks/pre-deploy-gate.sh", "toolNames": ["Bash"] }] |
      .hooks.Stop = (.hooks.Stop // []) + [{ "type": "command", "command": "bash .claude/shipwise/hooks/stop-updater.sh" }]' \
      "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
  else
    echo "jq not found. Please manually add hooks to $SETTINGS_FILE"
    echo "See: .claude/shipwise/hooks/ for the hook scripts."
  fi
else
  # Create new settings.json with hooks
  cat > "$SETTINGS_FILE" << 'SETTINGS'
{
  "hooks": {
    "SessionStart": [
      { "type": "command", "command": "bash .claude/shipwise/hooks/session-context.sh" }
    ],
    "PostToolUse": [
      { "type": "command", "command": "bash .claude/shipwise/hooks/post-edit-check.sh", "toolNames": ["Write", "Edit", "MultiEdit"] }
    ],
    "PreToolUse": [
      { "type": "command", "command": "bash .claude/shipwise/hooks/pre-deploy-gate.sh", "toolNames": ["Bash"] }
    ],
    "Stop": [
      { "type": "command", "command": "bash .claude/shipwise/hooks/stop-updater.sh" }
    ]
  }
}
SETTINGS
fi

echo ""
echo "Shipwise installed!"
echo ""
echo "Next steps:"
echo "  1. Run /shipwise in Claude Code to initialize"
echo "  2. Answer 9 diagnostic questions"
echo "  3. Start building -- shipwise works automatically"
echo ""
