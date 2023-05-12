import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Shortcuts {
  export const use = () => {
    const createDream = Editor.Dream.Create.use();
    Shortcut.use(
      useMemo(
        () => ({
          name: ["Dream", "Create"],
          icon: Theme.Icon.Plus,

          keys: ["Meta", "d"],
          action: () => createDream(),
        }),
        [createDream]
      )
    );
  };
}
