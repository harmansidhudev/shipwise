#!/bin/bash
# G4: Whisper deduplication
# Tracks which whisper categories have been shown in this session

DEDUP_FILE="/tmp/shipwise-whispers-${1:-default}"

has_whispered() {
  local category="$1"
  [ -f "$DEDUP_FILE" ] && grep -q "^$category$" "$DEDUP_FILE" 2>/dev/null
}

record_whisper() {
  local category="$1"
  echo "$category" >> "$DEDUP_FILE"
}

clear_whispers() {
  rm -f "$DEDUP_FILE"
}
