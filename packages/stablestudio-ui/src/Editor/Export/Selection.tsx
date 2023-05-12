import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Selection {
  export function Tool() {
    return (
      <Editor.Tool label="Selection export" tool="export">
        <Theme.Icon.Camera strokeWidth={1.5} size={22} />
      </Editor.Tool>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      const setTool = Editor.Tool.Active.useSet();
      Shortcut.use(
        useMemo(
          () => ({
            name: ["Export", "Selection"],
            icon: Theme.Icon.Camera,

            keys: "c",
            action: () => setTool("export"),
          }),
          [setTool]
        )
      );
    };
  }
}
