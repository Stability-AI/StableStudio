import { Editor } from "~/Editor";
import { UndoRedo } from "~/UndoRedo";

export namespace Shortcuts {
  export const use = () => {
    UndoRedo.Shortcuts.use();
    Editor.Dream.Create.Shortcuts.use();
    Editor.Brush.Shortcuts.use();
    Editor.Selection.Shortcuts.use();
    Editor.Export.Shortcuts.use();
    Editor.Camera.Shortcuts.use();
  };
}
