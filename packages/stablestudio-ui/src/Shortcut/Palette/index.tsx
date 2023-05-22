import { GlobalState } from "~/GlobalState";
import { Shortcut, Shortcuts } from "~/Shortcut";
import { Theme } from "~/Theme";
import { Input } from "~/Theme/Input";

export function Palette() {
  const { ref } = useEvents();

  const search = Shortcut.Search.use();
  const shortcuts = Shortcuts.useDisplayed();

  const { isOpen, setIsOpen } = Palette.use();
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(
    () => "toggle" && setIsOpen(!isOpen),
    [isOpen, setIsOpen]
  );

  const { clear } = search;
  useEffect(() => {
    !isOpen && clear();
  }, [isOpen, clear]);

  Shortcut.Key.useOnDown("Escape", close);
  Shortcut.Keys.use(
    useMemo(
      () => ({
        keys: ["Meta", "k"],
        action: toggle,
        options: {
          ignoredElementWhitelist: ["INPUT", "TEXTAREA"],
        },
      }),
      [toggle]
    )
  );

  return useMemo(
    () =>
      !isOpen ? null : (
        <div
          ref={ref}
          className="absolute bottom-0 left-0 right-0 top-0 z-[9999] flex items-center justify-center"
        >
          <div
            onClick={close}
            className="absolute bottom-0 left-0 right-0 top-0 z-0 bg-white/50 opacity-100 backdrop-blur-sm dark:bg-zinc-900/50"
          />
          <div className="relative">
            <div className="z-30 min-h-[500px] min-w-[400px] rounded bg-zinc-200/90 text-black shadow-lg dark:bg-zinc-800/90 dark:text-white">
              <div className="px-4 py-2">
                <Input
                  autoFocus
                  transparent
                  size="lg"
                  placeholder="What are you looking for?"
                  loading={search.loading}
                  value={search.text}
                  onChange={search.setText}
                  iconLeft={Theme.Icon.Search}
                  iconRight={
                    search.text !== "" &&
                    ((props) => (
                      <Theme.Icon.X
                        {...props}
                        onClick={() => search.setText("")}
                        className={classes(
                          "pointer-events-auto cursor-pointer",
                          props.className
                        )}
                      />
                    ))
                  }
                />
              </div>
              {shortcuts[0] ? (
                <Shortcuts className="p-2" onAction={close} />
              ) : (
                search.text !== "" &&
                !search.loading && (
                  <div className="dark:text-muted-white-extra flex items-center justify-center p-4 pt-2 text-xl text-zinc-400">
                    Nothing found
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ),
    [ref, isOpen, close, search, shortcuts]
  );
}

export namespace Palette {
  export type State = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };

  export const use = GlobalState.create<State>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }));
}

// TODO: Make focus not a hack
const useEvents = () => {
  const ref = useRef<HTMLDivElement>(null);

  Shortcut.Key.useOnDown(
    "Enter",
    useCallback((event) => {
      if (!ref.current) return;

      const buttons = Array.from(
        ref.current.querySelectorAll<HTMLButtonElement>("button")
      );

      // No hotkeys - do nothing
      if (!buttons.length) return;

      // Short-circuit so we can let the onClick handler fire
      if (buttons.some((button) => button === document.activeElement)) return;

      // Otherwise default to the first button in the list
      buttons[0]?.focus();
      event.stopPropagation();
      event.preventDefault();
    }, [])
  );

  const shiftFocus = useCallback((direction: "up" | "down") => {
    if (!ref.current) return;
    const focusableElements = [
      ...ref.current
        .querySelectorAll<HTMLInputElement | HTMLButtonElement>("input,button")
        .values(),
    ];

    const focusedIndex = focusableElements.findIndex(
      (element) => element === document.activeElement
    );

    if (focusedIndex === -1) return;

    const nextFocusedIndex =
      direction === "up" && focusedIndex > 0
        ? focusedIndex - 1
        : direction === "down" && focusedIndex < focusableElements.length - 1
        ? focusedIndex + 1
        : focusedIndex;

    focusableElements[nextFocusedIndex]?.focus();
  }, []);

  Shortcut.Key.useOnDown(
    "ArrowDown",
    useCallback(() => shiftFocus("down"), [shiftFocus])
  );

  Shortcut.Key.useOnDown(
    "ArrowUp",
    useCallback(() => shiftFocus("up"), [shiftFocus])
  );

  return { ref };
};
