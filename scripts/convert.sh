#!/bin/bash
# Convert shipwise skills to other agent formats
# Usage: bash scripts/convert.sh [format] [output-dir]
#
# Supported formats:
#   cursor    — Convert to Cursor rules format (.cursorrules)
#   codex     — Convert to OpenAI Codex format
#   gemini    — Convert to Gemini CLI format
#   windsurf  — Convert to Windsurf format
#   generic   — Convert to generic AGENTS.md format

set -euo pipefail

FORMAT="${1:-generic}"
OUTPUT_DIR="${2:-dist/$FORMAT}"

echo "Converting shipwise skills to $FORMAT format..."
mkdir -p "$OUTPUT_DIR"

# Find all SKILL.md files
SKILLS=$(find skills -name "SKILL.md" | sort)

case "$FORMAT" in
  cursor)
    echo "# Shipwise Launch Lifecycle Rules" > "$OUTPUT_DIR/.cursorrules"
    echo "" >> "$OUTPUT_DIR/.cursorrules"
    echo "These rules guide you through the webapp launch lifecycle." >> "$OUTPUT_DIR/.cursorrules"
    echo "" >> "$OUTPUT_DIR/.cursorrules"
    for skill in $SKILLS; do
      # Extract skill name from frontmatter
      name=$(grep "^name:" "$skill" | head -1 | sed 's/name: //')
      echo "## $name" >> "$OUTPUT_DIR/.cursorrules"
      # Strip frontmatter and append
      sed '/^---$/,/^---$/d' "$skill" >> "$OUTPUT_DIR/.cursorrules"
      echo "" >> "$OUTPUT_DIR/.cursorrules"
    done
    echo "Created $OUTPUT_DIR/.cursorrules"
    ;;

  codex)
    for skill in $SKILLS; do
      dir=$(dirname "$skill")
      skill_name=$(basename "$dir")
      # Convert SKILL.md to codex instruction format
      mkdir -p "$OUTPUT_DIR/$skill_name"
      {
        echo "# Instructions"
        echo ""
        sed '/^---$/,/^---$/d' "$skill"
      } > "$OUTPUT_DIR/$skill_name/AGENTS.md"
      # Copy references if they exist
      if [ -d "$dir/references" ]; then
        cp -r "$dir/references" "$OUTPUT_DIR/$skill_name/"
      fi
    done
    echo "Created Codex-compatible structure in $OUTPUT_DIR/"
    ;;

  gemini)
    echo "# Shipwise Launch Lifecycle" > "$OUTPUT_DIR/GEMINI.md"
    echo "" >> "$OUTPUT_DIR/GEMINI.md"
    for skill in $SKILLS; do
      sed '/^---$/,/^---$/d' "$skill" >> "$OUTPUT_DIR/GEMINI.md"
      echo "" >> "$OUTPUT_DIR/GEMINI.md"
      echo "---" >> "$OUTPUT_DIR/GEMINI.md"
      echo "" >> "$OUTPUT_DIR/GEMINI.md"
    done
    echo "Created $OUTPUT_DIR/GEMINI.md"
    ;;

  windsurf)
    for skill in $SKILLS; do
      dir=$(dirname "$skill")
      skill_name=$(basename "$dir")
      mkdir -p "$OUTPUT_DIR/.windsurf/rules"
      {
        sed '/^---$/,/^---$/d' "$skill"
      } > "$OUTPUT_DIR/.windsurf/rules/$skill_name.md"
    done
    echo "Created Windsurf rules in $OUTPUT_DIR/.windsurf/rules/"
    ;;

  generic)
    echo "# Shipwise Launch Lifecycle" > "$OUTPUT_DIR/AGENTS.md"
    echo "" >> "$OUTPUT_DIR/AGENTS.md"
    echo "Webapp launch lifecycle knowledge base. Use these as context for any AI coding assistant." >> "$OUTPUT_DIR/AGENTS.md"
    echo "" >> "$OUTPUT_DIR/AGENTS.md"
    for skill in $SKILLS; do
      sed '/^---$/,/^---$/d' "$skill" >> "$OUTPUT_DIR/AGENTS.md"
      echo "" >> "$OUTPUT_DIR/AGENTS.md"
    done
    echo "Created $OUTPUT_DIR/AGENTS.md"
    ;;

  *)
    echo "Unknown format: $FORMAT"
    echo "Supported: cursor, codex, gemini, windsurf, generic"
    exit 1
    ;;
esac

echo "Done! Files written to $OUTPUT_DIR/"
