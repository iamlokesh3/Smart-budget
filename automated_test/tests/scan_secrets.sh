#!/usr/bin/env bash
set -euo pipefail
# Scan repository files for potential hardcoded secrets (quick grep)
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/tmp_secrets_results.jsonl"
: > "$OUT"
# simple heuristics
grep -RIn --exclude-dir=.git --exclude=automated_test -E "(API_KEY|APIKEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|ACCESS_KEY)" .. | while read -r line; do
  file=$(echo "$line" | cut -d: -f2-)
  jq -n --arg file "$file" --arg raw "$line" '{file:$file,note:$raw}' >> "$OUT"
done
