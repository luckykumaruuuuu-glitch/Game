---
name: Metro pnpm monorepo bundle resolution fix
description: Why and how to fix Metro's inability to resolve pnpm-style bundle URLs in a pnpm workspace monorepo.
---

## The problem

In a pnpm monorepo (workspace root at `/home/runner/workspace`, mobile app at `artifacts/mobile`), Expo Metro generates HTML with bundle script URLs like:

```
/node_modules/.pnpm/expo-router@6.0.24_.../node_modules/expo-router/entry.bundle
```

Metro resolves these URLs relative to its `projectRoot` (`artifacts/mobile`). But pnpm's `.pnpm` folder only exists at the **workspace root** (`/home/runner/workspace/node_modules/.pnpm`), not inside `artifacts/mobile/node_modules/`. This causes a bundle failure:

```
Unable to resolve module ./index from /home/runner/workspace/.
```

## The fix

Two parts:

1. **metro.config.js** — configure Metro for the monorepo (watchFolders + nodeModulesPaths):
```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
module.exports = config;
```

2. **Symlink** `.pnpm` into the mobile package's node_modules so Metro can find packages by their full pnpm URL path:
```bash
ln -sf ../../../node_modules/.pnpm artifacts/mobile/node_modules/.pnpm
```

This symlink is wiped by `pnpm install`, so it must be recreated in `scripts/post-merge.sh` after every install.

**Why:** Metro resolves bundle URLs (e.g. `/node_modules/.pnpm/expo-router@.../entry.bundle`) by prepending `projectRoot`. Without the `.pnpm` symlink, the resolved path doesn't exist.
