import { App } from "~/App";

import { Editor } from "..";

export function TopBar() {
  return (
    <App.TopBar.Center.Set>
      <Editor.Tools />
    </App.TopBar.Center.Set>
  );
}
