import { App } from "~/App";
import { Router } from "~/Router";
import { Theme } from "~/Theme";

export function Button(props: Theme.Button.Props) {
  return (
    <Theme.Button
      size="lg"
      {...props}
      className={classes("w-full", props.className)}
    />
  );
}

export function Buttons({ position }: App.Sidebar.Props) {
  const navigate = Router.useNavigate();
  const [sidebar, setSidebar] = App.Sidebar.use(position);
  const tabs = App.Sidebar.Tabs.use(position);

  const isMobileDevice = Theme.useIsMobileDevice();

  const noButtons = tabs.every((tab) => tab.button === false);
  return useMemo(() => {
    if (!tabs[0] || noButtons) return null;
    return (
      <div className="flex flex-row gap-2 border-b border-zinc-300 p-2 dark:border-zinc-700">
        {tabs.map((tab) => {
          if (tab.button === false) return null;

          const onClick = () => {
            setSidebar((sidebar) => ({ ...sidebar, tab: tab.name }));
            tab.route && navigate(tab.route);
          };

          const props = {
            key: tab.name,
            icon: tab.icon,
            active: tab.name === sidebar.tab,
            className: classes("justify-start", !!tab.button && "w-full"),
            children: tab.name,
            color: tab.color,
            onClick,
          };

          return typeof tab.button === "function" ? (
            tab.button(props)
          ) : (
            <Button {...props} />
          );
        })}
        {isMobileDevice && (
          <Theme.Button
            className="h-full w-full"
            icon={Theme.Icon.ChevronLeft}
            onClick={() =>
              setSidebar((sidebar) => ({ ...sidebar, visible: false }))
            }
          />
        )}
      </div>
    );
  }, [tabs, noButtons, isMobileDevice, sidebar.tab, setSidebar, navigate]);
}
