import * as StableStudio from "@stability/stablestudio-plugin";
import * as StableStudioPluginExample from "@stability/stablestudio-plugin-example";
import * as StableStudioPluginStability from "@stability/stablestudio-plugin-stability";
import * as StableStudioPluginWebUI from "@stability/stablestudio-plugin-webui";

import { Environment } from "~/Environment";
import { Generation } from "~/Generation";
import { GlobalState } from "~/GlobalState";

export type Plugin = StableStudio.Plugin;
export namespace Plugin {
  export const get = () => {
    const { rootPlugin, activePluginID, plugins } = State.use.getState();
    const activePlugin = !!activePluginID
      ? plugins[activePluginID]?.plugin
      : rootPlugin;

    return activePlugin.getState();
  };

  export function use<Selection = State>(
    selector: (state: Plugin) => Selection = (state) => state as Selection
  ) {
    const plugin = State.use(({ rootPlugin, activePluginID, plugins }) =>
      activePluginID && plugins[activePluginID]?.plugin
        ? plugins[activePluginID].plugin
        : rootPlugin
    );

    return GlobalState.useStore(plugin, selector);
  }

  export const useUnload = () =>
    useCallback((id: ID) => {
      State.use.getState().setPlugins(({ [id]: _, ...plugins }) => plugins);
      State.use.getState().setActivePluginID();
    }, []);

  export const useSetup = () => {
    const [error, setError] = useState<Error | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const loadFromURL = useCallback(async (url: URLString) => {
      try {
        setIsLoading(true);

        const pluginModule = await import(
          /* @vite-ignore */
          url
        );

        const plugin = pluginModule.createPlugin({
          getGitHash: () => Environment.get("GIT_HASH"),
          getStableDiffusionRandomPrompt: () =>
            Generation.Image.Prompt.Random.get(),
        });

        const id = ID.create();

        State.use.getState().setPlugins((plugins) => ({
          ...plugins,
          [id]: {
            enabled: true,
            index: Object.keys(plugins).length,
            plugin,
          },
        }));

        State.use.getState().setActivePluginID(id);

        setIsLoading(false);

        return plugin;
      } catch (error: unknown) {
        setIsLoading(false);
        setError(
          error instanceof Error ? error : new Error("Failed to load plugin")
        );

        return undefined;
      }
    }, []);

    return {
      error,
      setError,
      isLoading,

      loadFromURL,
      getFromURL: doNothing,
    };
  };
}

type State = {
  rootPlugin: GlobalState.Store<StableStudio.Plugin>;

  activePluginID?: ID;
  setActivePluginID: (id?: ID) => void;

  plugins: State.Plugins;
  setPlugins: (
    setPlugins: State.Plugins | React.SetStateAction<State.Plugins>
  ) => void;
};

namespace State {
  export type Plugins = { [id: ID]: Plugin };
  export type Plugin = {
    enabled: boolean;
    index: number;
    plugin: GlobalState.Store<StableStudio.Plugin>;
  };

  export const use = GlobalState.create<State>((set) => {
    const { createPlugin: createRootPlugin } =
      Environment.get("USE_EXAMPLE_PLUGIN") === "true"
        ? StableStudioPluginExample
        : Environment.get("USE_WEBUI_PLUGIN") === "true"
        ? StableStudioPluginWebUI
        : StableStudioPluginStability;

    return {
      rootPlugin: createRootPlugin({
        getGitHash: () => Environment.get("GIT_HASH"),
        getStableDiffusionRandomPrompt: () =>
          Generation.Image.Prompt.Random.get(),
      }) as unknown as GlobalState.Store<StableStudio.Plugin>,

      setActivePluginID: (activePluginID) => set({ activePluginID }),

      plugins: {},
      setPlugins: (setPlugins) =>
        typeof setPlugins === "function"
          ? set(({ plugins }) => ({ plugins: setPlugins(plugins) }))
          : set({ plugins: setPlugins }),
    };
  });
}
