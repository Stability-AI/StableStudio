import { Editor } from "~/Editor";

export type Dreams = Editor.Dream[];
export namespace Dreams {
  export const use = () => Editor.Entities.useType("dream");
}
