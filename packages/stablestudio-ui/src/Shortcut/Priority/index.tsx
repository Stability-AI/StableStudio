import { Shortcut } from "~/Shortcut";

import { Order } from "./Order";

export * from "./Priorities";

export type Priority = {
  id: ID;
  name: Shortcut.Name;
  level?: "high" | "medium" | "low";
  enabled?: boolean;
};

export declare namespace Priority {
  export { Order };
}

export namespace Priority {
  Priority.Order = Order;

  export const applies = (priority: Priority, shortcut: Shortcut): boolean => {
    const names = Shortcut.Name.toStringArray(priority);
    const shortcutNames = Shortcut.Name.toStringArray(shortcut);
    return (
      names.filter((name, index) => shortcutNames[index] === name).length ===
      names.length
    );
  };

  export const use = (options: Omit<Priority, "id">) => {
    const [id] = useState(ID.create);
    const priority = useMemo(
      () => ({
        id,
        enabled: true,
        level: "low" as const,
        ...options,
      }),
      [id, options]
    );

    const setPriorities = Shortcut.Priorities.useSet();

    useEffect(() => {
      const enable = () =>
        setPriorities((priorities) => priorities.set(priority.id, priority));

      const disable = () =>
        setPriorities((priorities) => {
          priorities.delete(priority.id);
          return priorities;
        });

      priority.enabled ? enable() : disable();
      return disable;
    }, [priority, setPriorities]);
  };
}
