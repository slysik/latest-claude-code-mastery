#!/usr/bin/env bash
# refresh-all-slots.sh — Trigger all 3 briefing slots against running dev server
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"
PORT="${PORT:-3000}"
BASE_URL="http://localhost:$PORT"

# Load CRON_SECRET from .env.local or .env
CRON_SECRET=""
for f in "$SCRIPT_DIR/.env.local" "$SCRIPT_DIR/.env"; do
  if [[ -f "$f" ]]; then
    CRON_SECRET=$(grep '^CRON_SECRET=' "$f" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || true)
    [[ -n "$CRON_SECRET" ]] && break
  fi
done

if [[ -z "$CRON_SECRET" ]]; then
  echo "ERROR: CRON_SECRET not found in .env.local or .env"; exit 1
fi

for SLOT in morning midday evening; do
  echo "==> Triggering $SLOT briefing..."
  RESPONSE=$(curl -sf \
    -H "Authorization: Bearer $CRON_SECRET" \
    "$BASE_URL/api/cron/aggregate?slot=$SLOT&force=true" 2>&1) || {
    echo "    FAILED for $SLOT"
    continue
  }
  ITEMS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalItems',0))" 2>/dev/null || echo "?")
  TLDR=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tldrGenerated',False))" 2>/dev/null || echo "?")
  DURATION=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('durationMs',0))" 2>/dev/null || echo "?")
  echo "    OK: $ITEMS items, tldr=$TLDR, ${DURATION}ms"
done

echo ""
echo "==> All slots refreshed. Visit $BASE_URL"
