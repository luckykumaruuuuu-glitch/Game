---
name: Expo native-modules cache fix
description: Expo CLI crashes on Replit with SyntaxError: Unexpected end of JSON input when the native-modules cache expires, because api.expo.dev returns empty responses on Replit's network.
---

# Expo native-modules cache crash on Replit

## The rule
Before starting Expo, always extend the `~/.expo/native-modules-cache/*-info.json` expiration timestamps to 1 year in the future.

## Why
Expo CLI caches SDK native module version data from `https://api.expo.dev/v2/sdks/<version>/native-modules` with a ~1 hour TTL. When the cache expires, it re-fetches. On Replit, that request returns an empty response, which crashes `JSON.parse()` inside `validateDependenciesVersionsAsync` / `getNativeModuleVersionsAsync`. The crash manifests as `SyntaxError: Unexpected end of JSON input` in the startup logs.

`EXPO_NO_DOCTOR=1` does NOT suppress this check — it's a separate routine from the doctor command.

## How to apply
In `start-dev.sh`, before `exec expo start`, run:
```bash
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
} catch {}
EOF
```

The first run must have internet access so the cache is populated once. After that, the above keeps it perpetually fresh.
