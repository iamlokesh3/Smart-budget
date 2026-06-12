#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$DIR/input.json"
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
OUT="$DIR/tmp_idor_results.jsonl"
: > "$OUT"
# probe endpoints with :id param to access another user's resources
jq -c '.[]' "$DIR/discovered_endpoints.json" | while read -r ep; do
  path=$(echo "$ep" | jq -r .path)
  method=$(echo "$ep" | jq -r .method)
  if [[ "$path" != *":id"* ]]; then continue; fi
  token=$(jq -r '.roles.user' "$INPUT_FILE")
  url1="$BASE_URL${path//:id/123}"
  url2="$BASE_URL${path//:id/999999}"
  res1=$(curl -s -X "$method" "$url1" -H "Content-Type: application/json" -H "x-user-id: $token" -w "\n%{http_code} %{time_total}\n" --max-time 10 || echo "")
  res2=$(curl -s -X "$method" "$url2" -H "Content-Type: application/json" -H "x-user-id: $token" -w "\n%{http_code} %{time_total}\n" --max-time 10 || echo "")
  code1=$(echo "$res1" | tail -n1 | awk '{print $1}')
  code2=$(echo "$res2" | tail -n1 | awk '{print $1}')
  finding=false
  if [[ "$code2" =~ ^2 ]]; then finding=true; fi
  jq -n --arg endpoint "$path" --arg method "$method" --arg role "user" --arg status1 "$code1" --arg status2 "$code2" --argjson finding "$finding" --arg note "status1:$code1 status2:$code2" '{endpoint:$endpoint,method:$method,role:$role,status:((($status2|tonumber))),finding:$finding,test_category:"idor",note:$note,response_time_ms:0}' >> "$OUT"
  sleep 0.2
done
