import { Editor } from "~/Editor";

export namespace Shortcuts {
  export const use = () => {
    // Editor.Camera.Hand.Shortcuts.use();
    Editor.Camera.Reset.Shortcuts.use();
    Editor.Camera.Zoom.Shortcuts.use();
  };
}
