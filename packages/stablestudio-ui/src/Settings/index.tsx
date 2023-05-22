import { PluginStatus } from "@stability/stablestudio-plugin";
import { Link } from "react-router-dom";

import { GlobalState } from "~/GlobalState";
import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";

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
    <>
      <div className="h-full justify-between overflow-y-auto bg-white px-5 py-6 dark:bg-zinc-900">
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
          <Setting
            settingKey="developerMode"
            setSetting={() => setDeveloperMode(!developerMode)}
            settingValue={{
              type: "boolean",
              title: "Developer mode",
              description:
                "Enable experimental features such as installing untrusted plugins",

              required: false,
              value: developerMode,
            }}
          />
          {developerMode && (
            <Install
              installPlugin={(url) => url && pluginSetup.loadFromURL(url)}
            />
          )}
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
