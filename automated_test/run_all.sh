#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT_FILE="$DIR/input.json"
if [ ! -f "$INPUT_FILE" ]; then
  echo "ERROR: input.json not found in $DIR. Copy input.json.sample and fill tokens."
  exit 2
fi
BASE_URL=$(jq -r .baseUrl "$INPUT_FILE")
if [[ "$BASE_URL" == "null" || -z "$BASE_URL" ]]; then
  echo "ERROR: baseUrl missing in input.json"
  exit 2
fi
# discovery (using endpoints.json if present)
if [ -f "$DIR/endpoints.json" ]; then
  cp "$DIR/endpoints.json" "$DIR/discovered_endpoints.json"
  echo "Using provided endpoints.json -> discovered_endpoints.json"
else
  echo "No endpoints.json provided. Run discover_endpoints.sh to probe common OpenAPI paths."
fi
# Run tests (non-destructive by default)
bash "$DIR/tests/authn_bypass.sh" || true
bash "$DIR/tests/authz_privesc.sh" || true
bash "$DIR/tests/idor.sh" || true
bash "$DIR/tests/injection_probe.sh" || true
bash "$DIR/tests/rate_limit.sh" || true
bash "$DIR/tests/scan_secrets.sh" || true
# Generate report
node "$DIR/report_generator.js"

echo "Run complete. See report at $DIR/report.json"
