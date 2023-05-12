import { Shortcut, Shortcuts } from "~/Shortcut";

export namespace Order {
  const compare = (
    a: Pick<Shortcut.Priority, "level">,
    b: Pick<Shortcut.Priority, "level">
  ) => {
    const levels = ["low", "medium", "high"];
    return levels.indexOf(b.level ?? "low") - levels.indexOf(a.level ?? "low");
  };

  export const use = () => {
    const shortcuts = Shortcuts.use();
    const priorities = Shortcut.Priorities.use();
    return useMemo(() => {
      const highestPriorities = shortcuts.map((shortcut) => ({
        shortcut,
        priority: priorities
          .filter((priority) => Shortcut.Priority.applies(priority, shortcut))
          .sort(compare)[0],
      }));

      const ordered = highestPriorities.sort((a, b) => {
        const prioritiesCompared = compare(
          a.priority ?? { level: "low" },
          b.priority ?? { level: "low" }
        );

        return prioritiesCompared !== 0
          ? prioritiesCompared
          : Shortcut.Name.compare(a.shortcut, b.shortcut);
      });

      return ordered.map(({ shortcut }) => shortcut);
    }, [shortcuts, priorities]);
  };
}
