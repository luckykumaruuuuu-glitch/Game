---
name: Metro pnpm monorepo bundle resolution fix
description: Why and how to fix Metro's inability to resolve pnpm-style bundle URLs in a pnpm workspace monorepo.
---

## The problem

In a pnpm monorepo (workspace root at `/home/runner/workspace`, mobile app at `artifacts/mobile`), Expo Metro generates HTML with bundle script URLs like:

```
/node_modules/.pnpm/expo-router@6.0.24_.../node_modules/expo-router/entry.bundle
```

Metro resolves these URLs relative to its `projectRoot` (`artifacts/mobile`). But pnpm's `.pnpm` folder only exists at the **workspace root** (`/home/runner/workspace/node_modules/.pnpm`), not inside `artifacts/mobile/node_modules/`. This causes a bundle failure.

Also, when the project is moved to a new account/environment, `node_modules` is missing entirely and workflows fail to start.

## The fix

Three parts:

1. **metro.config.js** — configure Metro for the monorepo (watchFolders + nodeModulesPaths).

2. **`scripts/setup.sh`** — runs before every workflow start, auto-installs if node_modules missing and always recreates the `.pnpm` symlink:
```bash
if [ ! -d "node_modules" ] || [ ! -d "artifacts/mobile/node_modules" ]; then
  pnpm install --frozen-lockfile
fi
ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm
```

3. **Workflows** use `bash scripts/setup.sh && ...` as prefix:
- Mobile App: `bash scripts/setup.sh && PORT=5000 pnpm --filter @workspace/mobile run dev`
- API Server: `bash scripts/setup.sh && PORT=8000 pnpm --filter @workspace/api-server run dev`

4. **`scripts/post-merge.sh`** also runs `pnpm install` + symlink fix after merges.

**Why:** Metro resolves bundle URLs by prepending `projectRoot`. Without the `.pnpm` symlink, the resolved path doesn't exist. Without auto-install, new environments fail immediately.
