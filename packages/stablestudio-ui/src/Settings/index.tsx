import { PluginStatus } from "@stability/stablestudio-plugin";
import { Link } from "react-router-dom";

import { GlobalState } from "~/GlobalState";
import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";
import { Button } from "~/Theme/Button";

import { Install } from "./Install";
import { Manifest } from "./Manifest";
import { Setting } from "./Setting";

export function Settings() {
  const [pluginStatus, setPluginStatus] = useState<PluginStatus | undefined>();
  const pluginSetup = Plugin.useSetup();

  const { manifest, settings, setSetting, getStatus } = Plugin.use(
    ({ manifest, settings, setSetting, getStatus }) => ({
      manifest,
      settings,
      setSetting: setSetting ?? doNothing,
      getStatus,
    })
  );

  const { developerMode, setDeveloperMode } = Settings.use();

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

  return (
    <div className="h-full flex flex-col items-center justify-center bg-zinc-900 px-5 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
      </div>
      <div className="w-full max-w-[60rem]">
        <Manifest
          manifest={manifest}
          pluginStatus={pluginStatus}
          settings={settings ?? {}}
          setSetting={setSetting as never}
        />
        {!isMissingRequiredSetting && (
          <Link to="/generate" className="mt-8 w-fit ">
            <br>
            </br>
            <div className="flex items-center justify-center gap-2 text-lg text-white opacity-100 hover:opacity-80">
              <Theme.Icon.ImagePlus className="h-6 w-6 fill-current" />
              Generate
            </div>
          </Link>
        )}
      </div>
    </div>
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
