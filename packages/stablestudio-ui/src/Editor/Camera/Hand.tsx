import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Hand {
  export function Tool() {
    return (
      <Editor.Tool tool="hand">
        <Theme.Icon.Hand strokeWidth={1.5} size={22} />
      </Editor.Tool>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      const setTool = Editor.Tool.Active.useSet();
      Shortcut.use(
        useMemo(
          () => ({
            name: ["Camera", "Hand"],
            icon: Theme.Icon.Hand,

            keys: "h",
            action: () => setTool("hand"),
          }),
          [setTool]
        )
      );
    };
  }
}
