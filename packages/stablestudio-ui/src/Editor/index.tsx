// import { App } from "~/App";

import { GlobalState } from "~/GlobalState";

import { Brush } from "./Brush";
import { Camera } from "./Camera";
import { Canvas } from "./Canvas";
import { Dream } from "./Dream";
import { Entities, Entity } from "./Entity";
import { Export } from "./Export";
import { Floating } from "./Floating";
import { Image, Images } from "./Image";
import { Import } from "./Import";
import { Panel, Panels } from "./Panel";
import { Reset } from "./Reset";
import { Selection } from "./Selection";
import { Shortcuts } from "./Shortcut";
import { Sidebar } from "./Sidebar";
import { Tool, Tools } from "./Tool";
import { TopBar } from "./TopBar";

export function Editor() {
  Shortcuts.use();

  const createDream = Editor.Dream.Create.use();
  const { color } = Editor.State.use();

  useEffect(() => {
    const entities = Editor.Entities.get();
    if (entities.size > 0) return;
    createDream();
  }, [createDream]);

  // App.Breadcrumbs.useSet(["defaultProject", "edit"]);
  return useMemo(
    () => (
      <>
        <TopBar />
        <div
          className="relative z-[0] flex h-full min-h-0 w-full shrink select-none flex-col overflow-hidden dark:text-white"
          style={{ backgroundColor: `#${color}` }}
        >
          <Canvas>
            <Entities />
          </Canvas>
          <Floating />
        </div>
      </>
    ),
    [color]
  );
}

export declare namespace Editor {
  export {
    Brush,
    Camera,
    Canvas,
    Dream,
    Entities,
    Entity,
    Export,
    Floating,
    Image,
    Images,
    Import,
    Panel,
    Panels,
    Reset,
    Selection,
    Shortcuts,
    Sidebar,
    Tool,
    Tools,
  };
}

export namespace Editor {
  Editor.Brush = Brush;
  Editor.Camera = Camera;
  Editor.Canvas = Canvas;
  Editor.Dream = Dream;
  Editor.Entities = Entities;
  Editor.Entity = Entity;
  Editor.Export = Export;
  Editor.Floating = Floating;
  Editor.Image = Image;
  Editor.Import = Import;
  Editor.Panel = Panel;
  Editor.Panels = Panels;
  Editor.Reset = Reset;
  Editor.Selection = Selection;
  Editor.Shortcuts = Shortcuts;
  Editor.Sidebar = Sidebar;
  Editor.Tool = Tool;
  Editor.Tools = Tools;

  export type State = {
    color: string;
    setColor: (color: string) => void;
    allowSnapping: boolean;
    setAllowSnapping: (allowSnapping: boolean) => void;
    autoFlatten: boolean;
    setAutoFlatten: (autoFlatten: boolean) => void;
  };

  export namespace State {
    export const use = GlobalState.create<State>((set) => ({
      color: "121212",
      setColor: (color) => set((state) => ({ ...state, color })),
      allowSnapping: true,
      setAllowSnapping: (allowSnapping) =>
        set((state) => ({ ...state, allowSnapping })),
      autoFlatten: true,
      setAutoFlatten: (autoFlatten) =>
        set((state) => ({ ...state, autoFlatten })),
    }));
  }
}
