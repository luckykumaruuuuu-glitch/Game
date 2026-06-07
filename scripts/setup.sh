#!/bin/bash

# Auto-setup script — runs before every workflow start.
# Ensures node_modules, expo, and the Metro .pnpm symlink are always present,
# even after the project is moved to a new account or environment.

set -e

echo "🔧 Running setup check..."

# Step 1: Install dependencies if node_modules is missing or incomplete
if [ ! -d "node_modules" ] || [ ! -d "artifacts/mobile/node_modules" ] || [ ! -d "artifacts/api-server/node_modules" ]; then
  echo "📦 node_modules missing — running pnpm install..."
  pnpm install --frozen-lockfile
else
  echo "✅ node_modules present"
fi

# Step 2: Fix the Metro .pnpm symlink (pnpm install wipes it)
# Without this, Metro cannot resolve bundle URLs in the mobile workspace.
if [ ! -L "artifacts/mobile/node_modules/.pnpm" ]; then
  echo "🔗 Fixing Metro .pnpm symlink..."
  ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm
else
  echo "✅ Metro .pnpm symlink present"
fi

echo "✅ Setup complete — starting app..."
