#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push
# Recreate the .pnpm symlink in mobile's node_modules so Metro can resolve
# pnpm-style bundle URLs (e.g. /node_modules/.pnpm/expo-router@.../entry.bundle)
# relative to the mobile package root. pnpm install wipes this symlink.
ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm
