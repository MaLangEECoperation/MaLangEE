#!/usr/bin/env bash
set -euo pipefail

# Start script for MaLangEE frontend (Next.js dev) that ensures a clean start on PORT 3000.
# This script is intended to be used by a user-level systemd unit.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TARGET_PORT=3000

# Kill any processes owned by current user on target ports (best-effort)
for P in $TARGET_PORT 3001; do
  PIDS=$(lsof -t -i :"$P" -sTCP:LISTEN -a -u "$(whoami)" || true)
  if [[ -n "$PIDS" ]]; then
    echo "Stopping user processes on port $P: $PIDS"
    kill $PIDS || true
  fi
done

# Remove stale Next.js dev lock
rm -f .next/dev/lock || true

# Start Next dev, forcing PORT=3000
# Check for mode argument (default: development)
MODE=${1:-development}

if [ "$MODE" = "production" ]; then
  echo "Starting in PRODUCTION mode..."
  export NODE_ENV=production
  export PORT=$TARGET_PORT
  
  if command -v yarn >/dev/null 2>&1; then
    exec yarn start
  else
    exec npm run start
  fi
else
  echo "Starting in DEVELOPMENT mode..."
  export NODE_ENV=development
  export PORT=$TARGET_PORT
  
  if command -v yarn >/dev/null 2>&1; then
    exec yarn dev
  else
    exec npm run dev
  fi
fi

