import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Image } from "react-konva";

import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";
import { Theme } from "~/Theme";

import { Blur } from "./Blur";
import { Cursor } from "./Cursor";
import { MaskLine } from "./MaskLine";
import { Panel } from "./Panel";
import { Shortcuts } from "./Shortcut";
import { Sidebar } from "./Sidebar";
import { Size } from "./Size";
import { Strength } from "./Strength";

export type Brush = {
  size: Brush.Size;
  strength: Brush.Strength;
  blur: Brush.Blur;
};

export function Brush() {
  const [activeTool] = Editor.Tool.Active.use();
  const maskLine = useRef<MaskLine>(new MaskLine());
  const line = useRef<Konva.Image | null>(null);
  const stageRef = Editor.Canvas.use();

  const [, setForceUpdate] = useState(0);

  const entities = Editor.Entities.useMap();
  const setEntities = Editor.Entities.useSet();

  const { blur, size, strength } = Editor.Brush.use();

  useEffect(() => {
    if (maskLine.current && line.current) {
      maskLine.current.line = line.current;
    }
  }, []);

  Editor.Canvas.useMouseDown(
    (e: KonvaEventObject<MouseEvent>) => {
      if (activeTool === "brush" && e.evt.button === 0 && stageRef) {
        const scale = stageRef.current?.scaleX() || 1;
        const mousePos = stageRef.current?.getPointerPosition() || {
          x: 0,
          y: 0,
        };
        const pos = stageRef.current?.getPosition() || { x: 0, y: 0 };
        maskLine.current.restart(size / scale, blur, strength, [
          // put out the first point (w/ end so it draws a dot)
          mousePos.x / scale - pos.x / scale,
          mousePos.y / scale - pos.y / scale,

          mousePos.x / scale - pos.x / scale,
          mousePos.y / scale - pos.y / scale,
        ]);

        setForceUpdate((n) => n + 1);
      }
    },
    [activeTool, size, blur, stageRef?.current, maskLine.current]
  );

  Editor.Canvas.useMouseUp(() => {
    if (activeTool === "brush") {
      // go through all images that our points line up to and raserize them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promises: Promise<any>[] = [];

      entities.forEach((image) => {
        if (image.type !== "image") {
          return;
        }

        for (let i = 0; i < maskLine.current.points.length; i += 2) {
          const x = maskLine.current.points[i];
          const y = maskLine.current.points[i + 1];

          if (!x || !y) return;

          // check if image x/y/w/h contains point x/y
          // making sure to account for stroke width as circle radius
          if (
            Brush.circleIntersectsRectange(
              x,
              y,
              maskLine.current.strokeWidth + maskLine.current.strokeBlur,
              image.x,
              image.y,
              image.width,
              image.height
            )
          ) {
            // rasterize this image
            promises.push(MaskLine.applyToImage(image, maskLine.current));
            break;
          }
        }
      });

      Promise.all(promises).then((newImages) => {
        const newEntities: Map<string, Editor.Entity> = new Map();

        newImages.forEach((newImage) => {
          if (!newImage) {
            return;
          }

          const e = entities.get(newImage.id) as Editor.Image;

          newEntities.set(e.id, {
            ...e,
            element: newImage as HTMLImageElement,
          });
        });

        setEntities((entities) => new Map([...entities, ...newEntities]));

        maskLine.current.clear();
      });
    }
  }, [activeTool, maskLine.current]);

  Editor.Canvas.useMouseMove(
    (e: KonvaEventObject<MouseEvent>) => {
      if (
        activeTool === "brush" &&
        maskLine.current &&
        e.evt.buttons === 1 &&
        stageRef
      ) {
        const scale = stageRef.current?.scaleX() || 1;
        const mousePos = stageRef.current?.getPointerPosition() || {
          x: 0,
          y: 0,
        };
        const pos = stageRef.current?.getPosition() || { x: 0, y: 0 };

        maskLine.current.addPoint(
          mousePos.x / scale - pos.x / scale,
          mousePos.y / scale - pos.y / scale
        );
      }
    },
    [activeTool, maskLine.current, stageRef?.current]
  );

  return (
    <Image
      ref={line}
      listening={false}
      perfectDrawEnabled={false}
      globalCompositeOperation="destination-out"
      visible={activeTool === "brush"}
      image={maskLine.current.canvas}
    />
  );
}

export declare namespace Brush {
  export { MaskLine, Cursor, Panel, Sidebar, Shortcuts, Blur, Size, Strength };
}

export namespace Brush {
  Brush.MaskLine = MaskLine;
  Brush.Panel = Panel;
  Brush.Cursor = Cursor;
  Brush.Sidebar = Sidebar;
  Brush.Shortcuts = Shortcuts;
  Brush.Blur = Blur;
  Brush.Size = Size;
  Brush.Strength = Strength;

  export function circleIntersectsRectange(
    cx: number,
    cy: number,
    radius: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) {
    const circleDistanceX = Math.abs(cx - (rx + rw / 2));
    const circleDistanceY = Math.abs(cy - (ry + rh / 2));

    if (circleDistanceX > rw / 2 + radius) {
      return false;
    }
    if (circleDistanceY > rh / 2 + radius) {
      return false;
    }

    if (circleDistanceX <= rw / 2) {
      return true;
    }
    if (circleDistanceY <= rh / 2) {
      return true;
    }

    const cornerDistanceSq =
      (circleDistanceX - rw / 2) ** 2 + (circleDistanceY - rh / 2) ** 2;

    return cornerDistanceSq <= radius ** 2;
  }

  export const preset = (): Brush => ({
    size: Size.preset(),
    strength: Strength.preset(),
    blur: Blur.preset(),
  });

  const useState = GlobalState.create(() => ({ brush: preset() }));

  export const use = (): Brush => useState(({ brush }) => brush);
  export const useSet = () => {
    const brush = use();
    const set = useState.setState;
    return useCallback(
      (setBrush: React.SetStateAction<Brush>) =>
        set({
          brush: typeof setBrush === "function" ? setBrush(brush) : setBrush,
        }),
      [set, brush]
    );
  };

  export function Tool() {
    return (
      <>
        <Cursor />
        <Editor.Tool label="Eraser" tool="brush">
          <Brush.Icon />
        </Editor.Tool>
      </>
    );
  }

  export function Icon() {
    return <Theme.Icon.Eraser strokeWidth={1.5} size={22} />;
  }
}
