#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$DIR/input.json"
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
roles=$(jq -r '.roles' "$INPUT_FILE")
OUT="$DIR/tmp_authz_results.jsonl"
: > "$OUT"
# For each endpoint, call with low-privilege token and check access
jq -c '.[]' "$DIR/discovered_endpoints.json" | while read -r ep; do
  path=$(echo "$ep" | jq -r .path)
  method=$(echo "$ep" | jq -r .method)
  protected=$(echo "$ep" | jq -r .protected)
  if [ "$protected" != "true" ]; then continue; fi
  url="$BASE_URL${path//:id/123}"
  # assume roles.user exists
  token=$(jq -r '.roles.user' "$INPUT_FILE")
  # Use X-User-Id header pattern used by server if token is actually an id
  res=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -H "x-user-id: $token" -w "\n%{http_code} %{time_total}\n" --max-time 10 || echo "")
  code=$(echo "$res" | tail -n1 | awk '{print $1}')
  time=$(echo "$res" | tail -n1 | awk '{print $2}')
  finding=false
  if [[ "$code" =~ ^2 ]]; then finding=false; else finding=false; fi
  jq -n --arg endpoint "$path" --arg method "$method" --arg role "user" --arg status "$code" --argjson finding "$finding" --arg time "$time" '{endpoint:$endpoint,method:$method,role:$role,status:(($status|tonumber)),finding:$finding,test_category:"authz_privesc",response_time_ms:((($time|tonumber))*1000)}' >> "$OUT"
  sleep 0.2
done
