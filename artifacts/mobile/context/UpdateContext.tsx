import Constants from "expo-constants";
import React, { createContext, useContext, useEffect, useState } from "react";
import { runVersionCheck, VersionConfig } from "@/lib/updateChecker";

export const APP_VERSION: string = Constants.expoConfig?.version ?? "1.0.0";

function _getApiBase(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

export type UpdateStatus =
  | "checking"        // initial check in progress
  | "ok"              // all checks passed — allow entry
  | "update_required"; // version too old — block entry

export interface UpdateState {
  status: UpdateStatus;
  versionConfig: VersionConfig | null;
  installedVersion: string;
}

const UpdateContext = createContext<UpdateState>({
  status: "checking",
  versionConfig: null,
  installedVersion: APP_VERSION,
});

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UpdateState>({
    status: "checking",
    versionConfig: null,
    installedVersion: APP_VERSION,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      console.log("[UpdateProvider] Running version check, APP_VERSION =", APP_VERSION);
      const apiBase = _getApiBase();
      const result = await runVersionCheck(APP_VERSION, apiBase);
      if (cancelled) return;

      console.log("[UpdateProvider] Result:", result.outcome);

      if (result.outcome === "update_required") {
        setState({
          status: "update_required",
          versionConfig: result.config,
          installedVersion: APP_VERSION,
        });
      } else {
        // "ok" — version check passed or Firebase not configured
        setState({
          status: "ok",
          versionConfig: null,
          installedVersion: APP_VERSION,
        });
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <UpdateContext.Provider value={state}>
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate(): UpdateState {
  return useContext(UpdateContext);
}
