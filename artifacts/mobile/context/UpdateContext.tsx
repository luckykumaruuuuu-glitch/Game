import Constants from "expo-constants";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchVersionConfig, isUpdateRequired, VersionConfig } from "@/lib/updateChecker";

export const APP_VERSION: string =
  Constants.expoConfig?.version ?? "1.0.0";

interface UpdateState {
  checking: boolean;
  updateRequired: boolean;
  versionConfig: VersionConfig | null;
  installedVersion: string;
  error: boolean;
}

const UpdateContext = createContext<UpdateState>({
  checking: true,
  updateRequired: false,
  versionConfig: null,
  installedVersion: APP_VERSION,
  error: false,
});

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UpdateState>({
    checking: true,
    updateRequired: false,
    versionConfig: null,
    installedVersion: APP_VERSION,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const config = await fetchVersionConfig();
        if (cancelled) return;

        if (!config) {
          setState({
            checking: false,
            updateRequired: false,
            versionConfig: null,
            installedVersion: APP_VERSION,
            error: false,
          });
          return;
        }

        const updateRequired = isUpdateRequired(APP_VERSION, config);
        setState({
          checking: false,
          updateRequired,
          versionConfig: config,
          installedVersion: APP_VERSION,
          error: false,
        });
      } catch {
        if (!cancelled) {
          setState({
            checking: false,
            updateRequired: false,
            versionConfig: null,
            installedVersion: APP_VERSION,
            error: true,
          });
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return (
    <UpdateContext.Provider value={state}>
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
  return useContext(UpdateContext);
}
