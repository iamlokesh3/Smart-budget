#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$DIR/input.json"
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
OUT="$DIR/tmp_ratelimit_results.jsonl"
: > "$OUT"
# Pick a lightweight public endpoint or a protected one with token
ep=$(jq -r '.[] | select(.protected==true) | .path' "$DIR/discovered_endpoints.json" | head -n1)
if [ -z "$ep" ]; then ep=$(jq -r '.[0].path' "$DIR/discovered_endpoints.json"); fi
url="$BASE_URL${ep//:id/123}"
for i in {1..30}; do
  res=$(curl -s -o /dev/null -w "%{http_code} %{time_total}\n" -X GET "$url" -H "Content-Type: application/json" --max-time 10) || res="000 0"
  code=$(echo "$res" | awk '{print $1}')
  time=$(echo "$res" | awk '{print $2}')
  jq -n --arg endpoint "$ep" --arg status "$code" --arg time "$time" '{endpoint:$endpoint,status:(($status|tonumber)),response_time_ms:((($time|tonumber))*1000)}' >> "$OUT"
  sleep 0.1
done
