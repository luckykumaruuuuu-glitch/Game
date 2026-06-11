import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const _CACHE_KEY = "__x_vc_s__";

export interface VersionConfig {
  latestVersion: string;
  minimumRequiredVersion: string;
  apkDownloadUrl: string;
  updateMessage: string;
  forceUpdate: boolean;
}

interface _CachedPayload {
  c: VersionConfig;
  l: boolean;   // was locked when cached
  t: number;    // timestamp
}

// ─── Version comparison ────────────────────────────────────────────────────────

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

/**
 * Hard rule: version < minimumRequiredVersion → ALWAYS locked (ignores forceUpdate flag)
 * Soft rule: version < latestVersion AND forceUpdate=true → locked
 */
export function isUpdateRequired(installed: string, config: VersionConfig): boolean {
  if (compareVersions(installed, config.minimumRequiredVersion) < 0) return true;
  if (config.forceUpdate && compareVersions(installed, config.latestVersion) < 0) return true;
  return false;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export async function _readCache(): Promise<_CachedPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(_CACHE_KEY);
    if (!raw) return null;
    const p: _CachedPayload = JSON.parse(raw);
    if (!p?.c?.minimumRequiredVersion) return null;
    return p;
  } catch {
    return null;
  }
}

async function _writeCache(config: VersionConfig, locked: boolean): Promise<void> {
  try {
    const payload: _CachedPayload = { c: config, l: locked, t: Date.now() };
    await AsyncStorage.setItem(_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable — skip silently
  }
}

// ─── Layer 2: Firebase Firestore ──────────────────────────────────────────────

/**
 * Returns config if the Firestore document exists and has all required fields.
 * Returns null if the document is missing or incomplete — NOT an error condition.
 * Throws only on genuine network/Firestore failure.
 */
async function _fetchFirebase(): Promise<VersionConfig | null> {
  console.log("[UpdateCheck] Fetching version config from Firebase...");
  const snap = await getDoc(doc(db, "appConfig", "versionControl"));
  if (!snap.exists()) {
    console.log("[UpdateCheck] Firebase: appConfig/versionControl document not found → no gating");
    return null;
  }
  const d = snap.data();
  if (!d.latestVersion || !d.minimumRequiredVersion || !d.apkDownloadUrl) {
    console.log("[UpdateCheck] Firebase: document exists but missing required fields → no gating", JSON.stringify(d));
    return null;
  }
  const config: VersionConfig = {
    latestVersion: String(d.latestVersion),
    minimumRequiredVersion: String(d.minimumRequiredVersion),
    apkDownloadUrl: String(d.apkDownloadUrl),
    updateMessage: String(d.updateMessage ?? ""),
    forceUpdate: Boolean(d.forceUpdate ?? true),
  };
  console.log("[UpdateCheck] Firebase: config fetched →", JSON.stringify(config));
  return config;
}

// ─── Layer 3: API Server flag ─────────────────────────────────────────────────

async function _fetchServerFlag(apiBase: string): Promise<boolean | null> {
  if (!apiBase) {
    console.log("[UpdateCheck] Server flag: no apiBase configured, skipping");
    return null;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${apiBase}/api/version`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) {
      console.log("[UpdateCheck] Server flag: HTTP", res.status, "→ ignoring");
      return null;
    }
    const data = await res.json() as { forceUpdate?: unknown };
    const flag = typeof data.forceUpdate === "boolean" ? data.forceUpdate : null;
    console.log("[UpdateCheck] Server flag:", flag);
    return flag;
  } catch (err) {
    console.log("[UpdateCheck] Server flag fetch failed (best-effort, ignoring):", String(err));
    return null;
  }
}

// ─── Result types ─────────────────────────────────────────────────────────────

export type CheckResult =
  | { outcome: "ok" }
  | { outcome: "update_required"; config: VersionConfig };

// ─── Main multi-layer check ───────────────────────────────────────────────────

/**
 * Decision table:
 *
 * Firebase OK + no document          → OK          (no gating configured)
 * Firebase OK + doc + version OK     → OK
 * Firebase OK + doc + version old    → UPDATE_REQUIRED
 * Firebase THROWS (network error):
 *   → cache says update required     → UPDATE_REQUIRED (cached config)
 *   → cache says OK / no cache       → OK (fail-open: don't punish users for network issues)
 *
 * The "No Internet" screen was removed — it was triggering incorrectly when
 * the Firestore document was missing, even though internet was available.
 */
export async function runVersionCheck(
  installed: string,
  apiBase: string,
  retries = 2,
): Promise<CheckResult> {
  console.log("[UpdateCheck] Starting version check. installed =", installed, "apiBase =", apiBase);

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = attempt * 1500;
      console.log("[UpdateCheck] Retry", attempt, "in", delay, "ms...");
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      // Layer 2: Firebase
      const fbConfig = await _fetchFirebase();

      // Document missing or incomplete → Firebase is reachable but no version config set.
      // Treat as "no gating" — allow user in. This matches original behavior.
      if (!fbConfig) {
        console.log("[UpdateCheck] No version config in Firebase → OK (no gating)");
        return { outcome: "ok" };
      }

      // Layer 3: Server flag (best-effort — server outage must not block users)
      const serverForce = await _fetchServerFlag(apiBase);
      const effective: VersionConfig =
        serverForce === true ? { ...fbConfig, forceUpdate: true } : fbConfig;

      const locked = isUpdateRequired(installed, effective);
      await _writeCache(effective, locked);

      if (locked) {
        console.log("[UpdateCheck] UPDATE REQUIRED. installed =", installed,
          "minimum =", effective.minimumRequiredVersion,
          "latest =", effective.latestVersion);
        return { outcome: "update_required", config: effective };
      }

      console.log("[UpdateCheck] Version OK → allowing entry");
      return { outcome: "ok" };

    } catch (err) {
      console.warn("[UpdateCheck] Attempt", attempt, "threw:", String(err));
    }
  }

  // All retries exhausted — genuine network failure
  console.warn("[UpdateCheck] All", retries + 1, "attempts failed. Checking cache...");
  const cache = await _readCache();

  if (cache) {
    console.log("[UpdateCheck] Cache found. locked =", cache.l, "config =", JSON.stringify(cache.c));
    const cachedLocked = isUpdateRequired(installed, cache.c);
    if (cachedLocked) {
      // Previously required an update AND still requires it → enforce from cache
      console.warn("[UpdateCheck] Cache confirms update required → blocking");
      return { outcome: "update_required", config: cache.c };
    }
    // Cache says version was OK → let user in despite network issues
    console.log("[UpdateCheck] Cache says OK → allowing entry despite network failure");
    return { outcome: "ok" };
  }

  // No cache at all (first run with no network) → fail-open, let user in
  console.log("[UpdateCheck] No cache, no network → fail-open → OK");
  return { outcome: "ok" };
}
