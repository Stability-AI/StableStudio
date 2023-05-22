export { Keys } from "./Keys";

// Note: This uses date tracking since MacOS doesn't fire keyup events for modifier keys while they are pressed.

export type Key = keyof typeof keys;

const modifiers = {
  Meta: "⌘",
  Control: "^",
  Shift: "⇧",
};

const numbers = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
};

const alphabet = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",
};

const other = {
  Escape: "esc",
  Backspace: "⌫",
  Delete: "⌦",
  Enter: "↵",

  "\\": "\\",

  "-": "-",
  "=": "+",

  "[": { display: "[", shift: "{" },
  "]": { display: "]", shift: "}" },

  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",

  F5: "F5",
  F7: "F7",
};

const keys = {
  ...modifiers,
  ...numbers,
  ...alphabet,
  ...other,
};

export function Key({ keyType }: { keyType: Key }) {
  const active = Key.useIsActive(keyType);
  const display = useMemo(() => {
    const key = keys[keyType];
    return typeof key === "string" ? key : key.display;
  }, [keyType]);

  return (
    <div
      className={classes(
        "dark:bg-muted-white-extra flex h-6 items-center justify-center rounded bg-zinc-200 align-middle text-zinc-800 dark:text-white",
        active && "bg-white text-black",
        display.length === 1 ? "w-6 uppercase" : "px-1.5 lowercase"
      )}
    >
      {display}
    </div>
  );
}

export namespace Key {
  export type Modifier = keyof typeof modifiers;

  export const getShifted = (key: Key): string | undefined => {
    const keyData = keys[key];
    return typeof keyData === "string" ? keyData : keyData.shift;
  };

  export const useOnDown = (
    key: Key,
    onDown: (event: KeyboardEvent) => void
  ) => {
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) =>
        event.key === key && onDown(event);

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [key, onDown]);
  };

  export const useOnUp = (key: Key, onUp: (event: KeyboardEvent) => void) => {
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) =>
        event.key === key && onUp(event);

      window.addEventListener("keyup", onKeyDown);
      return () => window.removeEventListener("keyup", onKeyDown);
    }, [key, onUp]);
  };

  export const useIsActive = (key: Key) => {
    const [active, setActive] = useState(false);
    const activeTimeout = useRef<NodeJS.Timeout>();

    useOnDown(
      key,
      useCallback(
        (event) => event.key.toLowerCase() === key && setActive(true),
        [key]
      )
    );

    useOnUp(
      key,
      useCallback(
        (event) => event.key.toLowerCase() === key && setActive(false),
        [key]
      )
    );

    useEffect(() => () => clearTimeout(activeTimeout.current), []);
    useEffect(() => {
      if (!active) return;
      if (activeTimeout.current) clearTimeout(activeTimeout.current);
      activeTimeout.current = setTimeout(() => setActive(false), 1000);
    }, [active, activeTimeout]);

    return active;
  };
}
