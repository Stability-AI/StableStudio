import useHotkeys from "@reecelucas/react-use-hotkeys";
import { Theme } from "~/Theme";

import { Event } from "./Event";
import { Key, Keys } from "./Key";
import { Name } from "./Name";
import { Palette } from "./Palette";
import { Priorities, Priority } from "./Priority";
import { Search } from "./Search";
import { Shortcuts } from "./Shortcuts";

export * from "./Shortcuts";

export type Shortcut = {
  id: ID;

  menu?: boolean;
  name?: Name;
  group?: string;
  description?: React.ReactNode;
  icon?: React.ComponentProps<typeof Theme.Button>["icon"];

  enabled?: boolean;
  keys?: Keys | Omit<Keys.Options, "action">;
  options?: Parameters<typeof useHotkeys>[2];

  action: Shortcut.Action;
};

export function Shortcut({
  shortcut,
  group,
  selected,
}: {
  shortcut: Shortcut;
  group?: string;
  selected?: boolean;
}) {
  return useMemo(
    () => (
      <Theme.Button
        transparent
        className="w-full min-w-[200px]"
        selected={selected}
        iconLeft={shortcut.icon ?? Theme.Icon.Invisible}
        iconRight={
          shortcut.keys && (
            <Keys
              keys={shortcut.keys as never}
              className="ml-auto flex grow justify-end pl-6"
            />
          )
        }
        onClick={() => shortcut.action()}
      >
        <Shortcut.Name id={shortcut.id} name={shortcut.name} group={group} />
      </Theme.Button>
    ),
    [group, selected, shortcut]
  );
}

export declare namespace Shortcut {
  export { Event, Key, Keys, Palette, Priority, Priorities, Search, Name };
}

export namespace Shortcut {
  Shortcut.Event = Event;
  Shortcut.Key = Key;
  Shortcut.Keys = Keys;
  Shortcut.Palette = Palette;
  Shortcut.Priority = Priority;
  Shortcut.Priorities = Priorities;
  Shortcut.Search = Search;
  Shortcut.Name = Name;

  export type Action = (args?: { keyboardEvent?: KeyboardEvent }) => void;

  export function use(options: Omit<Shortcut, "id">): Shortcut {
    const [id] = useState(ID.create);
    const shortcut = useMemo(
      () => ({
        id,
        enabled: true,
        menu: true,
        ...options,
      }),
      [id, options]
    );

    const { enabled, action } = shortcut;

    const actionChecked: Shortcut.Action = useCallback(
      (args) => {
        if (!enabled) return;
        action(args);
      },
      [enabled, action]
    );

    useEffect(() => {
      const enable = () =>
        Shortcuts.set((shortcuts) => shortcuts.set(id, shortcut));

      const disable = () =>
        Shortcuts.set((shortcuts) => {
          shortcuts.delete(id);
          return shortcuts;
        });

      enabled ? enable() : disable();
      return disable;
    }, [enabled, id, shortcut]);

    Search.Datum.use(shortcut);

    Keys.use(
      useMemo(() => {
        const keys = !shortcut.keys
          ? undefined
          : typeof shortcut.keys === "string"
          ? shortcut.keys
          : Array.isArray(shortcut.keys)
          ? shortcut.keys
          : shortcut.keys.keys;

        return {
          keys,
          action: actionChecked,
          options: shortcut.options,
        };
      }, [shortcut.keys, shortcut.options, actionChecked])
    );

    return useMemo(
      () => ({ ...shortcut, action: actionChecked }),
      [shortcut, actionChecked]
    );
  }
}
