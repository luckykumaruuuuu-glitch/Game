#!/bin/bash
# Self-healing dev starter for Expo Mobile App.
# Works regardless of which workflow calls it — auto-installs if needed.
# Uses flock so parallel workflow starts don't race on pnpm install.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$MOBILE_ROOT/../.." && pwd)"

echo "📱 Starting mobile dev server..."
echo "   Workspace: $WORKSPACE_ROOT"

LOCK_FILE="/tmp/workspace-pnpm-install.lock"

# Auto-install if node_modules missing — flock prevents race with other workflows
if [ ! -d "$WORKSPACE_ROOT/node_modules" ] || [ ! -d "$MOBILE_ROOT/node_modules" ]; then
  echo "📦 node_modules missing — acquiring install lock..."
  (
    flock -x 200
    if [ ! -d "$WORKSPACE_ROOT/node_modules" ] || [ ! -d "$MOBILE_ROOT/node_modules" ]; then
      echo "📦 Running pnpm install..."
      cd "$WORKSPACE_ROOT"
      pnpm install --frozen-lockfile
    else
      echo "✅ node_modules already installed by another workflow"
    fi
  ) 200>"$LOCK_FILE"
fi

# Always fix the Metro .pnpm symlink (gets wiped on install)
ln -sf "$WORKSPACE_ROOT/node_modules/.pnpm" "$MOBILE_ROOT/node_modules/.pnpm" 2>/dev/null || true
echo "✅ .pnpm symlink ready"

# Start Expo from mobile root
cd "$MOBILE_ROOT"
exec ./node_modules/.bin/expo start --localhost --port "${PORT:-8080}"
