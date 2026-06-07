#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🗄️ Pushing database schema..."
pnpm --filter @workspace/db run push

# Recreate the .pnpm symlink in mobile's node_modules so Metro can resolve
# pnpm-style bundle URLs (e.g. /node_modules/.pnpm/expo-router@.../entry.bundle)
# relative to the mobile package root. pnpm install wipes this symlink.
echo "🔗 Fixing Metro .pnpm symlink..."
ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm

echo "✅ Post-merge setup complete"
