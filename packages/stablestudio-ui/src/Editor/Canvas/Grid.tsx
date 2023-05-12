import Konva from "konva";
import { Shape } from "react-konva";

import { Editor } from "~/Editor";
import { Theme } from "~/Theme";

export function Grid() {
  const dark = Theme.useDark();
  const stageRef = Editor.Canvas.use();

  if (1) return null;

  if (!stageRef) {
    return null;
  }

  const sceneFunc = useCallback(
    (context: Konva.Context) => {
      if (!stageRef.current) return;

      const scale = stageRef.current.scaleX(); // 2 if zoomed in, 0.5 if zoomed out

      // dont draw grid if zoomed out too far
      if (scale < 0.25) {
        return;
      }

      const stageSize = stageRef.current.getSize(); // get the size of the stage
      const stagePos = stageRef.current.position(); // top left corner of viewport
      const dotSize = 10; // size of the dots
      const spacing = 64; // distance between dots

      // draw the background that gets replaced by the lines later (this will be the color of the grid dots)
      context.beginPath();
      context.globalCompositeOperation = "source-over";
      context.fillStyle = dark
        ? "rgba(255,255,255, 0.05)"
        : "rgba(0, 0, 0, 0.04)";

      context.fillRect(
        -stagePos.x / scale,
        -stagePos.y / scale,
        stageSize.width / scale,
        stageSize.height / scale
      );
      context.closePath();

      // draw lines with destination-out to make holes where they arent intersecting that are grid dots
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "white";

      // calc lineWidth based on dotSize and scale. The lines should be just big enough to leave dots of the size of dotSize
      const lineWidth = spacing - dotSize;

      // starting with the first line that enters the viewport, draw lines that are spaced by spacing with a width of lineWidth
      // this will draw lines that are spaced by spacing and are just big enough to leave dots of the size of dotSize
      context.lineWidth = lineWidth;
      for (
        let x =
          -stagePos.x / scale -
          lineWidth * 2 -
          dotSize / 2 +
          (spacing - ((-stagePos.x / scale - lineWidth / 2) % spacing));
        x < stageSize.width / scale - stagePos.x / scale + lineWidth / 2;
        x += spacing
      ) {
        context.beginPath();
        context.moveTo(x, -stagePos.y / scale - lineWidth / 2);
        context.lineTo(
          x,
          stageSize.height / scale - stagePos.y / scale + lineWidth / 2
        );
        context.stroke();
        context.closePath();
      }

      for (
        let y =
          -stagePos.y / scale -
          lineWidth * 2 -
          dotSize / 2 +
          (spacing - ((-stagePos.y / scale - lineWidth / 2) % spacing));
        y < stageSize.height / scale - stagePos.y / scale + lineWidth / 2;
        y += spacing
      ) {
        context.beginPath();
        context.moveTo(-stagePos.x / scale, y);
        context.lineTo((-stagePos.x + stageSize.width) / scale, y);
        context.stroke();
        context.closePath();
      }

      // reset the globalCompositeOperation
      context.globalCompositeOperation = "source-over";
    },
    [stageRef, dark]
  );

  return <Shape stroke="white" {...{ sceneFunc }} />;
}
