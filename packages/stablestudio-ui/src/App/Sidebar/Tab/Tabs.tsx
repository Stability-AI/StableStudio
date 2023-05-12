import { App } from "~/App";
import { GlobalState } from "~/GlobalState";

export type Tabs = App.Sidebar.Tab[];
export namespace Tabs {
  export const use = (position: App.Sidebar.Position) => {
    const tabs = State.use(({ tabs }) => tabs);
    return useMemo(
      () =>
        Object.values(tabs)
          .filter((tab) => tab.position === position)
          .sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity)),
      [position, tabs]
    );
  };

  export type State = {
    tabs: Record<App.Sidebar.Tab.Name, App.Sidebar.Tab>;
    setTab: (name: App.Sidebar.Tab.Name, tab?: App.Sidebar.Tab) => void;

    leftElement?: HTMLDivElement | null;
    setLeftElement: (element?: HTMLDivElement | null) => void;

    rightElement?: HTMLDivElement | null;
    setRightElement: (element?: HTMLDivElement | null) => void;
  };

  export namespace State {
    export const use = GlobalState.create<State>((set) => ({
      tabs: {},
      setTab: (name, tab) =>
        set((state) => {
          const { [name]: _previous, ...tabs } = state.tabs;
          return { tabs: { ...tabs, ...(tab && { [name]: tab }) } };
        }),

      setLeftElement: (element) => set({ leftElement: element }),
      setRightElement: (element) => set({ rightElement: element }),
    }));
  }
}
