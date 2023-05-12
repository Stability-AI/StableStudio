import useHotkeys from "@reecelucas/react-use-hotkeys";

import { Device } from "~/Device";
import { Shortcut } from "~/Shortcut";

export type Keys = Shortcut.Key | OneOrMore | (Shortcut.Key | OneOrMore)[];
type OneOrMore = [Shortcut.Key, ...Shortcut.Key[]];

export function Keys({ className, ...props }: Styleable & { keys: Keys }) {
  const keys = useMemo(
    () =>
      Keys.normalize(props.keys).flatMap((keys) =>
        keys.map((keyType) => <Shortcut.Key key={keyType} keyType={keyType} />)
      ),
    [props.keys]
  );

  return (
    <div
      className={classes("flex items-center justify-center gap-1", className)}
    >
      {keys}
    </div>
  );
}

export namespace Keys {
  export type Options = {
    keys?: Keys;
    action?: Shortcut.Action;
    options?: Parameters<typeof useHotkeys>[2];
    event?: Shortcut.Event.Options;
  };

  export const normalize = (original: Keys): OneOrMore[] => {
    const keys: OneOrMore[] =
      typeof original === "string"
        ? [[original as Shortcut.Key]]
        : Array.isArray(original) && typeof original[0] === "string"
        ? [original as OneOrMore]
        : original.map((keys) => (typeof keys === "string" ? [keys] : keys));

    return Device.getInfo().operatingSystem !== "Windows"
      ? keys
      : (keys.map((keys) =>
          keys.map((key) => (key === "Meta" ? "Control" : key))
        ) as OneOrMore[]);
  };

  export const use = (options?: Options) => {
    const {
      action: originalAction = doNothing,
      keys: keysOrArray,
      options: libraryOptions = {},
      event: eventOptions = Shortcut.Event.Options.presets(),
    } = useMemo(() => ({ keys: [], ...options }), [options]);

    const keys = useMemo(
      () =>
        normalize(keysOrArray).map((keys) =>
          keys
            .map((key, index) => {
              const shifted =
                keys[0] === "Shift" &&
                index === 1 &&
                Shortcut.Key.getShifted(key);

              return shifted || key;
            })
            .join("+")
        ),
      [keysOrArray]
    );

    const action = useCallback(
      (event: KeyboardEvent) => {
        eventOptions.stopPropagation && event.stopPropagation();
        eventOptions.preventDefault && event.preventDefault();
        originalAction({ keyboardEvent: event });
      },
      [eventOptions, originalAction]
    );

    useHotkeys(keys, action, libraryOptions);
  };
}
