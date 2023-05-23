import * as ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";

import { App } from "~/App";
import { GlobalState } from "~/GlobalState";
import { Router } from "~/Router";
import { Theme } from "~/Theme";

import { Bottom, Bottoms } from "./Bottom";
import { Button, Buttons } from "./Button";
import { Tabs } from "./Tabs";

export * from "./Tabs";

export type Tab = {
  name: Tab.Name;
  position: App.Sidebar.Position;
  route?: Router.Route;
  defaultActive?: boolean;
  enabled?: boolean;
  index?: number;

  icon?: Theme.Icon.Prop;
  button?: Theme.Button.Prop;
  color?: Theme.Common.Color;

  above?: React.ReactNode;
  below?: React.ReactNode;
  bottom?: React.ReactNode;

  onClick?: (event: MouseEvent) => void;
};

export function Tab({ position }: App.Sidebar.Props) {
  const setElement = Tabs.State.use(
    (state) =>
      position === "left" ? state.setLeftElement : state.setRightElement,
    GlobalState.shallow
  );

  return (
    <div
      ref={setElement}
      className={classes("flex min-h-0 shrink flex-col overflow-y-auto")}
    />
  );
}

export declare namespace Tab {
  export { Bottom, Button, Buttons, Bottoms };
}

export namespace Tab {
  Tab.Bottom = Bottom;
  Tab.Button = Button;
  Tab.Buttons = Buttons;
  Tab.Bottoms = Bottoms;

  export type Name = string;
  export type Props = Tab & StyleableWithChildren;

  export function Set({ children, ...props }: Props) {
    const [sidebar, setSidebar] = App.Sidebar.use(props.position);
    const location = useLocation();

    const { setTab, element } = Tabs.State.use(
      ({ setTab, ...state }) => ({
        setTab,
        element:
          props.position === "left" ? state.leftElement : state.rightElement,
      }),
      GlobalState.shallow
    );

    useEffect(() => {
      setTab(props.name, { enabled: true, ...props });
      return () => setTab(props.name);
    }, [props, setTab]);

    useEffect(() => {
      (window.location.pathname === props.route ||
        (window.location.pathname === "/" && props.defaultActive)) &&
        setSidebar((sidebar) => ({ ...sidebar, tab: props.name }));
    }, [props.name, props.defaultActive, setSidebar, props.route, location]);

    return useMemo(
      () => (
        <>
          {sidebar.tab === props.name &&
            props.enabled &&
            element &&
            ReactDOM.createPortal(children, element)}
        </>
      ),
      [children, element, props.enabled, props.name, sidebar.tab]
    );
  }
}
