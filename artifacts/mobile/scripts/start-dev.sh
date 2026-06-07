#!/bin/bash
# Self-healing dev starter for Expo Mobile App.
# Works regardless of which workflow calls it — auto-installs if needed.

set -e

# Find workspace root (go up until pnpm-workspace.yaml is found)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$MOBILE_ROOT/../.." && pwd)"

echo "📱 Starting mobile dev server..."
echo "   Workspace: $WORKSPACE_ROOT"

# Auto-install if node_modules missing
if [ ! -d "$WORKSPACE_ROOT/node_modules" ] || [ ! -d "$MOBILE_ROOT/node_modules" ]; then
  echo "📦 node_modules missing — installing..."
  cd "$WORKSPACE_ROOT"
  pnpm install --frozen-lockfile
fi

# Always fix the Metro .pnpm symlink (gets wiped on install)
ln -sf "$WORKSPACE_ROOT/node_modules/.pnpm" "$MOBILE_ROOT/node_modules/.pnpm" 2>/dev/null || true
echo "✅ .pnpm symlink ready"

# Start Expo from mobile root
cd "$MOBILE_ROOT"
exec ./node_modules/.bin/expo start --localhost --port "${PORT:-8080}"
