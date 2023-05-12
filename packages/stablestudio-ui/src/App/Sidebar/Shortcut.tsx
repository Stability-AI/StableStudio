import { Shortcut } from "~/Shortcut";
import { Theme } from "~/Theme";

export namespace Shortcuts {
  export const use = () => {
    const toggleSidebars = doNothing;
    const toggleLayerPanel = doNothing;
    const toggleBrushPanel = doNothing;
    const toggleLayersTab = doNothing;
    const toggleHistoryTab = doNothing;

    Shortcut.use(
      useMemo(
        () => ({
          name: ["Sidebar", "Toggle Both"],
          keys: ["Meta", "\\"],
          icon: Theme.Icon.Sidebar,
          action: toggleSidebars,
        }),
        [toggleSidebars]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: ["Sidebar", "Toggle Right"],
          keys: ["F7"],
          icon: Theme.Icon.SidebarOpen,
          action: toggleLayerPanel,
        }),
        [toggleLayerPanel]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: ["Sidebar", "Toggle Left"],
          keys: ["F5"],
          icon: Theme.Icon.SidebarClose,
          action: toggleBrushPanel,
        }),
        [toggleBrushPanel]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: ["Sidebar", "Layers"],
          keys: ["Control", "l"],
          icon: Theme.Icon.Layers,
          action: toggleLayersTab,
        }),
        [toggleLayersTab]
      )
    );

    Shortcut.use(
      useMemo(
        () => ({
          name: ["Sidebar", "History"],
          keys: ["Control", "y"],
          icon: Theme.Icon.History,
          action: toggleHistoryTab,
        }),
        [toggleHistoryTab]
      )
    );
  };
}
