#!/bin/bash
set -e

echo "📦 Installing dependencies..."
if pnpm install --frozen-lockfile 2>&1; then
  echo "✅ Installed (frozen lockfile)"
else
  echo "⚠️  Frozen lockfile failed — retrying without lockfile constraint..."
  pnpm install --no-frozen-lockfile
  echo "✅ Installed (no frozen lockfile)"
fi

# Push DB schema only if DATABASE_URL is set — skip on fresh imports without a DB yet
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Pushing database schema..."
  pnpm --filter @workspace/db run push
  echo "✅ Database schema up to date"
else
  echo "⚠️  DATABASE_URL not set — skipping db push (connect a database to enable this)"
fi

# Recreate the .pnpm symlink in mobile's node_modules so Metro can resolve
# pnpm-style bundle URLs (e.g. /node_modules/.pnpm/expo-router@.../entry.bundle)
# relative to the mobile package root. pnpm install wipes this symlink.
echo "🔗 Fixing Metro .pnpm symlink..."
ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm

echo "✅ Post-merge setup complete"
