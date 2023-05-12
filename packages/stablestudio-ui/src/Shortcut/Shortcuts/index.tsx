import { GlobalState } from "~/GlobalState";
import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export type Shortcuts = Shortcut[];

export function Shortcuts({
  onAction,
  className,
}: Styleable & { onAction?: () => void }) {
  const shortcuts = Shortcuts.useDisplayed();
  return useMemo(() => {
    const groups = Shortcuts.toGroups(shortcuts);
    const { grouped, ungrouped } = shortcuts.reduce(
      ({ grouped, ungrouped }, shortcut) => {
        const names = Shortcut.Name.toStringArray(shortcut);
        const group = groups.find((name) => name === names[0]);
        return {
          ungrouped: group ? ungrouped : [...ungrouped, shortcut],
          grouped: group
            ? { ...grouped, [group]: [...(grouped[group] ?? []), shortcut] }
            : grouped,
        };
      },
      {
        grouped: {} as Record<string, Shortcut[]>,
        ungrouped: [] as Shortcut[],
      }
    );

    const divided = Object.entries(grouped).flatMap(
      ([group, items], groupIndex) => [
        <Theme.Divider key={group}>{group}</Theme.Divider>,
        ...items.map((shortcut, index) => (
          <Shortcut
            // TODO: Make focus not a hack
            selected={false && groupIndex === 0 && index === 0}
            key={shortcut.id}
            group={group}
            shortcut={{
              ...shortcut,
              action: () => {
                onAction?.();
                shortcut.action();
              },
            }}
          />
        )),
      ]
    );

    const notDivided = ungrouped.map((shortcut) => (
      <Shortcut
        key={shortcut.id}
        shortcut={{
          ...shortcut,
          action: () => {
            onAction?.();
            shortcut.action();
          },
        }}
      />
    ));

    return (
      <div className={classes("flex flex-col gap-2", className)}>
        {divided}
        {notDivided.length > 0 && <Theme.Divider />}
        {notDivided}
      </div>
    );
  }, [shortcuts, onAction, className]);
}

export namespace Shortcuts {
  export const toGroups = (shortcuts: Shortcuts) =>
    shortcuts.reduce<{
      seen: Record<string, boolean>;
      groups: string[];
    }>(
      ({ seen, groups }, shortcut) => {
        const [name, secondName] = Shortcut.Name.toStringArray(shortcut);
        return !name
          ? { seen, groups }
          : {
              seen: { ...seen, [name]: true },
              groups:
                (seen[name] || secondName) && !groups.includes(name)
                  ? [...groups, name]
                  : groups,
            };
      },
      { seen: {}, groups: [] }
    ).groups;

  export const get = () => State.use.getState().shortcuts;
  export const set = (setShortcuts: React.SetStateAction<Map<ID, Shortcut>>) =>
    State.use.getState().setShortcuts(setShortcuts);

  export const use = () => {
    const state = State.use(({ shortcuts }) => ({ shortcuts }));
    return useMemo(() => [...state.shortcuts.values()], [state.shortcuts]);
  };

  export const useDisplayed = () => {
    const shortcuts = Shortcut.Priority.Order.use();
    const search = Shortcut.Search.use();
    return useMemo(
      () =>
        shortcuts.filter(
          ({ id, menu }) =>
            menu && (search.text !== "" ? search.matches.includes(id) : true)
        ),
      [shortcuts, search.matches, search.text]
    );
  };
}

type State = {
  shortcuts: Map<ID, Shortcut>;
  setShortcuts: (setShortcuts: React.SetStateAction<Map<ID, Shortcut>>) => void;
};

namespace State {
  export const use = GlobalState.create<State>((set) => ({
    shortcuts: new Map(),
    setShortcuts: (setShortcut) =>
      set(({ shortcuts }) => ({
        shortcuts: new Map(
          typeof setShortcut === "function"
            ? setShortcut(shortcuts)
            : setShortcut
        ),
      })),
  }));
}
