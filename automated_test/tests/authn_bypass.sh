#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$DIR/input.json"
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
roles=$(jq -r '.roles | keys[]' "$INPUT_FILE")
OUT="$DIR/tmp_authn_results.jsonl"
: > "$OUT"
# For each protected endpoint, call without auth header
jq -c '.[]' "$DIR/discovered_endpoints.json" | while read -r ep; do
  protected=$(echo "$ep" | jq -r .protected)
  if [ "$protected" != "true" ]; then continue; fi
  path=$(echo "$ep" | jq -r .path)
  method=$(echo "$ep" | jq -r .method)
  url="$BASE_URL${path//:id/123}"  # replace :id with 123
  res=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -w "\n%{http_code} %{time_total}\n" --max-time 10 || echo "" )
  body=$(echo "$res" | sed -n '1,${=}' | sed -n '1,$p')
  code=$(echo "$res" | tail -n1 | awk '{print $1}')
  time=$(echo "$res" | tail -n1 | awk '{print $2}')
  finding=false
  if [[ "$code" =~ ^2 ]]; then finding=true; fi
  jq -n --arg endpoint "$path" --arg method "$method" --arg role "anonymous" --arg status "$code" --argjson finding "$finding" --arg time "$time" '{endpoint:$endpoint,method:$method,role:$role,status:(($status|tonumber)),finding:$finding,test_category:"authn_bypass",response_time_ms:((($time|tonumber))*1000)}' >> "$OUT"
  sleep 0.2
done
