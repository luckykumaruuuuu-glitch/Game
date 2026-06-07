---
name: Expo parallel start cache fix
description: Two simultaneous expo start calls race on the native-modules-cache directory, causing ENOENT crash in the artifacts/mobile workflow.
---

## Rule
Always `mkdir -p "$HOME/.expo/native-modules-cache"` and `mkdir -p "$HOME/.expo/cache"` in `start-dev.sh` before calling `expo start`.

**Why:** This project has two workflows that both invoke `start-dev.sh` simultaneously — "Mobile App" (PORT=5000) and "artifacts/mobile: expo" (no PORT → defaults to 8081). Expo CLI's `FileSystemResponseCache.get` calls `readFile` on a cache file inside `~/.expo/native-modules-cache/` during `validateDependenciesVersionsAsync`. If the directory doesn't exist yet, Node throws ENOENT which propagates up and kills the expo process. The first workflow to run creates the directory; the second fails if the directory doesn't exist yet. Pre-creating the directory in the script ensures both succeed.

**How to apply:** In `artifacts/mobile/scripts/start-dev.sh`, add these two lines before the `exec $EXPO_CMD start` line:
```bash
mkdir -p "$HOME/.expo/native-modules-cache"
mkdir -p "$HOME/.expo/cache"
```
