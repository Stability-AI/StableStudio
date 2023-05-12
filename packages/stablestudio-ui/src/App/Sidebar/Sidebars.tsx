import { Editor } from "~/Editor";
import { Generation } from "~/Generation";

export function Sidebars() {
  return (
    <>
      <Generation.Image.Sidebar />
      <Editor.Sidebar />
    </>
  );
}
