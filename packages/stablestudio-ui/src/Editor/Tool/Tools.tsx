import { App } from "~/App";
import { Editor } from "~/Editor";

export function Tools() {
  const [sidebar] = App.Sidebar.use("left");
  if (sidebar.tab !== "Edit") return null;
  return (
    <>
      <div className="flex h-full flex-row items-center gap-2">
        <Editor.Tool.Group>
          <Editor.Selection.Tool />
          <Editor.Brush.Tool />
        </Editor.Tool.Group>
        <div className="h-[75%] w-[2px] bg-zinc-700" />
        <Editor.Export.Tools />
      </div>
    </>
  );
}
