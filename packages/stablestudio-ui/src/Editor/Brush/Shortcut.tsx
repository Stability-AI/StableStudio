import { Editor } from "~/Editor";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Shortcuts {
  export const use = () => {
    const setTool = Editor.Tool.Active.useSet();
    const [tool] = Editor.Tool.Active.use();
    const enabled = tool === "brush";

    Editor.Brush.Blur.Shortcuts.use();
    Editor.Brush.Size.Shortcuts.use();

    Shortcut.Priority.use(
      useMemo(
        () => ({
          name: "Eraser",
          level: "high",
          enabled,
        }),
        [enabled]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: "Eraser",
          icon: Theme.Icon.Eraser,

          keys: "e",
          action: () => setTool("brush"),
        }),
        [setTool]
      )
    );
  };
}
