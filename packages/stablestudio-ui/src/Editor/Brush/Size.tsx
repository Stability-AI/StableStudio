import { Editor } from "~/Editor";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export type Size = number;
export namespace Size {
  export const min = () => 5;
  export const preset = () => 50;
  export const max = () => 200;

  export const use = () => {
    const brush = Editor.Brush.use();
    const setBrush = Editor.Brush.useSet();

    const set = useCallback(
      (
        setSize: number | undefined | ((size: number) => number | undefined)
      ) => {
        setBrush((brush) => {
          const size =
            (typeof setSize === "function" ? setSize(brush.size) : setSize) ??
            preset();

          return { ...brush, size: clamp(min(), size, max()) };
        });
      },
      [setBrush]
    );

    return useMemo(() => [brush.size, set] as const, [brush.size, set]);
  };

  export namespace Shortcuts {
    export const use = () => {
      const [, setSize] = Editor.Brush.Size.use();
      const [tool] = Editor.Tool.Active.use();
      const enabled = tool === "brush";

      Shortcut.use(
        useMemo(
          () => ({
            name: ["Eraser", "Size", "Increase"],
            icon: Theme.Icon.Plus,

            keys: "]",
            action: () => setSize((size) => size + 5),

            enabled,
          }),
          [enabled, setSize]
        )
      );

      Shortcut.use(
        useMemo(
          () => ({
            name: ["Eraser", "Size", "Decrease"],
            icon: Theme.Icon.Minus,

            keys: "[",
            action: () => setSize((size) => size - 5),

            enabled,
          }),
          [enabled, setSize]
        )
      );
    };
  }
}
