import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";

import { Panel } from "./Panel";

export function Install({
  installPlugin,
}: {
  installPlugin: (url: string) => void;
}) {
  const pluginSetup = Plugin.useSetup();
  const [url, setURL] = useState("");
  return (
    <Panel className="flex flex-col gap-3">
      <h1 className="text-2xl">Install untrusted plugin</h1>
      <p className="-mt-2 flex items-center gap-2 text-red-500">
        <Theme.Icon.AlertTriangle className="h-5 w-5" />
        Do not install plugins from untrusted sources!
      </p>
      <div className="flex items-center gap-2">
        <Theme.Input
          value={url}
          onChange={setURL}
          onKeyDown={(event) => event.key === "Enter" && installPlugin(url)}
          loading={pluginSetup.isLoading}
          placeholder="http://localhost:3000/CoolExamplePlugin.js"
        />
        <Theme.Button
          color="brand"
          className="h-[31px]"
          onClick={() => installPlugin(url)}
          loading={pluginSetup.isLoading}
          disabled={!url}
        >
          Load
        </Theme.Button>
      </div>
      <p className="text-muted text-sm">
        Enter a URL which points to a valid&nbsp;
        <a
          className="text-brand-300 hover:underline"
          href="https://github.com/Stability-AI/StableStudio/blob/main/packages/stablestudio-plugin/README.md"
          target="_blank"
          rel="noreferrer"
        >
          StableStudio plugin
        </a>
        .
      </p>
    </Panel>
  );
}
