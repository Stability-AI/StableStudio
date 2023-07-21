import { PluginStatus } from "@stability/stablestudio-plugin";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { version as getOsVerison, platform } from "@tauri-apps/api/os";
import { appDataDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { Link } from "react-router-dom";

import { GlobalState } from "~/GlobalState";
import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";

import { Manifest } from "./Manifest";

export function Settings() {
  const [pluginStatus, setPluginStatus] = useState<PluginStatus | undefined>();
  const [comfyLocation, setComfyLocation] = useState<string | undefined>();
  const [versions, setVersions] = useState<string[]>([]);

  const { manifest, settings, setSetting, getStatus } = Plugin.use(
    ({ manifest, settings, setSetting, getStatus }) => ({
      manifest,
      settings,
      setSetting: setSetting ?? doNothing,
      getStatus,
    })
  );

  useEffect(() => {
    function fetchStatus() {
      if (!getStatus) return;

      const status = getStatus();
      if (status) {
        if (status instanceof Promise) {
          setPluginStatus((previous) => ({
            ...previous,
            indicator: "loading",
          }));
          status.then(setPluginStatus);
        } else {
          setPluginStatus(status);
          console.log(status);
        }
      }
    }

    fetchStatus();

    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [getStatus]);

  const isMissingRequiredSetting = useMemo(
    () =>
      Object.entries(settings ?? {}).find(
        ([, setting]) => (setting as any).required && !(setting as any).value
      ),
    [settings]
  );

  useEffect(() => {
    async function fetchComfyLocation() {
      const path = await appDataDir();
      setComfyLocation(`${path}ComfyUI`);
    }

    async function fetchVersion() {
      const version = await getVersion();
      const tauriVersion = await getTauriVersion();
      const os = await platform();
      const osVersion = await getOsVerison();

      setVersions([
        `StableStudio (${version})`,
        `Tauri (${tauriVersion})`,
        `${os} (${osVersion})`,
      ]);
    }

    fetchComfyLocation();
    fetchVersion();
  }, []);

  return (
    <>
      <div className="h-full justify-between overflow-y-auto bg-zinc-900 px-5 py-6">
        <div className="mx-auto flex max-w-[60rem] flex-col gap-5">
          {!isMissingRequiredSetting && (
            <Link to="/generate" className="w-fit">
              <div className="my-5 -ml-1 flex gap-1 text-lg opacity-50 hover:opacity-100">
                <Theme.Icon.ChevronLeft className="h-6 w-6" />
                Generate
              </div>
            </Link>
          )}
          <div>
            <h1 className="text-3xl">Settings</h1>
          </div>
          <Manifest
            manifest={manifest}
            pluginStatus={pluginStatus}
            settings={settings ?? {}}
            setSetting={setSetting as never}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label>ComfyUI location</label>
            </div>
            <div className="flex gap-2">
              <Theme.Input
                className="opacity-50"
                placeholder={"/path/to/ComfyUI"}
                value={comfyLocation}
                onChange={doNothing}
                disabled
              />
              <Theme.Button
                className="py-2"
                onClick={async () => {
                  await invoke("show_in_folder", { path: comfyLocation });
                }}
              >
                <Theme.Icon.ExternalLink className="h-6 w-6" />
              </Theme.Button>
            </div>
          </div>

          <div className="mt-8 flex gap-3 text-xs font-light opacity-40">
            {versions.map((version, i) => (
              <>
                {i !== 0 && (
                  <div key={`${version}-dot`} className="select-none">
                    &middot;
                  </div>
                )}
                <div key={version}>{version}</div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export namespace Settings {
  type State = {
    developerMode: boolean;
    setDeveloperMode: (value: boolean) => void;
  };

  namespace State {
    export const use = GlobalState.create<State>((set) => ({
      developerMode:
        localStorage.getItem("stablestudio-developerMode") === "true",

      setDeveloperMode: (value) =>
        set((state) => {
          localStorage.setItem("stablestudio-developerMode", value.toString());
          return { ...state, developerMode: value };
        }),
    }));
  }

  export const use = State.use;
}
