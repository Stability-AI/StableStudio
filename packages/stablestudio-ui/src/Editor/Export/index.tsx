import { Editor } from "~/Editor";

import { Everything } from "./Everything";
import { Selection } from "./Selection";

export declare namespace Export {
  export { Everything, Selection };
}

export namespace Export {
  Export.Everything = Everything;
  Export.Selection = Selection;

  export function Tools() {
    return (
      <Editor.Tool.Group>
        <Selection.Tool />
        <Everything.Tool />
      </Editor.Tool.Group>
    );
  }

  export namespace Shortcuts {
    export const use = () => {
      Everything.Shortcuts.use();
      Selection.Shortcuts.use();
    };
  }
}
