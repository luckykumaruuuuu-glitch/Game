#!/bin/bash

# Auto-setup script — runs before every workflow start.
# Ensures node_modules, expo, and the Metro .pnpm symlink are always present,
# even after the project is moved to a new account or environment.
#
# Uses a file lock so parallel workflow starts don't race on pnpm install.
# Tries --frozen-lockfile first; falls back to a regular install if it fails
# (e.g. on a fresh import where the lockfile may have minor mismatches).

set -e

echo "🔧 Running setup check..."

LOCK_FILE="/tmp/workspace-pnpm-install.lock"

needs_install() {
  [ ! -d "node_modules" ] || \
  [ ! -d "artifacts/mobile/node_modules" ] || \
  [ ! -d "artifacts/api-server/node_modules" ]
}

if needs_install; then
  echo "📦 node_modules missing — acquiring install lock..."
  (
    flock -x 200
    if needs_install; then
      echo "📦 Running pnpm install..."
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
else
  echo "✅ node_modules present"
fi

# Fix the Metro .pnpm symlink (pnpm install wipes it)
# Without this, Metro cannot resolve bundle URLs in the mobile workspace.
if [ ! -L "artifacts/mobile/node_modules/.pnpm" ]; then
  echo "🔗 Fixing Metro .pnpm symlink..."
  ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm
else
  echo "✅ Metro .pnpm symlink present"
fi

echo "✅ Setup complete — starting app..."
