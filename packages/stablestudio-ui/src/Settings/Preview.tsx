import { PluginManifest } from "@stability/stablestudio-plugin";

import { Theme } from "~/Theme";

export function Preview({
  manifest,
  onInstall,
  loading,
  error,
}: {
  manifest?: PluginManifest;
  onInstall: () => void;
  loading: boolean;
  error?: Error;
}) {
  return (
    <div className="flex items-center justify-between rounded bg-white/10 p-3">
      {error ? (
        <div className="flex h-full w-full items-center justify-center text-red-500">
          {error.message}
        </div>
      ) : (
        <>
          {manifest ? (
            <div className="flex gap-3">
              {manifest.icon && (
                <img
                  src={manifest.icon}
                  className="aspect-square h-[45px] rounded-lg object-cover"
                />
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-xl">{manifest.name}</h1>
                <p className="opacity-muted text-sm">{manifest.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-xl">No manifest found</h1>
              <p className="opacity-muted text-sm">
                Proceed with caution. This plugin may not be safe to install.
              </p>
            </div>
          )}
          <Theme.Button
            color="brand"
            className="mr-3"
            loading={loading}
            onClick={onInstall}
          >
            Install
          </Theme.Button>
        </>
      )}
    </div>
  );
}
