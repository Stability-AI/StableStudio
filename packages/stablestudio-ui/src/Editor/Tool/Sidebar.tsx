import { Editor } from "~/Editor";

export namespace Sidebar {
  export function Section() {
    const [tool] = Editor.Tool.Active.use();
    return useMemo(() => {
      switch (tool) {
        case "brush":
          return <Editor.Brush.Sidebar.Section />;

        default:
          return null;
      }
    }, [tool]);
  }
}
