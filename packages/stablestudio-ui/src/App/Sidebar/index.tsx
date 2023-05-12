import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Resizer } from "./Resizer";
import { Section } from "./Section";
import { Shortcuts } from "./Shortcut";
import { Tab, Tabs } from "./Tab";

export * from "./Sidebars";

export type Sidebar = {
  visible: boolean;
  width: number;
  tab?: Tab.Name;
};

export function Sidebar({ position }: Sidebar.Props) {
  const [sidebar] = Sidebar.use(position);
  const tabs = Tabs.use(position);
  const hasTabs = tabs.some((tab) => tab.enabled);
  const isMobileDevice = Theme.useIsMobileDevice();
  const showing = hasTabs && sidebar.visible && sidebar.width > 300;

  const bar = useMemo(
    () => (
      <>
        <Tab.Buttons position={position} />
        <Tab position={position} />
        <Tab.Bottoms position={position} />
      </>
    ),
    [position]
  );

  if (isMobileDevice) return null;
  return (
    <div
      style={{ width: showing ? (isMobileDevice ? "100%" : sidebar.width) : 0 }}
      className={classes(
        "relative z-[10] min-h-0 shrink-0 border-zinc-700 dark:bg-zinc-900",
        showing && (position === "left" ? "border-r" : "border-l")
      )}
    >
      {hasTabs && <Resizer position={position} />}
      <div
        className={classes(
          "flex h-full min-h-0 shrink grow flex-col",
          !showing && "hidden"
        )}
      >
        {bar}
      </div>
    </div>
  );
}

export declare namespace Sidebar {
  export { Section, Shortcuts, Tab, Tabs };
}

export namespace Sidebar {
  Sidebar.Section = Section;
  Sidebar.Shortcuts = Shortcuts;
  Sidebar.Tab = Tab;
  Sidebar.Tabs = Tabs;

  export type Props = { position: Position };
  export type Position = "left" | "right";

  export const presetWidth = () => 400;

  export const use = (position: Position) => {
    const { sidebar, stateSet } = State.use(
      (state) => ({
        sidebar: state[position],
        stateSet: state.setSidebar,
      }),
      GlobalState.shallow
    );

    const setSidebar = useCallback(
      (setSidebar: React.SetStateAction<Partial<Sidebar>>) =>
        stateSet(position, setSidebar),
      [position, stateSet]
    );

    return useMemo(() => [sidebar, setSidebar] as const, [sidebar, setSidebar]);
  };

  type State = {
    left: Sidebar;
    right: Sidebar;

    setSidebar: (
      position: Position,
      setSidebar: React.SetStateAction<Partial<Sidebar>>
    ) => void;
  };

  namespace State {
    export const use = GlobalState.create<State>((set) => {
      const sidebar = { visible: true, width: presetWidth() };
      return {
        left: sidebar,
        right: sidebar,

        setSidebar: (position, setSidebar) =>
          set((state) => ({
            [position]: {
              ...state[position],
              ...(typeof setSidebar === "function"
                ? setSidebar(state[position])
                : setSidebar),
            },
          })),
      };
    });
  }
}
