import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export type Name = React.ReactNode | React.ReactNode[];
type Nameable = Pick<Shortcut, "id" | "name">;

export function Name({
  id,
  name,
  group,
}: Nameable & {
  group?: string;
}) {
  return useMemo(() => {
    const names = Name.toArray({ id, name });
    const namesWithoutGroup =
      group && names.length > 1 ? names.slice(1) : names;

    return (
      <>
        {namesWithoutGroup
          .flatMap((name, index) => [
            <span key={index}>{name}</span>,
            <Theme.Divider.Inline key={keys(index, "divider")} />,
          ])
          .slice(0, -1)}
      </>
    );
  }, [id, name, group]);
}

export namespace Name {
  export const compare = (a: Nameable, b: Nameable): number =>
    toString(a).localeCompare(toString(b));

  export const toArray = (shortcut: Nameable): React.ReactNode[] =>
    !shortcut.name
      ? [shortcut.id]
      : Array.isArray(shortcut.name)
      ? shortcut.name
      : [shortcut.name];

  export const toStringArray = (shortcut: Nameable): string[] =>
    toArray(shortcut).map((name) => `${name}`);

  export const toString = (shortcut: Nameable): string =>
    toStringArray(shortcut).join(" ");
}
