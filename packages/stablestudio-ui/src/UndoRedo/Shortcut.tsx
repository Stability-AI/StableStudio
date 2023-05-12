import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";
import { UndoRedo } from "~/UndoRedo";

export namespace Shortcuts {
  export const use = () => {
    const { undo, redo } = UndoRedo.use();

    Shortcut.use(
      useMemo(
        () => ({
          name: ["History", "Undo"],
          keys: ["Meta", "z"],
          icon: Theme.Icon.Undo,
          action: () => undo(),
        }),
        [undo]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: ["History", "Redo"],
          keys: ["Meta", "Shift", "z"],
          icon: Theme.Icon.Redo,
          action: () => redo(),
        }),
        [redo]
      )
    );
  };
}
