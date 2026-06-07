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

needs_install() {
  [ ! -d "$WORKSPACE_ROOT/node_modules" ] || [ ! -d "$MOBILE_ROOT/node_modules" ]
}

# Auto-install if node_modules missing — flock prevents race with other workflows
if needs_install; then
  echo "📦 node_modules missing — acquiring install lock..."
  (
    flock -x 200
    if needs_install; then
      echo "📦 Running pnpm install..."
      cd "$WORKSPACE_ROOT"
      if pnpm install --frozen-lockfile 2>&1; then
        echo "✅ Installed (frozen lockfile)"
      else
        echo "⚠️  Frozen lockfile failed — retrying without lockfile constraint..."
        pnpm install --no-frozen-lockfile
        echo "✅ Installed (no frozen lockfile)"
      fi
    else
      echo "✅ node_modules already installed by another workflow"
    fi
  ) 200>"$LOCK_FILE"
fi

# Always fix the Metro .pnpm symlink (gets wiped on install)
ln -sf "$WORKSPACE_ROOT/node_modules/.pnpm" "$MOBILE_ROOT/node_modules/.pnpm" 2>/dev/null || true
echo "✅ .pnpm symlink ready"

# Resolve the expo binary — prefer local package binary, fall back to pnpm exec
EXPO_BIN="$MOBILE_ROOT/node_modules/.bin/expo"
if [ ! -f "$EXPO_BIN" ] && [ ! -L "$EXPO_BIN" ]; then
  echo "⚠️  Local expo binary not found — using pnpm exec expo"
  EXPO_CMD="pnpm --filter @workspace/mobile exec expo"
else
  EXPO_CMD="$EXPO_BIN"
fi

# Start Expo from mobile root
cd "$MOBILE_ROOT"
exec $EXPO_CMD start --localhost --port "${PORT:-8080}"
