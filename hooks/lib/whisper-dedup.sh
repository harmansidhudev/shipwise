#!/bin/bash
# Whisper deduplication logic (Fix G4)
# Usage: source hooks/lib/whisper-dedup.sh

get_dedup_file() {
  local session_id="${1:-default}"
  echo "/tmp/shipwise-whispers-$session_id"
}

was_whispered() {
  local category="$1"
  local dedup_file="$2"

  [ -f "$dedup_file" ] && grep -q "^${category}$" "$dedup_file" 2>/dev/null
}

record_whisper() {
  local category="$1"
  local dedup_file="$2"

  echo "$category" >> "$dedup_file"
}

clear_session_whispers() {
  local dedup_file="$1"
  [ -f "$dedup_file" ] && rm -f "$dedup_file"
}
