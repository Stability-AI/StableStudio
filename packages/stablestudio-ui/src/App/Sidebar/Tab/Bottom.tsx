import { App } from "~/App";

export function Bottom({ className, children }: StyleableWithChildren) {
  return (
    <div
      className={classes("justify-end border-t border-zinc-700 p-2", className)}
    >
      {children}
    </div>
  );
}

export function Bottoms({ position }: App.Sidebar.Props) {
  const [sidebar] = App.Sidebar.use(position);
  const tabs = App.Sidebar.Tabs.use(position);
  const tab = tabs.find((tab) => tab.name === sidebar.tab);
  return <>{tab?.bottom}</>;
}
