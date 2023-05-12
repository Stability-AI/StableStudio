import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Panel } from "./Panel";
import { Sidebar } from "./Sidebar";

export * from "./Tools";

export type Tool = "select" | "hand" | "brush" | "export";

export function Tool({
  tool,
  label,
  active,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: React.PropsWithChildren & {
  tool?: Editor.Tool;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const [activeTool, setActiveTool] = Editor.Tool.Active.use();

  const content = (
    <div className="flex flex-col">
      <div
        onClick={
          onClick ??
          (() => {
            if (!tool) return;
            setActiveTool(tool);
          })
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={classes(
          "m-0.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded",
          active || tool === activeTool ? "bg-brand-500" : "hover:bg-zinc-700"
        )}
      >
        {children}
      </div>
    </div>
  );

  return !label ? (
    content
  ) : (
    <Theme.Tooltip content={label} placement="bottom" delay={500}>
      {content}
    </Theme.Tooltip>
  );
}

export declare namespace Tool {
  export { Panel, Sidebar };
}

export namespace Tool {
  Tool.Panel = Panel;
  Tool.Sidebar = Sidebar;

  export function Group({ children }: React.PropsWithChildren) {
    return (
      <div className="pointer-events-auto z-10 flex flex-row">{children}</div>
    );
  }

  export type Active = Tool;
  export type State = {
    value: Active;
    set: (value: Active) => void;
  };

  export namespace Active {
    const state = GlobalState.create<State>((set) => ({
      value: "select",
      set: (value) => set({ value }),
    }));

    export const use = () => [state().value, state().set] as const;
    export const useSet = () => state().set;
    export const useReset = () => state().set("select");
  }
}
