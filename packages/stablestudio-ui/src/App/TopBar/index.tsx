import { Theme } from "~/Theme";

import { Center } from "./Center";
import { Left } from "./Left";
import { Right } from "./Right";

export function TopBar() {
  return (
    <nav className="relative flex h-14 w-screen shrink-0 flex-row items-center border-b border-black/20 bg-zinc-50 px-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:min-w-[1000px]">
      <Left />
      <Center />
      <Right />
    </nav>
  );
}

export declare namespace TopBar {
  export { Center };
}

export namespace TopBar {
  TopBar.Center = Center;

  export function Divider(props: Theme.Divider.Props) {
    return (
      <Theme.Divider
        variant="vertical"
        className="mx-2 group-hover:bg-red-500"
        {...props}
      />
    );
  }

  export function Buttons({ children }: React.PropsWithChildren) {
    return <div>{children}</div>;
  }

  export function Button({
    menu,
    ...props
  }: Theme.Button.Props & { menu?: React.ReactNode }) {
    return (
      <div
        className={classes(
          "group/button relative flex h-full items-center justify-center duration-150",
          props.active ? "dark:bg-brand-500" : "hover:dark:bg-muted-white-extra"
        )}
      >
        <Theme.Button transparent size="lg" className="p-4" {...props} />
        {menu && (
          <Theme.Button
            transparent
            size="sm"
            className="-ml-4 h-full p-0 pr-2"
            icon={Theme.Icon.ChevronDown}
          />
        )}
      </div>
    );
  }
}
