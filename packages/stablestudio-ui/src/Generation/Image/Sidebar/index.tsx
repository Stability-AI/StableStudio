import { useLocation } from "react-router-dom";
import { App } from "~/App";
import { Comfy } from "~/Comfy";
import { Generation } from "~/Generation";
import { Theme } from "~/Theme";

import { Advanced } from "./Advanced";

export function Sidebar() {
  const { input } = Generation.Image.Session.useCurrentInput();
  const createDream = Generation.Image.Session.useCreateDream();
  const location = useLocation();

  if (!input?.id) return null;

  const bottom = (
    <App.Sidebar.Tab.Bottom>
      <div className="flex flex-col gap-2">
        <Comfy.Output small />
        <Generation.Image.Create.Button
          id={input.id}
          onIdleClick={() => createDream()}
          fullWidth
        />
      </div>
    </App.Sidebar.Tab.Bottom>
  );

  return (
    <>
      <App.Sidebar.Tab.Set
        defaultActive
        name="Generate"
        route="/generate"
        position="left"
        index={0}
        icon={Theme.Icon.Generate}
        enabled={
          location.pathname.startsWith("/generate") ||
          location.pathname.startsWith("/edit") ||
          location.pathname.startsWith("/nodes")
        }
        bottom={bottom}
      >
        <Sidebar.Tab id={input.id} />
      </App.Sidebar.Tab.Set>
      <App.Sidebar.Tab.Set
        defaultActive
        name="Nodes"
        route="/nodes"
        position="left"
        index={2}
        icon={Theme.Icon.Rectangle}
        enabled={
          location.pathname.startsWith("/generate") ||
          location.pathname.startsWith("/edit") ||
          location.pathname.startsWith("/nodes")
        }
        bottom={bottom}
      >
        <Sidebar.Tab id={input.id} />
      </App.Sidebar.Tab.Set>
    </>
  );
}

export namespace Sidebar {
  export function Tab({
    id,
    variant = "generate",
  }: {
    id: ID;
    variant?: "generate" | "editor";
  }) {
    const [settingsOpen, setSettingsOpen] = useState(true);
    const areStylesEnabled = Generation.Image.Styles.useAreEnabled();
    return (
      <>
        <App.Sidebar.Section divider defaultExpanded padding="sm">
          <div className="flex flex-col gap-2">
            {areStylesEnabled && <Generation.Image.Style.Dropdown id={id} />}
            <Generation.Image.Workflow.Dropdown />
          </div>
        </App.Sidebar.Section>
        <Generation.Image.Prompt.Sidebar.Section id={id} />
        {variant === "generate" && (
          <Generation.Image.Input.Image.Sidebar.Section id={id} />
        )}
        <App.Sidebar.Section
          divider={false}
          collapsable
          defaultExpanded
          title="Settings"
          onChange={setSettingsOpen}
        >
          <div className="flex flex-col gap-4">
            {variant === "generate" && <Generation.Image.Size id={id} />}
            <Generation.Image.Count.Slider />
          </div>
        </App.Sidebar.Section>
        {settingsOpen && <Advanced id={id} />}
      </>
    );
  }
}
