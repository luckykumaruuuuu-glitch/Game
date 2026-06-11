import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// ─── Internal cache key (obfuscated) ──────────────────────────────────────────
const _K = "__x_vc_s__";
const _TTL = 43_200_000; // 12 hours

export interface VersionConfig {
  latestVersion: string;
  minimumRequiredVersion: string;
  apkDownloadUrl: string;
  updateMessage: string;
  forceUpdate: boolean;
}

interface _CachedPayload {
  c: VersionConfig;   // config
  l: boolean;         // was locked at time of cache
  t: number;          // timestamp
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
 * Hard rule:  version < minimumRequiredVersion → ALWAYS locked (ignores forceUpdate flag)
 * Soft rule:  version < latestVersion AND forceUpdate=true → locked
 */
export function isUpdateRequired(installed: string, config: VersionConfig): boolean {
  if (compareVersions(installed, config.minimumRequiredVersion) < 0) return true;
  if (config.forceUpdate && compareVersions(installed, config.latestVersion) < 0) return true;
  return false;
}

// ─── AsyncStorage cache ────────────────────────────────────────────────────────

export async function _readCache(): Promise<_CachedPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(_K);
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
    await AsyncStorage.setItem(_K, JSON.stringify(payload));
  } catch {
    // storage unavailable — silently skip
  }
}

// ─── Layer 2: Firebase Firestore ───────────────────────────────────────────────

async function _fetchFirebase(): Promise<VersionConfig | null> {
  const snap = await getDoc(doc(db, "appConfig", "versionControl"));
  if (!snap.exists()) return null;
  const d = snap.data();
  if (!d.latestVersion || !d.minimumRequiredVersion || !d.apkDownloadUrl) return null;
  return {
    latestVersion: String(d.latestVersion),
    minimumRequiredVersion: String(d.minimumRequiredVersion),
    apkDownloadUrl: String(d.apkDownloadUrl),
    updateMessage: String(d.updateMessage ?? ""),
    forceUpdate: Boolean(d.forceUpdate ?? true),
  };
}

// ─── Layer 3: API Server flag ──────────────────────────────────────────────────

export async function _fetchServerFlag(apiBase: string): Promise<boolean | null> {
  if (!apiBase) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${apiBase}/api/version`, {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json() as { forceUpdate?: unknown };
    return typeof data.forceUpdate === "boolean" ? data.forceUpdate : null;
  } catch {
    return null;
  }
}

// ─── Result types ──────────────────────────────────────────────────────────────

export type CheckResult =
  | { outcome: "ok" }
  | { outcome: "update_required"; config: VersionConfig }
  | { outcome: "offline_locked";  config: VersionConfig | null };

// ─── Main multi-layer check (with retry) ──────────────────────────────────────

export async function runVersionCheck(
  installed: string,
  apiBase: string,
  retries = 2
): Promise<CheckResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, attempt * 1200));
    }

    try {
      // Layer 2: Firebase (primary source of truth)
      const fbConfig = await _fetchFirebase();

      if (!fbConfig) {
        // Firebase returned nothing — fail-secure
        const cache = await _readCache();
        return {
          outcome: "offline_locked",
          config: cache?.c ?? null,
        };
      }

      // Layer 3: Server (best-effort override — server outage must NOT block good users)
      const serverForce = await _fetchServerFlag(apiBase);

      // Server explicitly flags force → apply it; otherwise trust Firebase
      const effective: VersionConfig =
        serverForce === true
          ? { ...fbConfig, forceUpdate: true }
          : fbConfig;

      const locked = isUpdateRequired(installed, effective);

      // Always write fresh state to cache
      await _writeCache(effective, locked);

      if (locked) return { outcome: "update_required", config: effective };
      return { outcome: "ok" };
    } catch {
      // Network or Firestore error — try next attempt
    }
  }

  // All retries exhausted — fall back to cache
  const cache = await _readCache();

  if (!cache) {
    // Never cached anything → no way to verify → deny entry (fail-secure)
    return { outcome: "offline_locked", config: null };
  }

  // Cache hit: check if currently installed version would be locked by cached config
  const cachedLocked = isUpdateRequired(installed, cache.c);
  if (cachedLocked) {
    return { outcome: "update_required", config: cache.c };
  }

  // Cache says user was OK — block offline entry regardless
  // (app needs internet for auth anyway; block to prevent stale-state bypass)
  return { outcome: "offline_locked", config: null };
}
