import { Editor } from "~/Editor";

export type Strength = number;
export namespace Strength {
  export const min = () => 0;
  export const preset = () => max();
  export const max = () => 1;

  export const use = () => {
    const brush = Editor.Brush.use();
    const setBrush = Editor.Brush.useSet();

    const set = useCallback(
      (
        setStrength:
          | number
          | undefined
          | ((strength: number) => number | undefined)
      ) => {
        setBrush((brush) => {
          const strength =
            (typeof setStrength === "function"
              ? setStrength(brush.strength)
              : setStrength) ?? preset();

          return { ...brush, strength: clamp(min(), strength, max()) };
        });
      },
      [setBrush]
    );

    return useMemo(() => [brush.strength, set] as const, [brush.strength, set]);
  };
}
