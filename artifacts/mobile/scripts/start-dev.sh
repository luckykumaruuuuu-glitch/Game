#!/bin/bash
# Self-healing dev starter for Expo Mobile App.
# Works regardless of which workflow calls it — auto-installs if needed.
# Uses flock so parallel workflow starts don't race on pnpm install or expo cache.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$MOBILE_ROOT/../.." && pwd)"

echo "📱 Starting mobile dev server..."
echo "   Workspace: $WORKSPACE_ROOT"

# Kill any existing process on port 5000 so parallel restarts never get
# the interactive "Use port 5001 instead?" prompt that hangs in CI/scripts.
fuser -k 5000/tcp 2>/dev/null || true

LOCK_FILE="/tmp/workspace-pnpm-install.lock"
EXPO_START_LOCK="/tmp/expo-start.lock"

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

# Pre-create Expo cache directory — prevents ENOENT crash when two instances start
# simultaneously and race on /home/runner/.expo/native-modules-cache/*.json
mkdir -p "$HOME/.expo/native-modules-cache"
mkdir -p "$HOME/.expo/cache"

# Stagger expo starts — only one instance initializes the cache at a time.
# The lock is held only during the first ~15s of startup (cache init window).
# After that the lock file is released so the second instance can proceed.
(
  flock -x -w 60 201
  echo "🔒 Expo cache lock acquired for port ${PORT:-8081}"
  sleep 15
) 201>"$EXPO_START_LOCK" &
LOCK_PID=$!

# Resolve the expo binary — prefer local package binary, fall back to pnpm exec
EXPO_BIN="$MOBILE_ROOT/node_modules/.bin/expo"
if [ ! -f "$EXPO_BIN" ] && [ ! -L "$EXPO_BIN" ]; then
  echo "⚠️  Local expo binary not found — using pnpm exec expo"
  EXPO_CMD="pnpm --filter @workspace/mobile exec expo"
else
  EXPO_CMD="$EXPO_BIN"
fi

# Refresh the Expo native-modules cache expiration to 1 year from now.
# On Replit, api.expo.dev returns an empty response which causes JSON.parse()
# to crash inside validateDependenciesVersionsAsync. Extending the cached
# expiration timestamp means Expo always uses the local copy and never
# makes the network request.
CACHE_DIR="$HOME/.expo/native-modules-cache"
if [ -d "$CACHE_DIR" ]; then
  node - <<'EOF'
const fs = require('fs');
const dir = process.env.HOME + '/.expo/native-modules-cache';
const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
try {
  fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('-info.json')) return;
    const p = dir + '/' + f;
    try {
      const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
      obj.expiration = oneYear;
      fs.writeFileSync(p, JSON.stringify(obj));
    } catch {}
  });
  console.log('✅ Expo cache expiration refreshed (+1 year)');
} catch {}
EOF
fi

# Start Expo from mobile root
# Do NOT use --localhost — it binds to 127.0.0.1 only and breaks Replit's proxy.
# Without it, Metro binds to 0.0.0.0 so Replit can reach it.
cd "$MOBILE_ROOT"
export EXPO_NO_DOCTOR=1
exec $EXPO_CMD start --port "${PORT:-8081}" --clear
