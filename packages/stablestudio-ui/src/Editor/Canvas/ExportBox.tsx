import Konva from "konva";
import { Rect } from "react-konva";
import { Editor } from "~/Editor";
import { GlobalState } from "~/GlobalState";

// TODO: Move to `Editor.Export`
export function ExportBox() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rectRef = useRef<Konva.Rect>(null!);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const strokeRectRef = useRef<Konva.Rect>(null!);

  const { origin, setOrigin, size, setSize } = ExportBox.useState();

  const [activeTool] = Editor.Tool.Active.use();
  const setActiveTool = Editor.Tool.Active.useSet();

  const entities = Editor.Entities.use();
  const selection = Editor.Selection.use();
  const select = Editor.Selection.useSelect();

  Editor.Canvas.useMouseDown(
    (e) => {
      if (activeTool === "export" && e.evt.button === 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const stage = e.target.getStage()!;
        const scale = stage.scaleX() || 1;
        const mousePos = stage.getPointerPosition() || { x: 0, y: 0 };
        const pos = stage.getPosition() || { x: 0, y: 0 };

        setOrigin(() => [
          mousePos.x / scale - pos.x / scale,
          mousePos.y / scale - pos.y / scale,
        ]);
        setSize(() => [0, 0]);

        if (rectRef.current) {
          rectRef.current.visible(true);
          strokeRectRef.current.visible(true);
        }
      }
    },
    [activeTool, rectRef.current]
  );

  Editor.Canvas.useMouseMove(
    (e) => {
      if (
        activeTool === "export" &&
        origin !== null &&
        rectRef.current?.visible() &&
        e.evt.buttons === 1
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const stage = e.target.getStage()!;
        const scale = stage.scaleX() || 1;
        const mousePos = stage.getPointerPosition() || { x: 0, y: 0 };
        const pos = stage.getPosition() || { x: 0, y: 0 };

        const newWidth = mousePos.x / scale - pos.x / scale - origin[0];
        const newHeight = mousePos.y / scale - pos.y / scale - origin[1];

        if (newWidth < 0) {
          setOrigin((origin) => [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            origin![0] + newWidth,
            strokeRectRef.current.y(),
          ]);
          setSize((size) => [-newWidth, size[1]]);
        } else {
          setSize((size) => [newWidth, size[1]]);
        }

        if (newHeight < 0) {
          setOrigin((origin) => [
            strokeRectRef.current.x(),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            origin![1] + newHeight,
          ]);
          setSize((size) => [size[0], -newHeight]);
        } else {
          setSize((size) => [size[0], newHeight]);
        }

        const selected: string[] = [];
        let doUpd = false;
        entities.forEach((image) => {
          if (image.type !== "image") return;
          if (
            Editor.Canvas.rectContainsRect(
              rectRef.current.x(),
              rectRef.current.y(),
              rectRef.current.width(),
              rectRef.current.height(),

              image.x,
              image.y,
              image.width,
              image.height
            )
          ) {
            selected.push(image.id);

            if (!selection.has(image.id)) {
              doUpd = true;
            }
          } else if (selection.has(image.id)) {
            doUpd = true;
          }
        });

        if (doUpd) {
          select(selected);
        }
      }
    },
    [activeTool, rectRef.current, origin]
  );

  Editor.Canvas.useMouseUp(() => {
    if (activeTool === "export" && origin !== null && rectRef.current) {
      const bounds = {
        x: rectRef.current.x(),
        y: rectRef.current.y(),
        width: rectRef.current.width(),
        height: rectRef.current.height(),
      };

      let images = entities.flatMap((e) =>
        e.type === "image" && e.visible ? [e] : []
      );

      // check if the pixels are like less than 10
      if (rectRef.current.width() < 10 && rectRef.current.height() < 10) {
        // we just want to render clicked on entity
        const image = Editor.Canvas.Render.getImageFromPoint(
          rectRef.current.x(),
          rectRef.current.y(),
          entities
            .flatMap((e) => (e.type === "image" && e.visible ? [e] : []))
            .reverse()
        );

        if (image) {
          const img: Editor.Image = {
            ...image,
            x: 0,
            y: 0,
            type: "image",
            id: "export",
            index: 0,
            locked: false,
            visible: true,
          };
          images = [img];

          bounds.x = image.x;
          bounds.y = image.y;
          bounds.width = image.width;
          bounds.height = image.height;
        }
      }

      const canvas = Editor.Canvas.Render.createImageFromBox(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        images.reverse(),
        1
      );

      if (canvas) {
        const link = document.createElement("a");
        link.download = "export.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        canvas.remove();
      }

      setOrigin(() => null);
      setActiveTool("select");
    }
  }, [activeTool, rectRef.current]);

  return (
    <>
      {origin && size && (
        <>
          <Rect
            x={origin[0]}
            y={origin[1]}
            width={size[0]}
            height={size[1]}
            fill="#4f46e5"
            opacity={0.2}
            ref={rectRef}
            listening={false}
          />
          <Rect
            x={origin[0]}
            y={origin[1]}
            width={size[0]}
            height={size[1]}
            stroke="#4f46e5"
            strokeWidth={3}
            dash={[5, 5]}
            ref={strokeRectRef}
            listening={false}
          />
        </>
      )}
    </>
  );
}

export namespace ExportBox {
  export const useState = GlobalState.create<{
    origin: [number, number] | null;
    size: [number, number];
    setOrigin: (
      fn: (origin: [number, number] | null) => [number, number] | null
    ) => void;
    setSize: (fn: (size: [number, number]) => [number, number]) => void;
  }>((set) => ({
    origin: null,
    size: [0, 0],
    setOrigin: (fn) => set((state) => ({ ...state, origin: fn(state.origin) })),
    setSize: (fn) => set((state) => ({ ...state, size: fn(state.size) })),
  }));
}
