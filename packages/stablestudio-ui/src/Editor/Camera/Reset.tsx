import { Editor } from "~/Editor";
import { Shortcut as Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Reset {
  export const use = () => {
    const box = Editor.Entities.useSurroundingBox();
    const setCamera = Editor.Camera.useSet();
    return useCallback(() => {
      if (!box) return;
      setCamera(box);
    }, [box, setCamera]);
  };

  export function Tool() {
    const reset = use();
    return (
      <Editor.Tool onClick={reset}>
        <Theme.Icon.LocateFixed />
      </Editor.Tool>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      const reset = Reset.use();
      Shortcut.use(
        useMemo(
          () => ({
            name: ["Camera", "Reset"],
            icon: Theme.Icon.LocateFixed,

            keys: ["Meta", "9"],
            action: reset,
          }),
          [reset]
        )
      );
    };
  }
}
