import { Editor } from "~/Editor";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export type Blur = number;
export namespace Blur {
  export const min = () => 0;
  export const preset = () => 5;
  export const max = () => 50;

  export const use = () => {
    const brush = Editor.Brush.use();
    const setBrush = Editor.Brush.useSet();

    const set = useCallback(
      (
        setBlur: number | undefined | ((blur: number) => number | undefined)
      ) => {
        setBrush((brush) => {
          const blur =
            (typeof setBlur === "function" ? setBlur(brush.blur) : setBlur) ??
            preset();

          return { ...brush, blur: clamp(min(), blur, max()) };
        });
      },
      [setBrush]
    );

    return useMemo(() => [brush.blur, set] as const, [brush.blur, set]);
  };

  export namespace Shortcuts {
    export const use = () => {
      const [, setBlur] = Editor.Brush.Blur.use();
      const [tool] = Editor.Tool.Active.use();
      const enabled = tool === "brush";

      Shortcut.use(
        useMemo(
          () => ({
            name: ["Eraser", "Blur", "Increase"],
            icon: Theme.Icon.Plus,
            keys: ["Shift", "]"],

            enabled,
            action: () => setBlur((blur) => blur + 1),
          }),
          [enabled, setBlur]
        )
      );

      Shortcut.use(
        useMemo(
          () => ({
            name: ["Eraser", "Blur", "Decrease"],
            icon: Theme.Icon.Minus,
            keys: ["Shift", "["],

            enabled,
            action: () => setBlur((blur) => blur - 1),
          }),
          [enabled, setBlur]
        )
      );
    };
  }
}
