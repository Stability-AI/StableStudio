import { Editor } from "~/Editor";

export namespace Reset {
  export const use = () => {
    const resetCamera = Editor.Camera.Reset.use();
    return useCallback(() => {
      resetCamera();
    }, [resetCamera]);
  };
}
