#!/usr/bin/env bash
# refresh.sh — Restart dev server and trigger the data pipeline
# Usage: ./refresh.sh [--prod]
#   --prod  Use production URL instead of localhost

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"
PORT="${PORT:-3001}"
BASE_URL="http://localhost:$PORT"

# Load CRON_SECRET from .env.local
if [[ -f "$ENV_FILE" ]]; then
  CRON_SECRET=$(grep '^CRON_SECRET=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
else
  echo "ERROR: .env.local not found at $ENV_FILE"
  exit 1
fi

if [[ -z "${CRON_SECRET:-}" ]]; then
  echo "ERROR: CRON_SECRET not set in .env.local"
  exit 1
fi

# Parse flags
PROD=false
for arg in "$@"; do
  case $arg in
    --prod) PROD=true ;;
  esac
done

if [[ "$PROD" == "true" ]]; then
  BASE_URL="${VERCEL_URL:-https://morning-with-coffee-and-claude.vercel.app}"
  echo "==> Using production URL: $BASE_URL"
fi

# Step 1: Kill existing dev server (skip in prod mode)
if [[ "$PROD" == "false" ]]; then
  echo "==> Stopping existing dev server on port $PORT..."
  lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
  sleep 1

  # Step 2: Start dev server in background
  echo "==> Starting Next.js dev server on port $PORT..."
  cd "$SCRIPT_DIR"
  npx next dev -p "$PORT" > /tmp/nextdev-$PORT.log 2>&1 &
  DEV_PID=$!
  echo "    PID: $DEV_PID (logs: /tmp/nextdev-$PORT.log)"

  # Step 3: Wait for server to be ready
  echo "==> Waiting for server..."
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:$PORT" > /dev/null 2>&1; then
      echo "    Server ready after ${i}s"
      break
    fi
    if [[ $i -eq 30 ]]; then
      echo "ERROR: Server failed to start after 30s"
      echo "Check logs: /tmp/nextdev-$PORT.log"
      exit 1
    fi
    sleep 1
  done
fi

# Step 4: Trigger the pipeline
echo "==> Triggering data pipeline (force=true)..."
RESPONSE=$(curl -sf -w "\n%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/api/cron/aggregate?force=true" 2>&1) || true

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "==> Pipeline complete!"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "ERROR: Pipeline returned HTTP $HTTP_CODE"
  echo "$BODY"
  exit 1
fi

echo ""
echo "==> Dashboard ready at $BASE_URL"
