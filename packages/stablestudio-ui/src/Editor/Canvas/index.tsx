import Konva from "konva";
import { Layer, Stage } from "react-konva";

import { Editor } from "~/Editor";

import { Event } from "./Event";
import { ExportBox } from "./ExportBox";
import { Grid } from "./Grid";
import { Render } from "./Render";
import { Setup } from "./Setup";

export function Canvas({ children }: React.PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);

  const { canvas, loading } = Setup.use();

  const moving = useRef<boolean>(false);

  const [activeTool] = Editor.Tool.Active.use();
  const clearSelection = Editor.Selection.useClear();

  return (
    <div
      ref={ref}
      id="canvas-container"
      className={classes(
        "absolute bottom-0 left-0 right-0 top-0 z-0 opacity-100",
        loading && "opacity-0"
      )}
      onDrop={Editor.Image.Import.useOnDrop()}
      onDragOver={(event) => event.preventDefault()}
    >
      <Stage
        ref={canvas}
        css={css`
          & .konvajs-content {
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
        `}
        onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
          e.cancelBubble = true;

          if (
            (e.evt.buttons === 4 ||
              (e.evt.button === 0 && activeTool === "select")) &&
            moving.current
          ) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stage = e.target.getStage()!;

            // move the stage by the amount of the latest movement
            const oldPos = stage.position();

            stage.position({
              x: oldPos.x + e.evt.movementX,
              y: oldPos.y + e.evt.movementY,
            });

            if (activeTool !== "brush") {
              document.body.style.cursor = "grabbing";
            }
          }
        }}
        onWheel={(e: Konva.KonvaEventObject<WheelEvent>) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Canvas.changeZoomRelative(e.target.getStage()!, e.evt.deltaY);
        }}
        onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (
            e.evt.buttons === 4 ||
            (e.evt.button === 0 && activeTool === "select")
          ) {
            moving.current = true;
          }

          if (activeTool === "select") {
            // should only bubble up if no images were clicked (unselect all images)
            clearSelection();
          }
        }}
        onMouseUp={() => {
          moving.current = false;
          if (activeTool !== "brush") {
            document.body.style.cursor = "default";
          }
        }}
        onMouseLeave={() => {
          moving.current = false;
        }}
      >
        <Layer>
          <Grid />
        </Layer>
        {children}
        <Layer>
          {/* <SelectBox /> */}
          <ExportBox />
        </Layer>
      </Stage>
    </div>
  );
}

export declare namespace Canvas {
  export { Event, ExportBox, Render };
}

export namespace Canvas {
  export const use = () => Setup.useCanvas();

  export const useGetContainer = () => {
    const canvas = use();
    return useCallback(
      () => canvas.current?.container().parentElement,
      [canvas]
    );
  };

  export const useResize = () => {
    const canvas = use();
    const getContainer = useGetContainer();
    return useCallback(() => {
      if (!canvas.current) return;

      const container = getContainer();
      if (!container) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      if (!width || !height) return;

      canvas.current.setSize({ width, height });
    }, [canvas, getContainer]);
  };

  export function useStageEvent(
    events: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (e: Konva.KonvaEventObject<any>) => void,
    deps: unknown[] = []
  ) {
    const stageRef = use();
    useEffect(
      () => {
        if (stageRef && stageRef.current) {
          stageRef.current.on(events, callback);
          return () => {
            stageRef.current?.off(events, callback);
          };
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [events, callback, stageRef, ...deps]
    );

    return stageRef?.current || null;
  }

  // hook to get mousemove event from stage
  export function useMouseMove(
    callback: (e: Konva.KonvaEventObject<MouseEvent>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps: any[] = []
  ) {
    return useStageEvent("mousemove", callback, deps);
  }

  // hook to get mouseup event from stage
  export function useMouseUp(
    callback: (e: Konva.KonvaEventObject<MouseEvent>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps: any[] = []
  ) {
    return useStageEvent("mouseup", callback, deps);
  }

  // hook to get mousedown event from stage
  export function useMouseDown(
    callback: (e: Konva.KonvaEventObject<MouseEvent>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps: any[] = []
  ) {
    return useStageEvent("mousedown", callback, deps);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function collectSnapLines(entities: any[]) {
    const vertical: number[] = [];
    const horizontal: number[] = [];

    entities.forEach((entity) => {
      const pos = entity.position();
      const width = entity.width();
      const height = entity.height();

      vertical.push(pos.x, pos.x + width);
      horizontal.push(pos.y, pos.y + height);
    });

    return { vertical, horizontal };
  }

  export function rectContainsRect(
    srx: number,
    sry: number,
    srw: number,
    srh: number,

    drx: number,
    dry: number,
    drw: number,
    drh: number
  ): boolean {
    // check if the source rect contains the destination rect in any way
    return (
      srx <= drx &&
      sry <= dry &&
      srx + srw >= drx + drw &&
      sry + srh >= dry + drh
    );
  }

  export function changeZoom(factor: number | undefined, stage: Konva.Stage) {
    const oldScale = stage.scaleX();
    const pointer = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = factor ? oldScale * factor : 1;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  }

  export function changeZoomRelative(
    stage: Konva.Stage,
    delta: number,
    mousePos?: { x: number; y: number }
  ) {
    if (delta === 0) return;

    const oldScale = stage.scaleX();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pointer = stage.getPointerPosition()!;

    const mousePointTo = mousePos || {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = delta > 0 ? -1 : 1;

    const newScale =
      direction > 0 ? oldScale * (1 + 0.02) : oldScale * (1 - 0.02);

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();

    // set zoom in canvas store
    const zoom = stage.scaleX();
    Setup.setZoom(zoom);
  }

  export function useTriggerWheelEvent() {
    const stage = use();
    return useCallback(
      (e: WheelEvent) => {
        if (e.deltaY === 0) {
          // this happens if people have a touchpad/mouse that can scroll horizontally
          return;
        }

        if (stage && stage.current) {
          stage.current.setPointersPositions(e);
          changeZoomRelative(stage.current, e.deltaY);
        }
      },
      [stage]
    );
  }

  export function useTriggerMouseMoveEvent() {
    const stage = use();
    return useCallback(
      (e: MouseEvent) => {
        if (stage && stage.current) {
          stage.current.fire(
            "mousemove",
            {
              evt: e,
            },
            true
          );
        }
      },
      [stage]
    );
  }

  Canvas.Render = Render;
  Canvas.ExportBox = ExportBox;
}
