import { Editor } from "~/Editor";

export namespace Center {
  export const useGet = () => {
    const canvas = Editor.Canvas.use();
    return useCallback(() => {
      if (!canvas.current) return;

      const position = canvas.current.getPosition();
      const size = canvas.current.getSize();
      const scale = {
        x: canvas.current.scaleX(),
        y: canvas.current.scaleY(),
      };

      return {
        x: (-position.x + size.width / 2) / scale.x,
        y: (-position.y + size.height / 2) / scale.y,
      };
    }, [canvas]);
  };
}
