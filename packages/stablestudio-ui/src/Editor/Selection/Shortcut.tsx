import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Shortcuts {
  export const use = () => {
    const selection = Editor.Selection.use();
    const deleteEntities = Editor.Entities.useDelete();
    const setTool = Editor.Tool.Active.useSet();
    const [tool] = Editor.Tool.Active.use();

    const name = useMemo(
      () => `Selection (${selection.size})`,
      [selection.size]
    );

    Shortcut.Priority.use(
      useMemo(
        () => ({
          name,
          level: "high",
          enabled: selection.size > 0,
        }),
        [name, selection.size]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: "Select",
          icon: Editor.Selection.Icon,

          keys: "v",
          action: () => setTool("select"),
        }),
        [setTool]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: [name, "Delete"],
          icon: Theme.Icon.Trash,

          keys: [["Backspace"], ["Delete"]],
          action: () => deleteEntities(...selection),

          enabled: selection.size > 0 && tool === "select",
        }),
        [name, selection, tool, deleteEntities]
      )
    );
  };
}
