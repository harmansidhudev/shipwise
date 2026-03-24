#!/bin/bash
# Convert Shipwise skills to formats compatible with other AI coding agents
# Supports: Codex, Cursor, Gemini CLI, and generic markdown
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$PLUGIN_DIR/skills"
OUTPUT_DIR="${1:-$PLUGIN_DIR/dist}"

mkdir -p "$OUTPUT_DIR"

echo "Converting Shipwise skills for multi-agent compatibility..."

# Concatenate all skills into a single knowledge file
echo "# Shipwise — Launch Lifecycle Knowledge Base" > "$OUTPUT_DIR/shipwise-knowledge.md"
echo "" >> "$OUTPUT_DIR/shipwise-knowledge.md"
echo "This file contains all Shipwise domain knowledge for use with any AI coding agent." >> "$OUTPUT_DIR/shipwise-knowledge.md"
echo "" >> "$OUTPUT_DIR/shipwise-knowledge.md"

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_file="$skill_dir/SKILL.md"
  if [ -f "$skill_file" ]; then
    echo "---" >> "$OUTPUT_DIR/shipwise-knowledge.md"
    echo "" >> "$OUTPUT_DIR/shipwise-knowledge.md"
    cat "$skill_file" >> "$OUTPUT_DIR/shipwise-knowledge.md"
    echo "" >> "$OUTPUT_DIR/shipwise-knowledge.md"
  fi
done

echo "Generated: $OUTPUT_DIR/shipwise-knowledge.md"

# Generate Cursor rules file
echo "# Shipwise Launch Lifecycle Rules" > "$OUTPUT_DIR/.cursorrules"
echo "When working on this project, consider the launch readiness checklist." >> "$OUTPUT_DIR/.cursorrules"
echo "Check .claude/shipwise-state.json for current status if it exists." >> "$OUTPUT_DIR/.cursorrules"
echo "" >> "$OUTPUT_DIR/.cursorrules"
echo "Key principles:" >> "$OUTPUT_DIR/.cursorrules"
echo "- Always add error handling to API routes" >> "$OUTPUT_DIR/.cursorrules"
echo "- Include input validation on all endpoints" >> "$OUTPUT_DIR/.cursorrules"
echo "- Set security headers (CSP, HSTS, X-Frame-Options)" >> "$OUTPUT_DIR/.cursorrules"
echo "- Use environment variables for secrets (never hardcode)" >> "$OUTPUT_DIR/.cursorrules"
echo "- Add health check endpoints" >> "$OUTPUT_DIR/.cursorrules"
echo "- Include structured logging" >> "$OUTPUT_DIR/.cursorrules"
echo "- Write tests for business logic" >> "$OUTPUT_DIR/.cursorrules"

echo "Generated: $OUTPUT_DIR/.cursorrules"
echo "Done!"
