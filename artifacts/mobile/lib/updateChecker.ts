import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface VersionConfig {
  latestVersion: string;
  minimumRequiredVersion: string;
  apkDownloadUrl: string;
  updateMessage: string;
  forceUpdate: boolean;
}

export async function fetchVersionConfig(): Promise<VersionConfig | null> {
  try {
    const snap = await getDoc(doc(db, "appConfig", "versionControl"));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (
      !data.latestVersion ||
      !data.minimumRequiredVersion ||
      !data.apkDownloadUrl
    ) {
      return null;
    }
    return {
      latestVersion: String(data.latestVersion),
      minimumRequiredVersion: String(data.minimumRequiredVersion),
      apkDownloadUrl: String(data.apkDownloadUrl),
      updateMessage: String(data.updateMessage ?? ""),
      forceUpdate: Boolean(data.forceUpdate ?? true),
    };
  } catch {
    return null;
  }
}

export function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map((p) => parseInt(p, 10) || 0);
  const partsB = b.split(".").map((p) => parseInt(p, 10) || 0);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const pa = partsA[i] ?? 0;
    const pb = partsB[i] ?? 0;
    if (pa > pb) return 1;
    if (pa < pb) return -1;
  }
  return 0;
}

export function isUpdateRequired(
  installedVersion: string,
  config: VersionConfig
): boolean {
  if (!config.forceUpdate) return false;
  return (
    compareVersions(installedVersion, config.minimumRequiredVersion) < 0 ||
    compareVersions(installedVersion, config.latestVersion) < 0
  );
}
