import { Theme } from "~/Theme";

export function Filter() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/30">
      <Theme.Icon.AlertTriangle className="text-red-500" size={48} />
      <h1>Image was flagged as inappropriate</h1>
      <h2 className="text-sm opacity-75">You have not been charged</h2>
    </div>
  );
}
