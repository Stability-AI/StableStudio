import { Editor } from "~/Editor";
import { Box } from "~/Geometry";

import { Center } from "./Center";
import { Hand } from "./Hand";
import { Reset } from "./Reset";
import { Shortcuts } from "./Shortcut";
import { Zoom } from "./Zoom";

export type Camera = Box;

export declare namespace Camera {
  export { Center, Hand, Reset, Shortcuts, Zoom };
}

export namespace Camera {
  Camera.Center = Center;
  Camera.Hand = Hand;
  Camera.Reset = Reset;
  Camera.Shortcuts = Shortcuts;
  Camera.Zoom = Zoom;

  export const useSet = () => {
    const padding = 25;
    const canvas = Editor.Canvas.use();

    return useCallback(
      (boxWithoutPadding: Box) => {
        if (!canvas?.current) return;

        const box = {
          x: boxWithoutPadding.x - padding,
          y: boxWithoutPadding.y - padding,
          width: boxWithoutPadding.width + padding * 2,
          height: boxWithoutPadding.height + padding * 2,
        };

        const scale = Math.min(
          canvas.current.width() / box.width,
          canvas.current.height() / box.height
        );

        canvas.current.scale({ x: scale, y: scale });
        canvas.current.position({
          x:
            -box.x * canvas.current.scaleX() +
            canvas.current.width() / 2 -
            (box.width * canvas.current.scaleX()) / 2,

          y:
            -box.y * canvas.current.scaleY() +
            canvas.current.height() / 2 -
            (box.height * canvas.current.scaleY()) / 2,
        });
      },
      [canvas, padding]
    );
  };

  export function Tools() {
    return <Hand.Tool />;
  }
}
