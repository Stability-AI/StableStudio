import {
  PluginManifest,
  PluginSettings,
  PluginStatus,
} from "@stability/stablestudio-plugin";
import { Markdown } from "~/Markdown";

import { Plugin } from "~/Plugin";
import { Theme } from "~/Theme";

import { Panel } from "./Panel";
import { Setting } from "./Setting";

export function Manifest({
  id,
  manifest,
  pluginStatus,
  settings,
  setSetting,
}: {
  id?: ID;
  manifest?: PluginManifest;
  pluginStatus?: PluginStatus;
  settings: PluginSettings;
  setSetting: (key: string, value: any) => void;
}) {
  const unloadPlugin = Plugin.useUnload();
  return (
    <Panel className="flex flex-col gap-2">
      <div className="flex flex-col">
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {manifest?.icon && (
                <img
                  src={manifest.icon}
                  className="aspect-square h-7 w-7 shrink-0 rounded-lg object-cover"
                  alt="Plugin icon"
                />
              )}
              {manifest?.link ? (
                <a
                  href={manifest.link}
                  className="text-2xl hover:underline"
                  target={"_blank"}
                  rel="noreferrer"
                >
                  {manifest.name ?? "Unnamed"}
                </a>
              ) : (
                <h1 className="text-2xl">{manifest?.name ?? "Unnamed"}</h1>
              )}
              {pluginStatus && (
                <div className="flex items-center gap-1">
                  {pluginStatus.indicator === "error" && (
                    <Theme.Icon.AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {pluginStatus.indicator === "warning" && (
                    <Theme.Icon.AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {pluginStatus.indicator === "success" && (
                    <Theme.Icon.Check className="h-5 w-5 text-green-500" />
                  )}
                  {pluginStatus.indicator === "info" && (
                    <Theme.Icon.Info className="h-5 w-5 text-blue-500" />
                  )}
                  {pluginStatus.indicator === "loading" && (
                    <Theme.Icon.RefreshClockwise className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  <span
                    className={classes(
                      "text-sm",
                      pluginStatus.indicator === "error" && "text-red-500",
                      pluginStatus.indicator === "warning" && "text-yellow-500",
                      pluginStatus.indicator === "success" && "text-green-500",
                      pluginStatus.indicator === "info" && "text-blue-500",
                      pluginStatus.indicator === "loading" && "text-blue-500"
                    )}
                  >
                    {pluginStatus.text}
                  </span>
                </div>
              )}
            </div>
            {id && unloadPlugin && (
              <Theme.Button
                className="h-18"
                icon={Theme.Icon.Trash}
                onClick={() => id && unloadPlugin(id)}
              >
                Uninstall
              </Theme.Button>
            )}
          </div>
          <div className="mt-2 flex gap-5">
            {manifest?.version && (
              <MiniManifestField label="Version" value={manifest.version} />
            )}
            <MiniManifestField
              label="License"
              value={manifest?.license ?? "No license"}
            />
            <MiniManifestField
              label="Author"
              value={manifest?.author ?? "No author"}
            />
          </div>
        </div>
        <ManifestField
          label="About"
          value={manifest?.description ?? "No description"}
          markdown
        />
      </div>

      {Object.keys(settings).length > 0 && (
        <div className="mt-2 flex flex-col gap-4">
          <Theme.Label className="ml-0">Settings</Theme.Label>
          {Object.entries(settings).map(([key, setting]) => (
            <Setting
              key={key}
              settingKey={key}
              settingValue={setting}
              setSetting={setSetting}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}

function ManifestField({
  label,
  value,
  markdown,
  className,
}: {
  label: string;
  value: string | undefined;
  markdown?: boolean;
  className?: string;
}) {
  return (
    <div className={classes("flex flex-col gap-2", className)}>
      <Theme.Label className="ml-0">{label}</Theme.Label>
      {markdown ? <Markdown text={value ?? ""} /> : <p>{value}</p>}
    </div>
  );
}

function MiniManifestField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | undefined;
  className?: string;
}) {
  return (
    <p className={classes("opacity-muted text-sm", className)}>
      <span className="select-none opacity-50">{label} </span>
      {value}
    </p>
  );
}
