#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$DIR/input.json"
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
OUT="$DIR/tmp_injection_results.jsonl"
: > "$OUT"
payloads=("' OR '1'='1" "<script>alert(1)</script>" "../../etc/passwd")
jq -c '.[]' "$DIR/discovered_endpoints.json" | while read -r ep; do
  path=$(echo "$ep" | jq -r .path)
  method=$(echo "$ep" | jq -r .method)
  # probe query params and body for common params
  url="$BASE_URL${path//:id/123}"
  for p in "${payloads[@]}"; do
    res=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "{\"q\":\"$p\"}" -w "\n%{http_code} %{time_total}\n" --max-time 10 || echo "")
    code=$(echo "$res" | tail -n1 | awk '{print $1}')
    time=$(echo "$res" | tail -n1 | awk '{print $2}')
    note="payload:$p"
    finding=false
    if [[ "$code" =~ ^5 ]]; then finding=true; fi
    jq -n --arg endpoint "$path" --arg method "$method" --arg role "anonymous" --arg status "$code" --argjson finding "$finding" --arg time "$time" --arg note "$note" '{endpoint:$endpoint,method:$method,role:$role,status:(($status|tonumber)),finding:$finding,test_category:"injection_probe",response_time_ms:((($time|tonumber))*1000),note:$note}' >> "$OUT"
    sleep 0.2
  done
done
